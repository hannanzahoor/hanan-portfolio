#!/usr/bin/env node
/**
 * Compiles knowledge/**\/*.md into a single JSON module consumed by the
 * client-side assistant.
 *
 * This script only parses and normalizes. Tokenization and BM25 indexing
 * happen at runtime in lib/assistant/retrieve.ts so there is exactly one
 * tokenizer implementation and no build/runtime skew. The corpus is ~20
 * short documents; indexing it in the browser costs about a millisecond.
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "knowledge");
const OUT_DIR = join(ROOT, "lib", "assistant", "generated");
const OUT = join(OUT_DIR, "knowledge.json");

/** Recursively collect every .md file under a directory. */
async function collect(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(full)));
    else if (entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

/**
 * Minimal frontmatter parser. Supports `key: value` and `key: [a, b, c]`,
 * which is the entire surface the knowledge files use — no need for a
 * YAML dependency.
 */
function parseFrontmatter(raw) {
  const text = raw.replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) return { data: {}, body: text.trim() };

  const data = {};
  for (const line of match[1].split("\n")) {
    const kv = /^(\w[\w-]*)\s*:\s*(.*)$/.exec(line.trim());
    if (!kv) continue;
    const [, key, rawValue] = kv;
    let value = rawValue.trim();

    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      data[key] = value.replace(/^["']|["']$/g, "");
    }
  }

  return { data, body: text.slice(match[0].length).trim() };
}

function fail(message) {
  console.error(`\n  knowledge: ${message}\n`);
  process.exit(1);
}

const files = (await collect(SRC)).sort();
if (files.length === 0) fail(`no markdown files found in ${SRC}`);

const docs = [];
const seen = new Set();

for (const file of files) {
  const source = relative(ROOT, file).split(sep).join("/");
  const { data, body } = parseFrontmatter(await readFile(file, "utf8"));

  for (const field of ["id", "title", "section", "anchor"]) {
    if (!data[field]) fail(`${source} is missing required frontmatter: ${field}`);
  }
  if (seen.has(data.id)) fail(`duplicate knowledge id "${data.id}" (${source})`);
  if (!body) fail(`${source} has no body content`);
  seen.add(data.id);

  docs.push({
    id: data.id,
    title: data.title,
    section: data.section,
    anchor: data.anchor,
    tags: Array.isArray(data.tags) ? data.tags : [],
    body,
    source,
  });
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(
  OUT,
  JSON.stringify({ generatedFrom: "knowledge/", docs }, null, 2) + "\n",
  "utf8",
);

const bytes = JSON.stringify(docs).length;
console.log(
  `  knowledge: ${docs.length} documents compiled -> ${relative(ROOT, OUT).split(sep).join("/")} (${(bytes / 1024).toFixed(1)} KB)`,
);
