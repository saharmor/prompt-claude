"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { Award } from "lucide-react";
import {
  isAllComplete,
  PROGRESS_CHANGE_EVENT,
} from "@/lib/progress/storage";
import { chapters } from "@/lib/curriculum/data";
import { ShareButtons, totalExercises, totalChapters } from "@/components/share-buttons";

const allChapters = chapters.map((chapter) => ({
  slug: chapter.slug,
  exerciseIds: chapter.exercises.map((exercise) => exercise.id),
}));

function subscribeToProgress(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key !== null &&
      event.key !== "promptcraft_progress"
    ) {
      return;
    }

    callback();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(PROGRESS_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(PROGRESS_CHANGE_EVENT, handleChange);
  };
}

function getCompletionSnapshot() {
  return isAllComplete(allChapters);
}

export function ShareCard() {
  const complete = useSyncExternalStore(
    subscribeToProgress,
    getCompletionSnapshot,
    () => false
  );
  const confettiFiredRef = useRef(false);

  useEffect(() => {
    if (complete && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      import("canvas-confetti").then(({ default: confetti }) => {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.4 },
          colors: ["#E8694A", "#F5A623", "#7ED321", "#4A90E2", "#BD10E0"],
        });
      });
    }
  }, [complete]);

  if (!complete) return null;

  return (
    <div className="my-8">
      <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-card shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-blue/10 pointer-events-none" />
        <div className="relative flex flex-col items-center gap-5 px-8 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Award className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Course Complete!</h3>
            <p className="mt-1.5 text-muted-foreground">
              You finished all <strong>{totalExercises} exercises</strong> across{" "}
              <strong>{totalChapters} chapters</strong> of Claude prompt engineering.
            </p>
          </div>
          <ShareButtons surface="curriculum_share_card" />
        </div>
      </div>
    </div>
  );
}
