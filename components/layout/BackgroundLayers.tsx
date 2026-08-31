"use client";

import { useEffect } from "react";

/**
 * Four fixed planes behind the page: a wide grid, a dim dot matrix, an accent
 * dot matrix revealed in a radius around the pointer, and a vignette.
 *
 * The torch position is written to CSS custom properties on rAF rather than
 * through React state, so pointer movement never triggers a re-render. It is
 * skipped entirely for touch input and under prefers-reduced-motion.
 */
export function BackgroundLayers() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    if (reduced.matches || !fine.matches) return;

    const root = document.documentElement;
    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      root.style.setProperty("--tx", `${x}px`);
      root.style.setProperty("--ty", `${y}px`);
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true">
      <div className="bg-plane bg-plane--grid" />
      <div className="bg-plane bg-plane--dots" />
      <div className="bg-plane bg-plane--torch" />
      <div className="bg-plane bg-plane--vignette" />
    </div>
  );
}
