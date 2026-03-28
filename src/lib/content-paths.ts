export function getLearnChapterPath(chapterId: string): string {
  return `/learn/${chapterId}`;
}

export function getLearnExercisePath(
  chapterId: string,
  exerciseId: string
): string {
  return `${getLearnChapterPath(chapterId)}/${exerciseId}`;
}

export function getPracticeProblemPath(problemId: string): string {
  return `/practice/${problemId}`;
}
