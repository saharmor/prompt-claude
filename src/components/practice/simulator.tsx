"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import {
  DEFAULT_PRACTICE_MODEL,
  getStoredPracticeModel,
  getDecryptedApiKey,
  OPEN_SETTINGS_EVENT,
  SETTINGS_CHANGE_EVENT,
} from "@/components/settings-panel";
import { PromptEditor } from "@/components/practice/prompt-editor";
import { PracticeSessionHeader } from "@/components/practice/practice-session-header";
import { PracticeSetupPanel } from "@/components/practice/practice-setup-panel";
import { RunPanel } from "@/components/practice/run-panel";
import {
  loadPracticeWorkspace,
  savePracticeWorkspace,
} from "@/lib/practice/client-storage";
import type {
  BootstrapResponse,
  EvaluationResult,
  HiddenSuiteResult,
  Problem,
  RunResult,
} from "@/lib/practice/types";
import {
  buildInputPlaceholder,
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

function resolvePracticeModel(availableModels: string[]) {
  const storedModel = getStoredPracticeModel();
  if (availableModels.includes(storedModel)) {
    return storedModel;
  }

  return availableModels[0] ?? DEFAULT_PRACTICE_MODEL;
}

function didPassEvaluation(evaluation: EvaluationResult[]) {
  return evaluation.length > 0 && evaluation.every((item) => item.passed);
}

function didPassHiddenSuite(hiddenSuite: HiddenSuiteResult[]) {
  return hiddenSuite.every((item) => item.passed);
}

function isCompletedRun(run: Pick<RunResult, "error" | "evaluation" | "hidden_suite">) {
  return (
    !run.error &&
    didPassEvaluation(run.evaluation) &&
    didPassHiddenSuite(run.hidden_suite)
  );
}

export function Simulator({ initialProblemId }: { initialProblemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [draftUpdatedAt, setDraftUpdatedAt] = useState<Record<string, string>>({});
  const [runs, setRuns] = useState<RunResult[]>([]);
  const [config, setConfig] = useState<BootstrapResponse["config"]>({
    hasAnthropicKey: false,
    anthropicModels: [DEFAULT_PRACTICE_MODEL],
  });
  const [currentProblemId, setCurrentProblemId] = useState("");
  const [currentCaseId, setCurrentCaseId] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [anthropicModel, setAnthropicModel] = useState(DEFAULT_PRACTICE_MODEL);
  const [anthropicApiKey, setAnthropicApiKey] = useState("");

  const [runState, setRunState] = useState<RunState>(EMPTY_RUN_STATE);
  const [hints, setHints] = useState<Record<string, string>>({});
  const [hintLoading, setHintLoading] = useState<Record<string, boolean>>({});
  const [editorExternalDraftVersion, setEditorExternalDraftVersion] = useState(0);
  const [pendingActionAfterSettings, setPendingActionAfterSettings] = useState<
    "run" | null
  >(null);
  const activeProblemIdRef = useRef("");
  const runRequestIdRef = useRef(0);
  const hintContextIdRef = useRef(0);
  const latestDraftsRef = useRef(drafts);
  const latestRunsRef = useRef(runs);

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
  const completedProblemIds = useMemo(
    () => new Set(runs.filter(isCompletedRun).map((run) => run.problem_id)),
    [runs]
  );
  const isCurrentProblemCompleted =
    Boolean(currentProblem) &&
    (completedProblemIds.has(currentProblem.id) ||
      (!runState.running &&
        !runState.error &&
        didPassEvaluation(runState.evaluation) &&
        didPassHiddenSuite(runState.hiddenSuite)));
  const nextProblem = useMemo(() => {
    if (!currentProblem || !isCurrentProblemCompleted) {
      return null;
    }

    const currentIndex = problems.findIndex((problem) => problem.id === currentProblem.id);
    if (currentIndex === -1) {
      return null;
    }

    const laterProblems = problems.slice(currentIndex + 1);
    const nextSameDifficulty = laterProblems.find(
      (problem) =>
        problem.difficulty === currentProblem.difficulty &&
        !completedProblemIds.has(problem.id)
    );

    if (nextSameDifficulty) {
      return nextSameDifficulty;
    }

    const nextIncompleteLater = laterProblems.find(
      (problem) => !completedProblemIds.has(problem.id)
    );

    if (nextIncompleteLater) {
      return nextIncompleteLater;
    }

    return problems.find(
      (problem) =>
        problem.id !== currentProblem.id && !completedProblemIds.has(problem.id)
    ) ?? null;
  }, [completedProblemIds, currentProblem, isCurrentProblemCompleted, problems]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const payload = await fetchJson<BootstrapResponse>("/api/practice/bootstrap");
        const workspace = loadPracticeWorkspace();
        const nextDrafts = normalizeDraftsForProblems(
          workspace.drafts,
          payload.problems
        );
        const firstProblem = payload.problems[0];
        const requestedProblem = payload.problems.find(
          (problem) => problem.id === initialProblemId
        );

        setProblems(payload.problems);
        setDrafts(nextDrafts);
        latestDraftsRef.current = nextDrafts;
        setDraftUpdatedAt(workspace.draftUpdatedAt);
        setRuns(workspace.runs);
        setConfig(payload.config);
        setAnthropicModel(resolvePracticeModel(payload.config.anthropicModels));
        setAnthropicApiKey(await getDecryptedApiKey());

        if (requestedProblem) {
          setCurrentProblemId(requestedProblem.id);
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
  }, [initialProblemId]);

  useEffect(() => {
    activeProblemIdRef.current = currentProblem?.id ?? "";
  }, [currentProblem]);

  useEffect(() => {
    latestDraftsRef.current = drafts;
  }, [drafts]);

  useEffect(() => {
    latestRunsRef.current = runs;
  }, [runs]);

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
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
      return;
    }

    const requestProblemId = currentProblem.id;
    const requestPrompt =
      latestDraftsRef.current[requestProblemId] ?? currentProblem.starter_prompt ?? "";
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
          promptMarkdown: requestPrompt,
          inputData: currentInput,
          caseId: currentCase?.id ?? null,
          includeHiddenSuite: true,
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

      if (!run.error && isCompletedRun(run)) {
        // Left burst
        confetti({
          particleCount: 100,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
        });
        // Right burst
        confetti({
          particleCount: 100,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
        });
        // Center shower
        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 120,
            startVelocity: 45,
            origin: { y: 0.3 },
          });
        }, 250);
      }
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
    currentInput,
    currentProblem,
    runState.running,
  ]);

  useEffect(() => {
    async function handleSettingsChange(event: Event) {
      const nextApiKey = await getDecryptedApiKey();
      setAnthropicApiKey(nextApiKey);
      setAnthropicModel(
        event instanceof CustomEvent &&
          typeof event.detail?.practiceModel === "string" &&
          config.anthropicModels.includes(event.detail.practiceModel)
          ? event.detail.practiceModel
          : resolvePracticeModel(config.anthropicModels)
      );

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
  }, [config.anthropicModels, config.hasAnthropicKey, pendingActionAfterSettings, handleRun]);

  useEffect(() => {
    if (
      loading ||
      !initialProblemId ||
      !problems.some((problem) => problem.id === initialProblemId) ||
      currentProblemId === initialProblemId
    ) {
      return;
    }

    setCurrentProblemId(initialProblemId);
  }, [currentProblemId, initialProblemId, loading, problems]);

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

    const lastRun = latestRunsRef.current.find((r) => r.problem_id === currentProblem.id);
    if (lastRun) {
      setRunState({
        running: false,
        rawOutput: lastRun.output_text,
        formattedOutput: lastRun.formatted_output,
        evaluation: lastRun.evaluation,
        hiddenSuite: lastRun.hidden_suite,
        error: lastRun.error,
      });
    } else {
      setRunState(EMPTY_RUN_STATE);
    }

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
  }, [draftUpdatedAt, drafts, loading, runs]);

  function openSettings() {
    window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
  }

  function selectProblem(problemId: string) {
    if (problemId !== currentProblemId) {
      setCurrentProblemId(problemId);
    }

    if (problemId !== initialProblemId) {
      router.push(`/practice/${problemId}`);
    }
  }

  function updateCurrentDraft(nextMarkdown: string) {
    if (!currentProblem) {
      return;
    }

    const nextDrafts = {
      ...latestDraftsRef.current,
      [currentProblem.id]: nextMarkdown,
    };
    latestDraftsRef.current = nextDrafts;
    setDrafts(nextDrafts);
    setDraftUpdatedAt((previous) => ({
      ...previous,
      [currentProblem.id]: isoNow(),
    }));
  }

  function appendTemplate(template: string) {
    const liveDraft = currentProblem
      ? latestDraftsRef.current[currentProblem.id] ?? currentProblem.starter_prompt ?? ""
      : currentDraft;
    const inputPlaceholder = currentProblem
      ? buildInputPlaceholder(currentProblem.input_variable_name)
      : "${{INPUT}}";
    const normalizedTemplate = template.split("{{INPUT}}").join(inputPlaceholder);
    const merged = `${liveDraft.trimEnd()}\n\n${normalizedTemplate}`.trim();
    updateCurrentDraft(merged);
    setEditorExternalDraftVersion((previous) => previous + 1);
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
          <div className="w-full rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm text-primary shadow-sm">
            Please set your Anthropic API key first{" "}
            <button
              type="button"
              onClick={openSettingsFromError}
              className="cursor-pointer underline italic hover:opacity-80 transition-opacity"
            >
              open settings
            </button>
          </div>
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

      <PracticeSessionHeader
        isCurrentProblemCompleted={isCurrentProblemCompleted}
        nextProblemTitle={nextProblem?.title ?? null}
        onGoToNextProblem={() => {
          if (nextProblem) selectProblem(nextProblem.id);
        }}
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_480px]">
        <div className="space-y-4">
          <PracticeSetupPanel
            currentProblem={currentProblem}
            currentInput={currentInput}
            currentCaseId={currentCaseId}
            visibleCases={visibleCases}
            onCaseChange={(caseId) => setCurrentCaseId(caseId)}
            onInputChange={setCurrentInput}
          />
          <PromptEditor
            key={`${currentProblem.id}:${editorExternalDraftVersion}`}
            currentProblem={currentProblem}
            currentDraft={currentDraft}
            onDraftChange={updateCurrentDraft}
            onAppendTemplate={appendTemplate}
            onRun={handleRun}
          />
        </div>
        <div className="xl:sticky xl:top-20">
          <RunPanel
            currentProblem={currentProblem}
            currentDraft={currentDraft}
            currentInput={currentInput}
            runState={runState}
            runs={runs}
            hints={hints}
            hintLoading={hintLoading}
            onRequestHint={requestHint}
          />
        </div>
      </div>
    </div>
  );
}
