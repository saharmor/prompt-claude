import { ProgressData, ExerciseAttempt, CURRENT_VERSION } from "./types";

const STORAGE_KEY = "promptcraft_progress";

function createEmpty(): ProgressData {
  return { __version: CURRENT_VERSION, attempts: {} };
}

export function loadProgress(): ProgressData {
  if (typeof window === "undefined") return createEmpty();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmpty();

    const data = JSON.parse(raw) as ProgressData;

    if (data.__version !== CURRENT_VERSION) {
      return createEmpty();
    }

    return data;
  } catch {
    return createEmpty();
  }
}

export function saveAttempt(attempt: ExerciseAttempt): void {
  const data = loadProgress();
  const key = `${attempt.chapterSlug}/${attempt.exerciseId}`;

  data.attempts[key] = attempt;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getAttempt(
  chapterSlug: string,
  exerciseId: string
): ExerciseAttempt | null {
  const data = loadProgress();
  return data.attempts[`${chapterSlug}/${exerciseId}`] ?? null;
}

export function getChapterProgress(
  chapterSlug: string,
  exerciseIds: string[]
): { completed: number; total: number; allPassed: boolean } {
  const data = loadProgress();
  let completed = 0;

  for (const id of exerciseIds) {
    const attempt = data.attempts[`${chapterSlug}/${id}`];
    if (attempt?.passed) completed++;
  }

  return {
    completed,
    total: exerciseIds.length,
    allPassed: completed === exerciseIds.length,
  };
}

export function isAllComplete(
  chapters: { slug: string; exerciseIds: string[] }[]
): boolean {
  const data = loadProgress();

  for (const ch of chapters) {
    for (const id of ch.exerciseIds) {
      const attempt = data.attempts[`${ch.slug}/${id}`];
      if (!attempt?.passed) return false;
    }
  }

  return true;
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
