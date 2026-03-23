import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { chapters, getChapter } from "@/lib/curriculum/data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MarkdownContent } from "@/components/markdown-content";
import { InlineExercises } from "@/components/inline-exercises";
import {
  createMetadata,
  getChapterDescription,
  siteName,
} from "@/lib/site-metadata";

interface Props {
  params: Promise<{ chapterSlug: string }>;
}

export function generateStaticParams() {
  return chapters.map((c) => ({ chapterSlug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapterSlug } = await params;
  const chapter = getChapter(chapterSlug);

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
    path: `/learn/${chapter.slug}`,
  });
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
      </div>

      <Separator className="my-8" />

      {/* Inline Exercises */}
      <InlineExercises
        exercises={chapter.exercises}
        chapterSlug={chapter.slug}
        nextChapterSlug={nextChapter?.slug}
        nextChapterTitle={nextChapter?.title}
      />

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
