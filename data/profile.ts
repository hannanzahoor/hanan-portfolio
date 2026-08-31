/**
 * Core identity. Every claim here is supported by Hanan's résumés
 * — do not add anything that is not.
 */
export const profile = {
  name: "Hanan Zahoor",
  shortName: "Hanan",
  initials: "HZ",
  /** Canonical role string used in page metadata, JSON-LD and by the assistant. */
  role: "AI/ML Engineer · Software Engineer",
  roleParts: ["AI/ML Engineer", "Software Engineer"],
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
