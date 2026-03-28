"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { getLearnChapterPath, getLearnExercisePath } from "@/lib/content-paths";
import {
  getChapterProgress,
  subscribeToProgressStorage,
} from "@/lib/progress/storage";
import type { Exercise } from "@/lib/curriculum/schema";

interface Props {
  exercises: Exercise[];
  chapterId: string;
  nextChapterId?: string;
  nextChapterTitle?: string;
}

function serializeProgress(snapshot: {
  completed: number;
  total: number;
  allPassed: boolean;
  completedIds: string[];
}) {
  return [
    snapshot.completed,
    snapshot.total,
    snapshot.allPassed ? "1" : "0",
    snapshot.completedIds.join(","),
  ].join("|");
}

export function InlineExercises({
  exercises,
  chapterId,
  nextChapterId,
  nextChapterTitle,
}: Props) {
  const exerciseIds = useMemo(
    () => exercises.map((exercise) => exercise.id),
    [exercises]
  );
  const getProgressSnapshot = useCallback(() => {
    return getChapterProgress(chapterId, exerciseIds);
  }, [chapterId, exerciseIds]);
  const progressSnapshotRaw = useSyncExternalStore(
    subscribeToProgressStorage,
    () => serializeProgress(getProgressSnapshot()),
    () => serializeProgress(getProgressSnapshot())
  );
  const progressSnapshot = useMemo(() => {
    const [completedRaw, totalRaw, allPassedRaw, completedIdsRaw = ""] =
      progressSnapshotRaw.split("|");

    return {
      completed: Number(completedRaw),
      total: Number(totalRaw),
      allPassed: allPassedRaw === "1",
      completedIds: completedIdsRaw ? completedIdsRaw.split(",") : [],
    };
  }, [progressSnapshotRaw]);
  const completedIds = useMemo(() => {
    return new Set(progressSnapshot.completedIds);
  }, [progressSnapshot.completedIds]);
  const nextUpId = useMemo(() => {
    return (
      exercises.find((exercise) => !completedIds.has(exercise.id))?.id ?? null
    );
  }, [completedIds, exercises]);
  const nextChapterPath = nextChapterId
    ? getLearnChapterPath(nextChapterId)
    : null;

  if (exercises.length === 0) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Practice What You Learned</h2>
          <span className="text-sm tabular-nums text-muted-foreground">
            {progressSnapshot.completed}/{progressSnapshot.total} completed
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${
                progressSnapshot.total > 0
                  ? (progressSnapshot.completed / progressSnapshot.total) * 100
                  : 0
              }%`,
            }}
          />
        </div>
      </div>

      <div className="grid gap-3">
        {exercises.map((exercise, index) => {
          const isComplete = completedIds.has(exercise.id);
          const isNextUp = nextUpId === exercise.id;

          return (
            <Link
              key={exercise.id}
              href={getLearnExercisePath(chapterId, exercise.id)}
              className={`group flex items-start gap-4 rounded-xl border p-4 transition-colors ${
                isComplete
                  ? "border-success/30 bg-success/5 hover:border-success/50"
                  : isNextUp
                    ? "border-primary/40 bg-primary/5 hover:border-primary/60"
                    : "border-border bg-card hover:border-primary/30 hover:bg-accent/20"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  isComplete
                    ? "bg-success text-white"
                    : isNextUp
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? "\u2713" : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium transition-colors group-hover:text-primary">
                    {exercise.title}
                  </h3>
                  {isComplete ? (
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                      Complete
                    </span>
                  ) : null}
                  {!isComplete && isNextUp ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Next up
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {exercise.description}
                </p>
                <p className="mt-3 text-sm font-medium text-primary">
                  {isComplete
                    ? "Review exercise"
                    : isNextUp
                      ? progressSnapshot.completed === 0
                        ? "Start exercise"
                        : "Resume exercise"
                      : "Open exercise"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {progressSnapshot.allPassed ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-6 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-lg font-bold text-white">
            &#10003;
          </span>
          <p className="font-semibold text-success">All exercises complete!</p>
          {nextChapterPath && nextChapterTitle ? (
            <Link
              href={nextChapterPath}
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Continue to {nextChapterTitle} &rarr;
            </Link>
          ) : (
            <Link
              href="/learn"
              className="text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
            >
              Back to curriculum
            </Link>
          )}
        </div>
      ) : null}
    </div>
  );
}
