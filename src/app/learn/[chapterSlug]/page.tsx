import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  chapters,
  getAdjacentChapter,
  getChapter,
} from "@/lib/curriculum/data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownContent } from "@/components/markdown-content";
import { InlineExercises } from "@/components/inline-exercises";
import {
  getLearnChapterPath,
  getLearnExercisePath,
} from "@/lib/content-paths";
import {
  createMetadata,
  getChapterDescription,
  siteName,
} from "@/lib/site-metadata";

interface Props {
  params: Promise<{ chapterSlug: string }>;
}

export function generateStaticParams() {
  return chapters.map((chapter) => ({ chapterSlug: chapter.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapterSlug: chapterId } = await params;
  const chapter = getChapter(chapterId);

  if (!chapter) {
    return createMetadata({
      title: `Curriculum | ${siteName}`,
      description: "Explore the Prompt Claude curriculum.",
      path: "/learn",
    });
  }

  return createMetadata({
    title: `${chapter.title} | ${siteName}`,
    description: getChapterDescription(chapter),
    path: getLearnChapterPath(chapter.id),
  });
}

export default async function ChapterPage({ params }: Props) {
  const { chapterSlug: chapterId } = await params;
  const chapter = getChapter(chapterId);
  if (!chapter) notFound();

  const chapterIndex = chapters.findIndex((entry) => entry.id === chapterId);
  const prevChapter = getAdjacentChapter(chapter.id, "previous");
  const nextChapter = getAdjacentChapter(chapter.id, "next");
  const firstExercise = chapter.exercises[0] ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
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
        {firstExercise ? (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={getLearnExercisePath(chapter.id, firstExercise.id)}
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start Chapter Exercises &rarr;
            </Link>
            <Link
              href="#chapter-exercises"
              className="inline-flex h-9 items-center rounded-md border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              Browse Exercises
            </Link>
          </div>
        ) : null}
      </div>

      <Separator className="my-8" />

      {/* Inline Exercises */}
      <div id="chapter-exercises">
        <InlineExercises
          exercises={chapter.exercises}
          chapterId={chapter.id}
          nextChapterId={nextChapter?.id}
          nextChapterTitle={nextChapter?.title}
        />
      </div>

      {/* Chapter navigation */}
      <div className="mt-10 flex items-center justify-between">
        {prevChapter ? (
          <Link
            href={getLearnChapterPath(prevChapter.id)}
            className="inline-flex h-7 items-center rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted"
          >
            &larr; {prevChapter.title}
          </Link>
        ) : (
          <div />
        )}
        {nextChapter ? (
          <Link
            href={getLearnChapterPath(nextChapter.id)}
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
