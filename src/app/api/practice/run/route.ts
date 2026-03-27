import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_ANTHROPIC_MODELS } from "@/lib/practice/constants";
import { AnthropicRunner } from "@/lib/practice/anthropic-runner";
import { evaluateOutput } from "@/lib/practice/evaluation";
import { consumeRateLimit } from "@/lib/practice/rate-limit";
import { composeRuntimePrompt } from "@/lib/practice/runtime";
import {
  attachPracticeSessionCookie,
  getPracticeSession,
} from "@/lib/practice/session";
import { loadProblems } from "@/lib/practice/storage";
import type { Problem, RunResult, TestCase } from "@/lib/practice/types";
import { formatOutputText, isoNow } from "@/lib/practice/utils";

export const runtime = "nodejs";

const MAX_PROMPT_LENGTH = 100_000;
const MAX_INPUT_LENGTH = 100_000;
const RUN_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RUN_RATE_LIMIT_UNITS = 18;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function getProblem(problemId: string): Promise<Problem | undefined> {
  const problems = await loadProblems();
  return problems.find((problem) => problem.id === problemId);
}

function createAdhocCase(inputData: string): TestCase {
  return {
    id: "adhoc",
    name: "Ad hoc input",
    input_data: inputData,
    expected_output: "",
    notes: "",
    hidden: false,
  };
}

function getVisibleCase(problem: Problem, caseId?: string | null) {
  return problem.sample_cases.find((testCase) => testCase.id === caseId) ?? null;
}

async function runSinglePrompt({
  problem,
  promptMarkdown,
  inputData,
  testCase,
  modelName,
  apiKey,
}: {
  problem: Problem;
  promptMarkdown: string;
  inputData: string;
  testCase?: TestCase | null;
  modelName: string;
  apiKey: string;
}): Promise<RunResult> {
  const resolvedCase = testCase ? { ...testCase, input_data: inputData } : createAdhocCase(inputData);
  const runtimePrompt = composeRuntimePrompt(problem, promptMarkdown, inputData);
  const runner = new AnthropicRunner(apiKey);
  const response = await runner.run(runtimePrompt.promptText, modelName, {
    cachePrefixText: runtimePrompt.promptUsesVariable ? null : runtimePrompt.promptPrefix || null,
  });
  const evaluation = response.outputText
    ? evaluateOutput(problem, resolvedCase, response.outputText)
    : [];

  return {
    run_id: crypto.randomUUID(),
    created_at: isoNow(),
    problem_id: problem.id,
    problem_title: problem.title,
    provider: "anthropic",
    model_name: modelName,
    prompt_markdown: promptMarkdown,
    runtime_prompt: runtimePrompt.promptText,
    input_data: inputData,
    case_id: resolvedCase.id,
    output_text: response.outputText,
    formatted_output: formatOutputText(response.outputText),
    duration_seconds: response.durationSeconds,
    evaluation,
    hidden_suite: [],
    error: response.error ?? "",
    input_tokens: response.inputTokens ?? null,
    output_tokens: response.outputTokens ?? null,
    cache_creation_input_tokens: response.cacheCreationInputTokens ?? null,
    cache_read_input_tokens: response.cacheReadInputTokens ?? null,
  };
}

async function runHiddenSuite({
  problem,
  promptMarkdown,
  modelName,
  apiKey,
}: {
  problem: Problem;
  promptMarkdown: string;
  modelName: string;
  apiKey: string;
}) {
  const results = [];

  for (const hiddenCase of problem.hidden_cases) {
    const run = await runSinglePrompt({
      problem,
      promptMarkdown,
      inputData: hiddenCase.input_data,
      testCase: hiddenCase,
      modelName,
      apiKey,
    });

    results.push({
      case_id: hiddenCase.id,
      name: hiddenCase.name,
      passed: run.evaluation.length > 0 && run.evaluation.every((item) => item.passed),
      error: run.error,
      evaluation: run.evaluation,
    });
  }

  return results;
}

export async function POST(request: NextRequest) {
  const { sessionId, shouldSetCookie } = getPracticeSession(request);
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return jsonError("Missing run payload.");
  }

  const modelName = typeof body.modelName === "string" ? body.modelName.trim() : "";
  const problemId = typeof body.problemId === "string" ? body.problemId.trim() : "";
  const promptMarkdown =
    typeof body.promptMarkdown === "string" ? body.promptMarkdown : "";
  const inputData = typeof body.inputData === "string" ? body.inputData : "";
  const caseId = typeof body.caseId === "string" ? body.caseId : null;
  const includeHiddenSuite = Boolean(body.includeHiddenSuite);
  const apiKey =
    (typeof body.apiKey === "string" ? body.apiKey.trim() : "") ||
    process.env.ANTHROPIC_API_KEY?.trim() ||
    "";

  if (!problemId) {
    return jsonError("Missing problemId.");
  }

  if (!modelName) {
    return jsonError("Choose a Claude model before running.");
  }

  if (!DEFAULT_ANTHROPIC_MODELS.includes(modelName)) {
    return jsonError("Unsupported Claude model selected.");
  }

  if (!apiKey) {
    return jsonError("Anthropic API key is required for Claude runs.");
  }

  if (
    typeof body.apiKey === "string" &&
    body.apiKey.trim() &&
    !body.apiKey.trim().startsWith("sk-ant-")
  ) {
    return jsonError('Anthropic API keys start with "sk-ant-".');
  }

  if (promptMarkdown.length > MAX_PROMPT_LENGTH) {
    return jsonError(`Prompt exceeds ${MAX_PROMPT_LENGTH} characters.`);
  }

  if (inputData.length > MAX_INPUT_LENGTH) {
    return jsonError(`Input exceeds ${MAX_INPUT_LENGTH} characters.`);
  }

  const problem = await getProblem(problemId);
  if (!problem) {
    return jsonError("Problem not found.", 404);
  }

  const rateLimit = consumeRateLimit({
    bucketKey: `practice-run:${sessionId}`,
    maxUnits: RUN_RATE_LIMIT_UNITS,
    units: 1 + (includeHiddenSuite ? problem.hidden_cases.length : 0),
    windowMs: RUN_RATE_LIMIT_WINDOW_MS,
  });
  if (!rateLimit.allowed) {
    const response = NextResponse.json(
      {
        error: "Too many practice runs in a short period. Please wait and try again.",
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
    const run = await runSinglePrompt({
      problem,
      promptMarkdown,
      inputData,
      testCase: getVisibleCase(problem, caseId),
      modelName,
      apiKey,
    });

    if (includeHiddenSuite && problem.hidden_cases.length > 0 && !run.error) {
      run.hidden_suite = await runHiddenSuite({
        problem,
        promptMarkdown,
        modelName,
        apiKey,
      });
    }

    const response = NextResponse.json({ run });
    return attachPracticeSessionCookie(response, sessionId, shouldSetCookie);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Could not complete run.",
      500
    );
  }
}
