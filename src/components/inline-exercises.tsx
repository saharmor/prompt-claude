"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ExerciseRunner } from "@/components/exercise-runner";
import { Button } from "@/components/ui/button";
import {
  getAttempt,
  PROGRESS_CHANGE_EVENT,
} from "@/lib/progress/storage";
import type { Exercise } from "@/lib/curriculum/schema";

interface Props {
  exercises: Exercise[];
  chapterSlug: string;
  nextChapterSlug?: string;
  nextChapterTitle?: string;
}

export function InlineExercises({
  exercises,
  chapterSlug,
  nextChapterSlug,
  nextChapterTitle,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const exerciseRefs = useRef<(HTMLDivElement | null)[]>([]);

  const refreshProgress = useCallback(() => {
    const passed = new Set<string>();
    for (const ex of exercises) {
      const attempt = getAttempt(chapterSlug, ex.id);
      if (attempt?.passed) passed.add(ex.id);
    }
    setPassedIds(passed);
    return passed;
  }, [exercises, chapterSlug]);

  useEffect(() => {
    const passed = refreshProgress();
    const firstIncomplete = exercises.findIndex((ex) => !passed.has(ex.id));
    setOpenIndex(firstIncomplete === -1 ? null : firstIncomplete);
  }, [exercises, chapterSlug, refreshProgress]);

  useEffect(() => {
    const handle = () => refreshProgress();
    window.addEventListener(PROGRESS_CHANGE_EVENT, handle);
    window.addEventListener("storage", handle);
    return () => {
      window.removeEventListener(PROGRESS_CHANGE_EVENT, handle);
      window.removeEventListener("storage", handle);
    };
  }, [refreshProgress]);

  const openExercise = useCallback((index: number) => {
    setOpenIndex(index);
    const el = exerciseRefs.current[index];
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  const completedCount = passedIds.size;
  const total = exercises.length;
  const allDone = completedCount === total;

  return (
    <div>
      {/* Section header + progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Practice What You Learned</h2>
          <span className="text-sm text-muted-foreground tabular-nums">
            {completedCount}/{total} completed
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${total > 0 ? (completedCount / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Exercise accordion */}
      <div className="flex flex-col gap-3">
        {exercises.map((exercise, idx) => {
          const isPassed = passedIds.has(exercise.id);
          const isOpen = openIndex === idx;
          const nextExercise = idx < exercises.length - 1 ? exercises[idx + 1] : null;

          return (
            <div
              key={exercise.id}
              ref={(el) => {
                exerciseRefs.current[idx] = el;
              }}
              className={`rounded-lg border overflow-hidden transition-colors ${
                isPassed
                  ? "border-success/30"
                  : isOpen
                    ? "border-primary/40"
                    : "border-border"
              } bg-card`}
            >
              {/* Header / trigger */}
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/40 transition-colors"
              >
                {isPassed ? (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-white text-xs font-bold">
                    &#10003;
                  </span>
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                    {idx + 1}
                  </span>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{exercise.title}</h3>
                  {!isOpen && (
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                      {exercise.description}
                    </p>
                  )}
                </div>

                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-border px-4 pb-5 pt-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    {exercise.description}
                  </p>

                  <div className="rounded-lg border border-border bg-muted/30 p-4 mb-5">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Your Task
                    </h4>
                    <p className="text-sm leading-relaxed">{exercise.task}</p>
                  </div>

                  <ExerciseRunner
                    key={`${chapterSlug}/${exercise.id}`}
                    exercise={exercise}
                    chapterSlug={chapterSlug}
                  />

                  {isPassed && nextExercise && (
                    <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-success/20 bg-success/5 p-3">
                      <p className="text-sm text-success">
                        Passed. Next: <strong>{nextExercise.title}</strong>
                      </p>
                      <Button size="sm" onClick={() => openExercise(idx + 1)}>
                        Next Exercise &rarr;
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion / next chapter */}
      {allDone && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-6 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white text-lg font-bold">
            &#10003;
          </span>
          <p className="font-semibold text-success">
            All exercises complete!
          </p>
          {nextChapterSlug && nextChapterTitle && (
            <Link
              href={`/learn/${nextChapterSlug}`}
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Continue to {nextChapterTitle} &rarr;
            </Link>
          )}
          {!nextChapterSlug && (
            <Link
              href="/learn"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Back to curriculum
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
