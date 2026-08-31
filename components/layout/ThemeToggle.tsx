"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/ui/Icons";

export type Theme = "dark" | "light";

/** Shared with the inline boot script in app/layout.tsx — keep in sync. */
export const THEME_STORAGE_KEY = "theme";

/*
 * The theme lives on <html data-theme>, written before first paint by the
 * boot script. That attribute is the source of truth, so this component
 * subscribes to it as an external store rather than duplicating it in React
 * state — no effect, no cascading render, and nothing to get out of sync.
 */

const listeners = new Set<() => void>();
let watchingStorage = false;

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.dataset.theme = next;
  // Keeps native form controls and scrollbars in the right scheme.
  root.style.colorScheme = next;
  for (const listener of listeners) listener();
}

/** Another tab changed the preference. */
function onStorage(event: StorageEvent) {
  if (event.key !== THEME_STORAGE_KEY) return;
  applyTheme(event.newValue === "light" ? "light" : "dark");
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  if (!watchingStorage) {
    window.addEventListener("storage", onStorage);
    watchingStorage = true;
  }
  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
      watchingStorage = false;
    }
  };
}

/**
 * Null on the server and during hydration, so the markup matches and React
 * re-reads the real value immediately afterwards. The button reserves its
 * size meanwhile, so the nav never shifts.
 */
const serverSnapshot = (): Theme | null => null;

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, serverSnapshot);

  const toggle = () => {
    const next: Theme = readTheme() === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the choice just won't persist.
    }
  };

  const label =
    theme === null
      ? "Toggle theme"
      : `Switch to ${theme === "light" ? "dark" : "light"} theme`;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line text-fg-dim transition-colors hover:border-line-strong hover:text-accent"
    >
      {theme === "light" ? (
        <MoonIcon size={15} />
      ) : theme === "dark" ? (
        <SunIcon size={15} />
      ) : (
        <span className="size-[15px]" aria-hidden="true" />
      )}
    </button>
  );
}
