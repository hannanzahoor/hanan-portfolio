/**
 * Node module-resolution hooks so the assistant library can be exercised
 * directly with `node --experimental-strip-types`, outside the Next bundler.
 *
 * Handles two things the bundler does for us: the "@/" path alias and
 * extensionless TypeScript imports.
 */
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";

const ROOT = process.cwd();

function candidates(base) {
  return [base, `${base}.ts`, `${base}.tsx`, join(base, "index.ts")];
}

export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const base = join(ROOT, specifier.slice(2));
    for (const candidate of candidates(base)) {
      if (existsSync(candidate)) {
        return next(pathToFileURL(candidate).href, context);
      }
    }
  }

  if (specifier.startsWith(".") && context.parentURL) {
    const parentDir = new URL(".", context.parentURL);
    const base = new URL(specifier, parentDir);
    if (!existsSync(base) && !specifier.endsWith(".json")) {
      for (const suffix of [".ts", ".tsx", "/index.ts"]) {
        const candidate = new URL(specifier + suffix, parentDir);
        if (existsSync(candidate)) return next(candidate.href, context);
      }
    }
  }

  return next(specifier, context);
}
