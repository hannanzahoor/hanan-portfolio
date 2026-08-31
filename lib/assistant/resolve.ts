import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import type { Project } from "@/data/types";
import * as compose from "./answers";
import { firstOfKind, resolveEntities, type Entity } from "./entities";
import { confidenceOf, docById, nearestTopics, search } from "./retrieve";
import { normalize, stem, tokenize } from "./tokenize";
import type { Answer, ConversationContext } from "./types";

/* ------------------------------------------------------------------ */
/* Intent table                                                        */
/* ------------------------------------------------------------------ */

interface IntentRule {
  id: string;
  /** Ordinary signal words. */
  keywords: string[];
  /** Words that alone strongly imply the intent. */
  strong?: string[];
}

const INTENT_RULES: IntentRule[] = [
  {
    id: "availability",
    keywords: ["open", "role", "job", "work", "looking", "join", "intern", "apply", "candidate"],
    strong: ["available", "availability", "hiring", "hire", "opportunity", "opportunities", "vacancy", "recruiting", "freelance"],
  },
  {
    id: "contact",
    keywords: ["linkedin", "github", "leetcode", "social", "link", "profile", "connect", "talk"],
    strong: ["contact", "email", "reach", "touch", "mail"],
  },
  {
    id: "location",
    keywords: ["where", "city", "live", "country", "india", "bangalore", "remote", "relocate", "timezone"],
    strong: ["located", "location", "based"],
  },
  {
    id: "education",
    keywords: ["grade", "academic", "qualification", "major", "class"],
    strong: ["education", "degree", "university", "study", "studied", "school", "college", "cgpa", "gpa", "graduate", "btech"],
  },
  {
    id: "achievements",
    keywords: ["award", "win", "won", "hackathon", "certification", "certificate", "prize", "recognition", "accomplishment", "leetcode", "rank"],
    strong: ["achievement", "achievements", "accolade"],
  },
  {
    id: "experience.current",
    keywords: ["today", "nowadays"],
    strong: ["now", "currently", "current", "present"],
  },
  {
    id: "experience",
    keywords: ["work", "worked", "job", "company", "companies", "professional", "history", "background", "employment", "internship", "intern"],
    strong: ["experience", "career", "resume", "cv"],
  },
  {
    id: "projects",
    keywords: ["make", "made", "portfolio", "app", "apps", "application", "repo", "repository", "shipped", "created", "showcase", "demo"],
    strong: ["project", "projects", "built", "build"],
  },
  {
    id: "skills",
    keywords: ["know", "use", "using", "used", "proficient", "expertise", "capability", "familiar", "framework", "library", "good"],
    strong: ["skill", "skills", "stack", "technology", "technologies", "tech", "tooling"],
  },
];

/** Pre-stem the tables once so matching agrees with the query tokenizer. */
const INTENTS = INTENT_RULES.map((rule) => ({
  id: rule.id,
  keywords: new Set(rule.keywords.map(stem)),
  strong: new Set((rule.strong ?? []).map(stem)),
}));

const STRONG_WEIGHT = 2.5;
const KEYWORD_WEIGHT = 1;
const INTENT_MIN_SCORE = 1.5;
const RETRIEVAL_MIN_CONFIDENCE = 0.26;

/* ------------------------------------------------------------------ */
/* Pattern helpers                                                     */
/* ------------------------------------------------------------------ */

const GREETING = /^(hi|hey|hello|yo|sup|hiya|howdy|good (morning|afternoon|evening)|greetings)\b[\s!.?]*$/;

const META =
  /\b(who|what) are you\b|\bare you (a |an )?(real |actual )?(ai|bot|human|llm|chatbot)\b|\bhow (do|does) (you|this) work\b|\bare you chatgpt\b|\bwhat model\b|\bwho built (you|this)\b|\bhow were you (built|made)\b/;

const CONTINUATION =
  /^(tell me more|more|more please|go on|continue|and\??|what else|anything else|elaborate|details?|explain|expand|keep going)[\s!.?]*$/;

/**
 * Genuine identity signals only. An earlier version matched bare pronouns
 * ("he", "his"), which made this intent swallow questions the portfolio has
 * no answer for — "what is his salary?" would return a bio instead of an
 * honest refusal.
 */
const IDENTITY =
  /\bwho(\s+is|\s*'s|\s+he\s+is|\s+was)\b|\bwhoami\b|\btell me about (hanan|him|himself|zahoor)\b|\babout (hanan|himself)\b|\b(introduce|describe)\b|\bhis (bio|background|profile|story)\b|\bwhat does he do\b|^(hanan|hanan zahoor|zahoor)\b[\s?.!]*$/;

const YES_NO_SKILL =
  /^(does|do|did|has|have|is|are|can|any)\b|\b(know|use|used|familiar with|experience (with|in)|worked with)\b/;

/**
 * Positional references to a project. Bare number words ("one", "two") are
 * deliberately absent — "the one" is a pronoun, not an ordinal.
 */
const ORDINALS: [string, number][] = [
  ["first", 0], ["1st", 0], ["latest", 0], ["newest", 0],
  ["second", 1], ["2nd", 1],
  ["third", 2], ["3rd", 2],
  ["last", -1], ["oldest", -1],
];

/** Maps a knowledge document to a question a visitor could click. */
const QUESTION_FOR_DOC: Record<string, string> = {
  profile: "Who is Hanan?",
  skills: "What is his tech stack?",
  "skills-ai-ml": "What AI/ML tools does he use?",
  "skills-backend": "What backend technologies does he know?",
  "skills-frontend": "What frontend work has he done?",
  "skills-cloud": "What cloud and DevOps tools does he use?",
  "skills-core-cs": "What are his computer science fundamentals?",
  projects: "What has he built?",
  "airsense-ai": "Tell me about AirSense AI",
  "linux-log-analyzer": "Tell me about the Linux Log Analyzer",
  privora: "Tell me about Privora",
  experience: "What is his experience?",
  "experience-deloitte": "What did he do at Deloitte?",
  "experience-motion-cut": "What did he do at Motion Cut?",
  education: "What did he study?",
  achievements: "What are his achievements?",
  availability: "Is he open to opportunities?",
  contact: "How can I contact him?",
  faq: "Which project should I look at first?",
  "assistant-meta": "How do you work?",
};

const DEFAULT_SUGGESTIONS = [
  "What is his tech stack?",
  "What has he built?",
  "Is he open to opportunities?",
];

/* ------------------------------------------------------------------ */
/* Skill name lookup                                                   */
/* ------------------------------------------------------------------ */

interface SkillRef {
  skill: string;
  groupId: string;
  needle: string;
}

/** Longest names first so "GitHub Actions" wins over "GitHub". */
const SKILL_REFS: SkillRef[] = skillGroups
  .flatMap((group) =>
    group.skills.map((skill) => ({
      skill,
      groupId: group.id,
      needle: normalize(skill),
    })),
  )
  .sort((a, b) => b.needle.length - a.needle.length);

function findSkill(text: string): SkillRef | undefined {
  return SKILL_REFS.find((ref) => {
    const escaped = ref.needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|\\W)${escaped}(\\W|$)`).test(text);
  });
}

/* ------------------------------------------------------------------ */
/* Resolution                                                          */
/* ------------------------------------------------------------------ */

export interface Resolution {
  answer: Answer;
  intent: string;
  entity?: string;
}

function scoreIntents(tokens: string[]): { id: string; score: number }[] {
  const unique = new Set(tokens);

  return INTENTS.map((intent) => {
    let score = 0;
    for (const token of unique) {
      if (intent.strong.has(token)) score += STRONG_WEIGHT;
      else if (intent.keywords.has(token)) score += KEYWORD_WEIGHT;
    }
    return { id: intent.id, score };
  })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score);
}

function groupById(id: string) {
  return skillGroups.find((group) => group.id === id);
}

function roleById(id: string) {
  return experience.find((role) => role.id === id);
}

function projectFor(entity: Entity): Project | undefined {
  return projects.find((project) => project.id === entity.id);
}

/** Category filter implied by a skill-group mention on a projects question. */
const GROUP_TO_CATEGORY: Record<
  string,
  { category: Project["categories"][number]; label: string } | undefined
> = {
  "ai-ml": { category: "ai-ml", label: "AI / ML" },
  backend: { category: "software-engineering", label: "software engineering" },
  frontend: { category: "full-stack", label: "full stack" },
};

function suggestionsFor(question: string, asked: string[]): string[] {
  const seen = new Set(asked.map((entry) => entry.toLowerCase()));
  const fromDocs = nearestTopics(question, 4)
    .map((doc) => QUESTION_FOR_DOC[doc.id])
    .filter((entry): entry is string => Boolean(entry));

  const pool = [...fromDocs, ...DEFAULT_SUGGESTIONS];
  const result: string[] = [];

  for (const entry of pool) {
    const key = entry.toLowerCase();
    if (seen.has(key) || result.includes(entry)) continue;
    result.push(entry);
    if (result.length === 3) break;
  }

  return result.length > 0 ? result : DEFAULT_SUGGESTIONS;
}

/** Strips follow-up suggestions the visitor has already asked. */
function pruneFollowUps(answer: Answer, asked: string[]): Answer {
  const seen = new Set(asked.map((entry) => entry.toLowerCase()));
  const kept = answer.followUps.filter((entry) => !seen.has(entry.toLowerCase()));
  const filled = kept.length > 0 ? kept : DEFAULT_SUGGESTIONS.filter((entry) => !seen.has(entry.toLowerCase()));
  return { ...answer, followUps: filled.slice(0, 3) };
}

/** Continuation of the previous turn ("tell me more", "go on"). */
function continueFrom(context: ConversationContext): Resolution | undefined {
  const { lastEntity, lastIntent } = context;

  if (lastEntity) {
    const project = projects.find((entry) => entry.id === lastEntity);
    if (project) {
      return {
        answer: compose.projectDetailAnswer(project),
        intent: "projects.detail",
        entity: project.id,
      };
    }

    const role = roleById(lastEntity);
    if (role) {
      return { answer: compose.roleAnswer(role), intent: "experience.detail", entity: role.id };
    }

    const group = groupById(lastEntity);
    if (group) {
      return { answer: compose.skillGroupAnswer(group), intent: "skills.group", entity: group.id };
    }
  }

  if (lastIntent === "projects.list") {
    return {
      answer: compose.projectDetailAnswer(projects[0] as Project),
      intent: "projects.detail",
      entity: projects[0]?.id,
    };
  }
  if (lastIntent?.startsWith("experience")) {
    return { answer: compose.experienceAnswer(), intent: "experience.list" };
  }
  if (lastIntent?.startsWith("skills")) {
    return { answer: compose.skillsAnswer(), intent: "skills.all" };
  }

  return undefined;
}

/** Ordinal reference to a project ("the second one", "his first project"). */
function ordinalProject(text: string): Project | undefined {
  // "one"/"ones" are checked on the raw text because the tokenizer treats
  // them as stopwords.
  if (!/\b(project|projects|one|ones)\b/.test(text)) return undefined;

  for (const [word, position] of ORDINALS) {
    if (!new RegExp(`(^|\\W)${word}(\\W|$)`).test(text)) continue;
    const index = position === -1 ? projects.length - 1 : position;
    return projects[index];
  }

  return undefined;
}

/**
 * Maps a question to an answer.
 *
 * Order matters: explicit conversational patterns first, then named entities,
 * then scored intents, then plain retrieval, then an honest "I don't know".
 */
export function resolve(
  question: string,
  context: ConversationContext,
): Resolution {
  const raw = question.trim();
  if (!raw) return { answer: compose.emptyAnswer(), intent: "empty" };

  const text = normalize(raw);
  const tokens = tokenize(raw);

  if (GREETING.test(text)) {
    return { answer: compose.greetingAnswer(), intent: "greeting" };
  }
  if (META.test(text)) {
    return { answer: compose.metaAnswer(), intent: "meta" };
  }
  if (CONTINUATION.test(text)) {
    const continued = continueFrom(context);
    if (continued) return continued;
  }

  const matches = resolveEntities(raw);
  const intents = scoreIntents(tokens);
  const topIntent = intents[0];

  const project = firstOfKind(matches, "project");
  const role = firstOfKind(matches, "role");
  const group = firstOfKind(matches, "skillGroup");

  const projectScore = matches.find((m) => m.entity.kind === "project")?.score ?? 0;
  const roleScore = matches.find((m) => m.entity.kind === "role")?.score ?? 0;
  const groupScore = matches.find((m) => m.entity.kind === "skillGroup")?.score ?? 0;

  // A named project or employer is the most specific signal available.
  if (project && projectScore >= groupScore) {
    const entry = projectFor(project);
    if (entry) {
      return {
        answer: compose.projectDetailAnswer(entry),
        intent: "projects.detail",
        entity: entry.id,
      };
    }
  }

  if (role && roleScore >= groupScore) {
    const entry = roleById(role.id);
    if (entry) {
      return { answer: compose.roleAnswer(entry), intent: "experience.detail", entity: entry.id };
    }
  }

  const ordinal = ordinalProject(text);
  if (ordinal && (topIntent?.id === "projects" || context.lastIntent?.startsWith("projects"))) {
    return {
      answer: compose.projectDetailAnswer(ordinal),
      intent: "projects.detail",
      entity: ordinal.id,
    };
  }

  // "Does he know Docker?" — a specific technology, asked as a yes/no.
  if (YES_NO_SKILL.test(text)) {
    const skill = findSkill(text);
    if (skill) {
      const skillGroup = groupById(skill.groupId);
      if (skillGroup) {
        return {
          answer: compose.singleSkillAnswer(skill.skill, skillGroup),
          intent: "skills.single",
          entity: skillGroup.id,
        };
      }
    }
  }

  if (topIntent && topIntent.score >= INTENT_MIN_SCORE) {
    switch (topIntent.id) {
      case "projects": {
        if (group) {
          const mapped = GROUP_TO_CATEGORY[group.id];
          if (mapped) {
            return {
              answer: compose.projectsByCategoryAnswer(mapped.category, mapped.label),
              intent: "projects.filter",
              entity: group.id,
            };
          }
        }
        if (/\bsecurity|encrypt|cyber\b/.test(text)) {
          return {
            answer: compose.projectsByCategoryAnswer("security", "security"),
            intent: "projects.filter",
            entity: "security",
          };
        }
        return { answer: compose.projectsAnswer(), intent: "projects.list" };
      }

      case "skills": {
        if (group) {
          const skillGroup = groupById(group.id);
          if (skillGroup) {
            return {
              answer: compose.skillGroupAnswer(skillGroup),
              intent: "skills.group",
              entity: skillGroup.id,
            };
          }
        }
        return { answer: compose.skillsAnswer(), intent: "skills.all" };
      }

      case "experience.current": {
        const current = experience.find((entry) => entry.current);
        if (current) {
          return { answer: compose.roleAnswer(current), intent: "experience.detail", entity: current.id };
        }
        return { answer: compose.experienceAnswer(), intent: "experience.list" };
      }

      case "experience":
        return { answer: compose.experienceAnswer(), intent: "experience.list" };
      case "achievements":
        return { answer: compose.achievementsAnswer(), intent: "achievements" };
      case "education":
        return { answer: compose.educationAnswer(), intent: "education" };
      case "availability":
        return { answer: compose.availabilityAnswer(), intent: "availability" };
      case "contact":
        return { answer: compose.contactAnswer(), intent: "contact" };
      case "location":
        return { answer: compose.locationAnswer(), intent: "location" };
    }
  }

  // A skill group named on its own ("react?", "kubernetes").
  if (group && groupScore >= 5) {
    const skillGroup = groupById(group.id);
    if (skillGroup) {
      return {
        answer: compose.skillGroupAnswer(skillGroup),
        intent: "skills.group",
        entity: skillGroup.id,
      };
    }
  }

  // Checked late so that more specific intents win first.
  if (IDENTITY.test(text)) {
    return { answer: compose.identityAnswer(), intent: "identity" };
  }

  // Fall back to plain retrieval over the knowledge files.
  const [best] = search(raw, 1);
  if (best && confidenceOf(best.score) >= RETRIEVAL_MIN_CONFIDENCE) {
    const doc = docById(best.doc.id);
    if (doc) {
      return {
        answer: compose.passthroughAnswer(
          doc.body,
          doc.anchor,
          doc.id,
          suggestionsFor(raw, context.asked),
        ),
        intent: "retrieval",
        entity: doc.id,
      };
    }
  }

  return {
    answer: compose.unknownAnswer(suggestionsFor(raw, context.asked)),
    intent: "unknown",
  };
}

/**
 * Public entry point: resolve, tidy the follow-up chips, and stamp the answer
 * with its intent and entity so the next turn can resolve continuations.
 */
export function answerFor(
  question: string,
  context: ConversationContext,
): Resolution {
  const resolution = resolve(question, context);
  const answer = pruneFollowUps(resolution.answer, context.asked);

  return {
    ...resolution,
    answer: { ...answer, intent: resolution.intent, entity: resolution.entity },
  };
}
