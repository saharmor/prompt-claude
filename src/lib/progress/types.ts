import type { GradeResult } from "@/lib/curriculum/schema";

export interface ExerciseAttempt {
  exerciseId: string;
  chapterId: string;
  passed: boolean;
  score: number;
  submittedAt: string;
  result?: GradeResult;
}

export interface ProgressData {
  __version: number;
  attempts: Record<string, ExerciseAttempt>;
  submittedPrompts: Record<string, string>;
}

export const CURRENT_VERSION = 2;
