/**
 * Contract between the chat UI and whatever answers questions behind it.
 *
 * The UI depends on this interface only. `LocalProvider` implements it today
 * with deterministic retrieval; a future LLM-backed provider can implement the
 * same interface without any UI or knowledge-architecture changes.
 */

export interface AnswerLink {
  label: string;
  href: string;
  /** External links open in a new tab and render with an arrow glyph. */
  external?: boolean;
}

export interface Answer {
  /** Body text using a small markdown subset: **bold**, `code`, and - bullets. */
  text: string;
  links: AnswerLink[];
  /** Contextual next questions offered as clickable chips. */
  followUps: string[];
  /** Knowledge document ids that produced this answer. */
  sources: string[];
  /** False when the assistant could not answer from the portfolio. */
  grounded: boolean;
  /** Resolution metadata, carried so the next turn can resolve follow-ups. */
  intent?: string;
  entity?: string;
}

export interface ConversationContext {
  /** Intent of the previous answer, for resolving follow-ups like "tell me more". */
  lastIntent?: string;
  /** Entity of the previous answer (project id, role id, skill group id). */
  lastEntity?: string;
  /** Questions already asked, so suggestions do not repeat. */
  asked: string[];
}

export type AnswerChunk =
  | { type: "text"; value: string }
  | { type: "done"; answer: Answer };

export interface AssistantProvider {
  readonly id: string;
  /** Streams the answer. Text chunks first, then a terminating `done`. */
  ask(
    question: string,
    context: ConversationContext,
  ): AsyncGenerator<AnswerChunk, void, unknown>;
}

export function emptyContext(): ConversationContext {
  return { asked: [] };
}
