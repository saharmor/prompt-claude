import {
  DEFAULT_EXAM_STATE,
  DEFAULT_INPUT_WRAPPER_TEMPLATE,
  type EvaluationResult,
  type ExamState,
  type Problem,
  type RunResult,
  type TestCase,
  type ValidatorConfig,
} from "@/lib/practice/types";

export function isoNow() {
  return new Date().toISOString();
}

export function parseJsonSafe<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function normalizeInputVariableName(value: unknown): string {
  const cleaned = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!cleaned) {
    return "INPUT";
  }

  if (/^\d/.test(cleaned)) {
    return `INPUT_${cleaned}`;
  }

  return cleaned;
}

export function buildInputPlaceholder(inputVariableName: string) {
  return `\${{${normalizeInputVariableName(inputVariableName)}}}`;
}

export function replaceInputVariable(
  text: string,
  inputVariableName: string,
  inputValue: string
) {
  const variableName = normalizeInputVariableName(inputVariableName);
  let replaced = false;
  let nextText = String(text ?? "");

  for (const pattern of [
    new RegExp(`\\$\\{\\{\\s*${variableName}\\s*\\}\\}`, "g"),
    /\{\{\s*INPUT\s*\}\}/g,
  ]) {
    nextText = nextText.replace(pattern, () => {
      replaced = true;
      return inputValue;
    });
  }

  return { text: nextText, replaced };
}

export function injectInputWrapper(
  problem: Pick<Problem, "input_wrapper_template" | "input_variable_name">,
  inputValue: string
) {
  const wrapper = problem.input_wrapper_template || DEFAULT_INPUT_WRAPPER_TEMPLATE;
  const resolved = replaceInputVariable(
    wrapper,
    problem.input_variable_name,
    inputValue
  );

  if (resolved.replaced) {
    return resolved.text;
  }

  if (resolved.text.includes("{input}")) {
    return resolved.text.split("{input}").join(inputValue);
  }

  return `${resolved.text}\n${inputValue}`;
}

export function buildRuntimePromptParts(
  problem: Pick<Problem, "input_wrapper_template" | "input_variable_name">,
  promptMarkdown: string,
  inputValue: string
) {
  const resolvedPrompt = replaceInputVariable(
    promptMarkdown,
    problem.input_variable_name,
    inputValue
  );
  const prefix = resolvedPrompt.text.trimEnd();

  if (resolvedPrompt.replaced) {
    return { prefix, suffix: "" };
  }

  const injected = injectInputWrapper(problem, inputValue);
  return {
    prefix,
    suffix: prefix ? `\n${injected}` : injected,
  };
}

export function buildRuntimePrompt(
  problem: Pick<Problem, "input_wrapper_template" | "input_variable_name">,
  promptMarkdown: string,
  inputValue: string
) {
  const { prefix, suffix } = buildRuntimePromptParts(
    problem,
    promptMarkdown,
    inputValue
  );
  return `${prefix}${suffix}`;
}

export function formatOutputText(outputText: string) {
  const trimmed = outputText.trim();
  if (!trimmed) {
    return "";
  }

  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return trimmed;
  }
}

export function formatTimestamp(value: string) {
  if (!value) {
    return "Unknown time";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDuration(secondsRemaining: number) {
  const safe = Math.max(Math.floor(secondsRemaining), 0);
  const hours = String(Math.floor(safe / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((safe % 3600) / 60)).padStart(2, "0");
  const seconds = String(safe % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function computeRemainingSeconds(examState: ExamState) {
  if (!examState.active || !examState.started_at) {
    return examState.duration_minutes * 60;
  }

  const startedAt = new Date(examState.started_at).getTime();
  const elapsedSeconds = (Date.now() - startedAt) / 1000;
  let pausedSeconds = examState.total_paused_seconds || 0;

  if (examState.paused && examState.paused_at) {
    pausedSeconds += (Date.now() - new Date(examState.paused_at).getTime()) / 1000;
  }

  return examState.duration_minutes * 60 - Math.max(elapsedSeconds - pausedSeconds, 0);
}

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

export function hydrateTestCase(value: unknown, hiddenOverride?: boolean): TestCase {
  const record = toRecord(value);

  return {
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    input_data: String(record.input_data ?? ""),
    expected_output: String(record.expected_output ?? ""),
    notes: String(record.notes ?? ""),
    hidden: hiddenOverride ?? Boolean(record.hidden),
  };
}

export function hydrateValidator(value: unknown): ValidatorConfig {
  const record = toRecord(value);

  return {
    kind: String(record.kind ?? ""),
    label: String(record.label ?? record.kind ?? ""),
    config: toRecord(record.config),
  };
}

export function hydrateProblem(value: unknown): Problem {
  const record = toRecord(value);

  return {
    id: String(record.id ?? ""),
    title: String(record.title ?? "Untitled problem"),
    description: String(record.description ?? ""),
    input_format: String(record.input_format ?? ""),
    evaluator_expectation: String(record.evaluator_expectation ?? ""),
    starter_prompt: String(record.starter_prompt ?? ""),
    input_wrapper_template: String(
      record.input_wrapper_template ?? DEFAULT_INPUT_WRAPPER_TEMPLATE
    ),
    input_variable_name: normalizeInputVariableName(record.input_variable_name),
    sample_cases: Array.isArray(record.sample_cases)
      ? record.sample_cases.map((item) => hydrateTestCase(item, false))
      : [],
    hidden_cases: Array.isArray(record.hidden_cases)
      ? record.hidden_cases.map((item) => hydrateTestCase(item, true))
      : [],
    validators: Array.isArray(record.validators)
      ? record.validators.map(hydrateValidator)
      : [],
    evaluator_hook: String(record.evaluator_hook ?? ""),
    tags: Array.isArray(record.tags)
      ? record.tags
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    created_by_user: Boolean(record.created_by_user),
  };
}

export function hydrateEvaluationResult(value: unknown): EvaluationResult {
  const record = toRecord(value);

  return {
    label: String(record.label ?? ""),
    passed: Boolean(record.passed),
    details: String(record.details ?? ""),
    kind: String(record.kind ?? ""),
  };
}

export function hydrateRunResult(value: unknown): RunResult {
  const record = toRecord(value);

  return {
    run_id: String(record.run_id ?? ""),
    created_at: String(record.created_at ?? ""),
    problem_id: String(record.problem_id ?? ""),
    problem_title: String(record.problem_title ?? ""),
    provider: "anthropic",
    model_name: String(record.model_name ?? ""),
    prompt_markdown: String(record.prompt_markdown ?? ""),
    runtime_prompt: String(record.runtime_prompt ?? ""),
    input_data: String(record.input_data ?? ""),
    case_id: String(record.case_id ?? ""),
    output_text: String(record.output_text ?? ""),
    formatted_output: String(record.formatted_output ?? ""),
    duration_seconds: Number(record.duration_seconds ?? 0),
    evaluation: Array.isArray(record.evaluation)
      ? record.evaluation.map(hydrateEvaluationResult)
      : [],
    hidden_suite: Array.isArray(record.hidden_suite)
      ? record.hidden_suite.map((item) => {
          const suite = toRecord(item);
          return {
            case_id: String(suite.case_id ?? ""),
            name: String(suite.name ?? ""),
            passed: Boolean(suite.passed),
            error: String(suite.error ?? ""),
            evaluation: Array.isArray(suite.evaluation)
              ? suite.evaluation.map(hydrateEvaluationResult)
              : [],
          };
        })
      : [],
    error: String(record.error ?? ""),
    input_tokens:
      typeof record.input_tokens === "number" ? record.input_tokens : null,
    output_tokens:
      typeof record.output_tokens === "number" ? record.output_tokens : null,
    cache_creation_input_tokens:
      typeof record.cache_creation_input_tokens === "number"
        ? record.cache_creation_input_tokens
        : null,
    cache_read_input_tokens:
      typeof record.cache_read_input_tokens === "number"
        ? record.cache_read_input_tokens
        : null,
  };
}

export function hydrateExamState(value: unknown): ExamState {
  const record = toRecord(value);

  return {
    active: Boolean(record.active),
    paused: Boolean(record.paused),
    duration_minutes: Number(record.duration_minutes ?? DEFAULT_EXAM_STATE.duration_minutes),
    problem_ids: Array.isArray(record.problem_ids)
      ? record.problem_ids.filter((item): item is string => typeof item === "string")
      : [],
    selected_problem_id: String(record.selected_problem_id ?? ""),
    started_at: String(record.started_at ?? ""),
    paused_at: String(record.paused_at ?? ""),
    total_paused_seconds: Number(record.total_paused_seconds ?? 0),
    last_autosave_at: String(record.last_autosave_at ?? ""),
  };
}
