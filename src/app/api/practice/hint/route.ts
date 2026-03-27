import { NextRequest, NextResponse } from "next/server";
import { AnthropicRunner } from "@/lib/practice/anthropic-runner";
import { consumeRateLimit } from "@/lib/practice/rate-limit";
import { buildHintPromptParts } from "@/lib/practice/runtime";
import {
  attachPracticeSessionCookie,
  getPracticeSession,
} from "@/lib/practice/session";

export const runtime = "nodejs";

const MAX_HINT_FIELD_LENGTH = 20_000;
const HINT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const HINT_RATE_LIMIT_REQUESTS = 20;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const { sessionId, shouldSetCookie } = getPracticeSession(request);
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return jsonError("Missing hint payload.");
  }

  const checkLabel = typeof body.checkLabel === "string" ? body.checkLabel : "";
  const checkDetails =
    typeof body.checkDetails === "string" ? body.checkDetails : "";
  const userPrompt = typeof body.userPrompt === "string" ? body.userPrompt : "";
  const modelOutput =
    typeof body.modelOutput === "string" ? body.modelOutput : "";
  const problemDescription =
    typeof body.problemDescription === "string" ? body.problemDescription : "";
  const apiKey =
    (typeof body.apiKey === "string" ? body.apiKey.trim() : "") ||
    process.env.ANTHROPIC_API_KEY?.trim() ||
    "";

  if (!apiKey) {
    return jsonError("Anthropic API key is required for hints.");
  }

  if (
    typeof body.apiKey === "string" &&
    body.apiKey.trim() &&
    !body.apiKey.trim().startsWith("sk-ant-")
  ) {
    return jsonError('Anthropic API keys start with "sk-ant-".');
  }

  if (
    checkLabel.length > MAX_HINT_FIELD_LENGTH ||
    checkDetails.length > MAX_HINT_FIELD_LENGTH ||
    userPrompt.length > MAX_HINT_FIELD_LENGTH ||
    modelOutput.length > MAX_HINT_FIELD_LENGTH ||
    problemDescription.length > MAX_HINT_FIELD_LENGTH
  ) {
    return jsonError("Hint request is too large.");
  }

  const rateLimit = consumeRateLimit({
    bucketKey: `practice-hint:${sessionId}`,
    maxUnits: HINT_RATE_LIMIT_REQUESTS,
    windowMs: HINT_RATE_LIMIT_WINDOW_MS,
  });
  if (!rateLimit.allowed) {
    const response = NextResponse.json(
      {
        error: "Too many hint requests in a short period. Please wait and try again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      }
    );

    return attachPracticeSessionCookie(response, sessionId, shouldSetCookie);
  }

  try {
    const { prefix, suffix } = buildHintPromptParts({
      checkLabel,
      checkDetails,
      userPrompt,
      modelOutput,
      problemDescription,
    });

    const runner = new AnthropicRunner(apiKey);
    const response = await runner.run(`${prefix}${suffix}`, "claude-haiku-4-5", {
      maxTokens: 300,
      cachePrefixText: prefix,
    });

    if (response.error) {
      return jsonError(`Hint generation failed: ${response.error}`);
    }

    const responseBody = NextResponse.json({ hint: response.outputText });
    return attachPracticeSessionCookie(responseBody, sessionId, shouldSetCookie);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Could not generate hint.",
      500
    );
  }
}
