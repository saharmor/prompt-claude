"use client";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { Problem, TestCase } from "@/lib/practice/types";
import { buildInputPlaceholder } from "@/lib/practice/utils";

interface PracticeSetupPanelProps {
  currentProblem: Problem;
  currentInput: string;
  currentCaseId: string;
  visibleCases: TestCase[];
  onCaseChange: (caseId: string) => void;
  onInputChange: (value: string) => void;
}

export function PracticeSetupPanel({
  currentProblem,
  currentInput,
  currentCaseId,
  visibleCases,
  onCaseChange,
  onInputChange,
}: PracticeSetupPanelProps) {
  const placeholder = buildInputPlaceholder(currentProblem.input_variable_name);

  return (
    <section className="rounded-3xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {currentProblem.title}
              </h1>
              <Badge variant="outline" className="capitalize">
                {currentProblem.difficulty}
              </Badge>
            </div>
            {currentProblem.description ? (
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {currentProblem.description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              What the model receives
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {currentProblem.input_format || "This exercise does not define a separate input wrapper."}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Available input variable
            </p>
            <code className="mt-2 inline-flex rounded bg-background px-2 py-1 text-sm">
              {placeholder}
            </code>
            <p className="mt-2 text-sm text-muted-foreground">
              Use this variable directly in your prompt when you want the practice
              input inserted inline.
            </p>
          </div>

          {currentProblem.tags.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Focus areas
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {currentProblem.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-background p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Practice input
          </p>

          {visibleCases.length > 0 ? (
            <div className="space-y-2">
              <label htmlFor="practice-case" className="text-sm font-medium text-foreground">
                Scenario
              </label>
              <select
                id="practice-case"
                aria-label="Practice case"
                value={currentCaseId}
                onChange={(event) => onCaseChange(event.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {visibleCases.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="practice-input" className="text-sm font-medium text-foreground">
              Input content
            </label>
            <Textarea
              id="practice-input"
              rows={9}
              value={currentInput}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="Paste or edit a sample input..."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
