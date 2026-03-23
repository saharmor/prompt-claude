"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { chapters } from "@/lib/curriculum/data";
import { trackEvent } from "@/lib/analytics";
import { loadProgress, PROGRESS_CHANGE_EVENT } from "@/lib/progress/storage";

const orderedChapters = [
  ...chapters.filter((c) => c.difficulty === "beginner"),
  ...chapters.filter((c) => c.difficulty === "intermediate"),
  ...chapters.filter((c) => c.difficulty === "advanced"),
];

function subscribeToProgress(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleChange = (event: Event) => {
    if (
      event instanceof StorageEvent &&
      event.key !== null &&
      event.key !== "promptcraft_progress"
    ) {
      return;
    }

    callback();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(PROGRESS_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(PROGRESS_CHANGE_EVENT, handleChange);
  };
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

  // Resume at the chapter that contains the first incomplete exercise.
  for (const chapter of orderedChapters) {
    for (const exercise of chapter.exercises) {
      if (!data.attempts[`${chapter.slug}/${exercise.id}`]?.passed) {
        return {
          href: `/learn/${chapter.slug}`,
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
  startHref = orderedChapters.length > 0 ? `/learn/${orderedChapters[0].slug}` : "/learn",
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
