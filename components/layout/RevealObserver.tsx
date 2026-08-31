"use client";

import { useEffect } from "react";

/** If nothing has revealed by now, the observer is not working — show all. */
const FALLBACK_MS = 1500;

/**
 * Scroll reveal for every [data-reveal] element on the page.
 *
 * Keeping the observer here means section components stay server components —
 * they just declare the attribute.
 *
 * Two properties this is built around:
 *
 * 1. Fail-open. Content is visible in CSS until this component arms the
 *    animation by adding `.reveal-ready`. No JS, no IntersectionObserver, a
 *    thrown error, or a blocked bundle costs the animation — never the
 *    content.
 * 2. Flash-free. Arming and revealing the already-visible elements happen in
 *    one synchronous block, so the browser cannot paint between them and
 *    above-the-fold content never blinks out. Only off-screen elements — which
 *    nobody is looking at — take the hidden state.
 */
export function RevealObserver() {
  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    if (elements.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    // --- Synchronous block: arm, then reveal what is already on screen. ---
    root.classList.add("reveal-ready");

    const pending: HTMLElement[] = [];
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
      if (onScreen) element.classList.add("is-visible");
      else pending.push(element);
    }
    // ---------------------------------------------------------------------

    if (pending.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          const delay = Number(target.dataset.revealDelay ?? 0);

          if (delay > 0) {
            window.setTimeout(() => target.classList.add("is-visible"), delay);
          } else {
            target.classList.add("is-visible");
          }
          observer.unobserve(target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    for (const element of pending) observer.observe(element);

    const fallback = window.setTimeout(() => {
      const stuck = pending.filter(
        (element) => !element.classList.contains("is-visible"),
      );
      // Nothing at all revealed: observer callbacks are not arriving, so drop
      // the animation rather than fading the whole page in at once.
      if (stuck.length === pending.length) root.classList.remove("reveal-ready");
      for (const element of stuck) element.classList.add("is-visible");
    }, FALLBACK_MS);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
