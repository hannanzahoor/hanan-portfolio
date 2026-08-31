/**
 * Cross-component navigation for internal links emitted by the assistant.
 *
 * The chat can link to a specific project ("#projects/airsense-ai"); the
 * projects section listens for this event, expands that card, and the page
 * scrolls to it.
 */
export const OPEN_PROJECT_EVENT = "portfolio:open-project";

export interface OpenProjectDetail {
  id: string;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

/** Parses "#projects/airsense-ai" into its section and project id. */
export function parseInternalHref(
  href: string,
): { section: string; projectId?: string } | null {
  if (!href.startsWith("#")) return null;
  const [section, projectId] = href.slice(1).split("/");
  if (!section) return null;
  return { section, projectId: projectId || undefined };
}

export function navigateInternal(href: string) {
  const parsed = parseInternalHref(href);
  if (!parsed) return;

  if (parsed.projectId) {
    window.dispatchEvent(
      new CustomEvent<OpenProjectDetail>(OPEN_PROJECT_EVENT, {
        detail: { id: parsed.projectId },
      }),
    );
  }

  scrollToId(parsed.section);
}
