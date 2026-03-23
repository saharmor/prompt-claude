import type { Metadata } from "next";
import { chapters } from "@/lib/curriculum/data";
import type { Chapter } from "@/lib/curriculum/schema";

export const siteName = "Prompt Claude";
export const siteTagline = "Master Claude Prompt Engineering";
export const siteDescription =
  "Interactive exercises to sharpen your prompt engineering skills with Claude. Practice real techniques, get instant feedback, and level up your prompting.";
export const siteAuthor = "Sahar Mor";

const totalExercises = chapters.reduce(
  (sum, chapter) => sum + chapter.exercises.length,
  0
);

function normalizeSiteUrl(value: string): URL {
  return new URL(value.startsWith("http") ? value : `https://${value}`);
}

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    `http://localhost:${process.env.PORT ?? "3000"}`
);

export function createMetadata({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Prompt Claude logo and course branding",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: "/twitter-image",
          alt: "Prompt Claude logo and course branding",
        },
      ],
    },
  };
}

export function getCurriculumDescription() {
  return `Work through ${chapters.length} chapters and ${totalExercises} hands-on exercises to build real Claude prompt engineering skills.`;
}

export function getChapterDescription(chapter: Chapter) {
  const concepts = chapter.concepts.slice(0, 3).join(", ");
  const exerciseLabel = chapter.exercises.length === 1 ? "exercise" : "exercises";

  return `Learn ${chapter.title} in Prompt Claude. Explore ${concepts} and practice with ${chapter.exercises.length} ${exerciseLabel}.`;
}
