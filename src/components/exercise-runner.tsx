"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FeedbackPanel } from "@/components/feedback-panel";
import { ModelAnswer } from "@/components/model-answer";
import {
  saveAttempt,
  getAttempt,
  getSubmittedPrompt,
  saveSubmittedPrompt,
  getChapterProgress,
  isAllComplete,
} from "@/lib/progress/storage";
import { chapters } from "@/lib/curriculum/data";
import type { Exercise, GradeResult } from "@/lib/curriculum/schema";
import {
  OPEN_SETTINGS_EVENT,
  SETTINGS_CHANGE_EVENT,
  getDecryptedApiKey,
} from "@/components/settings-panel";
import { Award } from "lucide-react";
import { ShareButtons, totalExercises, totalChapters } from "@/components/share-buttons";
import { trackEvent, trackEventOnce } from "@/lib/analytics";

const allChaptersForCompletion = chapters.map((ch) => ({
  slug: ch.slug,
  exerciseIds: ch.exercises.map((e) => e.id),
}));
const chapterExerciseIdsBySlug = new Map(
  chapters.map((chapter) => [
    chapter.slug,
    chapter.exercises.map((exercise) => exercise.id),
  ])
);

interface Props {
  exercise: Exercise;
  chapterSlug: string;
}

export function ExerciseRunner({ exercise, chapterSlug }: Props) {
  const exerciseKey = `${chapterSlug}/${exercise.id}`;
  const [prompt, setPrompt] = useState(exercise.starterPrompt ?? "");
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAttemptPassed, setLastAttemptPassed] = useState<boolean | null>(null);
  const [showCourseComplete, setShowCourseComplete] = useState(false);
  const confettiFiredRef = useRef(false);
  const pendingSubmitAfterSettingsRef = useRef(false);

  useEffect(() => {
    const savedPrompt = getSubmittedPrompt(chapterSlug, exercise.id);
    setPrompt(savedPrompt ?? exercise.starterPrompt ?? "");

    const prev = getAttempt(chapterSlug, exercise.id);
    if (prev) {
      setLastAttemptPassed(prev.passed);
      setResult(prev.result ?? null);
    } else {
      setLastAttemptPassed(null);
      setResult(null);
    }
  }, [chapterSlug, exercise.id, exercise.starterPrompt]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("preview-complete")) {
        setShowCourseComplete(true);
      }
    }
  }, []);

  useEffect(() => {
    if (showCourseComplete && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      import("canvas-confetti").then(({ default: confetti }) => {
        const duration = 3500;
        const end = Date.now() + duration;
        const frame = () => {
          confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#E8694A", "#F5A623", "#7ED321", "#4A90E2"] });
          confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#E8694A", "#F5A623", "#7ED321", "#4A90E2"] });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      });
    }
  }, [showCourseComplete]);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsGrading(true);
    setError(null);
    setResult(null);

    try {
      const apiKey = await getDecryptedApiKey();
      if (!apiKey) {
        pendingSubmitAfterSettingsRef.current = true;
        setError("no-api-key");
        setIsGrading(false);
        return;
      }

      saveSubmittedPrompt(chapterSlug, exercise.id, prompt);

      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: exercise.id,
          chapterSlug,
          userPrompt: prompt,
          apiKey,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Grading failed (${res.status})`);
      }

      const data: GradeResult = await res.json();
      setResult(data);
      setLastAttemptPassed(data.passed);

      const chapterExerciseIds = chapterExerciseIdsBySlug.get(chapterSlug) ?? [
        exercise.id,
      ];
      const chapterProgressBefore = getChapterProgress(
        chapterSlug,
        chapterExerciseIds
      );
      const wasCourseComplete = isAllComplete(allChaptersForCompletion);

      saveAttempt({
        exerciseId: exercise.id,
        chapterSlug,
        passed: data.passed,
        score: data.score,
        submittedAt: new Date().toISOString(),
        result: data,
      });

      trackEvent("exercise_graded", {
        exercise: exerciseKey,
        passed: data.passed,
      });

      const chapterProgressAfter = getChapterProgress(chapterSlug, chapterExerciseIds);
      if (!chapterProgressBefore.allPassed && chapterProgressAfter.allPassed) {
        trackEvent("chapter_completed", {
          chapter_slug: chapterSlug,
        });
      }

      if (data.passed && !wasCourseComplete && isAllComplete(allChaptersForCompletion)) {
        trackEvent("course_completed");
        setShowCourseComplete(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsGrading(false);
    }
  }, [chapterSlug, exercise.id, exerciseKey, prompt]);

  useEffect(() => {
    async function handleSettingsChange(event: Event) {
      if (!pendingSubmitAfterSettingsRef.current) return;

      const hasApiKey =
        event instanceof CustomEvent &&
        typeof event.detail?.hasApiKey === "boolean"
          ? event.detail.hasApiKey
          : Boolean(await getDecryptedApiKey());

      if (!hasApiKey) return;

      pendingSubmitAfterSettingsRef.current = false;
      setError(null);
      void handleSubmit();
    }

    window.addEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);
    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);
    };
  }, [handleSubmit]);

  function handlePromptKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || (!event.metaKey && !event.ctrlKey)) {
      return;
    }

    event.preventDefault();
    if (!isGrading && prompt.trim()) {
      void handleSubmit();
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Course Complete Overlay */}
      {showCourseComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-primary/40 bg-card shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-blue/10 pointer-events-none" />
            <div className="relative flex flex-col items-center gap-5 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-8 w-8 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Course Complete!</h2>
                <p className="mt-2 text-muted-foreground">
                  You finished all <strong>{totalExercises} exercises</strong> across <strong>{totalChapters} chapters</strong> of Claude prompt engineering.
                </p>
              </div>

              <ShareButtons surface="course_complete_overlay" />

              <button
                onClick={() => setShowCourseComplete(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>

              <Link
                href="/learn"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                View full curriculum →
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* Previous attempt indicator */}
      {lastAttemptPassed !== null && !result && (
        <div
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
            lastAttemptPassed
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <span>{lastAttemptPassed ? "\u2713" : "\u25CB"}</span>
          {lastAttemptPassed
            ? "You previously passed this exercise."
            : "You attempted this exercise before. Try again!"}
        </div>
      )}

      {/* Prompt Editor */}
      <div>
        <label htmlFor="prompt-editor" className="mb-1.5 block text-sm font-medium">
          Your Prompt
        </label>
        <Textarea
          id="prompt-editor"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handlePromptKeyDown}
          placeholder="Write your prompt here..."
          className="min-h-[160px] font-mono text-sm bg-card resize-y"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={isGrading || !prompt.trim()}>
          {isGrading ? "Grading..." : "Submit for Grading"}
        </Button>
        <button
          onClick={() => {
            if (!showHints && exercise.hints.length > 0) {
              trackEventOnce("hints_revealed", `hints:${exerciseKey}`, {
                exercise: exerciseKey,
              });
            }

            setShowHints(!showHints);
          }}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {showHints ? "Hide hints" : "Show hints"}
        </button>
        <span className="text-xs text-muted-foreground">
          Cmd/Ctrl + Enter to submit
        </span>
      </div>

      {/* Hints */}
      {showHints && exercise.hints.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="mb-2 text-sm font-medium">Hints</p>
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {exercise.hints.map((hint, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-primary shrink-0">&#8226;</span>
                {hint}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error === "no-api-key" ? (
            <>
              Please set your Anthropic API key first{" "}
              <button
                onClick={() => {
                  pendingSubmitAfterSettingsRef.current = true;
                  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
                }}
                className="underline italic hover:opacity-80 transition-opacity cursor-pointer"
              >
                open settings
              </button>
            </>
          ) : (
            error
          )}
        </div>
      )}

      {/* Feedback */}
      {result && <FeedbackPanel result={result} />}

      {/* Model Answer */}
      <ModelAnswer answer={exercise.modelAnswer} exerciseKey={exerciseKey} />
    </div>
  );
}

