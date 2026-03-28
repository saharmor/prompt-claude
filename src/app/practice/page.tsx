import type { Metadata } from "next";
import { PracticeLibrary } from "@/components/practice/practice-library";
import { getSeedProblems } from "@/lib/practice/problems";
import { createMetadata, siteName } from "@/lib/site-metadata";

export const metadata: Metadata = createMetadata({
  title: `Practice | ${siteName}`,
  description:
    "Open-ended Claude prompt practice with editable problems, sample inputs, hidden checks, and instant coaching hints.",
  path: "/practice",
});

export default function PracticePage() {
  const problems = getSeedProblems();
  const libraryProblems = problems.map((problem) => ({
    id: problem.id,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    tags: problem.tags,
  }));

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10">
      <PracticeLibrary problems={libraryProblems} />
    </div>
  );
}
