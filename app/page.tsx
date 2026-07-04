import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Masthead } from "@/components/masthead";
import { CHAPTERS, CATEGORIES } from "@/lib/config";
import { getCategoryCount } from "@/lib/content";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main>
      <Masthead subtitle="Apprendre le français, pas à pas" />

      {/* Lede */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="eyebrow">Édition Débutant</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">
              알파벳의 첫 소리부터
              <br />
              첫 문장까지.
            </h2>
          </div>
          <p className="self-end font-display text-lg italic leading-relaxed text-ink-muted">
            과별 핵심 표현부터 발음·문법·단어까지 단계별로 쌓아가는 프랑스어
            학습 노트. 데이터가 늘어날수록 이 지면도 함께 자랍니다.
          </p>
        </div>
      </section>

      {/* Chapters */}
      <section className="border-t border-ink">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-8 flex items-baseline justify-between border-b border-line pb-3">
            <h3 className="eyebrow">Niveaux · 단계</h3>
            <span className="text-xs text-ink-faint">
              {CHAPTERS.filter((c) => c.available).length} / {CHAPTERS.length} 공개
            </span>
          </div>

          <div className="grid gap-px bg-line md:grid-cols-3">
            {CHAPTERS.map((chapter) => {
              const content = (
                <div
                  className={cn(
                    "flex h-full flex-col bg-paper p-7 transition-colors",
                    chapter.available
                      ? "group hover:bg-paper-raised"
                      : "opacity-55"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl">{chapter.label}</span>
                    {chapter.available ? (
                      <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    ) : (
                      <Lock className="h-4 w-4 text-ink-faint" />
                    )}
                  </div>
                  <p className="mt-1 font-display text-sm italic text-ink-faint">
                    {chapter.title}
                  </p>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-muted">
                    {chapter.description}
                  </p>
                  {chapter.available ? (
                    <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-4 text-xs text-ink-faint">
                      {chapter.categories.map((cat) => (
                        <span key={cat}>
                          {CATEGORIES[cat].label}{" "}
                          <span className="text-ink">
                            {getCategoryCount(chapter.id, cat)}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 border-t border-line pt-4 text-xs uppercase tracking-widest text-ink-faint">
                      À venir · 준비 중
                    </div>
                  )}
                </div>
              );

              return chapter.available ? (
                <Link key={chapter.id} href={`/${chapter.id}`}>
                  {content}
                </Link>
              ) : (
                <div key={chapter.id}>{content}</div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-ink">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-xs text-ink-faint">
          La Française · 프랑스어 학습 노트 · {new Date().getFullYear()}
        </div>
      </footer>
    </main>
  );
}
