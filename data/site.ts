import { profile } from "./profile";

const fallbackUrl = "https://hananzahoor.com";

export const site = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl).replace(/\/$/, ""),
  title: `${profile.name} - AI/ML Engineer & Full-Stack Developer`,
  shortTitle: profile.name,
  /**
   * Kept under ~155 characters so search engines show it whole rather than
   * truncating mid-sentence. Feeds the meta description, Open Graph and
   * Twitter/X cards, and the JSON-LD graph — one string, one source.
   */
  description:
    "Hanan Zahoor — AI/ML Engineer and Full-Stack Developer in Bangalore. Portfolio of LLM applications, ML pipelines, and backend systems.",
  locale: "en_IN",
} as const;

/** Primary navigation. */
export const navigation = [
  { id: "home", label: "home", href: "#home" },
  { id: "about", label: "about", href: "#about" },
  { id: "experience", label: "experience", href: "#experience" },
  { id: "projects", label: "projects", href: "#projects" },
  { id: "skills", label: "skills", href: "#skills" },
  { id: "achievements", label: "achievements", href: "#achievements" },
  { id: "contact", label: "contact", href: "#contact" },
] as const;
