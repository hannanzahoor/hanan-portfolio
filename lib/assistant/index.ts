import { LocalProvider } from "./local-provider";
import type { AssistantProvider } from "./types";

export * from "./types";
export { LocalProvider } from "./local-provider";
export { answerFor, resolve } from "./resolve";

/**
 * Returns the assistant implementation the UI should use.
 *
 * Today there is exactly one: a local, deterministic provider that needs no
 * API key, no server, and no recurring cost. Adding an LLM later means adding
 * a second `AssistantProvider` and branching here — the chat UI and the
 * knowledge files stay as they are.
 */
export function createAssistant(options: { instant?: boolean } = {}): AssistantProvider {
  return new LocalProvider({ instant: options.instant });
}

/** Questions offered before the visitor has typed anything. */
export const SUGGESTED_QUESTIONS = [
  "What is Hanan's tech stack?",
  "Tell me about his AI/ML projects",
  "What did he build at Deloitte?",
  "Tell me about AirSense AI",
  "What are his achievements?",
  "Is he open to opportunities?",
] as const;
