/**
 * Core identity. Every claim here is supported by Hanan's résumés
 * — do not add anything that is not.
 */
export const profile = {
  name: "Hanan Zahoor",
  shortName: "Hanan",
  initials: "HZ",
  /**
   * Canonical role string used in page metadata, JSON-LD, image alt text and
   * by the assistant. Kept in step with the site title and the About role
   * line so the page presents one consistent identity rather than three.
   *
   * This is how Hanan describes his work, not an employment title — the
   * actual job titles live in data/experience.ts and are untouched.
   */
  role: "AI/ML Engineer · Full-Stack Developer",
  roleParts: ["AI/ML Engineer", "Full-Stack Developer"],
  /** Role line shown in the About section. */
  roleDisplay: "Full-Stack Developer · AI/ML Engineer",
  location: "Bangalore, India",
  email: "hananzahoorr@gmail.com",

  availability: "OPEN TO AI/ML & SOFTWARE ENGINEERING OPPORTUNITIES",
  /** Hero badge. Deliberately short — it covers roles, internships and freelance. */
  availabilityShort: "AVAILABLE · open to roles & freelance",

  /** Hero paragraph. */
  tagline:
    "I build intelligent systems and reliable software — from LLM-powered applications and machine learning pipelines to backend services and full-stack products.",

  /** Phrases highlighted in accent within the hero paragraph. */
  taglineHighlights: ["intelligent systems", "reliable software"],

  /** About section body. */
  about: [
    "I’m a Full-Stack Developer and AI/ML Engineer focused on turning complex problems into practical software. I work across LLM applications, machine learning pipelines, backend systems, APIs, and full-stack products.",
    "I’m interested in more than getting a model to work. I care about the systems around it — how data flows, how APIs behave, how applications perform, and how an idea becomes something people can actually use.",
    "I learn by building: understanding problems deeply, experimenting with different approaches, and turning what I learn into software that is useful, reliable, and maintainable.",
  ],

  /** Compact facts surfaced in the contact section. */
  focus: "Full-Stack Development & AI/ML Engineering",
} as const;
