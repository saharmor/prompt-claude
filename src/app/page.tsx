import type { Metadata } from "next";
import Link from "next/link";
import { chapters } from "@/lib/curriculum/data";
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
          Hands-on exercises with instant AI feedback, whether you&apos;re preparing for a role at Anthropic or just want to get more out of Claude.
          </p>
          <p className="text-sm text-muted-foreground">
            Based on{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/1jIxjzUWG-6xBVIa2ay6yDpLyeuOh_hR_ZB75a47KX_E/edit?gid=869808629#gid=869808629"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Anthropic&apos;s prompt engineering tutorial
            </a>
          </p>
          <div className="flex gap-3 pt-2">
            <SmartLearnLink
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
              analyticsPlacement="hero"
            />
            <Link
              href="/learn#curriculum"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              View Curriculum
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

      {/* Stats */}
      <section className="w-full border-y border-border bg-muted/50">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-12 px-4 py-10 text-center">
          <div>
            <p className="text-3xl font-bold text-primary">{stats.chapters}</p>
            <p className="text-sm text-muted-foreground">Chapters</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{stats.exercises}</p>
            <p className="text-sm text-muted-foreground">Exercises</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">3</p>
            <p className="text-sm text-muted-foreground">Difficulty Levels</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-4xl px-4 py-16 text-center">
        <h2 className="mb-4 text-2xl font-semibold">Ready to start?</h2>
        <p className="mb-6 text-muted-foreground">
          All you need is an Anthropic API key. The course is free and open-source. Jump into any chapter at your own pace.
        </p>
        <SmartLearnLink
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          startLabel="Browse the Curriculum"
          resumeLabel="Resume Learning"
          startHref="/learn#curriculum"
          analyticsPlacement="footer_cta"
        />
      </section>
    </div>
  );
}
