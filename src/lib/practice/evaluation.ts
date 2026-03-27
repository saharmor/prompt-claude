import Ajv from "ajv";
import type {
  EvaluationResult,
  Problem,
  TestCase,
  ValidatorConfig,
} from "@/lib/practice/types";

const ajv = new Ajv({ allErrors: true, strict: false });
const MAX_REGEX_PATTERN_LENGTH = 500;
const MAX_REGEX_TEXT_LENGTH = 20_000;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parseJson(outputText: string): unknown {
  return JSON.parse(outputText.trim());
}

function jsonSchemaValidator(
  outputText: string,
  validator: ValidatorConfig
): EvaluationResult {
  const schema = validator.config.schema;

  try {
    const parsed = parseJson(outputText);
    const validate = ajv.compile(
      schema && typeof schema === "object" ? schema : {}
    );
    const passed = validate(parsed);

    if (passed) {
      return {
        label: validator.label,
        passed: true,
        details: "Output matches the JSON schema.",
        kind: "json_schema",
      };
    }

    return {
      label: validator.label,
      passed: false,
      details: `Schema validation failed: ${ajv.errorsText(validate.errors)}`,
      kind: "json_schema",
    };
  } catch (error) {
    return {
      label: validator.label,
      passed: false,
      details:
        error instanceof Error
          ? `Output is not valid JSON: ${error.message}`
          : "Output is not valid JSON.",
      kind: "json_schema",
    };
  }
}

function regexValidator(
  outputText: string,
  validator: ValidatorConfig
): EvaluationResult {
  const pattern =
    typeof validator.config.pattern === "string" ? validator.config.pattern : "";
  const multiline = validator.config.multiline !== false;

  if (pattern.length > MAX_REGEX_PATTERN_LENGTH) {
    return {
      label: validator.label,
      passed: false,
      details: "Pattern is too large to evaluate safely.",
      kind: "regex",
    };
  }

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, multiline ? "m" : "");
  } catch (error) {
    return {
      label: validator.label,
      passed: false,
      details:
        error instanceof Error
          ? `Invalid regex pattern: ${error.message}`
          : "Invalid regex pattern.",
      kind: "regex",
    };
  }

  const passed = regex.test(outputText.slice(0, MAX_REGEX_TEXT_LENGTH));

  return {
    label: validator.label,
    passed,
    details: passed
      ? typeof validator.config.success_message === "string"
        ? validator.config.success_message
        : "Pattern matched."
      : typeof validator.config.failure_message === "string"
        ? validator.config.failure_message
        : `Pattern did not match: ${pattern}`,
    kind: "regex",
  };
}

function hasXmlTag(outputText: string, tagName: string) {
  const pattern = new RegExp(
    `<${tagName}(?:\\s[^>]*)?>[\\s\\S]*?<\\/${tagName}>`,
    "i"
  );
  return pattern.test(outputText);
}

function xmlRequiredTagsValidator(
  outputText: string,
  validator: ValidatorConfig
): EvaluationResult {
  const requiredTags = asStringArray(validator.config.required_tags);
  const missing = requiredTags.filter((tag) => !hasXmlTag(outputText, tag));

  return {
    label: validator.label,
    passed: missing.length === 0,
    details:
      missing.length === 0
        ? "All required XML tags are present."
        : `Missing required tags: ${missing.join(", ")}`,
    kind: "xml_required_tags",
  };
}

function containsAllValidator(
  outputText: string,
  validator: ValidatorConfig
): EvaluationResult {
  const phrases = asStringArray(validator.config.phrases);
  const missing = phrases.filter((phrase) => !outputText.includes(phrase));

  return {
    label: validator.label,
    passed: missing.length === 0,
    details:
      missing.length === 0
        ? "All required phrases are present."
        : `Missing phrases: ${missing.join(", ")}`,
    kind: "contains_all",
  };
}

function clientEmailHook(outputText: string, testCase: TestCase): EvaluationResult {
  const issues: string[] = [];
  const lower = outputText.toLowerCase();

  if (!hasXmlTag(outputText, "subject") || !hasXmlTag(outputText, "body")) {
    issues.push("Missing <subject> or <body> XML tags.");
  }

  const nextStepSignals = [
    "next step",
    "next steps",
    "follow up",
    "follow-up",
    "we will",
    "we'll",
    "expect",
    "our next",
    "update you",
    "keep you informed",
    "keep you posted",
  ];

  if (!nextStepSignals.some((signal) => lower.includes(signal))) {
    issues.push("No clear next-step commitment found.");
  }

  const jargonPatterns = [
    /misconfigured\s+worker/i,
    /rollback/i,
    /backfill/i,
    /dead.?letter\s+queue/i,
    /\bSQS\b/i,
    /\bIAM\b/i,
    /partner\s+payload/i,
    /malformed.*payload/i,
    /queue\s+drain/i,
    /worker\s+deploy/i,
    /ingestion\s+lag/i,
  ];

  const leaked = jargonPatterns.filter((pattern) => pattern.test(outputText));
  if (leaked.length > 0) {
    issues.push(
      `Internal jargon leaked (${leaked.length} pattern(s)). Client emails should not expose implementation details.`
    );
  }

  const concerns: string[] = [];
  let inConcerns = false;

  for (const line of (testCase.input_data || "").toLowerCase().split("\n")) {
    const trimmed = line.trim();
    if (trimmed.includes("client concerns:") || trimmed.includes("client concern:")) {
      inConcerns = true;
      continue;
    }

    if (inConcerns && trimmed.startsWith("- ")) {
      concerns.push(trimmed.slice(2).trim());
      continue;
    }

    if (inConcerns && trimmed && !trimmed.startsWith("-")) {
      inConcerns = false;
    }
  }

  if (concerns.length > 0) {
    const addressed = concerns.reduce((count, concern) => {
      const matches = concern
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .some((keyword) => lower.includes(keyword));
      return count + (matches ? 1 : 0);
    }, 0);

    if (addressed < concerns.length) {
      issues.push(`Only ~${addressed}/${concerns.length} client concerns appear addressed.`);
    }
  }

  return {
    label: "Client email quality",
    passed: issues.length === 0,
    details:
      issues.length === 0
        ? "Good structure, no jargon leakage, concerns addressed, next step included."
        : issues.join(" | "),
    kind: "hook",
  };
}

function dataExtractionHook(outputText: string): EvaluationResult {
  const issues: string[] = [];

  let parsed: unknown;
  try {
    parsed = parseJson(outputText);
  } catch {
    return {
      label: "Data extraction quality",
      passed: false,
      details: "Output is not valid JSON.",
      kind: "hook",
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      label: "Data extraction quality",
      passed: false,
      details: "Expected a JSON object at the top level.",
      kind: "hook",
    };
  }

  const record = parsed as Record<string, unknown>;
  const items = record.line_items;

  if (!Array.isArray(items) || items.length === 0) {
    issues.push("line_items should be a non-empty array.");
  } else {
    items.forEach((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        issues.push(`line_items[${index}] is not an object.`);
        return;
      }

      const lineItem = item as Record<string, unknown>;
      if (!("description" in lineItem)) {
        issues.push(`line_items[${index}] missing 'description'.`);
      }

      if (!("quantity" in lineItem) && !("amount" in lineItem) && !("unit_price" in lineItem)) {
        issues.push(
          `line_items[${index}] missing numeric fields (quantity, amount, or unit_price).`
        );
      }
    });
  }

  for (const field of [
    "invoice_id",
    "vendor_name",
    "invoice_date",
    "currency",
    "total_amount",
  ]) {
    if (!(field in record)) {
      issues.push(`Missing top-level field: ${field}.`);
    }
  }

  return {
    label: "Data extraction quality",
    passed: issues.length === 0,
    details:
      issues.length === 0
        ? "JSON has all required fields, line items are well-structured."
        : issues.slice(0, 4).join(" | "),
    kind: "hook",
  };
}

function structuredReasoningHook(
  outputText: string,
  testCase: TestCase
): EvaluationResult {
  const issues: string[] = [];
  const inputText = testCase.input_data || "";
  const quoteMatches = Array.from(
    outputText.matchAll(/<quote>([\s\S]*?)<\/quote>/gi)
  ).map((match) => match[1].trim());

  if (quoteMatches.length === 0) {
    issues.push("No <quote> elements found - reasoning must be grounded in evidence.");
  } else {
    const grounded = quoteMatches.filter((quote) => {
      const words = quote.split(/\s+/).filter((word) => word.length > 3).slice(0, 6);
      return words.some((word) => inputText.toLowerCase().includes(word.toLowerCase()));
    });

    if (grounded.length === 0) {
      issues.push(
        "None of the quoted evidence appears in the original input - quotes should reference actual data."
      );
    }
  }

  const reasoningMatch = outputText.match(/<reasoning>([\s\S]*?)<\/reasoning>/i);
  if (!reasoningMatch) {
    issues.push("Missing <reasoning> section.");
  } else if (reasoningMatch[1].trim().length < 60) {
    issues.push("Reasoning section is too brief to constitute a real analysis.");
  }

  const rootCauseMatch = outputText.match(/<root_cause>([\s\S]*?)<\/root_cause>/i);
  if (!rootCauseMatch) {
    issues.push("Missing <root_cause>.");
  } else if (rootCauseMatch[1].trim().length < 5) {
    issues.push("Root cause is too vague.");
  }

  return {
    label: "Reasoning quality",
    passed: issues.length === 0,
    details:
      issues.length === 0
        ? "Evidence is grounded in input, reasoning has substance, root cause is specific."
        : issues.join(" | "),
    kind: "hook",
  };
}

function toolPlanHook(outputText: string): EvaluationResult {
  const issues: string[] = [];
  const required = ["plan", "tool_call", "final_answer"];
  const missing = required.filter((tag) => !hasXmlTag(outputText, tag));

  if (missing.length > 0) {
    issues.push(`Missing blocks: ${missing.map((tag) => `<${tag}>`).join(", ")}.`);
  }

  const validTools = new Set(["create_ticket", "search_docs", "schedule_meeting"]);
  const toolCallMatches = Array.from(
    outputText.matchAll(/<tool_call>([\s\S]*?)<\/tool_call>/gi)
  );
  const toolCallBody = toolCallMatches[0]?.[1] ?? "";
  const nameMatch = toolCallBody.match(/<name>\s*([\s\S]*?)\s*<\/name>/i);
  if (!nameMatch) {
    issues.push("No <name> tag found inside <tool_call>.");
  } else if (!validTools.has(nameMatch[1].trim())) {
    issues.push(
      `Tool '${nameMatch[1].trim()}' is not in the catalog (${Array.from(validTools).join(", ")}).`
    );
  }

  const argsMatch = toolCallBody.match(/<arguments>\s*([\s\S]*?)\s*<\/arguments>/i);
  if (!argsMatch) {
    issues.push("No <arguments> tag found inside <tool_call>.");
  } else {
    try {
      const parsed = JSON.parse(argsMatch[1]);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || Object.keys(parsed).length === 0) {
        issues.push("Arguments JSON should be a non-empty object with named parameters.");
      }
    } catch {
      issues.push("Arguments block is not valid JSON.");
    }
  }

  const toolCallCount = (outputText.match(/<tool_call>/g) ?? []).length;
  if (toolCallCount > 1) {
    issues.push(`Expected exactly 1 tool_call but found ${toolCallCount}.`);
  }

  return {
    label: "Tool simulation quality",
    passed: issues.length === 0,
    details:
      issues.length === 0
        ? "Includes plan, valid tool from catalog, parseable JSON arguments, and final answer."
        : issues.join(" | "),
    kind: "hook",
  };
}

const validators = {
  json_schema: jsonSchemaValidator,
  regex: regexValidator,
  xml_required_tags: xmlRequiredTagsValidator,
  contains_all: containsAllValidator,
} as const;

const hooks = {
  client_email_hook: clientEmailHook,
  data_extraction_hook: (outputText: string) => dataExtractionHook(outputText),
  structured_reasoning_hook: structuredReasoningHook,
  tool_plan_hook: (outputText: string) => toolPlanHook(outputText),
} as const;

export function evaluateOutput(
  problem: Problem,
  testCase: TestCase,
  outputText: string
): EvaluationResult[] {
  const results: EvaluationResult[] = [];

  for (const validator of problem.validators) {
    const handler = validators[validator.kind as keyof typeof validators];

    if (!handler) {
      results.push({
        label: validator.label,
        passed: false,
        details: `Unknown validator kind: ${validator.kind}`,
        kind: validator.kind,
      });
      continue;
    }

    results.push(handler(outputText, validator));
  }

  if (problem.evaluator_hook) {
    const hook = hooks[problem.evaluator_hook as keyof typeof hooks];

    if (!hook) {
      results.push({
        label: "Custom Hook",
        passed: false,
        details: `Unknown evaluator hook: ${problem.evaluator_hook}`,
        kind: "hook",
      });
    } else {
      results.push(hook(outputText, testCase));
    }
  }

  return results;
}
