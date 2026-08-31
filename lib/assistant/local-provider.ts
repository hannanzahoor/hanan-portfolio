import { answerFor } from "./resolve";
import type {
  AnswerChunk,
  AssistantProvider,
  ConversationContext,
} from "./types";

export interface LocalProviderOptions {
  /** Emit the whole answer at once — used under prefers-reduced-motion. */
  instant?: boolean;
}

const THINK_MIN = 220;
const THINK_MAX = 460;
const CHUNK_MIN_DELAY = 10;
const CHUNK_MAX_DELAY = 26;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pacing only makes sense while someone is actually watching.
 *
 * Browsers clamp timers to roughly one per second in a hidden tab, so a paced
 * answer would crawl for a minute in the background and a visitor returning to
 * the tab would find a half-written reply. When the page is hidden we skip the
 * delays and let the answer complete immediately.
 */
function isWatching(): boolean {
  return typeof document === "undefined" || document.visibilityState === "visible";
}

function between(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Splits text into chunks of two to four words, keeping newlines attached so
 * markdown structure appears in one piece rather than character by character.
 */
function chunk(text: string): string[] {
  const pieces = text.split(/(\s+)/);
  const chunks: string[] = [];
  let buffer = "";
  let words = 0;
  const target = () => 2 + Math.floor(Math.random() * 3);
  let quota = target();

  for (const piece of pieces) {
    buffer += piece;
    if (/\S/.test(piece)) words += 1;

    const isBreak = piece.includes("\n");
    if (words >= quota || isBreak) {
      chunks.push(buffer);
      buffer = "";
      words = 0;
      quota = target();
    }
  }

  if (buffer) chunks.push(buffer);
  return chunks;
}

/**
 * The zero-cost assistant: deterministic retrieval over the local knowledge
 * base, paced to read like a streamed response.
 *
 * A future LLM-backed provider implements the same `AssistantProvider`
 * interface, so nothing in the UI changes when one is added.
 */
export class LocalProvider implements AssistantProvider {
  readonly id = "local";

  constructor(private readonly options: LocalProviderOptions = {}) {}

  async *ask(
    question: string,
    context: ConversationContext,
  ): AsyncGenerator<AnswerChunk, void, unknown> {
    const { answer } = answerFor(question, context);

    if (this.options.instant) {
      yield { type: "text", value: answer.text };
      yield { type: "done", answer };
      return;
    }

    if (isWatching()) await wait(between(THINK_MIN, THINK_MAX));

    for (const piece of chunk(answer.text)) {
      yield { type: "text", value: piece };
      if (isWatching()) await wait(between(CHUNK_MIN_DELAY, CHUNK_MAX_DELAY));
    }

    yield { type: "done", answer };
  }
}
