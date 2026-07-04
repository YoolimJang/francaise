import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TopicView } from "@/components/content/topic-view";
import { getChapter, CATEGORIES } from "@/lib/config";
import { getTopic, getTopics, getAllTopicParams } from "@/lib/content";
import type { CategoryId, ChapterId } from "@/lib/types";

export function generateStaticParams() {
  return getAllTopicParams();
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ chapter: string; category: string; slug: string }>;
}) {
  const { chapter, category, slug } = await params;
  const meta = getChapter(chapter);
  const cat = CATEGORIES[category as CategoryId];
  if (!meta || !meta.available || !cat) notFound();

  const topic = getTopic(chapter as ChapterId, category as CategoryId, slug);
  if (!topic) notFound();

  const siblings = getTopics(chapter as ChapterId, category as CategoryId);
  const idx = siblings.findIndex((t) => t.slug === slug);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];

  return (
    <div className="px-6 py-10 md:px-12 md:py-14">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-ink-faint">
        <Link href={`/${chapter}`} className="hover:text-ink">
          {meta.label}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{cat.label}</span>
      </div>

      {/* Header */}
      <header className="mt-4 border-b border-ink pb-6">
        <p className="font-display text-sm italic text-ink-faint">{cat.labelFr}</p>
        <h1 className="mt-1 font-display text-4xl leading-tight tracking-tight">
          {topic.title}
        </h1>
        {topic.summary && (
          <p className="mt-3 max-w-prose text-ink-muted">{topic.summary}</p>
        )}
      </header>

      <div className="mt-10">
        <TopicView topic={topic} />
      </div>

      {/* Prev / Next */}
      <nav className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/${chapter}/${category}/${prev.slug}`}
            className="group flex items-center gap-3 bg-paper p-5 transition-colors hover:bg-paper-raised"
          >
            <ChevronLeft className="h-4 w-4 shrink-0 text-ink-faint" />
            <span className="min-w-0">
              <span className="eyebrow block">이전</span>
              <span className="truncate">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span className="bg-paper p-5" />
        )}
        {next ? (
          <Link
            href={`/${chapter}/${category}/${next.slug}`}
            className="group flex items-center justify-end gap-3 bg-paper p-5 text-right transition-colors hover:bg-paper-raised"
          >
            <span className="min-w-0">
              <span className="eyebrow block">다음</span>
              <span className="truncate">{next.title}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
          </Link>
        ) : (
          <span className="bg-paper p-5" />
        )}
      </nav>
    </div>
  );
}
