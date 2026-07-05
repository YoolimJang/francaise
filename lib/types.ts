// ─────────────────────────────────────────────────────────────
// Domain model for the Française study app.
// Source of truth = markdown files under /content (see lib/content.ts).
// ─────────────────────────────────────────────────────────────

/** Learning levels. Only "intro" has content today; add more as you author them. */
export type ChapterId = "intro" | "a1" | "a2" | "b1" | "b2";

/** The four ways content is organised inside a chapter. */
export type CategoryId = "lessons" | "pronunciation" | "grammar" | "vocabulary";

/** How a topic's structured `items` should be rendered. */
export type RenderType =
  | "prose" // markdown body only (grammar explanations)
  | "letters" // alphabet / pronunciation table
  | "vocab" // word list with gender + meaning
  | "conjugation" // verb conjugation table
  | "expression"; // set phrases with usage

export interface Chapter {
  id: ChapterId;
  /** e.g. "입문", "A1" */
  label: string;
  title: string;
  description: string;
  order: number;
  /** false → shown as "coming soon" and not navigable */
  available: boolean;
  /** alphabet only exists in the intro chapter */
  categories: CategoryId[];
}

/** A single structured row. Fields are optional so one shape serves every RenderType. */
export interface TopicItem {
  fr?: string; // French headword / letter / expression
  ipa?: string; // IPA pronunciation
  ko?: string; // Korean meaning
  gender?: "m" | "f" | "m/f"; // noun/adjective gender
  example?: string; // example sentence (French) — letters/expression single example
  exampleKo?: string; // example translation
  examples?: { fr: string; ko?: string }[]; // vocab: 2+ example sentences per word
  eng?: string; // similar/cognate English word — memory aid
  note?: string; // short annotation
  // conjugation-specific
  pronoun?: string;
  form?: string;
}

export interface Topic {
  chapter: ChapterId;
  category: CategoryId;
  slug: string;
  title: string;
  summary?: string;
  /** optional sub-group label within a category (e.g. "동사", "시간") for sidebar grouping */
  group?: string;
  order: number;
  render: RenderType;
  items: TopicItem[];
  /** markdown explanation body */
  body: string;
  /** cross-links to related topics (from the vault's 관련 line) */
  related?: RelatedLink[];
}

/** A pointer to another topic, rendered as a jump button. */
export interface RelatedLink {
  category: CategoryId;
  slug: string;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string; // Korean label
  labelFr: string; // French label (editorial serif accent)
  description: string;
}
