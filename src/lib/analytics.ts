"use client";

import { track } from "@vercel/analytics";

type AnalyticsValue = string | number | boolean | null;
type AnalyticsData = Record<string, AnalyticsValue>;

const ONCE_KEY_PREFIX = "promptclaude_analytics_once";

export function trackEvent(name: string, data?: AnalyticsData) {
  try {
    track(name, data);
  } catch {
    // Ignore analytics failures so user interactions still succeed.
  }
}

export function trackEventOnce(
  name: string,
  dedupeKey: string,
  data?: AnalyticsData
) {
  if (typeof window === "undefined") return;

  const storageKey = `${ONCE_KEY_PREFIX}:${dedupeKey}`;

  try {
    if (window.localStorage.getItem(storageKey) === "1") {
      return;
    }

    track(name, data);
    window.localStorage.setItem(storageKey, "1");
  } catch {
    trackEvent(name, data);
  }
}
