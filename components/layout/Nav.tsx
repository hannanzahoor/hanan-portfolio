"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { navigation } from "@/data/site";
import { useActiveSection } from "@/lib/hooks/useActiveSection";

const SECTION_IDS = navigation.map((item) => item.id);

export function Nav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Escape closes the menu and returns focus to the control that opened it.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      toggleRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Prevent the page behind the menu from scrolling.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/75 backdrop-blur-[12px]">
      <div className="mx-auto flex max-w-[var(--shell)] items-center justify-between gap-6 px-6 py-3.5 sm:px-8">
        <a
          href="#home"
          className="flex shrink-0 items-center gap-2.5 font-mono text-[15px] font-semibold tracking-tight text-fg-bright"
        >
          <span
            className="anim-blip size-2 shrink-0 rounded-full bg-accent shadow-[0_0_12px_var(--accent-glow)]"
            aria-hidden="true"
          />
          <span>hanan</span>
          <span className="-ml-1.5 font-normal text-fg-dim">zahoor</span>
        </a>

        {/* Desktop navigation */}
        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => {
            const isActive = active === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                aria-current={isActive ? "true" : undefined}
                className={`rounded-md px-3.5 py-2 font-mono text-[13px] transition-colors duration-150 hover:bg-surface hover:text-fg-bright ${
                  isActive ? "text-accent" : "text-fg-dim"
                }`}
              >
                {/* Decorative path prefix; the accessible name stays the
                    bare section label. */}
                <span
                  className={isActive ? "text-accent-muted" : "text-fg-faint"}
                  aria-hidden="true"
                >
                  ~/
                </span>
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Theme toggle sits far right, with the mobile menu button beside it */}
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line text-fg-dim transition-colors hover:border-line-strong hover:text-fg-bright lg:hidden"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <>
                  <path d="M3.5 3.5 12.5 12.5" />
                  <path d="M12.5 3.5 3.5 12.5" />
                </>
              ) : (
                <>
                  <path d="M2.5 5h11" />
                  <path d="M2.5 11h11" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="border-t border-line bg-bg/95 backdrop-blur-[12px] lg:hidden"
      >
        <nav aria-label="Sections" className="mx-auto max-w-[var(--shell)] px-6 py-3 sm:px-8">
          {navigation.map((item) => {
            const isActive = active === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={close}
                aria-current={isActive ? "true" : undefined}
                className={`flex items-baseline rounded-md px-2 py-3 font-mono text-[15px] transition-colors hover:bg-surface ${
                  isActive ? "text-accent" : "text-fg"
                }`}
              >
                <span
                  className={isActive ? "text-accent-muted" : "text-fg-faint"}
                  aria-hidden="true"
                >
                  ~/
                </span>
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
