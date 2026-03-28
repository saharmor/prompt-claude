"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PracticeSessionHeaderProps {
  isCurrentProblemCompleted?: boolean;
  nextProblemTitle?: string | null;
  onGoToNextProblem?: () => void;
}

export function PracticeSessionHeader({
  isCurrentProblemCompleted,
  nextProblemTitle,
  onGoToNextProblem,
}: PracticeSessionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Link
        href="/practice"
        className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Back to all exercises
      </Link>

      {isCurrentProblemCompleted ? (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-accent-green">
              Problem completed
            </p>
            <p className="text-sm text-accent-green/90">
              {nextProblemTitle
                ? `Next up: ${nextProblemTitle}`
                : "You have completed all available problems."}
            </p>
          </div>
          {nextProblemTitle ? (
            <Button onClick={onGoToNextProblem}>Next</Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
