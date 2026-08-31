import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "quiet";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-mono text-[13px] transition-[background-color,border-color,color,transform] duration-150 hover:-translate-y-px active:translate-y-0";

const VARIANTS: Record<Variant, string> = {
  primary:
    "border border-accent bg-accent px-[18px] py-3 font-semibold text-accent-ink hover:bg-accent-hover",
  ghost:
    "border border-line-strong bg-surface px-[18px] py-3 text-fg-bright hover:border-accent/60 hover:bg-surface-2",
  quiet:
    "border border-transparent px-2 py-1 text-fg-dim hover:text-accent",
};

interface CommonProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

export function TerminalLink({
  variant = "ghost",
  children,
  className = "",
  ...props
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </a>
  );
}

export function TerminalButton({
  variant = "ghost",
  children,
  className = "",
  type = "button",
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Small rounded tag used for technologies and filters. */
export function Tag({
  children,
  accent = false,
}: {
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] leading-none ${
        accent
          ? "border-accent/35 bg-accent/10 text-accent"
          : "border-line bg-surface-2 text-fg-dim"
      }`}
    >
      {children}
    </span>
  );
}

/** Pulsing availability indicator. */
export function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[11px] tracking-[0.04em] text-fg-dim sm:text-[12px]">
      <span
        className="anim-blip size-[7px] shrink-0 rounded-full bg-accent shadow-[0_0_10px_var(--accent-glow)]"
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

/** Decorative corner brackets for terminal-style panels. */
export function PanelCorners() {
  return (
    <span aria-hidden="true">
      <span className="corner corner-tl" />
      <span className="corner corner-tr" />
      <span className="corner corner-bl" />
      <span className="corner corner-br" />
    </span>
  );
}
