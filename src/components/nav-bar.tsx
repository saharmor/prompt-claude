"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteName } from "@/lib/site-metadata";
import { SettingsPanel } from "./settings-panel";

export function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/learn", label: "Learn" },
    { href: "/practice", label: "Practice" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <span className="text-primary text-lg">&#9672;</span>
          {siteName}
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "rounded-full px-3 py-1.5 transition-colors",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
          <SettingsPanel />
        </div>
      </nav>
    </header>
  );
}
