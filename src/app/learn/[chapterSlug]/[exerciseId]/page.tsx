import { notFound } from "next/navigation";
import Link from "next/link";
import { chapters, getExercise } from "@/lib/curriculum/data";
import { Badge } from "@/components/ui/badge";
import { ExerciseRunner } from "@/components/exercise-runner";

interface Props {
  params: Promise<{ chapterSlug: string; exerciseId: string }>;
}

export function generateStaticParams() {
  return chapters.flatMap((c) =>
    c.exercises.map((e) => ({ chapterSlug: c.slug, exerciseId: e.id }))
  );
}

export default async function ExercisePage({ params }: Props) {
  const { chapterSlug, exerciseId } = await params;
  const result = getExercise(chapterSlug, exerciseId);
  if (!result) notFound();

  const { chapter, exercise } = result;
  const exerciseIndex = chapter.exercises.findIndex(
    (e) => e.id === exerciseId
  );
  const prevExercise =
    exerciseIndex > 0 ? chapter.exercises[exerciseIndex - 1] : null;
  const nextExercise =
    exerciseIndex < chapter.exercises.length - 1
      ? chapter.exercises[exerciseIndex + 1]
      : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/learn" className="hover:text-foreground transition-colors">
          Curriculum
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/learn/${chapter.slug}`}
          className="hover:text-foreground transition-colors"
        >
          {chapter.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{exercise.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs capitalize">
            {chapter.difficulty}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Exercise {exerciseIndex + 1} of {chapter.exercises.length}
          </span>
        </div>
        <h1 className="text-2xl font-bold">{exercise.title}</h1>
        <p className="mt-2 text-muted-foreground">{exercise.description}</p>
      </div>

      {/* Task Card */}
      <div className="rounded-lg border border-border bg-card p-5 mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Your Task
        </h2>
        <p className="text-foreground leading-relaxed">{exercise.task}</p>
      </div>

      {/* Exercise Runner (client component) */}
      <ExerciseRunner exercise={exercise} chapterSlug={chapter.slug} />

      {/* Exercise navigation */}
      <div className="mt-10 flex items-center justify-between text-sm">
        {prevExercise ? (
          <Link
            href={`/learn/${chapter.slug}/${prevExercise.id}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; {prevExercise.title}
          </Link>
        ) : (
          <Link
            href={`/learn/${chapter.slug}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Back to chapter
          </Link>
        )}
        {nextExercise ? (
          <Link
            href={`/learn/${chapter.slug}/${nextExercise.id}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {nextExercise.title} &rarr;
          </Link>
        ) : (
          <Link
            href={`/learn/${chapter.slug}`}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to chapter &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
