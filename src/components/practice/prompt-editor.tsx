"use client";

import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { BEST_PRACTICES, XML_TEMPLATES } from "@/lib/practice/constants";
import type { Problem } from "@/lib/practice/types";

interface PromptEditorProps {
  currentProblem: Problem;
  currentDraft: string;
  onDraftChange: (markdown: string) => void;
  onAppendTemplate: (template: string) => void;
  onRun: () => void;
}

export function PromptEditor({
  currentProblem,
  currentDraft,
  onDraftChange,
  onAppendTemplate,
  onRun,
}: PromptEditorProps) {
  const [editorTheme, setEditorTheme] = useState("vs");
  const [editorValue, setEditorValue] = useState(currentDraft);

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
    <section className="flex min-h-[44rem] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Write your prompt</h2>
          </div>
          <details className="rounded-2xl border border-border bg-background">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-foreground">
              Tips & Templates
            </summary>
            <div className="space-y-4 border-t border-border px-4 py-4">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Templates
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(XML_TEMPLATES).map(([label, template]) => (
                    <Button
                      key={label}
                      variant="outline"
                      size="sm"
                      onClick={() => onAppendTemplate(template)}
                    >
                      Insert {label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Reminders
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {BEST_PRACTICES.map((tip) => (
                    <li key={tip} className="rounded-xl bg-muted/40 px-3 py-2">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="relative h-[38rem] overflow-hidden rounded-2xl border border-border bg-background">
          {!editorValue ? (
            <div className="pointer-events-none absolute left-[62px] top-4 z-10 select-none text-sm leading-relaxed text-muted-foreground/50">
              Write your prompt instructions here...
            </div>
          ) : null}

          <Editor
            height="100%"
            defaultLanguage="markdown"
            defaultValue={currentDraft}
            theme={editorTheme}
            onChange={(value) => {
              const nextValue = value ?? "";
              setEditorValue(nextValue);
              onDraftChange(nextValue);
            }}
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

        <div className="mt-3 flex items-center justify-end gap-3">
          <Button onClick={onRun}>Run prompt</Button>
          <span className="text-xs text-muted-foreground/60">
            or press Cmd/Ctrl + Enter
          </span>
        </div>
      </div>
    </section>
  );
}
