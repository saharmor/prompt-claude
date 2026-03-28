import { APIUserAbortError } from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { getExercise } from "@/lib/curriculum/data";
import { gradeSubmission } from "@/lib/anthropic/grader";
import { MAX_PROMPT_LENGTH } from "@/lib/anthropic/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exerciseId, chapterId, userPrompt, apiKey } = body;

    if (!exerciseId || !chapterId || !userPrompt || !apiKey) {
      return NextResponse.json(
        { error: "Missing required fields: exerciseId, chapterId, userPrompt, apiKey" },
        { status: 400 }
      );
    }

    if (typeof userPrompt !== "string" || userPrompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt is too long. Please keep it under ${MAX_PROMPT_LENGTH.toLocaleString()} characters.` },
        { status: 400 }
      );
    }

    if (typeof apiKey !== "string" || !apiKey.startsWith("sk-ant-")) {
      return NextResponse.json(
        { error: "Invalid API key format. Anthropic keys start with 'sk-ant-'." },
        { status: 400 }
      );
    }

    const result = getExercise(chapterId, exerciseId);
    if (!result) {
      return NextResponse.json(
        { error: `Exercise not found: ${chapterId}/${exerciseId}` },
        { status: 404 }
      );
    }

    const gradeResult = await gradeSubmission(
      result.exercise,
      userPrompt,
      apiKey
    );

    return NextResponse.json(gradeResult);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Something went wrong during grading.";

    if (message.includes("authentication") || message.includes("401") || message.includes("invalid x-api-key")) {
      return NextResponse.json(
        { error: "Invalid Anthropic API key. Please check your key in settings." },
        { status: 401 }
      );
    }

    if (message.includes("rate") || message.includes("429")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    if (err instanceof APIUserAbortError || (err instanceof Error && err.name === "AbortError")) {
      return NextResponse.json(
        { error: "The grading request timed out. Please try again." },
        { status: 504 }
      );
    }

    console.error("Grading error:", message);
    return NextResponse.json(
      { error: "An unexpected error occurred during grading. Please try again." },
      { status: 500 }
    );
  }
}
