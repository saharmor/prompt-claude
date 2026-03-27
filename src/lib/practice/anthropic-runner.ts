import Anthropic from "@anthropic-ai/sdk";
import type { ProviderResponse } from "@/lib/practice/types";

const EPHEMERAL_CACHE_CONTROL = { type: "ephemeral", ttl: "1h" } as const;
const PREPARED_PREFIX_CACHE = new Map<string, string>();
const PADDING_TOKEN_CACHE = new Map<string, number>();
const PADDING_BLOCK =
  "<cache_padding>\n" +
  "Ignore this block. It exists only to satisfy Claude prompt caching minimum length.\n" +
  "cache padding cache padding cache padding cache padding cache padding cache padding\n" +
  "cache padding cache padding cache padding cache padding cache padding cache padding\n" +
  "</cache_padding>";

type CachedContentBlock = {
  type: "text";
  text: string;
  cache_control?: typeof EPHEMERAL_CACHE_CONTROL;
};

type PracticeMessage = {
  role: "user";
  content: string | CachedContentBlock[];
};

export function minimumCacheableTokens(modelName: string) {
  const normalized = modelName.trim().toLowerCase();

  if (
    normalized.startsWith("claude-opus-4-6") ||
    normalized.startsWith("claude-opus-4-5") ||
    normalized.startsWith("claude-haiku-4-5")
  ) {
    return 4096;
  }

  if (
    normalized.startsWith("claude-sonnet-4-6") ||
    normalized.startsWith("claude-haiku-3.5") ||
    normalized.startsWith("claude-haiku-3")
  ) {
    return 2048;
  }

  return 1024;
}

export class AnthropicRunner {
  private client: Anthropic;

  constructor(apiKey: string, timeoutMs = 60_000) {
    if (!apiKey.trim()) {
      throw new Error("Anthropic API key is required.");
    }

    this.client = new Anthropic({
      apiKey: apiKey.trim(),
      timeout: timeoutMs,
    });
  }

  async run(
    promptText: string,
    modelName: string,
    options: {
      maxTokens?: number;
      cachePrefixText?: string | null;
    } = {}
  ): Promise<ProviderResponse> {
    const started = performance.now();
    const { maxTokens = 2048, cachePrefixText } = options;

    try {
      let messages: PracticeMessage[] = [{ role: "user", content: promptText }];

      if (cachePrefixText && promptText.startsWith(cachePrefixText)) {
        try {
          messages = [
            {
              role: "user",
              content: await this.buildCachedContent({
                modelName,
                promptText,
                cachePrefixText,
              }),
            },
          ];
        } catch {
          messages = [{ role: "user", content: promptText }];
        }
      }

      const response = await this.client.messages.create({
        model: modelName,
        max_tokens: maxTokens,
        messages,
      });

      const outputText = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();

      return {
        outputText,
        durationSeconds: (performance.now() - started) / 1000,
        inputTokens: response.usage.input_tokens ?? null,
        outputTokens: response.usage.output_tokens ?? null,
        cacheCreationInputTokens:
          response.usage.cache_creation_input_tokens ?? null,
        cacheReadInputTokens: response.usage.cache_read_input_tokens ?? null,
      };
    } catch (error) {
      return {
        outputText: "",
        durationSeconds: (performance.now() - started) / 1000,
        error: error instanceof Error ? error.message : "Request failed.",
      };
    }
  }

  private async buildCachedContent({
    modelName,
    promptText,
    cachePrefixText,
  }: {
    modelName: string;
    promptText: string;
    cachePrefixText: string;
  }) {
    const cachedPrefix = await this.prepareCachedPrefix(modelName, cachePrefixText);
    const dynamicSuffix = promptText.slice(cachePrefixText.length);
    const content: CachedContentBlock[] = [
      {
        type: "text",
        text: cachedPrefix,
        cache_control: EPHEMERAL_CACHE_CONTROL,
      },
    ];

    if (dynamicSuffix) {
      content.push({ type: "text", text: dynamicSuffix });
    }

    return content;
  }

  private async prepareCachedPrefix(modelName: string, prefixText: string) {
    if (!prefixText) {
      return prefixText;
    }

    const cacheKey = `${modelName}::${prefixText}`;
    const cached = PREPARED_PREFIX_CACHE.get(cacheKey);
    if (cached) {
      return cached;
    }

    const minimumTokens = minimumCacheableTokens(modelName);
    const prefixTokens = await this.countTextTokens(modelName, prefixText);

    if (prefixTokens >= minimumTokens) {
      PREPARED_PREFIX_CACHE.set(cacheKey, prefixText);
      return prefixText;
    }

    const paddingTokens = await this.paddingTokenCount(modelName);
    const repeats = Math.max(
      1,
      Math.ceil((minimumTokens - prefixTokens) / Math.max(paddingTokens, 1))
    );

    let paddedPrefix = appendPadding(prefixText, repeats);
    while ((await this.countTextTokens(modelName, paddedPrefix)) < minimumTokens) {
      paddedPrefix = appendPadding(paddedPrefix, 1);
    }

    PREPARED_PREFIX_CACHE.set(cacheKey, paddedPrefix);
    return paddedPrefix;
  }

  private async paddingTokenCount(modelName: string) {
    const cached = PADDING_TOKEN_CACHE.get(modelName);
    if (cached != null) {
      return cached;
    }

    const tokenCount = await this.countTextTokens(modelName, PADDING_BLOCK);
    PADDING_TOKEN_CACHE.set(modelName, tokenCount);
    return tokenCount;
  }

  private async countTextTokens(modelName: string, text: string) {
    const countTokens = (this.client.messages as unknown as {
      countTokens: (payload: unknown) => Promise<{ input_tokens?: number }>;
    }).countTokens;

    const response = await countTokens({
      model: modelName,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text }],
        },
      ],
    });

    return Number(response.input_tokens ?? 0);
  }
}

function appendPadding(text: string, repeats: number) {
  const padding = Array.from({ length: repeats }, () => PADDING_BLOCK).join("\n\n");
  return text.trim() ? `${text.trimEnd()}\n\n${padding}` : padding;
}
