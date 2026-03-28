import type { Metadata } from "next";
import Link from "next/link";
import { chapters } from "@/lib/curriculum/data";
import { Badge } from "@/components/ui/badge";
import { ChapterProgress } from "@/components/chapter-progress";
import { ShareCard } from "@/components/share-card";
import {
  createMetadata,
  getCurriculumDescription,
  siteName,
} from "@/lib/site-metadata";

const difficultyColor: Record<string, string> = {
  beginner: "bg-accent-green/15 text-accent-green border-accent-green/30",
  intermediate: "bg-accent-blue/15 text-accent-blue border-accent-blue/30",
  advanced: "bg-primary/15 text-primary border-primary/30",
};

export const metadata: Metadata = createMetadata({
  title: `Curriculum | ${siteName}`,
  description: getCurriculumDescription(),
  path: "/learn",
});

export default function LearnPage() {
  const grouped = {
    beginner: chapters.filter((c) => c.difficulty === "beginner"),
    intermediate: chapters.filter((c) => c.difficulty === "intermediate"),
    advanced: chapters.filter((c) => c.difficulty === "advanced"),
  };

  const sections: { label: string; key: keyof typeof grouped; description: string }[] = [
    {
      label: "Beginner",
      key: "beginner",
      description: "Core mechanics of prompting — how to structure messages, be specific, and set roles.",
    },
    {
      label: "Intermediate",
      key: "intermediate",
      description: "Level up with XML structuring, output control, chain-of-thought reasoning, and few-shot examples.",
    },
    {
      label: "Advanced",
      key: "advanced",
      description: "Production-grade techniques: hallucination prevention, complex multi-technique prompts, chaining, and tool use.",
    },
  ];

  // Pre-compute a stable 1-based index for each chapter to avoid mutating state inside JSX
  const allChaptersInOrder = sections.flatMap((s) => grouped[s.key]);
  const chapterIndexMap = new Map(
    allChaptersInOrder.map((c, i) => [c.slug, i + 1])
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold">Curriculum</h1>
        <p className="mt-2 text-muted-foreground">
          Work through the chapters in order for the recommended path, or jump
          to any topic that interests you.
        </p>
      </div>

      <ShareCard />

      <Link
        href="/practice"
        className="group flex items-start gap-4 rounded-lg border border-primary/30 bg-primary/5 p-4 transition-colors hover:border-primary/60 hover:bg-primary/10"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          &rarr;
        </span>
        <div>
          <h3 className="font-medium group-hover:text-primary transition-colors">
            Practice Simulator
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ready to go beyond guided exercises? Tackle open-ended problems with hidden test cases, timed drills, and coaching hints.
          </p>
        </div>
      </Link>

      <div id="curriculum" className="flex flex-col gap-12">
        {sections.map((section) => (
          <div key={section.key}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{section.label}</h2>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>
            <div className="flex flex-col gap-3">
              {grouped[section.key].map((chapter) => (
                  <Link
                    key={chapter.slug}
                    href={`/learn/${chapter.slug}`}
                    className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {chapterIndexMap.get(chapter.slug)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {chapter.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${difficultyColor[chapter.difficulty]}`}
                        >
                          {chapter.difficulty}
                        </Badge>
                        <ChapterProgress
                          chapterSlug={chapter.slug}
                          exerciseIds={chapter.exercises.map((e) => e.id)}
                        />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {chapter.concepts.join(" · ")}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {chapter.exercises.length}{" "}
                        {chapter.exercises.length === 1 ? "exercise" : "exercises"}
                        {chapter.prerequisites && chapter.prerequisites.length > 0 && (
                          <span className="ml-2 text-muted-foreground/60">
                            · Recommended after:{" "}
                            {chapter.prerequisites
                              .map(
                                (slug) =>
                                  chapters.find((c) => c.slug === slug)?.title ?? slug
                              )
                              .join(", ")}
                          </span>
                        )}
                      </p>
                    </div>
                  </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
