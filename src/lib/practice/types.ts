export const DEFAULT_INPUT_WRAPPER_TEMPLATE = "\n\n<input>\n{input}\n</input>";

export interface TestCase {
  id: string;
  name: string;
  input_data: string;
  expected_output: string;
  notes: string;
  hidden: boolean;
}

export interface ValidatorConfig {
  kind: string;
  label: string;
  config: Record<string, unknown>;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  input_format: string;
  evaluator_expectation: string;
  starter_prompt: string;
  input_wrapper_template: string;
  input_variable_name: string;
  sample_cases: TestCase[];
  hidden_cases: TestCase[];
  validators: ValidatorConfig[];
  evaluator_hook: string;
  tags: string[];
  created_by_user: boolean;
}

export interface EvaluationResult {
  label: string;
  passed: boolean;
  details: string;
  kind: string;
}

export interface HiddenSuiteResult {
  case_id: string;
  name: string;
  passed: boolean;
  error: string;
  evaluation: EvaluationResult[];
}

export interface RunResult {
  run_id: string;
  created_at: string;
  problem_id: string;
  problem_title: string;
  provider: "anthropic";
  model_name: string;
  prompt_markdown: string;
  runtime_prompt: string;
  input_data: string;
  case_id: string;
  output_text: string;
  formatted_output: string;
  duration_seconds: number;
  evaluation: EvaluationResult[];
  hidden_suite: HiddenSuiteResult[];
  error: string;
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

export interface ExamState {
  active: boolean;
  paused: boolean;
  duration_minutes: number;
  problem_ids: string[];
  selected_problem_id: string;
  started_at: string;
  paused_at: string;
  total_paused_seconds: number;
  last_autosave_at: string;
}

export const DEFAULT_EXAM_STATE: ExamState = {
  active: false,
  paused: false,
  duration_minutes: 55,
  problem_ids: [],
  selected_problem_id: "",
  started_at: "",
  paused_at: "",
  total_paused_seconds: 0,
  last_autosave_at: "",
};

export interface PracticeConfig {
  hasAnthropicKey: boolean;
  anthropicModels: string[];
}

export interface BootstrapResponse {
  problems: Problem[];
  config: PracticeConfig;
}

export interface ProviderResponse {
  outputText: string;
  durationSeconds: number;
  error?: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  cacheCreationInputTokens?: number | null;
  cacheReadInputTokens?: number | null;
}
