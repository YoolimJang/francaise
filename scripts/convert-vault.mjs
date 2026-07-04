#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Vault → app content converter.
// Reads the Obsidian vault (Franciase Data/) per scripts/vault-map.mjs
// and regenerates content/intro/**. Run: npm run convert
//
// - Fully managed dirs (lessons, pronunciation, vocabulary) are wiped
//   and rebuilt. grammar rule files are overwritten in place; curated
//   verb bundles (verbes-*.md) are left untouched.
// - The Korean phonetic (발음) column is always dropped — IPA only.
// ─────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";
import {
  VAULT, CHAPTER, MANAGED, LESSONS_DIR,
  PRONUNCIATION, GRAMMAR, VOCABULARY,
} from "./vault-map.mjs";

const ROOT = process.cwd();
const vaultPath = (p) => path.join(ROOT, VAULT, p);
const outDir = (cat) => path.join(ROOT, "content", CHAPTER, cat);

let written = 0;

// ── generic helpers ──────────────────────────────────────────
function splitFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  return m ? { fm: m[1], body: m[2] } : { fm: "", body: raw };
}

function firstH1(body) {
  const m = body.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : "";
}

function deriveTitle(body, { isLesson } = {}) {
  let t = firstH1(body);
  t = t.replace(/\s+—\s+.*$/, ""); // drop "— 뜻" tails (verbs, unused here)
  if (!isLesson) t = t.replace(/^\d+[.)]\s*/, ""); // strip "09. " but keep "1과."
  return t.trim();
}

// strip wikilinks and "→ [[...]]" pointers from a cell / line
function stripLinks(s) {
  return s
    .replace(/\s*→?\s*\[\[[^\]]+\]\]/g, "")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, (_, x) => x.replace(/^\d+과-|^\d+-/, "").replace(/\.md$/, ""))
    .trim();
}

const ARTICLE = /^(les |le |la |l'|des |un |une )/;
const stripArticle = (s) => s.replace(ARTICLE, "").trim();

function yamlQuote(s) {
  return `"${String(s).replace(/"/g, "'")}"`;
}

// ── prose parser (passthrough) ───────────────────────────────
function cleanProse(body) {
  let b = body;
  b = b.replace(/^\s*#\s+.*\n/, ""); // drop first H1
  b = b.replace(/\n관련\s*:.*$/s, "\n"); // drop trailing 관련 links block
  b = b.replace(/^>\s*\[!\w+\]\s*(.*)$/gm, (_, t) => (t.trim() ? `> **${t.trim()}**` : ">"));
  b = b.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2");
  b = b.replace(/\[\[([^\]]+)\]\]/g, (_, x) => x.replace(/^\d+과-|^\d+-/, "").replace(/\.md$/, ""));
  return b.trim() + "\n";
}

// ── table parser ─────────────────────────────────────────────
function parseTables(body) {
  const blocks = [];
  let buf = [];
  for (const line of body.split("\n")) {
    if (/^\s*\|/.test(line)) buf.push(line);
    else if (buf.length) { blocks.push(buf); buf = []; }
  }
  if (buf.length) blocks.push(buf);

  return blocks.map((b) => {
    const rows = b.map((l) =>
      l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim())
    );
    const headers = rows[0];
    const data = rows
      .slice(1)
      .filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c) || c === ""));
    return { headers, rows: data };
  });
}

const findCol = (headers, re) => headers.findIndex((h) => re.test(h));

function tableItems(body, kind) {
  const items = [];
  for (const { headers, rows } of parseTables(body)) {
    const iFr = findCol(headers, /글자|철자|프랑스어|^단어$|표현/);
    const iMasc = findCol(headers, /^남성$/);
    const iFem = findCol(headers, /^여성$/);
    // IPA: prefer a header that is IPA but not 예시 IPA
    let iIpa = headers.findIndex((h) => /IPA/i.test(h) && !/예시/.test(h));
    if (iIpa < 0) iIpa = findCol(headers, /IPA/i);
    const iKo = findCol(headers, /예시\s*뜻|^뜻$|뜻$|^숫자$/);
    const iGender = findCol(headers, /^성$/);
    const iEx = findCol(headers, /예시\s*단어/);

    for (const r of rows) {
      const item = {};
      if (iMasc >= 0 && iFem >= 0) {
        const m = stripLinks(r[iMasc] || ""), f = stripLinks(r[iFem] || "");
        item.fr = f && f !== m ? `${m} / ${f}` : m;
      } else if (iFr >= 0) {
        item.fr = stripArticle(stripLinks(r[iFr] || ""));
      }
      if (!item.fr) continue;
      if (iIpa >= 0 && r[iIpa]) item.ipa = r[iIpa];
      if (kind === "letters" && iEx >= 0 && r[iEx]) item.example = stripLinks(r[iEx]);
      if (iKo >= 0 && r[iKo]) item.ko = stripLinks(r[iKo]);
      if (iGender >= 0) {
        const g = (r[iGender] || "").replace(/·/g, "/").replace(/\s/g, "");
        if (/^(m|f|m\/f)$/.test(g)) item.gender = g;
      }
      items.push(item);
    }
  }
  return items;
}

// ── terms parser (**bold** /ipa/ 한글 — 뜻) ──────────────────
function termsItems(body) {
  const items = [];
  for (const line of body.split("\n")) {
    const m = line.match(/^\*\*(.+?)\*\*(.*)$/);
    // A real vocab entry is "**term** [(gender)] /ipa/ [한글] — 뜻".
    // Require both an IPA and the em-dash meaning separator so usage
    // notes (e.g. "**jouer à** + 구기 / **faire de** + ...") are skipped.
    if (!m) continue;
    const rest = m[2];
    const ipa = rest.match(/\/[^/]+\//);
    if (!ipa || !rest.includes("—")) continue;
    const item = {};
    const gm = rest.match(/\((m\/f|m|f)\)/);
    if (gm) item.gender = gm[1];
    item.ipa = ipa[0];
    const ko = rest.split("—").pop().trim();
    item.fr = item.gender ? stripArticle(m[1].trim()) : m[1].trim();
    if (ko) item.ko = ko;
    items.push(item);
  }
  return items;
}

// ── writers ──────────────────────────────────────────────────
function itemLine(it) {
  const parts = [];
  for (const k of ["fr", "ipa", "example", "ko", "gender"]) {
    if (it[k] != null && it[k] !== "") parts.push(`${k}: ${yamlQuote(it[k])}`);
  }
  return `  - { ${parts.join(", ")} }`;
}

function writeTopic(cat, { slug, title, order, group, render, items, body }) {
  const fm = ["---", `title: ${yamlQuote(title)}`, `slug: ${slug}`, `order: ${order}`];
  if (group) fm.push(`group: ${yamlQuote(group)}`);
  fm.push(`render: ${render}`);
  if (items) {
    fm.push("items:");
    for (const it of items) fm.push(itemLine(it));
  }
  fm.push("---", "");
  const out = fm.join("\n") + (body ? body : "") + "\n";
  fs.writeFileSync(path.join(outDir(cat), `${slug}.md`), out);
  written++;
}

function readMerged(job) {
  if (job.srcMerge) {
    return job.srcMerge
      .map((s) => {
        const { body } = splitFrontmatter(fs.readFileSync(vaultPath(s), "utf8"));
        const title = deriveTitle(body);
        return `## ${title}\n\n${cleanProse(body)}`;
      })
      .join("\n");
  }
  return null;
}

function processJob(cat, job) {
  const merged = readMerged(job);
  const raw = merged == null ? fs.readFileSync(vaultPath(job.src), "utf8") : "";
  const { body } = merged == null ? splitFrontmatter(raw) : { body: "" };
  const isLesson = cat === "lessons";
  const title = job.title || deriveTitle(body, { isLesson });

  if (job.parser === "prose") {
    writeTopic(cat, {
      slug: job.slug, title, order: job.order, group: job.group,
      render: "prose", body: merged != null ? merged.trim() + "\n" : cleanProse(body),
    });
  } else {
    // Auto-detect format: vault mixes markdown tables and **bold** term
    // lists, and files sometimes switch between them. Pick whichever
    // parser yields more items. (letters are always tables.)
    let items;
    if (job.kind === "letters") {
      items = tableItems(body, "letters");
    } else {
      const t = tableItems(body, "vocab");
      const b = termsItems(body);
      items = b.length > t.length ? b : t;
    }
    if (!items.length) console.warn(`  ! ${job.src}: 항목 0개 (형식 확인 필요)`);
    const render = job.kind === "letters" ? "letters" : "vocab";
    writeTopic(cat, { slug: job.slug, title, order: job.order, group: job.group, render, items });
  }
}

// ── lessons (auto-glob) ──────────────────────────────────────
function processLessons() {
  const dir = vaultPath(LESSONS_DIR);
  const files = fs.readdirSync(dir).filter((f) => /^\d+과-.*\.md$/.test(f));
  for (const f of files) {
    const n = parseInt(f.match(/^(\d+)과/)[1], 10);
    const { body } = splitFrontmatter(fs.readFileSync(path.join(dir, f), "utf8"));
    writeTopic("lessons", {
      slug: `lesson-${String(n).padStart(2, "0")}`,
      title: deriveTitle(body, { isLesson: true }),
      order: n,
      render: "prose",
      body: cleanProse(body),
    });
  }
}

// ── run ──────────────────────────────────────────────────────
function resetManaged(cat) {
  const d = outDir(cat);
  fs.rmSync(d, { recursive: true, force: true });
  fs.mkdirSync(d, { recursive: true });
}

console.log("▸ Converting vault → content/" + CHAPTER);

for (const cat of MANAGED) resetManaged(cat);
fs.mkdirSync(outDir("grammar"), { recursive: true });

processLessons();
for (const job of PRONUNCIATION) processJob("pronunciation", job);
for (const job of VOCABULARY) processJob("vocabulary", job);
for (const job of GRAMMAR) processJob("grammar", job);

console.log(`✓ ${written}개 파일 생성 (동사 번들 verbes-*.md은 큐레이션 유지)`);
