"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BEST_PRACTICES, XML_TEMPLATES } from "@/lib/practice/constants";
import type { ExamState, Problem } from "@/lib/practice/types";
import { formatDuration } from "@/lib/practice/utils";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutList,
  Lightbulb,
} from "lucide-react";

interface ProblemSidebarProps {
  problems: Problem[];
  currentProblemId: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectProblem: (problemId: string) => void;
  onStartExam: () => void;
  onPauseResumeExam: () => void;
  onResetExam: () => void;
  onAppendTemplate: (template: string) => void;
  examState: ExamState;
  examProblems: Problem[];
  remainingSeconds: number;
}

export function ProblemSidebar({
  problems,
  currentProblemId,
  collapsed,
  onToggleCollapse,
  onSelectProblem,
  onStartExam,
  onPauseResumeExam,
  onResetExam,
  onAppendTemplate,
  examState,
  examProblems,
  remainingSeconds,
}: ProblemSidebarProps) {
  if (collapsed) {
    return (
      <div className="hidden flex-col items-center gap-1 rounded-2xl border border-border bg-card py-3 shadow-sm xl:flex">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Expand sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="my-1 h-px w-6 bg-border" />
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Problems"
        >
          <LayoutList className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Timer"
        >
          <Clock className="h-4 w-4" />
          {examState.active && (
            <span className="text-[10px] font-mono leading-none text-foreground">
              {formatDuration(remainingSeconds)}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title="Best Practices"
        >
          <Lightbulb className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card size="sm" className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground xl:flex"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div>
              <CardTitle>Problems</CardTitle>
              <CardDescription>
                Practice prompts against interview-style tasks.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="flex max-h-[20rem] flex-col gap-2 overflow-y-auto pr-1">
            {problems.map((problem) => {
              const isActive = problem.id === currentProblemId;

              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => onSelectProblem(problem.id)}
                  className={[
                    "rounded-xl border px-3 py-3 text-left transition-colors",
                    isActive
                      ? "border-primary/30 bg-primary/10 shadow-sm"
                      : "border-border bg-background hover:border-primary/40 hover:bg-accent/40",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {problem.title}
                    </span>
                  </div>
                  {problem.tags.length > 0 ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {problem.tags.join(" · ")}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-sm">
        <CardHeader>
          <CardTitle>Timer Mode</CardTitle>
          <CardDescription>
            Run a 55-minute mock practice block across multiple problems.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {examState.active ? (
            <>
              <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-3">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">
                  Time remaining
                </div>
                <div className="mt-1 font-mono text-xl font-semibold text-foreground">
                  {formatDuration(remainingSeconds)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onPauseResumeExam}>
                  {examState.paused ? "Resume" : "Pause"}
                </Button>
                <Button variant="ghost" size="sm" onClick={onResetExam}>
                  End
                </Button>
              </div>
              {examProblems.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Exam problems
                  </p>
                  <div className="flex flex-col gap-2">
                    {examProblems.map((problem) => (
                      <button
                        key={problem.id}
                        type="button"
                        onClick={() => onSelectProblem(problem.id)}
                        className={[
                          "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                          problem.id === currentProblemId
                            ? "border-primary/30 bg-primary/10 shadow-sm"
                            : "border-border bg-background hover:border-primary/40 hover:bg-accent/40",
                        ].join(" ")}
                      >
                        {problem.title}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <Button className="w-full" onClick={onStartExam}>
              Start 55-minute test
            </Button>
          )}
        </CardContent>
      </Card>

      <Card size="sm" className="shadow-sm">
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
            Drop in a template or use the reminders below while drafting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2 text-sm text-muted-foreground">
            {BEST_PRACTICES.map((tip) => (
              <li key={tip} className="rounded-lg bg-muted/60 px-3 py-2">
                {tip}
              </li>
            ))}
          </ul>
          <div className="grid gap-2">
            {Object.entries(XML_TEMPLATES).map(([label, template]) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                onClick={() => onAppendTemplate(template)}
              >
                Insert {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
