import type { ReactNode } from "react";

/** Page shell: one consistent max width and gutter for every section. */
export function Shell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[var(--shell)] px-6 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  id,
  labelledBy,
  children,
  className = "",
}: {
  id: string;
  labelledBy?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`relative scroll-mt-20 py-16 sm:py-20 ${className}`}
    >
      <Shell>{children}</Shell>
    </section>
  );
}

/**
 * The repeated section masthead: numbered eyebrow, mono headline, and a
 * right-aligned terminal path with an optional status line.
 */
export function SectionHeader({
  num,
  eyebrow,
  title,
  titleId,
  path,
  note,
  noteAccent = false,
}: {
  num: string;
  eyebrow: string;
  title: string;
  titleId: string;
  path: string;
  note?: string;
  noteAccent?: boolean;
}) {
  return (
    <div
      data-reveal
      className="mb-8 flex items-end justify-between gap-6 border-b border-line pb-5 sm:mb-9 sm:items-baseline"
    >
      <div className="min-w-0">
        <p className="font-mono text-[11px] tracking-[0.08em] text-fg-dim sm:text-[12px]">
          <span className="mr-2 text-accent">{num}</span>
          {eyebrow}
        </p>
        <h2
          id={titleId}
          className="mt-1.5 font-mono text-[clamp(24px,3.4vw,40px)] font-medium tracking-[-0.03em] text-fg-bright"
        >
          {title}
        </h2>
      </div>

      <div className="shrink-0 text-right font-mono text-[11px] leading-relaxed text-fg-dim sm:text-[12px]">
        <span className="whitespace-nowrap">{path}</span>
        {note ? (
          <>
            <br />
            <span
              className={`whitespace-nowrap ${noteAccent ? "text-accent" : "text-fg-faint"}`}
            >
              {note}
            </span>
          </>
        ) : null}
      </div>
    </div>
  );
}
