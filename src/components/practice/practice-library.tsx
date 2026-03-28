"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PRACTICE_DIFFICULTIES,
  type PracticeDifficulty,
} from "@/lib/practice/types";

interface PracticeLibraryProblem {
  id: string;
  title: string;
  description: string;
  difficulty: PracticeDifficulty;
  tags: string[];
}

interface PracticeLibraryProps {
  problems: PracticeLibraryProblem[];
}

const difficultyMeta: Record<
  PracticeDifficulty,
  { badgeClassName: string; description: string; label: string }
> = {
  beginner: {
    label: "Beginner",
    description: "Tighter structure and lower ambiguity.",
    badgeClassName:
      "border-accent-green/30 bg-accent-green/15 text-accent-green",
  },
  intermediate: {
    label: "Intermediate",
    description: "More nuance, trade-offs, and format control.",
    badgeClassName:
      "border-accent-blue/30 bg-accent-blue/15 text-accent-blue",
  },
  advanced: {
    label: "Advanced",
    description: "Harder synthesis, planning, and reliability constraints.",
    badgeClassName: "border-primary/30 bg-primary/15 text-primary",
  },
};

export function PracticeLibrary({ problems }: PracticeLibraryProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<
    "all" | PracticeDifficulty
  >("all");

  const visibleProblems = useMemo(() => {
    if (difficultyFilter === "all") {
      return problems;
    }

    return problems.filter((problem) => problem.difficulty === difficultyFilter);
  }, [difficultyFilter, problems]);

  const groupedProblems = PRACTICE_DIFFICULTIES.map((difficulty) => ({
    difficulty,
    problems: visibleProblems.filter((problem) => problem.difficulty === difficulty),
  })).filter((group) => group.problems.length > 0);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Practice
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Open-ended prompt exercises with realistic inputs and hidden checks.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={difficultyFilter === "all" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setDifficultyFilter("all")}
        >
          All ({problems.length})
        </Button>
        {PRACTICE_DIFFICULTIES.map((difficulty) => (
          <Button
            key={difficulty}
            variant={difficultyFilter === difficulty ? "secondary" : "outline"}
            size="sm"
            onClick={() => setDifficultyFilter(difficulty)}
          >
            {difficultyMeta[difficulty].label}
          </Button>
        ))}
      </div>

      <div className="space-y-8">
        {groupedProblems.map((group) => (
          <section key={group.difficulty} className="space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-foreground">
                  {difficultyMeta[group.difficulty].label}
                </h2>
                <Badge variant="outline">{group.problems.length}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {difficultyMeta[group.difficulty].description}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.problems.map((problem) => (
                <Link
                  key={problem.id}
                  href={`/practice/${problem.id}`}
                  className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/35 hover:bg-accent/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                      {problem.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={difficultyMeta[problem.difficulty].badgeClassName}
                    >
                      {difficultyMeta[problem.difficulty].label}
                    </Badge>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {problem.description}
                  </p>
                  {problem.tags.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {problem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
