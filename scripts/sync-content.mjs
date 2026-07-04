#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Content validator / report.
// Scans /content, checks frontmatter, and prints a chapter summary.
// Run: npm run sync
// Use this after adding or editing data files to catch mistakes
// before they break the build.
// ─────────────────────────────────────────────────────────────
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.join(process.cwd(), "content");
const VALID_RENDER = ["prose", "letters", "vocab", "conjugation", "expression"];
const VALID_CATEGORIES = ["lessons", "pronunciation", "grammar", "vocabulary"];

let errors = 0;
let topics = 0;

function warn(file, msg) {
  errors++;
  console.error(`  ✗ ${file}\n    → ${msg}`);
}

if (!fs.existsSync(ROOT)) {
  console.error("content/ 디렉터리가 없습니다.");
  process.exit(1);
}

for (const chapter of fs.readdirSync(ROOT).sort()) {
  const chapterDir = path.join(ROOT, chapter);
  if (!fs.statSync(chapterDir).isDirectory()) continue;
  console.log(`\n▌ ${chapter}`);

  for (const category of fs.readdirSync(chapterDir).sort()) {
    const catDir = path.join(chapterDir, category);
    if (!fs.statSync(catDir).isDirectory()) continue;
    if (!VALID_CATEGORIES.includes(category)) {
      warn(`${chapter}/${category}`, `알 수 없는 카테고리 (허용: ${VALID_CATEGORIES.join(", ")})`);
    }

    const files = fs.readdirSync(catDir).filter((f) => f.endsWith(".md"));
    console.log(`  ${category.padEnd(12)} ${files.length}개`);

    for (const file of files) {
      const rel = `${chapter}/${category}/${file}`;
      topics++;
      try {
        const { data } = matter(fs.readFileSync(path.join(catDir, file), "utf8"));
        if (!data.title) warn(rel, "title 누락");
        if (data.render && !VALID_RENDER.includes(data.render))
          warn(rel, `잘못된 render: ${data.render}`);
        if (data.items && !Array.isArray(data.items)) warn(rel, "items는 배열이어야 합니다");
      } catch (e) {
        warn(rel, `프론트매터 파싱 실패: ${e.message}`);
      }
    }
  }
}

console.log(`\n─────────────────────────────`);
console.log(`총 ${topics}개 토픽, 오류 ${errors}개`);
process.exit(errors > 0 ? 1 : 0);
