import type { NextRequest, NextResponse } from "next/server";

export const PRACTICE_SESSION_COOKIE = "practice_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getPracticeSession(request: NextRequest) {
  const existing = request.cookies.get(PRACTICE_SESSION_COOKIE)?.value?.trim() ?? "";

  if (existing && SESSION_ID_PATTERN.test(existing)) {
    return {
      sessionId: existing,
      shouldSetCookie: false,
    };
  }

  return {
    sessionId: crypto.randomUUID(),
    shouldSetCookie: true,
  };
}

export function attachPracticeSessionCookie(
  response: NextResponse,
  sessionId: string,
  shouldSetCookie: boolean
) {
  if (!shouldSetCookie) {
    return response;
  }

  response.cookies.set({
    name: PRACTICE_SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
