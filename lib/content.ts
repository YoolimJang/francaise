import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { CategoryId, ChapterId, RenderType, Topic, TopicItem } from "./types";
import { CATEGORY_ORDER } from "./config";

const CONTENT_ROOT = path.join(process.cwd(), "content");

function readTopicFile(
  chapter: ChapterId,
  category: CategoryId,
  file: string
): Topic | null {
  const full = path.join(CONTENT_ROOT, chapter, category, file);
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  if (!data.title) return null;

  return {
    chapter,
    category,
    slug: (data.slug as string) ?? file.replace(/\.md$/, ""),
    title: data.title as string,
    summary: data.summary as string | undefined,
    group: data.group as string | undefined,
    order: typeof data.order === "number" ? data.order : 999,
    render: (data.render as RenderType) ?? "prose",
    items: (data.items as TopicItem[]) ?? [],
    body: content.trim(),
    related: (data.related as Topic["related"]) ?? undefined,
  };
}

/** All vocab items in a chapter — used to build the gloss lexicon (noun genders). */
export function getVocabLexiconItems(chapter: ChapterId): TopicItem[] {
  return getTopics(chapter, "vocabulary").flatMap((t) => t.items);
}

/** Resolve a topic's related links to full topics (drops any that no longer exist). */
export function getRelated(topic: Topic) {
  if (!topic.related?.length) return [];
  return topic.related
    .map((r) => getTopic(topic.chapter, r.category, r.slug))
    .filter((t): t is Topic => !!t);
}

/** All topics in a chapter+category, ordered. */
export function getTopics(chapter: ChapterId, category: CategoryId): Topic[] {
  const dir = path.join(CONTENT_ROOT, chapter, category);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readTopicFile(chapter, category, f))
    .filter((t): t is Topic => t !== null)
    .sort((a, b) => a.order - b.order);
}

export function getTopic(
  chapter: ChapterId,
  category: CategoryId,
  slug: string
): Topic | undefined {
  return getTopics(chapter, category).find((t) => t.slug === slug);
}

/** Category → topic list map for a whole chapter (used by the sidebar). */
export function getChapterOutline(chapter: ChapterId) {
  return CATEGORY_ORDER.map((category) => ({
    category,
    topics: getTopics(chapter, category),
  })).filter((g) => g.topics.length > 0);
}

/** Count of authored topics — powers the "N개 항목" stats on cards. */
export function getCategoryCount(chapter: ChapterId, category: CategoryId) {
  return getTopics(chapter, category).length;
}

/** All (chapter, category, slug) triples — for generateStaticParams. */
export function getAllTopicParams() {
  if (!fs.existsSync(CONTENT_ROOT)) return [];
  const params: { chapter: string; category: string; slug: string }[] = [];
  for (const chapter of fs.readdirSync(CONTENT_ROOT)) {
    const chapterDir = path.join(CONTENT_ROOT, chapter);
    if (!fs.statSync(chapterDir).isDirectory()) continue;
    for (const category of fs.readdirSync(chapterDir)) {
      const catDir = path.join(chapterDir, category);
      if (!fs.statSync(catDir).isDirectory()) continue;
      for (const t of getTopics(chapter as ChapterId, category as CategoryId)) {
        params.push({ chapter, category, slug: t.slug });
      }
    }
  }
  return params;
}
