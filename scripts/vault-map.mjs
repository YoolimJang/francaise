// ─────────────────────────────────────────────────────────────
// Vault → app content mapping.
// Declares, per output topic, its source note, category, group,
// order, and how to parse it. The engine (convert-vault.mjs) reads
// this and regenerates content/intro/**.
//
// parser: "prose"   → passthrough (drop H1/관련/callout syntax, strip wikilinks)
//         "table"   → parse markdown tables into items
//         "terms"   → parse **bold** term lists into items
// kind (for table/terms): "letters" | "vocab"
//
// Titles are derived from each note's H1 (leading "NN." stripped;
// lesson "N과." kept). Korean phonetic (발음) columns are always dropped.
// ─────────────────────────────────────────────────────────────

export const VAULT = "Franciase Data";
export const CHAPTER = "intro";

// Categories the converter FULLY owns (dir is wiped then regenerated).
export const MANAGED = ["lessons", "pronunciation", "vocabulary"];
// grammar is PARTIAL: converter writes the rule files below but leaves
// hand-curated verb bundles (verbes-*.md) untouched.

// 핵심 표현 — auto-globbed from 핵심표현/*.md (NN과-*.md). No per-file entry needed.
export const LESSONS_DIR = "핵심표현";

// 발음 → pronunciation
export const PRONUNCIATION = [
  { src: "발음/01-알파벳.md", slug: "alphabet-26", order: 1, parser: "table", kind: "letters" },
  { src: "발음/02-숫자.md", slug: "nombres", order: 2, parser: "table", kind: "vocab" },
  { src: "발음/03-모음.md", slug: "voyelles", order: 3, parser: "prose" },
  { src: "발음/04-비모음.md", slug: "voyelles-nasales", order: 4, parser: "prose" },
  { src: "발음/05-반모음.md", slug: "semi-voyelles", order: 5, parser: "prose" },
  { src: "발음/06-악상.md", slug: "accents", order: 6, parser: "prose" },
  { src: "발음/07-발음규칙.md", slug: "regles", order: 7, parser: "prose" },
  { src: "발음/08-발음-총정리.md", slug: "sons-resume", order: 8, parser: "prose" },
];

// 문법 → grammar (rules only; verb bundles are curated, not managed here)
export const GRAMMAR = [
  { src: "문법/09-관사.md", slug: "articles", order: 1, group: "관사·명사·형용사", parser: "prose" },
  { src: "문법/11-명사.md", slug: "noms", order: 2, group: "관사·명사·형용사", parser: "prose" },
  { src: "문법/12-형용사.md", slug: "adjectifs", order: 3, group: "관사·명사·형용사", parser: "prose" },
  { src: "문법/07-국가-언어-국적.md", slug: "pays-langues-nationalites", order: 4, group: "관사·명사·형용사", parser: "prose" },
  { src: "문법/08-인칭대명사.md", slug: "pronoms", order: 5, group: "대명사", parser: "prose" },
  { src: "문법/16-목적보어.md", slug: "objets", order: 6, group: "대명사", parser: "prose" },
  { src: "문법/10-전치사.md", slug: "prepositions", order: 7, group: "전치사·의문사", parser: "prose" },
  { src: "문법/15-의문사.md", slug: "interrogatifs", order: 8, group: "전치사·의문사", parser: "prose" },
  { src: "문법/17-si-긍정답변.md", slug: "reponse-si", order: 30, group: "기타 구문", parser: "prose" },
  { src: "문법/21-비교급.md", slug: "comparatif", order: 31, group: "기타 구문", parser: "prose" },
  { src: "문법/18-형용사-de-동사원형.md", slug: "adjectif-de-infinitif", order: 32, group: "기타 구문", parser: "prose" },
  {
    srcMerge: ["문법/19-avoir-mal-a.md", "문법/20-avoir-froid-chaud.md"],
    slug: "avoir-expressions",
    order: 33,
    group: "기타 구문",
    title: "avoir 관용 표현",
    parser: "prose",
  },
];

// 단어장 → vocabulary
export const VOCABULARY = [
  { src: "단어장/요일.md", slug: "jours", order: 1, group: "시간", parser: "table", kind: "vocab" },
  { src: "단어장/월.md", slug: "mois", order: 2, group: "시간", parser: "table", kind: "vocab" },
  { src: "단어장/계절.md", slug: "saisons", order: 3, group: "시간", parser: "table", kind: "vocab" },
  { src: "단어장/시간표현.md", slug: "temps", order: 4, group: "시간", parser: "table", kind: "vocab" },
  { src: "단어장/감정과상태.md", slug: "emotions", order: 5, group: "감정·기능어", parser: "terms", kind: "vocab" },
  { src: "단어장/부사와연결어.md", slug: "adverbes", order: 6, group: "감정·기능어", parser: "table", kind: "vocab" },
  { src: "단어장/방향.md", slug: "direction", order: 7, group: "사람·일상", parser: "table", kind: "vocab" },
  { src: "단어장/가족.md", slug: "famille", order: 8, group: "사람·일상", parser: "table", kind: "vocab" },
  { src: "단어장/직업.md", slug: "professions", order: 9, group: "사람·일상", parser: "table", kind: "vocab" },
  { src: "단어장/소지품.md", slug: "affaires", order: 10, group: "사람·일상", parser: "table", kind: "vocab" },
  { src: "단어장/신체.md", slug: "corps", order: 11, group: "사람·일상", parser: "table", kind: "vocab" },
  { src: "단어장/색깔.md", slug: "couleurs", order: 12, group: "묘사", parser: "table", kind: "vocab" },
  { src: "단어장/묘사형용사.md", slug: "adjectifs-description", order: 13, group: "묘사", parser: "table", kind: "vocab" },
  { src: "단어장/취미.md", slug: "loisirs", order: 14, group: "여가", parser: "table", kind: "vocab" },
  { src: "단어장/스포츠.md", slug: "sport", order: 15, group: "여가", parser: "table", kind: "vocab" },
  { src: "단어장/악기.md", slug: "musique", order: 16, group: "여가", parser: "table", kind: "vocab" },
  { src: "단어장/채소와과일.md", slug: "legumes-fruits", order: 17, group: "음식", parser: "table", kind: "vocab" },
  { src: "단어장/고기생선해산물.md", slug: "viande-poisson", order: 18, group: "음식", parser: "table", kind: "vocab" },
  { src: "단어장/재료.md", slug: "ingredients", order: 19, group: "음식", parser: "table", kind: "vocab" },
  { src: "단어장/옷과액세서리.md", slug: "vetements", order: 20, group: "사물·장소", parser: "table", kind: "vocab" },
  { src: "단어장/장소.md", slug: "endroits", order: 21, group: "사물·장소", parser: "table", kind: "vocab" },
];
