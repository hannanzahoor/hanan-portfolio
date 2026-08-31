import { editDistance, normalize, tokenize } from "./tokenize";

export type EntityKind = "project" | "role" | "skillGroup";

export interface Entity {
  id: string;
  kind: EntityKind;
  /** Canonical display name. */
  label: string;
  /**
   * Phrases a visitor might use. Multi-word aliases are matched against the
   * normalized query as substrings; single-word aliases also match tokens
   * with an edit distance of 1–2, so "airsence" still resolves.
   */
  aliases: string[];
}

export const entities: Entity[] = [
  {
    id: "airsense-ai",
    kind: "project",
    label: "AirSense AI",
    aliases: [
      "airsense", "airsense ai", "air sense", "aqi", "air quality",
      "health advisor", "aqi advisor", "air quality project", "the aqi one",
      "pollution",
    ],
  },
  {
    id: "linux-log-analyzer",
    kind: "project",
    label: "Intelligent Linux Log Analyzer",
    aliases: [
      "log analyzer", "log analyser", "linux log analyzer", "linux log",
      "log analysis", "loganalyzer", "security monitoring", "anomaly detection",
      "intrusion detection", "the log one", "logs project", "siem",
    ],
  },
  {
    id: "privora",
    kind: "project",
    label: "Privora",
    aliases: [
      "privora", "privacy platform", "privacy first", "social platform",
      "encrypted messaging", "messaging app", "the encryption one",
      "encrypted chat",
    ],
  },
  {
    id: "deloitte",
    kind: "role",
    label: "Deloitte",
    aliases: ["deloitte", "deloite", "his current job", "current role", "current internship"],
  },
  {
    id: "motion-cut",
    kind: "role",
    label: "Motion Cut",
    aliases: ["motion cut", "motioncut", "motion-cut", "his first internship"],
  },
  {
    id: "ai-ml",
    kind: "skillGroup",
    label: "AI / Machine Learning",
    aliases: [
      "ai", "ml", "machine learning", "artificial intelligence", "deep learning",
      "llm", "llms", "generative ai", "genai", "gen ai", "rag", "agents",
      "data science", "nlp", "ai ml",
    ],
  },
  {
    id: "languages",
    kind: "skillGroup",
    label: "Languages",
    aliases: [
      "language", "languages", "programming language", "programming languages",
      "coding language", "which languages",
    ],
  },
  {
    id: "backend",
    kind: "skillGroup",
    label: "Backend",
    aliases: [
      "backend", "back end", "server side", "serverside", "api", "apis",
      "rest api", "server", "microservices", "fastapi", "flask", "express",
    ],
  },
  {
    id: "frontend",
    kind: "skillGroup",
    label: "Frontend",
    aliases: [
      "frontend", "front end", "client side", "ui", "user interface", "react",
      "tailwind", "css", "html",
    ],
  },
  {
    id: "databases",
    kind: "skillGroup",
    label: "Databases",
    aliases: [
      "database", "databases", "db", "sql", "mongo", "mongodb", "mysql",
      "sqlite", "data storage",
    ],
  },
  {
    id: "cloud",
    kind: "skillGroup",
    label: "Cloud & Infrastructure",
    aliases: [
      "cloud", "infrastructure", "infra", "devops", "aws", "docker",
      "kubernetes", "k8s", "ci cd", "cicd", "deployment", "containers", "linux",
    ],
  },
  {
    id: "testing",
    kind: "skillGroup",
    label: "Testing",
    aliases: [
      "testing", "test", "tests", "qa", "quality assurance", "automation testing",
      "regression", "debugging",
    ],
  },
  {
    id: "core-cs",
    kind: "skillGroup",
    label: "Core Computer Science",
    aliases: [
      "dsa", "data structures", "algorithms", "core cs", "computer science",
      "fundamentals", "system design", "operating systems", "networks",
      "oop", "dbms",
    ],
  },
];

export interface EntityMatch {
  entity: Entity;
  score: number;
}

/**
 * Resolves every entity mentioned in a question, best match first.
 *
 * Scoring favours longer, more specific phrases so that "tell me about the
 * log analyzer" resolves to the project rather than to the "linux" cloud
 * skill alias.
 */
export function resolveEntities(question: string): EntityMatch[] {
  const text = normalize(question);
  const tokens = new Set(tokenize(question));
  const matches: EntityMatch[] = [];

  for (const entity of entities) {
    let best = 0;

    for (const alias of entity.aliases) {
      const normalizedAlias = normalize(alias);
      const words = normalizedAlias.split(" ");

      if (words.length > 1) {
        if (text.includes(normalizedAlias)) {
          best = Math.max(best, 6 + words.length);
        }
        continue;
      }

      // Single-word alias: exact token hit, then a bounded fuzzy fallback.
      const aliasTokens = tokenize(alias);
      const aliasToken = aliasTokens[0] ?? normalizedAlias;

      if (tokens.has(aliasToken)) {
        best = Math.max(best, 5);
        continue;
      }

      if (aliasToken.length >= 5) {
        for (const token of tokens) {
          if (token.length < 4) continue;
          const budget = aliasToken.length >= 8 ? 2 : 1;
          if (editDistance(token, aliasToken, budget) <= budget) {
            best = Math.max(best, 3);
            break;
          }
        }
      }
    }

    if (best > 0) matches.push({ entity, score: best });
  }

  return matches.sort((a, b) => b.score - a.score);
}

/** Best entity of a given kind, if any was mentioned. */
export function firstOfKind(
  matches: EntityMatch[],
  kind: EntityKind,
): Entity | undefined {
  return matches.find((match) => match.entity.kind === kind)?.entity;
}
