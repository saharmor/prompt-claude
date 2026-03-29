import type { Metadata } from "next";
import Link from "next/link";
import { chapters } from "@/lib/curriculum/data";
import { getSeedProblems } from "@/lib/practice/problems";
import {
  createMetadata,
  siteDescription,
  siteName,
  siteTagline,
} from "@/lib/site-metadata";
import { SmartLearnLink } from "@/components/smart-learn-link";

const stats = {
  chapters: chapters.length,
  exercises: chapters.reduce((sum, ch) => sum + ch.exercises.length, 0),
  practiceProblems: getSeedProblems().length,
};

export const metadata: Metadata = createMetadata({
  title: `${siteName} | ${siteTagline}`,
  description: siteDescription,
  path: "/",
});

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-20 text-center">
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            Interactive Prompt Engineering Course
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Master Prompting with Claude
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
          Hands-on exercises with instant AI feedback to get more out of Claude.
          </p>
          <p className="text-sm text-muted-foreground">
            Based on{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/1jIxjzUWG-6xBVIa2ay6yDpLyeuOh_hR_ZB75a47KX_E/edit?gid=869808629#gid=869808629"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Anthropic&apos;s popular prompt engineering tutorial
            </a>
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <SmartLearnLink
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
              analyticsPlacement="hero"
            />
            <Link
              href="/practice"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              Practice Simulator
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-5xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-semibold">How It Works</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Learn the Concept",
              body: "Each chapter starts with a focused lesson explaining one prompting technique, with examples from Claude's best practices.",
            },
            {
              step: "2",
              title: "Practice with Exercises",
              body: "Write prompts in the built-in editor. Exercises range from beginner formatting to advanced production-grade prompts.",
            },
            {
              step: "3",
              title: "Get Instant Feedback",
              body: "Submit your prompt and get it graded by Claude. See what you did well, what to improve, and compare with a model answer.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-6"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {item.step}
              </span>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Practice Simulator */}
      <section className="w-full border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold">Practice Simulator</h2>
            <p className="mt-2 text-muted-foreground">
              Go beyond guided exercises. Write prompts from scratch, test them against hidden checks, and get coaching hints.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Open-Ended Problems",
                body: "Tackle realistic prompt challenges across beginner, intermediate, and advanced difficulty levels.",
              },
              {
                title: "Hidden Test Cases",
                body: "Your prompt is evaluated against inputs you haven't seen, so you know it generalizes.",
              },
              {
                title: "Coaching Hints",
                body: "Stuck? Request an AI-generated hint for any check without revealing the full answer.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-2 rounded-lg border border-border bg-background p-5"
              >
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/practice"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              Open Practice Simulator
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="w-full border-y border-border bg-muted/50">
        <div className="mx-auto flex max-w-4xl items-stretch justify-center px-4 py-10 text-center">
          <div className="flex-1">
            <p className="text-3xl font-bold text-primary">{stats.chapters}</p>
            <p className="text-sm text-muted-foreground">Chapters</p>
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold text-primary">{stats.exercises}</p>
            <p className="text-sm text-muted-foreground">Guided Exercises</p>
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold text-primary">{stats.practiceProblems}</p>
            <p className="text-sm text-muted-foreground">Practice Problems</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-4xl px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl font-semibold">Ready to start?</h2>
        <p className="mb-6 text-muted-foreground">
          All you need is an Anthropic API key. The course is free and open-source. Jump into any chapter at your own pace.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <SmartLearnLink
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            startLabel="Start Learning"
            resumeLabel="Resume Learning"
            analyticsPlacement="footer_cta"
          />
          <Link
            href="/practice"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
          >
            Practice Simulator
          </Link>
        </div>
      </section>
    </div>
  );
}
