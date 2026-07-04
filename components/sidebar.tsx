"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CategoryId, ChapterId } from "@/lib/types";
import { CATEGORIES } from "@/lib/config";
import { cn } from "@/lib/utils";

interface SidebarTopic {
  slug: string;
  title: string;
  group?: string;
}

interface OutlineGroup {
  category: CategoryId;
  topics: SidebarTopic[];
}

/** Preserve first-seen order of group labels (topics already come pre-sorted). */
function groupTopics(topics: SidebarTopic[]) {
  const order: string[] = [];
  const map = new Map<string, SidebarTopic[]>();
  for (const t of topics) {
    const key = t.group ?? "";
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(t);
  }
  return order.map((key) => ({ group: key, topics: map.get(key)! }));
}

export function Sidebar({
  chapter,
  chapterLabel,
  outline,
}: {
  chapter: ChapterId;
  chapterLabel: string;
  outline: OutlineGroup[];
}) {
  const pathname = usePathname();

  return (
    <nav className="scroll-thin h-full overflow-y-auto px-5 py-8">
      <Link href="/" className="eyebrow block hover:text-ink">
        ← La Française
      </Link>
      <p className="mt-4 font-display text-2xl">{chapterLabel}</p>

      <div className="mt-8 space-y-8">
        {outline.map((group) => {
          const meta = CATEGORIES[group.category];
          return (
            <div key={group.category}>
              <div className="flex items-baseline justify-between border-b border-line pb-1.5">
                <span className="eyebrow">{meta.label}</span>
                <span className="font-display text-xs italic text-ink-faint">
                  {meta.labelFr}
                </span>
              </div>
              <div className="mt-2 space-y-3">
                {groupTopics(group.topics).map((sub) => (
                  <div key={sub.group}>
                    {sub.group && (
                      <p className="mb-1 pl-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                        {sub.group}
                      </p>
                    )}
                    <ul>
                      {sub.topics.map((t) => {
                        const href = `/${chapter}/${group.category}/${t.slug}`;
                        const active = pathname === href;
                        return (
                          <li key={t.slug}>
                            <Link
                              href={href}
                              className={cn(
                                "block border-l-2 py-1.5 pl-3 text-sm transition-colors",
                                active
                                  ? "border-ink font-medium text-ink"
                                  : "border-transparent text-ink-muted hover:border-line hover:text-ink"
                              )}
                            >
                              {t.title}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
