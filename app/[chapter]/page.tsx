import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getChapter, CATEGORIES } from "@/lib/config";
import { getChapterOutline } from "@/lib/content";
import type { ChapterId } from "@/lib/types";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const meta = getChapter(chapter);
  if (!meta || !meta.available) notFound();

  const outline = getChapterOutline(chapter as ChapterId);

  return (
    <div className="px-6 py-12 md:px-12 md:py-16">
      <p className="eyebrow">{meta.title}</p>
      <h1 className="mt-3 font-display text-5xl tracking-tight">{meta.label}</h1>
      <p className="mt-4 max-w-prose text-ink-muted">{meta.description}</p>

      <div className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2">
        {outline.map(({ category, topics }) => {
          const cat = CATEGORIES[category];
          const first = topics[0];
          return (
            <Link
              key={category}
              href={`/${chapter}/${category}/${first.slug}`}
              className="group flex flex-col bg-paper p-7 transition-colors hover:bg-paper-raised"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-display text-2xl italic">{cat.labelFr}</span>
                  <p className="eyebrow mt-1">{cat.label}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 -translate-y-0.5 text-ink-faint transition-all group-hover:-translate-y-1 group-hover:text-ink" />
              </div>
              <p className="mt-4 flex-1 text-sm text-ink-muted">{cat.description}</p>
              <div className="mt-6 border-t border-line pt-3 text-xs text-ink-faint">
                {topics.length}개 항목
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
