import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Simulator } from "@/components/practice/simulator";
import { loadProblems } from "@/lib/practice/storage";
import { createMetadata, siteName } from "@/lib/site-metadata";

interface Props {
  params: Promise<{ problemId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { problemId } = await params;
  const problems = await loadProblems();
  const problem = problems.find((entry) => entry.id === problemId);

  if (!problem) {
    return createMetadata({
      title: `Practice | ${siteName}`,
      description:
        "Open-ended Claude prompt practice with realistic inputs and automated review.",
      path: "/practice",
    });
  }

  return createMetadata({
    title: `${problem.title} | Practice | ${siteName}`,
    description: problem.description,
    path: `/practice/${problem.id}`,
  });
}

export default async function PracticeProblemPage({ params }: Props) {
  const { problemId } = await params;
  const problems = await loadProblems();
  const problem = problems.find((entry) => entry.id === problemId);

  if (!problem) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10">
      <Simulator initialProblemId={problemId} />
    </div>
  );
}
