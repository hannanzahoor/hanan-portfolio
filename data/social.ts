import type { SocialLink } from "./types";

/**
 * These URLs are taken from the link annotations embedded in Hanan's
 * résumé PDFs — they are his real profiles, not placeholders.
 */
export const social: SocialLink[] = [
  {
    id: "github",
    label: "github",
    handle: "@hannanzahoor",
    href: "https://github.com/hannanzahoor",
  },
  {
    id: "linkedin",
    label: "linkedin",
    handle: "in/hananzahoor",
    href: "https://www.linkedin.com/in/hananzahoor",
  },
  {
    id: "leetcode",
    label: "leetcode",
    handle: "u/hananzahoor",
    href: "https://leetcode.com/u/hananzahoor",
  },
];

export const socialById = Object.fromEntries(
  social.map((s) => [s.id, s]),
) as Record<string, SocialLink>;
