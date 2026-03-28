"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  EvaluationResult,
  HiddenSuiteResult,
  Problem,
  RunResult,
} from "@/lib/practice/types";
import { buildRuntimePrompt, formatTimestamp } from "@/lib/practice/utils";

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
  runState: RunPanelState;
  runs: RunResult[];
  hints: Record<string, string>;
  hintLoading: Record<string, boolean>;
  onRequestHint: (checkKey: string, label: string, details: string) => void;
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
  runState,
  runs,
  hints,
  hintLoading,
  onRequestHint,
}: RunPanelProps) {
  const [copyFeedback, setCopyFeedback] = useState("");
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
    <section className="relative rounded-3xl border border-border bg-card shadow-sm">
      <div className="max-h-[42rem] overflow-y-auto xl:max-h-[calc(100vh-8rem)]">
        <div className="flex flex-col gap-5 p-6">
          <div className="space-y-1 rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">Review</p>
            <p className="text-sm text-muted-foreground">
              Inspect the evaluation, the generated output, and the submission
              history for this exercise.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Evaluation
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
            </div>

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
                      open
                    >
                      <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-primary">
                        {item.label}
                      </summary>
                      <div className="space-y-3 border-t border-primary/15 px-3 py-3 text-sm">
                        {item.issues.length > 0 ? (
                          <ul className="list-disc space-y-1.5 pl-4 text-foreground">
                            {item.issues.map((issue, issueIndex) => (
                              <li key={issueIndex}>{issue}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-foreground">{item.details}</p>
                        )}
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
            ) : (
              <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                Run your prompt to see automated evaluation feedback here first.
              </div>
            )}

          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Output
                </p>
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
                The generated output will appear here after you run the prompt.
              </div>
            )}

            {runState.hiddenSuite.length > 0 ? (
              <details className="rounded-xl border border-border bg-background">
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

          <details className="rounded-xl border border-border bg-background">
            <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
              Final prompt sent to Claude
            </summary>
            <pre className={promptPreviewClassName}>
              {buildRuntimePrompt(currentProblem, currentDraft, currentInput)}
            </pre>
          </details>

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
          className="absolute inset-0 flex items-center justify-center rounded-3xl bg-card/80 px-6 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-2xl border border-border bg-background px-8 py-4 text-center shadow-sm">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
            <p className="font-medium text-foreground">Running evaluation...</p>
            <p className="mt-1 text-sm text-muted-foreground">
              The output and checks will appear here when evaluation finishes.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
