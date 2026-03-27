"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  OPEN_SETTINGS_EVENT,
  SETTINGS_CHANGE_EVENT,
} from "@/components/settings-panel";
import { ProblemSidebar } from "@/components/practice/problem-sidebar";
import { PromptEditor } from "@/components/practice/prompt-editor";
import { RunPanel } from "@/components/practice/run-panel";
import {
  loadPracticeWorkspace,
  savePracticeWorkspace,
} from "@/lib/practice/client-storage";
import type {
  BootstrapResponse,
  HiddenSuiteResult,
  Problem,
} from "@/lib/practice/types";
import {
  DEFAULT_EXAM_STATE,
  type EvaluationResult,
  type RunResult,
} from "@/lib/practice/types";
import {
  computeRemainingSeconds,
  buildInputPlaceholder,
  hydrateExamState,
  isoNow,
  replaceInputVariable,
} from "@/lib/practice/utils";

interface RunState {
  running: boolean;
  rawOutput: string;
  formattedOutput: string;
  evaluation: EvaluationResult[];
  hiddenSuite: HiddenSuiteResult[];
  error: string;
}

const EMPTY_RUN_STATE: RunState = {
  running: false,
  rawOutput: "",
  formattedOutput: "",
  evaluation: [],
  hiddenSuite: [],
  error: "",
};

function getStoredApiKey() {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    localStorage.getItem("anthropic_api_key") ??
    sessionStorage.getItem("anthropic_api_key") ??
    ""
  );
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }

  return payload as T;
}

function buildExamSummary(problemIds: string[], problems: Problem[], drafts: Record<string, string>) {
  return problemIds.map((problemId) => {
    const problem = problems.find((item) => item.id === problemId);
    return {
      problemId,
      title: problem?.title || problemId,
      prompt: drafts[problemId] ?? problem?.starter_prompt ?? "",
    };
  });
}

function normalizeDraftsForProblems(
  draftMap: Record<string, string>,
  problemList: Problem[]
) {
  const problemsById = new Map(problemList.map((problem) => [problem.id, problem]));

  return Object.fromEntries(
    Object.entries(draftMap).map(([problemId, draft]) => {
      const problem = problemsById.get(problemId);
      if (!problem) {
        return [problemId, draft];
      }

      return [
        problemId,
        replaceInputVariable(draft, problem.input_variable_name, buildInputPlaceholder(problem.input_variable_name)).text,
      ];
    })
  );
}

export function Simulator() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [draftUpdatedAt, setDraftUpdatedAt] = useState<Record<string, string>>({});
  const [runs, setRuns] = useState<RunResult[]>([]);
  const [examState, setExamState] = useState(DEFAULT_EXAM_STATE);
  const [examSummary, setExamSummary] = useState<
    { problemId: string; title: string; prompt: string }[]
  >([]);
  const [config, setConfig] = useState<BootstrapResponse["config"]>({
    hasAnthropicKey: false,
    anthropicModels: ["claude-sonnet-4-6"],
  });
  const [currentProblemId, setCurrentProblemId] = useState("");
  const [currentCaseId, setCurrentCaseId] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [anthropicModel, setAnthropicModel] = useState("claude-sonnet-4-6");
  const [anthropicApiKey, setAnthropicApiKey] = useState("");
  const [includeHiddenSuite, setIncludeHiddenSuite] = useState(false);
  const [runState, setRunState] = useState<RunState>(EMPTY_RUN_STATE);
  const [hints, setHints] = useState<Record<string, string>>({});
  const [hintLoading, setHintLoading] = useState<Record<string, boolean>>({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingActionAfterSettings, setPendingActionAfterSettings] = useState<
    "run" | null
  >(null);
  const [, setTimerTick] = useState(0);
  const [isWideViewport, setIsWideViewport] = useState(false);
  const activeProblemIdRef = useRef("");
  const runRequestIdRef = useRef(0);
  const hintContextIdRef = useRef(0);
  const latestExamStateRef = useRef(examState);
  const latestProblemsRef = useRef(problems);
  const latestDraftsRef = useRef(drafts);

  const currentProblem = useMemo(
    () => problems.find((problem) => problem.id === currentProblemId) ?? problems[0] ?? null,
    [currentProblemId, problems]
  );
  const visibleCases = currentProblem?.sample_cases ?? [];
  const currentCase =
    visibleCases.find((item) => item.id === currentCaseId) ?? visibleCases[0] ?? null;
  const currentDraft = currentProblem
    ? drafts[currentProblem.id] ?? currentProblem.starter_prompt ?? ""
    : "";
  const examProblems = useMemo(
    () =>
      examState.problem_ids
        .map((problemId) => problems.find((problem) => problem.id === problemId))
        .filter((problem): problem is Problem => Boolean(problem)),
    [examState.problem_ids, problems]
  );
  const effectiveSidebarCollapsed = sidebarCollapsed && isWideViewport;
  const remainingSeconds = computeRemainingSeconds(examState);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const payload = await fetchJson<BootstrapResponse>("/api/practice/bootstrap");
        const workspace = loadPracticeWorkspace();
        const nextDrafts = normalizeDraftsForProblems(
          workspace.drafts,
          payload.problems
        );
        const nextExamState = hydrateExamState(workspace.examState);
        const firstProblem = payload.problems[0];

        setProblems(payload.problems);
        setDrafts(nextDrafts);
        setDraftUpdatedAt(workspace.draftUpdatedAt);
        setRuns(workspace.runs);
        setConfig(payload.config);
        setAnthropicModel(
          payload.config.anthropicModels[0] ?? "claude-sonnet-4-6"
        );
        setAnthropicApiKey(getStoredApiKey());
        setExamState(nextExamState);

        if (nextExamState.selected_problem_id) {
          setCurrentProblemId(nextExamState.selected_problem_id);
        } else if (firstProblem) {
          setCurrentProblemId(firstProblem.id);
          setCurrentCaseId(firstProblem.sample_cases[0]?.id ?? "");
          setCurrentInput(firstProblem.sample_cases[0]?.input_data ?? "");
        }
      } catch (bootstrapError) {
        setError(
          bootstrapError instanceof Error
            ? bootstrapError.message
            : "Could not load practice mode."
        );
      } finally {
        setLoading(false);
      }
    };

    bootstrap().catch(() => {});
  }, []);

  useEffect(() => {
    activeProblemIdRef.current = currentProblem?.id ?? "";
  }, [currentProblem]);

  useEffect(() => {
    latestExamStateRef.current = examState;
  }, [examState]);

  useEffect(() => {
    latestProblemsRef.current = problems;
  }, [problems]);

  useEffect(() => {
    latestDraftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const updateViewport = () => setIsWideViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  const handleRun = useCallback(async () => {
    if (!currentProblem || runState.running) {
      return;
    }

    if (!anthropicModel) {
      setError("Choose a Claude model before running.");
      return;
    }

    if (!anthropicApiKey.trim() && !config.hasAnthropicKey) {
      setPendingActionAfterSettings("run");
      setError("no-api-key");
      return;
    }

    const requestProblemId = currentProblem.id;
    const requestId = runRequestIdRef.current + 1;
    runRequestIdRef.current = requestId;
    hintContextIdRef.current += 1;

    setRunState((previous) => ({ ...previous, running: true, error: "" }));
    setHints({});
    setHintLoading({});

    try {
      const payload = await fetchJson<{ run: RunResult }>("/api/practice/run", {
        method: "POST",
        body: JSON.stringify({
          modelName: anthropicModel,
          apiKey: anthropicApiKey.trim() || undefined,
          problemId: currentProblem.id,
          promptMarkdown: currentDraft,
          inputData: currentInput,
          caseId: currentCase?.id ?? null,
          includeHiddenSuite,
        }),
      });

      if (
        runRequestIdRef.current !== requestId ||
        activeProblemIdRef.current !== requestProblemId
      ) {
        return;
      }

      const run = payload.run;
      setRunState({
        running: false,
        rawOutput: run.output_text,
        formattedOutput: run.formatted_output,
        evaluation: run.evaluation,
        hiddenSuite: run.hidden_suite,
        error: run.error,
      });
      setRuns((previous) => [run, ...previous].slice(0, 20));
      setError("");
    } catch (runError) {
      if (
        runRequestIdRef.current !== requestId ||
        activeProblemIdRef.current !== requestProblemId
      ) {
        return;
      }

      const message =
        runError instanceof Error ? runError.message : "Could not run prompt.";
      setRunState((previous) => ({
        ...previous,
        running: false,
        error: message,
      }));
      setError(message);
    }
  }, [
    anthropicApiKey,
    anthropicModel,
    config.hasAnthropicKey,
    currentCase?.id,
    currentDraft,
    currentInput,
    currentProblem,
    includeHiddenSuite,
    runState.running,
  ]);

  useEffect(() => {
    function handleSettingsChange(event: Event) {
      const nextApiKey = getStoredApiKey();
      setAnthropicApiKey(nextApiKey);

      if (pendingActionAfterSettings !== "run") {
        return;
      }

      const hasApiKey =
        event instanceof CustomEvent &&
        typeof event.detail?.hasApiKey === "boolean"
          ? event.detail.hasApiKey
          : Boolean(nextApiKey || config.hasAnthropicKey);

      if (!hasApiKey) {
        return;
      }

      setPendingActionAfterSettings(null);
      setError("");
      void handleRun();
    }

    window.addEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);
    return () => window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);
  }, [config.hasAnthropicKey, pendingActionAfterSettings, handleRun]);

  useEffect(() => {
    if (!currentProblem && problems.length > 0) {
      setCurrentProblemId(problems[0].id);
    }
  }, [currentProblem, problems]);

  useEffect(() => {
    if (!currentProblem) {
      return;
    }

    runRequestIdRef.current += 1;
    hintContextIdRef.current += 1;
    setCurrentCaseId(currentProblem.sample_cases[0]?.id ?? "");
    setCurrentInput(currentProblem.sample_cases[0]?.input_data ?? "");
    setRunState(EMPTY_RUN_STATE);
    setHints({});
    setHintLoading({});
  }, [currentProblem]);

  useEffect(() => {
    if (!currentCase) {
      return;
    }

    setCurrentInput(currentCase.input_data || "");
  }, [currentCaseId, currentCase]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        savePracticeWorkspace({
          drafts,
          draftUpdatedAt,
          runs,
          examState,
        });
        setSaveError("");
      } catch (saveError) {
        setSaveError(
          saveError instanceof Error
            ? saveError.message
            : "Could not save practice workspace."
        );
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [draftUpdatedAt, drafts, examState, loading, runs]);

  useEffect(() => {
    if (!examState.active) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimerTick((previous) => previous + 1);
      const currentExamState = latestExamStateRef.current;
      const remaining = computeRemainingSeconds(currentExamState);

      if (remaining <= 0) {
        setExamSummary(
          buildExamSummary(
            currentExamState.problem_ids,
            latestProblemsRef.current,
            latestDraftsRef.current
          )
        );
        setExamState(DEFAULT_EXAM_STATE);
        return;
      }

      const lastAutosave = currentExamState.last_autosave_at
        ? new Date(currentExamState.last_autosave_at).getTime()
        : 0;

      if (Date.now() - lastAutosave >= 30_000) {
        setExamState((previous) =>
          previous.active
            ? {
                ...previous,
                last_autosave_at: isoNow(),
              }
            : previous
        );
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [examState.active]);

  function openSettings() {
    window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
  }

  function selectProblem(problemId: string) {
    if (examState.active && !examState.problem_ids.includes(problemId)) {
      return;
    }

    setCurrentProblemId(problemId);
    if (examState.active) {
      setExamState((previous) => ({
        ...previous,
        selected_problem_id: problemId,
      }));
    }
  }

  function updateCurrentDraft(nextMarkdown: string) {
    if (!currentProblem) {
      return;
    }

    setDrafts((previous) => ({
      ...previous,
      [currentProblem.id]: nextMarkdown,
    }));
    setDraftUpdatedAt((previous) => ({
      ...previous,
      [currentProblem.id]: isoNow(),
    }));
  }

  function appendTemplate(template: string) {
    const inputPlaceholder = currentProblem
      ? buildInputPlaceholder(currentProblem.input_variable_name)
      : "${{INPUT}}";
    const normalizedTemplate = template.split("{{INPUT}}").join(inputPlaceholder);
    const merged = `${currentDraft.trimEnd()}\n\n${normalizedTemplate}`.trim();
    updateCurrentDraft(merged);
  }

  const requestHint = useCallback(async (checkKey: string, label: string, details: string) => {
    if (hints[checkKey] || hintLoading[checkKey]) {
      return;
    }

    const requestProblemId = activeProblemIdRef.current;
    const hintContextId = hintContextIdRef.current;
    setHintLoading((previous) => ({ ...previous, [checkKey]: true }));

    try {
      const payload = await fetchJson<{ hint: string }>("/api/practice/hint", {
        method: "POST",
        body: JSON.stringify({
          checkLabel: label,
          checkDetails: details,
          userPrompt: currentDraft,
          modelOutput: runState.rawOutput,
          problemDescription: currentProblem?.description || "",
          apiKey: anthropicApiKey.trim() || undefined,
        }),
      });

      if (
        activeProblemIdRef.current !== requestProblemId ||
        hintContextIdRef.current !== hintContextId
      ) {
        return;
      }

      setHints((previous) => ({ ...previous, [checkKey]: payload.hint }));
    } catch (hintError) {
      if (
        activeProblemIdRef.current !== requestProblemId ||
        hintContextIdRef.current !== hintContextId
      ) {
        return;
      }

      setHints((previous) => ({
        ...previous,
        [checkKey]:
          hintError instanceof Error
            ? `Could not generate hint: ${hintError.message}`
            : "Could not generate hint.",
      }));
    } finally {
      if (
        activeProblemIdRef.current !== requestProblemId ||
        hintContextIdRef.current !== hintContextId
      ) {
        return;
      }

      setHintLoading((previous) => ({ ...previous, [checkKey]: false }));
    }
  }, [
    anthropicApiKey,
    currentDraft,
    currentProblem?.description,
    hintLoading,
    hints,
    runState.rawOutput,
  ]);

  function startExam() {
    const selectedProblems = problems.slice(0, Math.min(4, problems.length));
    if (selectedProblems.length === 0) {
      return;
    }

    const nextState = {
      active: true,
      paused: false,
      duration_minutes: 55,
      problem_ids: selectedProblems.map((problem) => problem.id),
      selected_problem_id: selectedProblems[0].id,
      started_at: isoNow(),
      paused_at: "",
      total_paused_seconds: 0,
      last_autosave_at: isoNow(),
    };

    setExamSummary([]);
    setExamState(nextState);
    selectProblem(selectedProblems[0].id);
  }

  function pauseOrResumeExam() {
    setExamState((previous) => {
      if (!previous.active) {
        return previous;
      }

      if (previous.paused) {
        const pausedDelta = previous.paused_at
          ? (Date.now() - new Date(previous.paused_at).getTime()) / 1000
          : 0;

        return {
          ...previous,
          paused: false,
          paused_at: "",
          total_paused_seconds: previous.total_paused_seconds + pausedDelta,
        };
      }

      return {
        ...previous,
        paused: true,
        paused_at: isoNow(),
      };
    });
  }

  function resetExam() {
    setExamState(DEFAULT_EXAM_STATE);
  }

  function openSettingsFromError() {
    setPendingActionAfterSettings("run");
    openSettings();
  }

  if (loading) {
    return (
      <div className="flex min-h-[28rem] items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
        <div className="rounded-2xl border border-border bg-background px-5 py-4 text-sm text-muted-foreground">
          Loading practice workspace...
        </div>
      </div>
    );
  }

  if (!currentProblem) {
    return (
      <div className="flex min-h-[28rem] items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
        <div className="rounded-2xl border border-border bg-background px-5 py-4 text-sm text-muted-foreground">
          No practice problems available.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        error === "no-api-key" ? (
          <button
            type="button"
            onClick={openSettingsFromError}
            className="w-full rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-left text-sm text-primary shadow-sm transition-colors hover:bg-primary/12"
          >
            Please set your Anthropic API key first. Click this message to open
            Settings.
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setError("")}
            className="w-full rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-left text-sm text-primary shadow-sm"
          >
            {error}
          </button>
        )
      ) : null}

      {saveError ? (
        <button
          type="button"
          onClick={() => setSaveError("")}
          className="w-full rounded-2xl border border-border bg-muted px-4 py-3 text-left text-sm text-muted-foreground shadow-sm"
        >
          Autosave issue: {saveError}
        </button>
      ) : null}

      {examSummary.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-foreground">Exam Summary</h2>
              <p className="text-sm text-muted-foreground">
                Your latest timed run ended. These drafts were captured from the
                selected exam problems.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExamSummary([])}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {examSummary.map((item) => (
              <div
                key={item.problemId}
                className="rounded-xl border border-border bg-background px-3 py-3"
              >
                <p className="font-medium text-foreground">{item.title}</p>
                <pre className="mt-2 overflow-x-auto text-xs whitespace-pre-wrap text-muted-foreground">
                  {item.prompt || "No prompt saved."}
                </pre>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className={[
          "grid items-start gap-4 transition-[grid-template-columns] duration-300 ease-in-out",
          effectiveSidebarCollapsed
            ? "xl:grid-cols-[48px_minmax(0,1fr)_320px]"
            : "xl:grid-cols-[260px_minmax(0,1fr)_320px]",
        ].join(" ")}
      >
        <div className="xl:sticky xl:top-20">
          <ProblemSidebar
            problems={problems}
            currentProblemId={currentProblem.id}
            collapsed={effectiveSidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
            onSelectProblem={selectProblem}
            onStartExam={startExam}
            onPauseResumeExam={pauseOrResumeExam}
            onResetExam={resetExam}
            onAppendTemplate={appendTemplate}
            examState={examState}
            examProblems={examProblems}
            remainingSeconds={remainingSeconds}
          />
        </div>
        <PromptEditor
          currentProblem={currentProblem}
          currentDraft={currentDraft}
          showPreview={showPreview}
          onDraftChange={updateCurrentDraft}
          onTogglePreview={setShowPreview}
          onRun={handleRun}
        />
        <div className="xl:sticky xl:top-20">
          <RunPanel
            currentProblem={currentProblem}
            currentDraft={currentDraft}
            currentInput={currentInput}
            currentCaseId={currentCaseId}
            visibleCases={visibleCases}
            anthropicModels={config.anthropicModels}
            anthropicModel={anthropicModel}
            includeHiddenSuite={includeHiddenSuite}
            runState={runState}
            runs={runs}
            hints={hints}
            hintLoading={hintLoading}
            onCaseChange={(caseId) => setCurrentCaseId(caseId)}
            onInputChange={setCurrentInput}
            onModelChange={setAnthropicModel}
            onIncludeHiddenSuiteChange={setIncludeHiddenSuite}
            onRun={handleRun}
            onRequestHint={requestHint}
          />
        </div>
      </div>
    </div>
  );
}
