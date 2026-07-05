// ─────────────────────────────────────────────────────────────
// Example-sentence glossing.
// A rehype plugin that annotates words inside prose example sentences:
//   • bolded conjugated verbs  → tooltip with the infinitive + a link
//   • nouns from our vocab DB  → tooltip with gender (le/la) + 단수/복수
// Pure server-side; tooltips are CSS-only (see globals.css .gloss).
// ─────────────────────────────────────────────────────────────
import type { TopicItem } from "./types";

interface VerbDef {
  inf: string;
  slug: string; // grammar topic that documents it
  forms: string[]; // je, tu, il, nous, vous, ils
}

// Conjugated form → infinitive, for the verbs we document.
const VERBS: VerbDef[] = [
  { inf: "être", slug: "verbes-essentiels", forms: ["suis", "es", "est", "sommes", "êtes", "sont"] },
  { inf: "avoir", slug: "verbes-essentiels", forms: ["ai", "as", "a", "avons", "avez", "ont"] },
  { inf: "aller", slug: "verbes-essentiels", forms: ["vais", "vas", "va", "allons", "allez", "vont"] },
  { inf: "faire", slug: "verbes-essentiels", forms: ["fais", "fait", "faisons", "faites", "font"] },
  { inf: "vouloir", slug: "verbes-essentiels", forms: ["veux", "veut", "voulons", "voulez", "veulent", "voudrais"] },
  { inf: "pouvoir", slug: "verbes-essentiels", forms: ["peux", "peut", "pouvons", "pouvez", "peuvent"] },
  { inf: "devoir", slug: "verbes-essentiels", forms: ["dois", "doit", "devons", "devez", "doivent"] },
  { inf: "prendre", slug: "verbes-essentiels", forms: ["prends", "prend", "prenons", "prenez", "prennent"] },
  { inf: "venir", slug: "verbes-essentiels", forms: ["viens", "vient", "venons", "venez", "viennent"] },
  { inf: "voir", slug: "verbes-essentiels", forms: ["vois", "voit", "voyons", "voyez", "voient"] },
  { inf: "dire", slug: "verbes-essentiels", forms: ["dis", "dit", "disons", "dites", "disent"] },
  { inf: "savoir", slug: "verbes-essentiels", forms: ["sais", "sait", "savons", "savez", "savent"] },
  { inf: "comprendre", slug: "verbes-3e-groupe", forms: ["comprends", "comprend", "comprenons", "comprenez", "comprennent"] },
  { inf: "attendre", slug: "verbes-3e-groupe", forms: ["attends", "attend", "attendons", "attendez", "attendent"] },
  { inf: "partir", slug: "verbes-3e-groupe", forms: ["pars", "part", "partons", "partez", "partent"] },
  { inf: "dormir", slug: "verbes-3e-groupe", forms: ["dors", "dort", "dormons", "dormez", "dorment"] },
  { inf: "croire", slug: "verbes-3e-groupe", forms: ["crois", "croit", "croyons", "croyez", "croient"] },
  { inf: "lire", slug: "verbes-3e-groupe", forms: ["lis", "lit", "lisons", "lisez", "lisent"] },
  { inf: "boire", slug: "verbes-3e-groupe", forms: ["bois", "boit", "buvons", "buvez", "boivent"] },
];

export interface GlossLexicon {
  verbs: Map<string, { inf: string; href: string }>;
  nouns: Map<string, { gender: "m" | "f" | "m/f"; plural: boolean }>;
}

const NOUN_STOP = new Set([
  "le", "la", "les", "un", "une", "des", "du", "de", "au", "aux",
  "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles",
  "ce", "cet", "cette", "ces", "et", "ou", "à", "en", "que", "qui",
]);

/** Build the lexicon: verbs from the table above, nouns from vocab items. */
export function buildGlossLexicon(
  chapter: string,
  vocabItems: TopicItem[]
): GlossLexicon {
  const verbs = new Map<string, { inf: string; href: string }>();
  for (const v of VERBS) {
    const href = `/${chapter}/grammar/${v.slug}`;
    verbs.set(v.inf.toLowerCase(), { inf: v.inf, href });
    for (const f of v.forms) verbs.set(f.toLowerCase(), { inf: v.inf, href });
  }

  const nouns = new Map<string, { gender: "m" | "f" | "m/f"; plural: boolean }>();
  const addNoun = (word: string, gender: "m" | "f" | "m/f") => {
    const w = word.toLowerCase().trim();
    if (!w || NOUN_STOP.has(w)) return;
    if (!nouns.has(w)) nouns.set(w, { gender, plural: false });
    // naive plural forms so "chats"/"gâteaux" also match
    const pl = /s$|x$|z$/.test(w) ? w : /(au|eu|eau)$/.test(w) ? w + "x" : w + "s";
    if (!nouns.has(pl)) nouns.set(pl, { gender, plural: true });
  };
  for (const it of vocabItems) {
    if (!it.fr || !it.gender) continue; // only gendered nouns
    // fr may be "père" or "père / mère"; take the masculine/base token
    const base = it.fr.split("/")[0].trim().split(" ")[0].replace(/[(),]/g, "");
    if (base.length >= 2) addNoun(base, it.gender);
  }
  return { verbs, nouns };
}

// ── rehype plugin ────────────────────────────────────────────
type HNode = { type: string; tagName?: string; value?: string; properties?: Record<string, unknown>; children?: HNode[] };

const WORD = /([\p{L}]+)/u;

function el(tagName: string, properties: Record<string, unknown>, children: HNode[]): HNode {
  return { type: "element", tagName, properties, children };
}
const txt = (value: string): HNode => ({ type: "text", value });

function verbNode(word: string, inf: string, href: string): HNode {
  return el("span", { className: ["gloss", "gloss-verb"] }, [
    txt(word),
    el("span", { className: ["gloss-tip"] }, [
      txt("원형 "),
      el("a", { href, className: ["gloss-link"] }, [txt(inf)]),
    ]),
  ]);
}
function nounNode(word: string, gender: string, plural: boolean): HNode {
  const art = gender === "m" ? "le" : gender === "f" ? "la" : "le/la";
  return el("span", { className: ["gloss", "gloss-noun"] }, [
    txt(word),
    el("span", { className: ["gloss-tip"] }, [txt(`${art} · ${plural ? "복수" : "단수"}`)]),
  ]);
}

/** Split one text string into glossed/plain hast nodes. */
function glossText(value: string, lex: GlossLexicon, inStrong: boolean): HNode[] {
  const out: HNode[] = [];
  for (const seg of value.split(WORD)) {
    if (!seg) continue;
    const key = seg.toLowerCase();
    if (WORD.test(seg)) {
      const verb = inStrong ? lex.verbs.get(key) : undefined;
      const noun = !inStrong ? lex.nouns.get(key) : undefined;
      if (verb) { out.push(verbNode(seg, verb.inf, verb.href)); continue; }
      if (noun) { out.push(nounNode(seg, noun.gender, noun.plural)); continue; }
    }
    out.push(txt(seg));
  }
  return out;
}

/** rehype plugin factory. Only rewrites text inside list items (examples). */
export function makeRehypeGloss(lex: GlossLexicon) {
  const walk = (node: HNode, inStrong: boolean, inLi: boolean) => {
    if (!node.children) return;
    const next: HNode[] = [];
    for (const child of node.children) {
      if (child.type === "text" && inLi) {
        next.push(...glossText(child.value ?? "", lex, inStrong));
      } else {
        if (child.type === "element") {
          const strong = inStrong || child.tagName === "strong" || child.tagName === "em";
          const li = inLi || child.tagName === "li";
          walk(child, strong, li);
        }
        next.push(child);
      }
    }
    node.children = next;
  };
  return () => (tree: HNode) => {
    walk(tree, false, false);
  };
}
