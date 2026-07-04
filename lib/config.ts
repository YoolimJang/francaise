import type { Chapter, CategoryMeta, CategoryId } from "./types";

/**
 * Chapter registry. To add A1 content: flip `available` to true once
 * /content/a1/** has topics. Everything else (nav, routing) follows.
 */
export const CHAPTERS: Chapter[] = [
  {
    id: "intro",
    label: "입문",
    title: "Débutant",
    description: "과별 핵심 표현과 발음·문법·단어까지, 프랑스어의 첫걸음.",
    order: 0,
    available: true,
    categories: ["lessons", "pronunciation", "grammar", "vocabulary"],
  },
  {
    id: "a1",
    label: "A1",
    title: "Élémentaire",
    description: "일상 표현과 기본 문장 구조.",
    order: 1,
    available: false,
    categories: ["lessons", "grammar", "vocabulary"],
  },
  {
    id: "a2",
    label: "A2",
    title: "Pré-intermédiaire",
    description: "과거·미래 시제와 확장된 어휘.",
    order: 2,
    available: false,
    categories: ["lessons", "grammar", "vocabulary"],
  },
];

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  lessons: {
    id: "lessons",
    label: "핵심 표현",
    labelFr: "Expressions clés",
    description: "책 진도에 맞춘 1~13과 회화 표현",
  },
  pronunciation: {
    id: "pronunciation",
    label: "발음",
    labelFr: "Prononciation",
    description: "알파벳·모음·비모음·반모음·악상·발음규칙",
  },
  grammar: {
    id: "grammar",
    label: "문법",
    labelFr: "Grammaire",
    description: "관사·명사·형용사·대명사·전치사·동사 규칙",
  },
  vocabulary: {
    id: "vocabulary",
    label: "단어",
    labelFr: "Vocabulaire",
    description: "주제별 단어장",
  },
};

export const CATEGORY_ORDER: CategoryId[] = [
  "lessons",
  "pronunciation",
  "grammar",
  "vocabulary",
];

export function getChapter(id: string) {
  return CHAPTERS.find((c) => c.id === id);
}
