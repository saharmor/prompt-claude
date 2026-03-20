import { notFound } from "next/navigation";
import Link from "next/link";
import { chapters, getChapter } from "@/lib/curriculum/data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownContent } from "@/components/markdown-content";

interface Props {
  params: Promise<{ chapterSlug: string }>;
}

export function generateStaticParams() {
  return chapters.map((c) => ({ chapterSlug: c.slug }));
}

export default async function ChapterPage({ params }: Props) {
  const { chapterSlug } = await params;
  const chapter = getChapter(chapterSlug);
  if (!chapter) notFound();

  const chapterIndex = chapters.findIndex((c) => c.slug === chapterSlug);
  const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/learn" className="hover:text-foreground transition-colors">
          Curriculum
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{chapter.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs capitalize">
            {chapter.difficulty}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Chapter {chapterIndex + 1} of {chapters.length}
          </span>
        </div>
        <h1 className="text-3xl font-bold">{chapter.title}</h1>
        <p className="mt-2 text-muted-foreground">
          {chapter.concepts.join(" · ")}
        </p>
      </div>

      {/* Lesson Content */}
      <div className="rounded-lg border border-border bg-card p-6 mb-8">
        <MarkdownContent content={chapter.lessonContent} />
      </div>

      <Separator className="my-8" />

      {/* Exercises */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Exercises</h2>
        <div className="flex flex-col gap-3">
          {chapter.exercises.map((exercise, idx) => (
            <Link
              key={exercise.id}
              href={`/learn/${chapter.slug}/${exercise.id}`}
              className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {idx + 1}
              </span>
              <div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {exercise.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {exercise.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Chapter navigation */}
      <div className="mt-10 flex items-center justify-between">
        {prevChapter ? (
          <Link
            href={`/learn/${prevChapter.slug}`}
            className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted"
          >
            &larr; {prevChapter.title}
          </Link>
        ) : (
          <div />
        )}
        {nextChapter ? (
          <Link
            href={`/learn/${nextChapter.slug}`}
            className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted"
          >
            {nextChapter.title} &rarr;
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
