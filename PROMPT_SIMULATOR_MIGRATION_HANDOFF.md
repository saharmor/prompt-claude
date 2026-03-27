# Prompt Simulator Migration Handoff

## What We Changed

- Moved the old local prompt simulator concept into the `claude-prompting` app as a first-class `Practice` section.
- Added a new nav item next to `Curriculum` that links to `/practice`.
- Added a new page at `src/app/practice/page.tsx`.
- Rebuilt the simulator UI in Next.js/React/TypeScript under `src/components/practice/`:
  - `simulator.tsx`
  - `problem-sidebar.tsx`
  - `prompt-editor.tsx`
  - `run-panel.tsx`
- Ported the shared simulator logic into `src/lib/practice/`:
  - `types.ts`
  - `constants.ts`
  - `utils.ts`
  - `runtime.ts`
  - `evaluation.ts`
  - `anthropic-runner.ts`
  - `problems.ts`
  - `storage.ts`
- Added Next.js API routes under `src/app/api/practice/`:
  - `bootstrap`
  - `run`
  - `hint`
- Moved the 4 seed problems into `src/lib/practice/problems/*.json`.
- Added browser-local practice persistence aligned with the curriculum approach.
- Kept `data/practice/problems.json` as the optional server-side problem source/seed file.
- Added runtime request validation and lightweight rate limiting for practice runs and hints.
- Kept hidden test-case inputs server-side so the browser only receives visible cases.
- Removed the old temporary source project from `wispr-action/_scratch/prompt-simulator`.

## Important Implementation Notes

- This is a Next.js-native port, not an embedded Flask/Vite app.
- The new `Practice` area is Anthropic-only for now. Ollama was intentionally not ported in v1.
- Practice drafts, run history, and exam state now live in browser storage, matching the curriculum.
- Server-side file storage is only used for practice problem definitions (`data/practice/problems.json`), not user workspace state.
- The simulator reuses the app's existing Anthropic key model:
  - browser-stored key via the existing settings panel
  - or `ANTHROPIC_API_KEY` from the server environment
- Prompt evaluation, hidden checks, and hint generation were ported to TypeScript.
- Prompt caching logic from the old Anthropic runner was also ported.

## Key Files To Know

- Navigation:
  - `src/components/nav-bar.tsx`
  - `src/app/layout.tsx`
- Practice page:
  - `src/app/practice/page.tsx`
- Practice UI:
  - `src/components/practice/*`
- Practice runtime + storage:
  - `src/lib/practice/*`
- Practice API:
  - `src/app/api/practice/*`

## What Was Deferred

- Ollama support
- Problem import/export
- Draft ZIP export
- SQLite history persistence

## Validation Done

- `npm run build` passed in `claude-prompting`.
- `npm run lint` passed in `claude-prompting`.
- Browser smoke test passed for:
  - nav link to `Practice`
  - loading `/practice`
  - simulator rendering
  - missing API key guard
  - timer countdown updates live
  - runtime prompt preview resolves legacy `{{INPUT}}` placeholders correctly

## Remaining Work / Recommended Next Steps

- Run real end-to-end simulator tests with a valid Anthropic API key.
- Decide whether browser-local practice state is enough long-term or should move to a DB-backed account model.
- Polish the UI to feel even more native to the rest of `claude-prompting`.
- Consider whether custom problem editing should remain user-facing or be simplified.
- If needed later, add back:
  - import/export
  - better history persistence
  - Ollama/local-model support
