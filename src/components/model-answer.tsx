"use client";

import { useState } from "react";
import { trackEventOnce } from "@/lib/analytics";

interface Props {
  answer: string;
  exerciseKey: string;
}

export function ModelAnswer({ answer, exerciseKey }: Props) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <button
        onClick={() => {
          if (!revealed) {
            trackEventOnce("model_answer_revealed", `model_answer:${exerciseKey}`, {
              exercise: exerciseKey,
            });
          }

          setRevealed(!revealed);
        }}
        className="flex w-full items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span
          className="transition-transform"
          style={{ transform: revealed ? "rotate(90deg)" : "rotate(0deg)" }}
        >
          &#9654;
        </span>
        {revealed ? "Hide model answer" : "Show model answer"}
      </button>
      {revealed && (
        <pre className="mt-3 whitespace-pre-wrap rounded-md bg-muted p-4 text-sm font-mono leading-relaxed">
          {answer}
        </pre>
      )}
    </div>
  );
}
