"use client";

import { useEffect, useState } from "react";

/**
 * Tracks which section is currently in view for navigation highlighting.
 *
 * The root margin defines a band across the upper-middle of the viewport; the
 * active section is the first one (in document order) intersecting it. The
 * bottom-of-page check ensures the final section activates even when it is too
 * short to reach the band.
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    const visible = new Set<string>();

    const pick = () => {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      if (atBottom) {
        const last = ids[ids.length - 1];
        if (last) setActive(last);
        return;
      }

      const next = ids.find((id) => visible.has(id));
      if (next) setActive(next);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        pick();
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 },
    );

    for (const element of elements) observer.observe(element);
    window.addEventListener("scroll", pick, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", pick);
    };
  }, [ids]);

  return active;
}
