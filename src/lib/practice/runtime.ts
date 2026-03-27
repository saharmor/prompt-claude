import type { Problem } from "@/lib/practice/types";
import { buildRuntimePromptParts } from "@/lib/practice/utils";

export function composeRuntimePrompt(
  problem: Problem,
  promptMarkdown: string,
  inputData: string
) {
  const { prefix, suffix } = buildRuntimePromptParts(
    problem,
    promptMarkdown,
    inputData
  );

  return {
    promptUsesVariable: suffix.length === 0,
    promptPrefix: prefix,
    promptSuffix: suffix,
    promptText: `${prefix}${suffix}`,
  };
}

export function buildHintPromptParts({
  checkLabel,
  checkDetails,
  userPrompt,
  modelOutput,
  problemDescription,
}: {
  checkLabel: string;
  checkDetails: string;
  userPrompt: string;
  modelOutput: string;
  problemDescription: string;
}) {
  const prefix =
    "You are a prompt engineering coach. A student is practicing writing prompts and one of the automated checks failed. Help them understand why and how to fix it.\n\n" +
    "Give a brief, specific coaching hint (2-4 sentences). Explain what went wrong and suggest a concrete change to the prompt. Do not give them the full answer; guide them to figure it out.\n\n" +
    "Use the context below.\n\n";

  const suffix =
    `<task_description>\n${problemDescription}\n</task_description>\n\n` +
    `<student_prompt>\n${userPrompt}\n</student_prompt>\n\n` +
    `<model_output_excerpt>\n${modelOutput.slice(0, 1500)}\n</model_output_excerpt>\n\n` +
    `<failed_check>\nCheck: ${checkLabel}\nReason: ${checkDetails}\n</failed_check>\n`;

  return { prefix, suffix };
}
