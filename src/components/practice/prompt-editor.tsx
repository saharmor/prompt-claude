"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Problem } from "@/lib/practice/types";
import { buildInputPlaceholder } from "@/lib/practice/utils";

interface PromptEditorProps {
  currentProblem: Problem;
  currentDraft: string;
  showPreview: boolean;
  onDraftChange: (markdown: string) => void;
  onTogglePreview: (value: boolean) => void;
  onRun: () => void;
}

export function PromptEditor({
  currentProblem,
  currentDraft,
  showPreview,
  onDraftChange,
  onTogglePreview,
  onRun,
}: PromptEditorProps) {
  const inputPlaceholder = buildInputPlaceholder(currentProblem.input_variable_name);
  const [editorTheme, setEditorTheme] = useState("vs");

  useEffect(() => {
    const root = document.documentElement;
    const updateTheme = () => {
      setEditorTheme(root.classList.contains("dark") ? "vs-dark" : "vs");
    };

    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="flex min-h-[40rem] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">
            {currentProblem.title}
          </h2>
          {currentProblem.description ? (
            <p className="max-w-3xl text-sm text-muted-foreground">
              {currentProblem.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        {currentProblem.input_format ? (
          <div className="border-b border-border bg-muted/40 px-5 py-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  What the model receives
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {currentProblem.input_format}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Available input variable
                </p>
                <code className="mt-2 inline-block rounded bg-background px-2 py-1 text-sm">
                  {inputPlaceholder}
                </code>
              </div>
            </div>
          </div>
        ) : null}

        <div className="border-b border-border px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={showPreview}
                onChange={(event) => onTogglePreview(event.target.checked)}
                className="accent-primary"
              />
              Preview
            </label>
            <p className="text-sm text-muted-foreground">
              Use <code>{inputPlaceholder}</code> to place the practice input
              directly inside your prompt.
            </p>
          </div>
        </div>

        <div
          className={[
            "grid flex-1 gap-4 p-5",
            showPreview
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]"
              : "grid-cols-1",
          ].join(" ")}
        >
          <div className="relative h-[34rem] overflow-hidden rounded-2xl border border-border bg-background">
            {!currentDraft ? (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-start p-5">
                <div className="max-w-md rounded-xl border border-dashed border-border bg-background/90 px-4 py-3 text-sm text-muted-foreground shadow-sm">
                  Start writing your prompt here. Read the task context above,
                  then draft the instructions you want Claude to follow.
                </div>
              </div>
            ) : null}

            <Editor
              height="100%"
              defaultLanguage="markdown"
              theme={editorTheme}
              value={currentDraft}
              onChange={(value) => onDraftChange(value ?? "")}
              onMount={(editor, monaco) => {
                editor.addCommand(
                  monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                  () => onRun()
                );
              }}
              options={{
                minimap: { enabled: false },
                wordWrap: "on",
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                ariaLabel: `${currentProblem.title} prompt editor`,
                accessibilitySupport: "auto",
              }}
            />
          </div>

          {showPreview ? (
            <div className="h-[34rem] overflow-auto rounded-2xl border border-border bg-background p-5">
              <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-pre:bg-muted">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentDraft ||
                    "_Start writing your prompt in the editor on the left._"}
                </ReactMarkdown>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
