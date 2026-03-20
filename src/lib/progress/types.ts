export interface ExerciseAttempt {
  exerciseId: string;
  chapterSlug: string;
  passed: boolean;
  score: number;
  submittedAt: string;
}

export interface ProgressData {
  __version: number;
  attempts: Record<string, ExerciseAttempt>;
}

export const CURRENT_VERSION = 1;
