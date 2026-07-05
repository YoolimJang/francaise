import Link from "next/link";
import { glossTokens, type GlossLexicon } from "@/lib/gloss";

/** Render a French sentence with hover-gloss tooltips (verbs → 원형+link, nouns → 성·수). */
export function GlossText({ text, lex }: { text: string; lex: GlossLexicon }) {
  return (
    <>
      {glossTokens(text, lex, true).map((tok, i) => {
        if ("verb" in tok) {
          return (
            <span key={i} className="gloss gloss-verb">
              {tok.text}
              <span className="gloss-tip">
                원형{" "}
                <Link href={tok.verb.href} className="gloss-link">
                  {tok.verb.inf}
                </Link>
              </span>
            </span>
          );
        }
        if ("noun" in tok) {
          const art = tok.noun.gender === "m" ? "le" : tok.noun.gender === "f" ? "la" : "le/la";
          return (
            <span key={i} className="gloss gloss-noun">
              {tok.text}
              <span className="gloss-tip">
                {art} · {tok.noun.plural ? "복수" : "단수"}
              </span>
            </span>
          );
        }
        return <span key={i}>{tok.text}</span>;
      })}
    </>
  );
}
