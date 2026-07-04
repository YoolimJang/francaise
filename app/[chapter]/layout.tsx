import { notFound } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { getChapter } from "@/lib/config";
import { getChapterOutline } from "@/lib/content";
import type { ChapterId } from "@/lib/types";

export default async function ChapterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const meta = getChapter(chapter);
  if (!meta || !meta.available) notFound();

  const outline = getChapterOutline(chapter as ChapterId).map((g) => ({
    category: g.category,
    topics: g.topics.map((t) => ({ slug: t.slug, title: t.title, group: t.group })),
  }));

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-ink lg:block">
        <Sidebar
          chapter={chapter as ChapterId}
          chapterLabel={`${meta.label} · ${meta.title}`}
          outline={outline}
        />
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
