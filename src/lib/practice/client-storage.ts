import {
  createBrowserStore,
  readBrowserJson,
} from "@/lib/browser-storage";
import { RUN_HISTORY_LIMIT } from "@/lib/practice/constants";
import {
  DEFAULT_EXAM_STATE,
  type ExamState,
  type RunResult,
} from "@/lib/practice/types";
import { hydrateExamState, hydrateRunResult } from "@/lib/practice/utils";

export const PRACTICE_STORAGE_KEY = "promptcraft_practice";
export const PRACTICE_CHANGE_EVENT = "promptcraft-practice-change";
const CURRENT_VERSION = 1;
const LEGACY_DRAFTS_KEY = "prompt-simulator-drafts";
const LEGACY_DRAFT_TIMESTAMPS_KEY = "prompt-simulator-draft-timestamps";
const LEGACY_EXAM_KEY = "prompt-simulator-exam";
const practiceStore = createBrowserStore(
  PRACTICE_STORAGE_KEY,
  PRACTICE_CHANGE_EVENT
);

export interface PracticeWorkspaceSnapshot {
  drafts: Record<string, string>;
  draftUpdatedAt: Record<string, string>;
  runs: RunResult[];
  examState: ExamState;
}

interface PracticeWorkspaceData extends PracticeWorkspaceSnapshot {
  __version: number;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function createEmptyWorkspace(): PracticeWorkspaceData {
  return {
    __version: CURRENT_VERSION,
    drafts: {},
    draftUpdatedAt: {},
    runs: [],
    examState: DEFAULT_EXAM_STATE,
  };
}

function normalizeStringRecord(value: unknown) {
  if (!isPlainObject(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, typeof entry === "string" ? entry : ""])
  );
}

function normalizeTimestampRecord(value: unknown) {
  if (!isPlainObject(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      const timestamp = typeof entry === "string" ? entry : "";
      return [key, Number.isFinite(Date.parse(timestamp)) ? timestamp : ""];
    })
  );
}

function normalizeWorkspace(value: unknown): PracticeWorkspaceData {
  if (!isPlainObject(value) || value.__version !== CURRENT_VERSION) {
    return createEmptyWorkspace();
  }

  return {
    __version: CURRENT_VERSION,
    drafts: normalizeStringRecord(value.drafts),
    draftUpdatedAt: normalizeTimestampRecord(value.draftUpdatedAt),
    runs: Array.isArray(value.runs)
      ? value.runs.filter((entry) => entry != null).map((entry) => hydrateRunResult(entry)).slice(0, RUN_HISTORY_LIMIT)
      : [],
    examState: hydrateExamState(value.examState),
  };
}

export function loadPracticeWorkspace() {
  const storedWorkspace = practiceStore.read<PracticeWorkspaceData | null>(null);
  const workspace = storedWorkspace
    ? normalizeWorkspace(storedWorkspace)
    : {
        __version: CURRENT_VERSION,
        drafts: normalizeStringRecord(
          readBrowserJson<Record<string, string>>(LEGACY_DRAFTS_KEY, {})
        ),
        draftUpdatedAt: normalizeTimestampRecord(
          readBrowserJson<Record<string, string>>(LEGACY_DRAFT_TIMESTAMPS_KEY, {})
        ),
        runs: [],
        examState: hydrateExamState(readBrowserJson<object | null>(LEGACY_EXAM_KEY, null)),
      };

  return {
    drafts: workspace.drafts,
    draftUpdatedAt: workspace.draftUpdatedAt,
    runs: workspace.runs,
    examState: workspace.examState,
  };
}

export function savePracticeWorkspace(workspace: PracticeWorkspaceSnapshot) {
  practiceStore.write(
    normalizeWorkspace({ __version: CURRENT_VERSION, ...workspace })
  );

  if (typeof window !== "undefined") {
    localStorage.removeItem(LEGACY_DRAFTS_KEY);
    localStorage.removeItem(LEGACY_DRAFT_TIMESTAMPS_KEY);
    localStorage.removeItem(LEGACY_EXAM_KEY);
  }
}

export function resetPracticeWorkspace() {
  practiceStore.remove();
}

export function subscribeToPracticeStorage(callback: () => void) {
  return practiceStore.subscribe(callback);
}
