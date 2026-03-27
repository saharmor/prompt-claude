import { NextResponse } from "next/server";
import { DEFAULT_ANTHROPIC_MODELS } from "@/lib/practice/constants";
import { loadProblems } from "@/lib/practice/storage";

export const runtime = "nodejs";

export async function GET() {
  const problems = await loadProblems();

  const clientProblems = problems.map((problem) => ({
    ...problem,
    hidden_cases: [],
  }));

  return NextResponse.json({
    problems: clientProblems,
    config: {
      hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
      anthropicModels: DEFAULT_ANTHROPIC_MODELS,
    },
  });
}
