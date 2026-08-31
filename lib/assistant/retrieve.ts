import knowledge from "./generated/knowledge.json" with { type: "json" };
import { normalize, stem, tokenize } from "./tokenize";

export interface KnowledgeDoc {
  id: string;
  title: string;
  section: string;
  anchor: string;
  tags: string[];
  body: string;
  source: string;
}

export interface ScoredDoc {
  doc: KnowledgeDoc;
  score: number;
}

const docs = knowledge.docs as KnowledgeDoc[];

/** BM25 parameters. k1 controls term saturation, b controls length normalization. */
const K1 = 1.35;
const B = 0.7;
/** Frontmatter tags describe what a document answers, so they outweigh prose. */
const TAG_WEIGHT = 3;
const TITLE_WEIGHT = 2;

interface IndexedDoc {
  doc: KnowledgeDoc;
  freq: Map<string, number>;
  length: number;
}

interface Index {
  entries: IndexedDoc[];
  idf: Map<string, number>;
  avgLength: number;
}

let cached: Index | null = null;

function build(): Index {
  const entries: IndexedDoc[] = docs.map((doc) => {
    const freq = new Map<string, number>();
    const add = (text: string, weight: number) => {
      for (const token of tokenize(text)) {
        freq.set(token, (freq.get(token) ?? 0) + weight);
      }
    };

    add(doc.body, 1);
    add(doc.title, TITLE_WEIGHT);
    for (const tag of doc.tags) add(tag, TAG_WEIGHT);

    let length = 0;
    for (const count of freq.values()) length += count;

    return { doc, freq, length };
  });

  const docFreq = new Map<string, number>();
  for (const entry of entries) {
    for (const token of entry.freq.keys()) {
      docFreq.set(token, (docFreq.get(token) ?? 0) + 1);
    }
  }

  const total = entries.length;
  const idf = new Map<string, number>();
  for (const [token, count] of docFreq) {
    // Standard BM25 IDF, floored so common terms never score negative.
    idf.set(token, Math.max(0.05, Math.log(1 + (total - count + 0.5) / (count + 0.5))));
  }

  const avgLength =
    entries.reduce((sum, entry) => sum + entry.length, 0) / (total || 1);

  return { entries, idf, avgLength };
}

function index(): Index {
  if (!cached) cached = build();
  return cached;
}

/** BM25 ranking over the knowledge corpus. */
export function search(query: string, limit = 4): ScoredDoc[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const { entries, idf, avgLength } = index();

  return entries
    .map(({ doc, freq, length }) => {
      let score = 0;
      for (const term of terms) {
        const tf = freq.get(term);
        if (!tf) continue;
        const weight = idf.get(term) ?? 0;
        const norm = tf * (K1 + 1);
        const denom = tf + K1 * (1 - B + (B * length) / avgLength);
        score += weight * (norm / denom);
      }
      return { doc, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Normalizes a raw BM25 score into a rough 0..1 confidence. BM25 is unbounded,
 * so this is a calibration against typical scores for this corpus rather than
 * a probability.
 */
export function confidenceOf(score: number): number {
  return Math.min(1, score / 9);
}

export function docById(id: string): KnowledgeDoc | undefined {
  return docs.find((doc) => doc.id === id);
}

export function allDocs(): KnowledgeDoc[] {
  return docs;
}

/** Topic labels offered when the assistant cannot answer confidently. */
export function nearestTopics(query: string, limit = 3): KnowledgeDoc[] {
  const ranked = search(query, limit);
  if (ranked.length > 0) return ranked.map((result) => result.doc);

  return ["skills", "projects", "experience"]
    .map(docById)
    .filter((doc): doc is KnowledgeDoc => Boolean(doc))
    .slice(0, limit);
}

export { normalize, stem, tokenize };
