import { profile } from "./profile";

const fallbackUrl = "https://hananzahoor.com";

export const site = {
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl).replace(/\/$/, ""),
  title: `${profile.name} - AI/ML Engineer & Full-Stack Developer`,
  shortTitle: profile.name,
  description:
    "Portfolio of Hanan Zahoor, an AI/ML and software engineering student building LLM-powered applications, machine learning systems, backend services, and full-stack software.",
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
