import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NavBar } from "@/components/nav-bar";
import { chapters } from "@/lib/curriculum/data";

import {
  siteAuthor,
  siteDescription,
  siteName,
  siteTagline,
  siteUrl,
} from "@/lib/site-metadata";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const firstChapterHref = chapters[0] ? `/learn/${chapters[0].slug}` : "/learn";

const footerSections = [
  {
    title: "Course",
    links: [
      {
        href: firstChapterHref,
        label: "Start Learning",
        description: "Begin with the first chapter and practice as you go.",
        external: false,
      },
      {
        href: "/learn#curriculum",
        label: "Curriculum",
        description: "Browse all chapters, exercises, and difficulty levels.",
        external: false,
      },
      {
        href: "/practice",
        label: "Practice",
        description: "Use the prompt simulator to test open-ended prompts and hidden checks.",
        external: false,
      },
    ],
  },
  {
    title: "More AI Tools",
    links: [
      {
        href: "https://toolsuse.dev",
        label: "🔨 Tool Calls Schema Generator",
        description: "Generate valid tool schemas for OpenAI and Anthropic.",
        external: true,
      },
      {
        href: "https://sidekickdev.com",
        label: "✨ Sidekick Dev",
        description: "Generate context files for Cursor, Claude Code, and more.",
        external: true,
      },
    ],
  },
] as const;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: siteName,
  title: siteName,
  description: siteDescription,
  authors: [{ name: siteAuthor, url: "https://saharmor.me" }],
  creator: siteAuthor,
  publisher: siteAuthor,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: "/",
    siteName,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Prompt Claude logo and course branding",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/twitter-image",
        alt: "Prompt Claude logo and course branding",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border bg-card/60">
          <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 md:grid-cols-[1.6fr_repeat(2,minmax(0,1fr))]">
            <div className="space-y-5">
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-semibold text-foreground"
              >
                <span className="text-lg text-primary">&#9672;</span>
                <span>{siteName}</span>
              </Link>
              <div className="space-y-3">
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {siteTagline}. A hands-on, open-source course inspired by
                  Anthropic&apos;s original prompt engineering tutorial and
                  adapted for modern Claude workflows.
                </p>
              </div>
            </div>
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h2 className="text-sm font-semibold text-foreground">
                  {section.title}
                </h2>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${link.label} (opens in a new tab)`}
                          className="block rounded-lg transition-colors hover:text-foreground"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {link.label}
                          </span>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {link.description}
                          </p>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="block rounded-lg transition-colors hover:text-foreground"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {link.label}
                          </span>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {link.description}
                          </p>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border/80">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>
                Built by{" "}
                <a
                  href="https://saharmor.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  {siteAuthor}
                </a>
              </p>
              <p>Independent project. Not affiliated with Anthropic.</p>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
