"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { chapters } from "@/lib/curriculum/data";
import {
  getLearnChapterPath,
  getLearnExercisePath,
} from "@/lib/content-paths";
import { trackEvent } from "@/lib/analytics";
import {
  loadProgress,
  subscribeToProgressStorage,
} from "@/lib/progress/storage";

const orderedChapters = chapters;

function subscribeToProgress(callback: () => void) {
  return subscribeToProgressStorage(callback);
}

function resolveLearnHref(
  startHref: string
): { href: string; hasProgress: boolean } {
  const data = loadProgress();
  const hasAnyAttempt = Object.keys(data.attempts).length > 0;

  if (!hasAnyAttempt) {
    return {
      href: startHref,
      hasProgress: false,
    };
  }

  // Resume at the first incomplete exercise.
  for (const chapter of orderedChapters) {
    for (const exercise of chapter.exercises) {
      if (!data.attempts[`${chapter.id}/${exercise.id}`]?.passed) {
        return {
          href: getLearnExercisePath(chapter.id, exercise.id),
          hasProgress: true,
        };
      }
    }
  }

  // All chapters complete — send to curriculum overview
  return { href: "/learn", hasProgress: true };
}

interface Props {
  className?: string;
  startLabel?: string;
  resumeLabel?: string;
  startHref?: string;
  analyticsPlacement?: string;
}

function serializeResolvedLink(snapshot: {
  href: string;
  hasProgress: boolean;
}) {
  return `${snapshot.hasProgress ? "1" : "0"}|${snapshot.href}`;
}

export function SmartLearnLink({
  className,
  startLabel = "Start Learning",
  resumeLabel = "Resume Learning",
  startHref = orderedChapters.length > 0
    ? getLearnChapterPath(orderedChapters[0].id)
    : "/learn",
  analyticsPlacement = "unknown",
}: Props) {
  const resolvedSnapshot = useSyncExternalStore(
    subscribeToProgress,
    () => serializeResolvedLink(resolveLearnHref(startHref)),
    () => serializeResolvedLink({ href: startHref, hasProgress: false })
  );
  const separatorIndex = resolvedSnapshot.indexOf("|");
  const hasProgress = resolvedSnapshot.slice(0, separatorIndex) === "1";
  const href = resolvedSnapshot.slice(separatorIndex + 1);
  const label = hasProgress ? resumeLabel : startLabel;

  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackEvent("cta_learn_click", {
          placement: analyticsPlacement,
          has_progress: hasProgress,
        })
      }
    >
      {label}
    </Link>
  );
}
