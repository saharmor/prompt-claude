import type { Metadata } from "next";
import { Simulator } from "@/components/practice/simulator";
import { createMetadata, siteName } from "@/lib/site-metadata";

export const metadata: Metadata = createMetadata({
  title: `Practice | ${siteName}`,
  description:
    "Open-ended Claude prompt practice with editable problems, sample inputs, hidden checks, and instant coaching hints.",
  path: "/practice",
});

export default function PracticePage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Practice
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tackle open-ended prompt exercises with realistic inputs, hidden
            checks, timed drills, and reusable problem templates.
          </p>
        </div>
        <div className="inline-flex items-center rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Cmd/Ctrl + Enter</span>
          <span className="mx-1.5 text-border">•</span>
          <span>Run from the editor or input panel</span>
        </div>
      </div>

      <Simulator />
    </div>
  );
}
