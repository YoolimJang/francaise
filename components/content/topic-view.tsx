import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Topic, TopicItem } from "@/lib/types";
import { cn } from "@/lib/utils";

function GenderMark({ g }: { g?: TopicItem["gender"] }) {
  if (!g) return null;
  const label = g === "m" ? "le" : g === "f" ? "la" : "le/la";
  return (
    <span className="ml-2 font-display text-xs italic text-ink-faint">{label}</span>
  );
}

/* Alphabet / pronunciation — big serif letter cards */
function LettersGrid({ items }: { items: TopicItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
      {items.map((it, i) => (
        <div key={i} className="group bg-paper p-5 transition-colors hover:bg-paper-raised">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-4xl leading-none">{it.fr}</span>
            <span className="font-display text-lg italic text-ink-muted">{it.ipa}</span>
          </div>
          {it.example && (
            <div className="mt-4 border-t border-line pt-3">
              <p className="font-display text-base italic">{it.example}</p>
              {it.ko && <p className="mt-0.5 text-sm text-ink-muted">{it.ko}</p>}
            </div>
          )}
          {it.note && <p className="mt-2 text-xs text-ink-faint">{it.note}</p>}
        </div>
      ))}
    </div>
  );
}

/* Vocabulary — editorial two-column list */
function VocabList({ items }: { items: TopicItem[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((it, i) => (
        <li key={i} className="flex items-baseline justify-between gap-4 py-3">
          <div className="min-w-0">
            <span className="font-display text-lg">{it.fr}</span>
            <GenderMark g={it.gender} />
            {it.ipa && (
              <span className="ml-2 text-sm italic text-ink-faint">{it.ipa}</span>
            )}
          </div>
          <span className="shrink-0 text-right text-sm text-ink-muted">{it.ko}</span>
        </li>
      ))}
    </ul>
  );
}

/* Verb conjugation — pronoun / form table */
function ConjugationTable({ items }: { items: TopicItem[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {items.map((it, i) => (
          <tr key={i} className="border-b border-line">
            <td className="w-1/3 py-2.5 pr-4 text-ink-muted">{it.pronoun}</td>
            <td className="py-2.5 font-display text-base">{it.form}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* Expressions — phrase + usage + example */
function ExpressionList({ items }: { items: TopicItem[] }) {
  return (
    <div className="space-y-px border border-line bg-line">
      {items.map((it, i) => (
        <div key={i} className="bg-paper p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-display text-xl">{it.fr}</span>
            <span className="text-sm text-ink-muted">{it.ko}</span>
          </div>
          {it.example && (
            <div className="mt-3 border-l-2 border-ink pl-3">
              <p className="font-display italic">{it.example}</p>
              {it.exampleKo && (
                <p className="mt-0.5 text-sm text-ink-muted">{it.exampleKo}</p>
              )}
            </div>
          )}
          {it.note && <p className="mt-2 text-xs text-ink-faint">{it.note}</p>}
        </div>
      ))}
    </div>
  );
}

export function TopicView({ topic }: { topic: Topic }) {
  const hasItems = topic.items.length > 0;
  return (
    <article className="pb-24">
      {hasItems && (
        <div className={cn("mb-10", topic.body && "mb-12")}>
          {topic.render === "letters" && <LettersGrid items={topic.items} />}
          {topic.render === "vocab" && <VocabList items={topic.items} />}
          {topic.render === "conjugation" && <ConjugationTable items={topic.items} />}
          {topic.render === "expression" && <ExpressionList items={topic.items} />}
        </div>
      )}
      {topic.body && (
        <div className="prose-editorial">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{topic.body}</ReactMarkdown>
        </div>
      )}
    </article>
  );
}
