import { achievements } from "@/data/achievements";
import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { categoryLabels, projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { social } from "@/data/social";
import { MAILTO } from "@/lib/contact";
import type { Project, Role, SkillGroup } from "@/data/types";
import type { Answer, AnswerLink } from "./types";

const DOT = " · ";

function link(label: string, href: string, external = false): AnswerLink {
  return { label, href, external };
}

function projectLink(project: Project): AnswerLink {
  return link(`View ${project.title}`, `#projects/${project.id}`);
}

function repoLink(project: Project): AnswerLink[] {
  return project.links.github
    ? [link(`${project.title} on GitHub`, project.links.github, true)]
    : [];
}

function bullets(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function answer(partial: Partial<Answer> & Pick<Answer, "text">): Answer {
  return {
    links: [],
    followUps: [],
    sources: [],
    grounded: true,
    ...partial,
  };
}

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

export function identityAnswer(): Answer {
  return answer({
    text: [
      `**${profile.name}** — ${profile.role}, based in ${profile.location}.`,
      profile.about[0],
    ].join("\n\n"),
    links: [link("About", "#about")],
    followUps: [
      "What is his tech stack?",
      "What has he built?",
      "Is he open to opportunities?",
    ],
    sources: ["profile"],
  });
}

export function metaAnswer(): Answer {
  return answer({
    text: [
      "I'm a local search layer over Hanan's portfolio — no external AI API, no server, nothing leaves this page.",
      "I answer by matching your question against a small set of knowledge files written from his résumés, so I can only tell you what is actually in his portfolio. I cannot invent an employer, a metric, or a project. If I don't know something, I'll say so.",
    ].join("\n\n"),
    followUps: [
      "What is his tech stack?",
      "Tell me about AirSense AI",
      "What did he do at Deloitte?",
    ],
    sources: ["assistant-meta"],
  });
}

export function greetingAnswer(): Answer {
  return answer({
    text: `Hey — ask me anything about ${profile.shortName}'s work, projects, or experience.`,
    followUps: [
      "Who is Hanan?",
      "What is his tech stack?",
      "What are his achievements?",
    ],
    sources: ["profile"],
  });
}

/* ------------------------------------------------------------------ */
/* Skills                                                              */
/* ------------------------------------------------------------------ */

export function skillsAnswer(): Answer {
  const body = skillGroups
    .map((group) => `**${group.label}** — ${group.skills.join(DOT)}`)
    .join("\n\n");

  return answer({
    text: [
      "His stack spans AI/ML and software engineering:",
      body,
      "Python is his primary language across both AI/ML and backend work.",
    ].join("\n\n"),
    links: [link("Skills", "#skills")],
    followUps: [
      "What backend technologies does he know?",
      "What AI/ML tools does he use?",
      "What has he built with these?",
    ],
    sources: ["skills"],
  });
}

export function skillGroupAnswer(group: SkillGroup): Answer {
  const related = projects.filter((project) =>
    project.tech.some((tech) => group.skills.includes(tech)),
  );

  const parts = [`**${group.label}** — ${group.skills.join(DOT)}`];

  if (related.length > 0) {
    const names = related.map((project) => `**${project.title}**`).join(" and ");
    parts.push(`Applied in ${names}.`);
  }

  return answer({
    text: parts.join("\n\n"),
    links: [link("Skills", "#skills"), ...related.slice(0, 2).map(projectLink)],
    followUps: [
      "What is his full tech stack?",
      ...related.slice(0, 1).map((project) => `Tell me about ${project.title}`),
      "What is his experience?",
    ],
    sources: [`skills-${group.id}`, "skills"],
  });
}

/** Answers "does he know X?" for one specific named technology. */
export function singleSkillAnswer(skill: string, group: SkillGroup): Answer {
  const related = projects.filter((project) => project.tech.includes(skill));
  const others = group.skills.filter((entry) => entry !== skill);

  const parts = [
    `Yes — **${skill}** is part of his ${group.label} stack.`,
    `Alongside it: ${others.join(DOT)}.`,
  ];

  if (related.length > 0) {
    const names = related.map((project) => `**${project.title}**`).join(" and ");
    parts.push(`He used it in ${names}.`);
  }

  return answer({
    text: parts.join("\n\n"),
    links: [link("Skills", "#skills"), ...related.slice(0, 2).map(projectLink)],
    followUps: [
      "What is his full tech stack?",
      "What has he built?",
      "Is he open to opportunities?",
    ],
    sources: [`skills-${group.id}`, "skills"],
  });
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

function projectLine(project: Project): string {
  const tech = project.tech.slice(0, 5).join(DOT);
  return `**[${project.index}] ${project.title}** (${project.year}) — ${project.subtitle}.\n${tech}`;
}


export function projectsAnswer(): Answer {
  return answer({
    text: [
      `${profile.shortName} has three main projects:`,
      projects.map(projectLine).join("\n\n"),
    ].join("\n\n"),
    links: [link("All projects", "#projects"), ...projects.map(projectLink)],
    followUps: [
      "Tell me about AirSense AI",
      "What AI projects has he built?",
      "What did he do at Deloitte?",
    ],
    sources: ["projects"],
  });
}

export function projectDetailAnswer(project: Project): Answer {
  const categories = project.categories.map((c) => categoryLabels[c]).join(DOT);

  return answer({
    text: [
      `**${project.title}** — ${project.subtitle}\n${project.dateLabel}${DOT}${categories}`,
      project.summary,
      bullets(project.highlights),
      `**Stack:** ${project.tech.join(DOT)}`,
    ].join("\n\n"),
    links: [projectLink(project), ...repoLink(project)],
    followUps: [
      ...projects
        .filter((other) => other.id !== project.id)
        .slice(0, 2)
        .map((other) => `Tell me about ${other.title}`),
      "What is his tech stack?",
    ],
    sources: [project.id, "projects"],
  });
}

export function projectsByCategoryAnswer(
  category: Project["categories"][number],
  label: string,
): Answer {
  const matched = projects.filter((project) =>
    project.categories.includes(category),
  );

  if (matched.length === 0) return projectsAnswer();

  const count = matched.length === 1 ? "One project" : `${matched.length} projects`;

  return answer({
    text: [
      `${count} in ${label}:`,
      matched.map(projectLine).join("\n\n"),
    ].join("\n\n"),
    links: [...matched.map(projectLink), link("All projects", "#projects")],
    followUps: [
      ...matched.slice(0, 2).map((project) => `Tell me about ${project.title}`),
      "What is his tech stack?",
    ],
    sources: ["projects", ...matched.map((project) => project.id)],
  });
}

/* ------------------------------------------------------------------ */
/* Experience                                                          */
/* ------------------------------------------------------------------ */

export function experienceAnswer(): Answer {
  const body = experience
    .map((role) =>
      [
        `**${role.company}** — ${role.title}`,
        `${role.start} – ${role.end}${DOT}${role.location}`,
        bullets(role.highlights),
      ].join("\n"),
    )
    .join("\n\n");

  return answer({
    text: [`${profile.shortName} has held two internships:`, body].join("\n\n"),
    links: [link("Experience", "#experience")],
    followUps: [
      "What did he do at Deloitte?",
      "What has he built?",
      "Is he open to opportunities?",
    ],
    sources: ["experience"],
  });
}

export function roleAnswer(role: Role): Answer {
  const current = role.current ? " (current role)" : "";

  return answer({
    text: [
      `**${role.company}** — ${role.title}\n${role.location}${DOT}${role.start} – ${role.end}${current}`,
      bullets(role.highlights),
      `**Stack:** ${role.tech.join(DOT)}`,
    ].join("\n\n"),
    links: [link("Experience", "#experience")],
    followUps: [
      role.id === "deloitte"
        ? "What did he do at Motion Cut?"
        : "What did he do at Deloitte?",
      "What has he built?",
      "What is his tech stack?",
    ],
    sources: [`experience-${role.id}`, "experience"],
  });
}

/* ------------------------------------------------------------------ */
/* Achievements, education, availability, contact                      */
/* ------------------------------------------------------------------ */

export function achievementsAnswer(): Answer {
  return answer({
    text: [
      `${profile.shortName}'s achievements:`,
      bullets(
        achievements.map(
          (item) => `**${item.figure}** — ${item.title}. ${item.detail}.`,
        ),
      ),
    ].join("\n\n"),
    links: [link("Achievements", "#achievements")],
    followUps: [
      "What has he built?",
      "What is his experience?",
      "Is he open to opportunities?",
    ],
    sources: ["achievements"],
  });
}

export function educationAnswer(): Answer {
  return answer({
    text: [
      "Education:",
      bullets(
        education.map((entry) =>
          [
            `**${entry.institution}** — ${entry.qualification}`,
            `  ${entry.location}${DOT}${entry.period}${DOT}${entry.result}`,
          ].join("\n"),
        ),
      ),
    ].join("\n\n"),
    links: [link("About", "#about")],
    followUps: [
      "Who is Hanan?",
      "What is his tech stack?",
      "What are his achievements?",
    ],
    sources: ["education"],
  });
}

export function availabilityAnswer(): Answer {
  return answer({
    text: [
      `Yes — ${profile.shortName} is open to **AI/ML and software engineering** opportunities.`,
      `He is based in ${profile.location}, currently a Software Development Intern at Deloitte while completing his B.Tech in Computer Science & Engineering at Jain University.`,
      `The fastest way to reach him is email: \`${profile.email}\``,
    ].join("\n\n"),
    links: [
      link("Get in touch", "#contact"),
      link(profile.email, MAILTO, true),
    ],
    followUps: [
      "What is his tech stack?",
      "What has he built?",
      "What is his experience?",
    ],
    sources: ["availability", "contact"],
  });
}

export function contactAnswer(): Answer {
  return answer({
    text: [
      `Email is best: \`${profile.email}\``,
      bullets(social.map((item) => `**${item.label}** — ${item.handle}`)),
      `He is based in ${profile.location} and open to AI/ML and software engineering roles.`,
    ].join("\n\n"),
    links: [
      link(profile.email, MAILTO, true),
      ...social.map((item) => link(item.label, item.href, true)),
      link("Contact section", "#contact"),
    ],
    followUps: [
      "Is he open to opportunities?",
      "Where is he based?",
      "What has he built?",
    ],
    sources: ["contact", "availability"],
  });
}

export function locationAnswer(): Answer {
  return answer({
    text: `${profile.shortName} is based in **${profile.location}**. He is currently a Software Development Intern at Deloitte in Bangalore, Karnataka, and a B.Tech CSE student at Jain University.`,
    links: [link("Get in touch", "#contact")],
    followUps: [
      "Is he open to opportunities?",
      "What is his experience?",
      "How can I contact him?",
    ],
    sources: ["profile", "availability"],
  });
}

/* ------------------------------------------------------------------ */
/* Fallbacks                                                           */
/* ------------------------------------------------------------------ */

/**
 * Used when a knowledge document matched but no intent composer applies.
 * Returns the curated document prose verbatim — nothing is generated.
 */
export function passthroughAnswer(
  body: string,
  anchor: string,
  sourceId: string,
  followUps: string[],
): Answer {
  return answer({
    text: body,
    links: anchor ? [link("Open section", anchor)] : [],
    followUps,
    sources: [sourceId],
  });
}

export function unknownAnswer(suggestions: string[]): Answer {
  return answer({
    text: [
      "I don't have enough information in Hanan's portfolio to answer that accurately.",
      suggestions.length > 0
        ? "Here is what I can tell you about:"
        : "Try asking about his projects, experience, or tech stack.",
    ].join("\n\n"),
    followUps: suggestions,
    sources: [],
    grounded: false,
  });
}

export function emptyAnswer(): Answer {
  return answer({
    text: "Ask me something about Hanan — his stack, projects, experience, or availability.",
    followUps: [
      "What is his tech stack?",
      "What has he built?",
      "Is he open to opportunities?",
    ],
    sources: [],
  });
}
