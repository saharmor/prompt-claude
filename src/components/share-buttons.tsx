"use client";

import { useSyncExternalStore } from "react";
import {
  XShareButton,
  XIcon,
  FacebookShareButton,
  FacebookIcon,
  RedditIcon,
} from "react-share";
import { trackEvent } from "@/lib/analytics";
import { siteName } from "@/lib/site-metadata";
import { chapters } from "@/lib/curriculum/data";

export const totalExercises = chapters.reduce((sum, ch) => sum + ch.exercises.length, 0);
export const totalChapters = chapters.length;

const shareText = `I just completed the ${siteName} course — all ${totalExercises} exercises across ${totalChapters} chapters of Claude prompt engineering.`;
const fallbackShareUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

interface Props {
  surface: "course_complete_overlay" | "curriculum_share_card";
}

function subscribeToShareUrl() {
  return () => {};
}

function getShareUrlSnapshot() {
  if (typeof window === "undefined") return fallbackShareUrl;
  return fallbackShareUrl || window.location.origin;
}

export function ShareButtons({ surface }: Props) {
  const url = useSyncExternalStore(
    subscribeToShareUrl,
    getShareUrlSnapshot,
    () => fallbackShareUrl
  );

  if (!url) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Share on
      </p>
      <div className="flex items-center gap-3">
        <XShareButton
          url={url}
          title={shareText}
          aria-label="Share on X"
          onClick={() => trackEvent("share_clicked", { platform: "x", surface })}
        >
          <XIcon size={44} borderRadius={12} />
        </XShareButton>

        <FacebookShareButton
          url={url}
          hashtag="#claudeai"
          aria-label="Share on Facebook"
          onClick={() =>
            trackEvent("share_clicked", { platform: "facebook", surface })
          }
        >
          <FacebookIcon size={44} borderRadius={12} />
        </FacebookShareButton>

        <a
          href={`https://www.reddit.com/r/PromptEngineering/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on Reddit"
          onClick={() =>
            trackEvent("share_clicked", { platform: "reddit", surface })
          }
        >
          <RedditIcon size={44} borderRadius={12} />
        </a>
      </div>
    </div>
  );
}
