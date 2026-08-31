/** Shared shapes for the portfolio content layer. */

export type ProjectCategory =
  | "ai-ml"
  | "software-engineering"
  | "full-stack"
  | "security";

export interface Project {
  id: string;
  /** Display index, e.g. "01". */
  index: string;
  title: string;
  subtitle: string;
  year: string;
  /** Month + year exactly as dated on the résumés. */
  dateLabel: string;
  categories: ProjectCategory[];
  /** One-sentence summary used on the card. */
  summary: string;
  /** Résumé bullets, lightly rewritten for portfolio voice. */
  highlights: string[];
  /** Technical concepts a recruiter should recognise. */
  concepts: string[];
  tech: string[];
  links: { github?: string; demo?: string };
}

export interface Role {
  id: string;
  company: string;
  title: string;
  location: string;
  start: string;
  end: string;
  /** Right-aligned marker on the timeline. */
  period: string;
  current: boolean;
  highlights: string[];
  tech: string[];
}

export interface SkillGroup {
  id: string;
  label: string;
  /** Terminal-style key used in the skills.json presentation. */
  key: string;
  skills: string[];
}

export interface Achievement {
  id: string;
  /** Large numeral or short token, e.g. "TOP 10", "500+". */
  figure: string;
  title: string;
  detail: string;
  href?: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  qualification: string;
  location: string;
  period: string;
  result: string;
}

export interface SocialLink {
  id: string;
  label: string;
  /** Displayed handle, e.g. "@hannanzahoor". */
  handle: string;
  href: string;
}
