"use client";

import { useId, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type {
  EvaluationResult,
  HiddenSuiteResult,
  Problem,
  RunResult,
  TestCase,
} from "@/lib/practice/types";
import {
  buildInputPlaceholder,
  buildRuntimePrompt,
  formatTimestamp,
} from "@/lib/practice/utils";

interface RunPanelState {
  running: boolean;
  rawOutput: string;
  formattedOutput: string;
  evaluation: EvaluationResult[];
  hiddenSuite: HiddenSuiteResult[];
  error: string;
}

interface RunPanelProps {
  currentProblem: Problem;
  currentDraft: string;
  currentInput: string;
  currentCaseId: string;
  visibleCases: TestCase[];
  anthropicModels: string[];
  anthropicModel: string;
  includeHiddenSuite: boolean;
  runState: RunPanelState;
  runs: RunResult[];
  hints: Record<string, string>;
  hintLoading: Record<string, boolean>;
  onCaseChange: (caseId: string) => void;
  onInputChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onIncludeHiddenSuiteChange: (value: boolean) => void;
  onRun: () => void;
  onRequestHint: (checkKey: string, label: string, details: string) => void;
}

function isRunShortcut(event: React.KeyboardEvent<HTMLTextAreaElement>) {
  return (
    (event.metaKey || event.ctrlKey) &&
    (event.key === "Enter" || event.code === "Enter")
  );
}

const promptPreviewClassName =
  "max-h-80 overflow-auto border-t border-border px-3 py-3 text-xs whitespace-pre-wrap text-muted-foreground";

const runOutputClassName =
  "max-h-96 overflow-auto rounded-xl border border-border bg-background px-4 py-4 text-sm whitespace-pre-wrap";

const historyBlockClassName =
  "max-h-72 overflow-auto rounded-lg border border-border bg-background px-3 py-3 text-xs whitespace-pre-wrap";

export function RunPanel({
  currentProblem,
  currentDraft,
  currentInput,
  currentCaseId,
  visibleCases,
  anthropicModels,
  anthropicModel,
  includeHiddenSuite,
  runState,
  runs,
  hints,
  hintLoading,
  onCaseChange,
  onInputChange,
  onModelChange,
  onIncludeHiddenSuiteChange,
  onRun,
  onRequestHint,
}: RunPanelProps) {
  const [copyFeedback, setCopyFeedback] = useState("");
  const modelSelectId = useId();
  const caseSelectId = useId();
  const placeholder = buildInputPlaceholder(currentProblem.input_variable_name);
  const passCount = runState.evaluation.filter((item) => item.passed).length;
  const totalChecks = runState.evaluation.length;

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(runState.rawOutput);
      setCopyFeedback("Copied");
      window.setTimeout(() => setCopyFeedback(""), 1500);
    } catch {
      setCopyFeedback("Copy failed");
      window.setTimeout(() => setCopyFeedback(""), 2000);
    }
  }

  return (
    <section className="relative rounded-2xl border border-border bg-card shadow-sm">
      <div className="max-h-[42rem] overflow-y-auto xl:max-h-[calc(100vh-8rem)]">
        <div className="flex flex-col gap-5 p-5">
          <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Run &amp; Review</p>
              <p className="text-sm text-muted-foreground">
                Test the current prompt with editable inputs and inspect the
                output, checks, and history.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor={modelSelectId} className="sr-only">
                Claude model
              </label>
              <select
                id={modelSelectId}
                aria-label="Claude model"
                value={anthropicModel}
                onChange={(event) => onModelChange(event.target.value)}
                className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {anthropicModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              <Button onClick={onRun} disabled={runState.running}>
                {runState.running ? "Running..." : "Run"}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Practice Input
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Available placeholder: <code>{placeholder}</code>. If you use it
                in the prompt, the wrapper below is skipped.
              </p>
            </div>

            {visibleCases.length > 0 ? (
              <>
                <label htmlFor={caseSelectId} className="sr-only">
                  Practice case
                </label>
                <select
                  id={caseSelectId}
                  aria-label="Practice case"
                  value={currentCaseId}
                  onChange={(event) => onCaseChange(event.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {visibleCases.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </>
            ) : null}

            <Textarea
              rows={8}
              value={currentInput}
              onChange={(event) => onInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (isRunShortcut(event)) {
                  event.preventDefault();
                  onRun();
                }
              }}
              placeholder="Paste or edit a sample input..."
            />

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={includeHiddenSuite}
                onChange={(event) =>
                  onIncludeHiddenSuiteChange(event.target.checked)
                }
                className="accent-primary"
              />
              Also run hidden checks
            </label>

            <details className="rounded-xl border border-border bg-background">
              <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                Final prompt sent to Claude
              </summary>
              <pre className={promptPreviewClassName}>
                {buildRuntimePrompt(currentProblem, currentDraft, currentInput)}
              </pre>
            </details>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Output
                </p>
                {totalChecks > 0 ? (
                  <Badge
                    variant="outline"
                    className={
                      passCount === totalChecks
                        ? "border-accent-green/30 bg-accent-green/10 text-accent-green"
                        : "border-primary/30 bg-primary/10 text-primary"
                    }
                  >
                    {passCount}/{totalChecks} passed
                  </Badge>
                ) : null}
              </div>
              {runState.rawOutput ? (
                <div className="flex items-center gap-2">
                  {copyFeedback ? (
                    <span className="text-xs text-muted-foreground">{copyFeedback}</span>
                  ) : null}
                  <Button variant="ghost" size="sm" onClick={() => void copyOutput()}>
                    Copy
                  </Button>
                </div>
              ) : null}
            </div>

            {runState.error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive">
                {runState.error}
              </div>
            ) : null}

            {runState.rawOutput ? (
              <pre className={runOutputClassName}>
                {runState.formattedOutput || runState.rawOutput}
              </pre>
            ) : (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                Run a prompt to see output and automated evaluation here.
              </div>
            )}

            {runState.evaluation.length > 0 ? (
              <div className="space-y-2">
                {runState.evaluation.map((item, index) => {
                  const checkKey = `${item.label}-${index}`;

                  if (item.passed) {
                    return (
                      <div
                        key={checkKey}
                        className="rounded-xl border border-accent-green/30 bg-accent-green/10 px-3 py-2 text-sm text-accent-green"
                      >
                        <span className="font-medium">{item.label}</span>
                      </div>
                    );
                  }

                  return (
                    <details
                      key={checkKey}
                      className="rounded-xl border border-primary/30 bg-primary/8"
                    >
                      <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-primary">
                        {item.label}
                      </summary>
                      <div className="space-y-3 border-t border-primary/15 px-3 py-3 text-sm">
                        <p className="text-foreground">{item.details}</p>
                        {hints[checkKey] ? (
                          <div className="rounded-lg border border-border bg-background px-3 py-3 text-muted-foreground">
                            <div className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground">
                              Coaching hint
                            </div>
                            <p>{hints[checkKey]}</p>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={hintLoading[checkKey]}
                            onClick={() =>
                              onRequestHint(checkKey, item.label, item.details)
                            }
                          >
                            {hintLoading[checkKey] ? "Thinking..." : "Get a hint"}
                          </Button>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            ) : null}

            {runState.hiddenSuite.length > 0 ? (
              <details className="rounded-xl border border-border bg-background" open>
                <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                  Hidden checks (
                  {
                    runState.hiddenSuite.filter((item) => item.passed).length
                  }/{runState.hiddenSuite.length})
                </summary>
                <div className="grid gap-2 border-t border-border px-3 py-3">
                  {runState.hiddenSuite.map((item) => (
                    <div
                      key={item.case_id}
                      className={[
                        "rounded-lg border px-3 py-2 text-sm",
                        item.passed
                          ? "border-accent-green/30 bg-accent-green/10 text-accent-green"
                          : "border-primary/30 bg-primary/8 text-primary",
                      ].join(" ")}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </details>
            ) : null}
          </div>

          {runs.length > 0 ? (
            <details className="rounded-xl border border-border bg-background">
              <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                Submission history ({runs.length})
              </summary>
              <div className="space-y-3 border-t border-border px-3 py-3">
                {runs.map((run) => (
                  <details
                    key={run.run_id}
                    className="rounded-xl border border-border bg-card"
                  >
                    <summary className="cursor-pointer px-3 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">
                            {run.problem_title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(run.created_at)}
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>{run.model_name}</div>
                          <div>
                            {run.evaluation.length > 0
                              ? `${run.evaluation.filter((item) => item.passed).length}/${run.evaluation.length} passed`
                              : "No checks"}
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {run.output_text || run.error || "No output"}
                      </p>
                    </summary>
                    <div className="space-y-3 border-t border-border px-3 py-3 text-sm">
                      {run.error ? (
                        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-3 text-destructive">
                          {run.error}
                        </div>
                      ) : null}

                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Final prompt sent to Claude
                        </p>
                        <pre className={historyBlockClassName}>
                          {run.runtime_prompt || run.prompt_markdown || "No prompt captured."}
                        </pre>
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Practice input
                        </p>
                        <pre className={historyBlockClassName}>
                          {run.input_data || "No input captured."}
                        </pre>
                      </div>

                      <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Model output
                        </p>
                        <pre className={historyBlockClassName}>
                          {run.formatted_output || run.output_text || "No output captured."}
                        </pre>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ) : null}
        </div>
      </div>

      {runState.running ? (
        <div
          className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-2xl border border-border bg-background px-5 py-4 text-center shadow-sm">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
            <p className="font-medium text-foreground">Running evaluation...</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The output and checks will appear here when Claude finishes.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
