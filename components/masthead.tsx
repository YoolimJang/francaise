import Link from "next/link";

/** NYT-style masthead: centered serif wordmark over hairline rules. */
export function Masthead({ subtitle }: { subtitle?: string }) {
  return (
    <header className="border-b border-ink">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between py-2 text-[0.65rem] uppercase tracking-[0.15em] text-ink-muted">
          <span>Niveau · Débutant</span>
          <span>{today()}</span>
        </div>
        <div className="border-t border-line py-6 text-center">
          <Link href="/">
            <h1 className="font-display text-5xl font-medium tracking-tight sm:text-6xl">
              La Française
            </h1>
          </Link>
          <p className="eyebrow mt-3">프랑스어 학습 노트</p>
          {subtitle && (
            <p className="mt-1 font-display text-sm italic text-ink-muted">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}

function today() {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}
