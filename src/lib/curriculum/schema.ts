export type Difficulty = "beginner" | "intermediate" | "advanced";

export type EvaluationType =
  | "string_match"
  | "structural_check"
  | "behavioral_check"
  | "llm_rubric"
  | "hybrid";

export interface Exercise {
  id: string;
  title: string;
  description: string;
  task: string;
  starterPrompt?: string;
  evaluationType: EvaluationType;
  successCriteria: string;
  hints: string[];
  modelAnswer: string;
}

export interface Chapter {
  slug: string;
  title: string;
  difficulty: Difficulty;
  concepts: string[];
  lessonContent: string;
  exercises: Exercise[];
  prerequisites?: string[];
}

export interface GradeResult {
  passed: boolean;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}
