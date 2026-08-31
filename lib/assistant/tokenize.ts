/**
 * Text normalization shared by the query parser and the retrieval index.
 * Both sides must use these functions so the vocabularies always agree.
 */

/** Tokens that would otherwise be shredded by the word splitter. */
const COMPOUNDS: [RegExp, string][] = [
  [/\bc\+\+\b/g, "cpp"],
  [/\bc#/g, "csharp"],
  [/\bc\/c\+\+\b/g, "c cpp"],
  [/\bci\s*\/\s*cd\b/g, "cicd"],
  [/\bnode\.?js\b/g, "nodejs"],
  [/\bexpress\.?js\b/g, "expressjs"],
  [/\bnext\.?js\b/g, "nextjs"],
  [/\bgpt-?4o\b/g, "gpt4o"],
  [/\btf-?idf\b/g, "tfidf"],
  [/\baes-?gcm\b/g, "aesgcm"],
  [/\brest\s+apis?\b/g, "rest api"],
  [/\be2e\b/g, "endtoend"],
  [/\bend[-\s]to[-\s]end\b/g, "endtoend"],
  [/\bfull[-\s]stack\b/g, "fullstack"],
  [/\bback[-\s]end\b/g, "backend"],
  [/\bfront[-\s]end\b/g, "frontend"],
  [/\bmachine\s+learning\b/g, "machinelearning ml"],
  [/\bdata\s+structures?\b/g, "datastructures dsa"],
  [/\bsystem\s+design\b/g, "systemdesign"],
  [/\bgenerative\s+ai\b/g, "generativeai genai"],
  [/\bgen\s+ai\b/g, "genai"],
  [/\bai\s*\/\s*ml\b/g, "ai ml"],
];

const STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "all", "also", "am", "an",
  "and", "any", "are", "as", "at", "be", "because", "been", "being", "but",
  "by", "can", "could", "did", "do", "does", "doing", "done", "for", "from",
  "get", "give", "had", "has", "have", "he", "her", "here", "hes", "him",
  "his", "how", "i", "if", "in", "into", "is", "it", "its", "just", "know",
  "like", "many", "me", "more", "most", "much", "my", "of", "on", "one",
  "only", "or", "other", "our", "out", "over", "please", "s", "said", "same",
  "she", "should", "so", "some", "such", "tell", "than", "that", "the",
  "their", "them", "then", "there", "these", "they", "this", "those", "to",
  "too", "us", "very", "was", "we", "were", "what", "whats", "when", "where",
  "which", "while", "who", "whom", "why", "will", "with", "would", "you",
  "your", "yours",
]);

/** Lower-cases, folds punctuation, and expands compound technology names. */
export function normalize(input: string): string {
  let text = input
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-");

  for (const [pattern, replacement] of COMPOUNDS) {
    text = text.replace(pattern, replacement);
  }

  return text.replace(/\s+/g, " ").trim();
}

/**
 * Conservative suffix stripping. A full Porter stemmer would over-stem
 * technology names ("agno", "agile"); this only folds the endings that
 * actually vary between how people ask and how the knowledge files are
 * written ("projects"/"project", "solved"/"solve").
 */
export function stem(word: string): string {
  if (word.length <= 3) return word;

  if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
  if (/(?:ss|us|is)$/.test(word)) return word;
  if (/(?:ches|shes|xes|zes|ses)$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("s")) return word.slice(0, -1);
  if (word.endsWith("ing") && word.length > 5) return word.slice(0, -3);
  if (word.endsWith("ed") && word.length > 4) return word.slice(0, -2);

  return word;
}

/** Normalized string -> stemmed, stopword-filtered token list. */
export function tokenize(input: string): string[] {
  return normalize(input)
    .split(/[^a-z0-9+#]+/)
    .filter((token) => token.length > 0 && !STOPWORDS.has(token))
    .map(stem)
    .filter((token) => token.length > 1);
}

/** Levenshtein distance, capped for early exit. Used only on entity names. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        (curr[j - 1] ?? 0) + 1,
        (prev[j] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost,
      );
      curr[j] = value;
      if (value < rowMin) rowMin = value;
    }
    if (rowMin > max) return max + 1;
    prev = curr;
  }

  return prev[b.length] ?? max + 1;
}
