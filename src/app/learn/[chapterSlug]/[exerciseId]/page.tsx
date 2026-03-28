import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  chapters,
  getAdjacentExercise,
  getChapter,
  getExercise,
} from "@/lib/curriculum/data";
import { ExerciseRunner } from "@/components/exercise-runner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getLearnChapterPath,
  getLearnExercisePath,
} from "@/lib/content-paths";
import { createMetadata, siteName } from "@/lib/site-metadata";

interface Props {
  params: Promise<{ chapterSlug: string; exerciseId: string }>;
}

export function generateStaticParams() {
  return chapters.flatMap((chapter) =>
    chapter.exercises.map((exercise) => ({
      chapterSlug: chapter.id,
      exerciseId: exercise.id,
    }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapterSlug: chapterId, exerciseId } = await params;
  const result = getExercise(chapterId, exerciseId);

  if (!result) {
    return createMetadata({
      title: `Curriculum | ${siteName}`,
      description: "Explore the Prompt Claude curriculum.",
      path: "/learn",
    });
  }

  return createMetadata({
    title: `${result.exercise.title} | ${result.chapter.title} | ${siteName}`,
    description: result.exercise.description,
    path: getLearnExercisePath(result.chapter.id, result.exercise.id),
  });
}

export default async function LearnExercisePage({ params }: Props) {
  const { chapterSlug: chapterId, exerciseId } = await params;
  const result = getExercise(chapterId, exerciseId);
  if (!result) {
    notFound();
  }

  const { chapter, exercise } = result;
  const chapterIndex = chapters.findIndex((entry) => entry.id === chapter.id);
  const exerciseIndex = chapter.exercises.findIndex(
    (entry) => entry.id === exercise.id
  );
  const previousExercise = getAdjacentExercise(chapter.id, exercise.id, "previous");
  const nextExercise = getAdjacentExercise(chapter.id, exercise.id, "next");
  const chapterLessonPath = getLearnChapterPath(chapter.id);
  const prerequisiteTitles =
    chapter.prerequisites?.map(
      (prerequisiteId) => getChapter(prerequisiteId)?.title ?? prerequisiteId
    ) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/learn" className="transition-colors hover:text-foreground">
          Curriculum
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={chapterLessonPath}
          className="transition-colors hover:text-foreground"
        >
          {chapter.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{exercise.title}</span>
      </nav>

      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">
            {chapter.difficulty}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Chapter {chapterIndex + 1} of {chapters.length}
          </span>
          <span className="text-xs text-muted-foreground">
            Exercise {exerciseIndex + 1} of {chapter.exercises.length}
          </span>
        </div>
        <h1 className="text-3xl font-bold">{exercise.title}</h1>
        <p className="mt-2 text-muted-foreground">{exercise.description}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={chapterLessonPath}
            className="inline-flex h-9 items-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            &larr; Back to lesson
          </Link>
          <Link
            href={`${chapterLessonPath}#chapter-exercises`}
            className="inline-flex h-9 items-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            View chapter exercise list
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your Task
          </p>
          <p className="text-sm leading-relaxed">{exercise.task}</p>
        </section>
        <section className="rounded-lg border border-border bg-card p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Success Criteria
          </p>
          <p className="text-sm leading-relaxed">{exercise.successCriteria}</p>
        </section>
      </div>

      {prerequisiteTitles.length > 0 ? (
        <div className="mt-4 rounded-lg border border-border bg-card p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Recommended Background
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Review {prerequisiteTitles.join(", ")} before attempting this
            exercise for the best experience.
          </p>
        </div>
      ) : null}

      <Separator className="my-8" />

      <ExerciseRunner exercise={exercise} chapterId={chapter.id} />

      <div className="mt-10 flex items-center justify-between gap-4">
        {previousExercise ? (
          <Link
            href={getLearnExercisePath(
              previousExercise.chapter.id,
              previousExercise.exercise.id
            )}
            className="inline-flex min-h-10 items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            &larr; {previousExercise.exercise.title}
          </Link>
        ) : (
          <div />
        )}
        {nextExercise ? (
          <Link
            href={getLearnExercisePath(
              nextExercise.chapter.id,
              nextExercise.exercise.id
            )}
            className="inline-flex min-h-10 items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            {nextExercise.exercise.title} &rarr;
          </Link>
        ) : (
          <Link
            href="/learn"
            className="inline-flex min-h-10 items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Back to curriculum
          </Link>
        )}
      </div>
    </div>
  );
}
