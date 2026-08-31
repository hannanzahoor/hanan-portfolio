"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { PanelCorners } from "@/components/ui/TerminalButton";
import { createAssistant, SUGGESTED_QUESTIONS } from "@/lib/assistant";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import type { AnswerLink, ConversationContext } from "@/lib/assistant/types";
import { navigateInternal } from "@/lib/navigation";
import { Markdown } from "./Markdown";

type Role = "system" | "user" | "assistant";
type Status = "ready" | "thinking" | "typing" | "error";

interface Message {
  id: number;
  role: Role;
  text: string;
  links?: AnswerLink[];
  followUps?: string[];
  grounded?: boolean;
  streaming?: boolean;
  failed?: boolean;
}

const SYSTEM_MESSAGE: Message = {
  id: 0,
  role: "system",
  text: "connected to hananzahoor.com — ask anything about Hanan's work, projects, or experience.",
};

const STATUS_LABEL: Record<Status, string> = {
  ready: "ready",
  thinking: "thinking",
  typing: "typing",
  error: "error",
};

const MAX_QUESTION_LENGTH = 300;

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("ready");

  const contextRef = useRef<ConversationContext>({ asked: [] });
  const nextId = useRef(1);
  const runId = useRef(0);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const instant = useMediaQuery("(prefers-reduced-motion: reduce)");
  const assistant = useMemo(() => createAssistant({ instant }), [instant]);
  const busy = status === "thinking" || status === "typing";

  // Cancel any in-flight stream when the panel unmounts.
  useEffect(() => () => void (runId.current += 1), []);

  // Keep the newest content in view without fighting a visitor who scrolled up.
  useEffect(() => {
    const node = transcriptRef.current;
    if (!node) return;
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    if (distance < 140) node.scrollTop = node.scrollHeight;
  }, [messages]);

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim().slice(0, MAX_QUESTION_LENGTH);
      if (!trimmed || busy) return;

      const run = ++runId.current;
      const userId = nextId.current++;
      const replyId = nextId.current++;

      setInput("");
      setStatus("thinking");
      setMessages((current) => [
        ...current,
        { id: userId, role: "user", text: trimmed },
        { id: replyId, role: "assistant", text: "", streaming: true },
      ]);

      try {
        let started = false;

        for await (const chunk of assistant.ask(trimmed, contextRef.current)) {
          if (run !== runId.current) return;

          if (chunk.type === "text") {
            if (!started) {
              started = true;
              setStatus("typing");
            }
            setMessages((current) =>
              current.map((message) =>
                message.id === replyId
                  ? { ...message, text: message.text + chunk.value }
                  : message,
              ),
            );
            continue;
          }

          const { answer } = chunk;
          contextRef.current = {
            asked: [...contextRef.current.asked, trimmed].slice(-12),
            lastIntent: answer.intent,
            lastEntity: answer.entity,
          };

          setMessages((current) =>
            current.map((message) =>
              message.id === replyId
                ? {
                    ...message,
                    text: answer.text,
                    links: answer.links,
                    followUps: answer.followUps,
                    grounded: answer.grounded,
                    streaming: false,
                  }
                : message,
            ),
          );
          setStatus("ready");
        }
      } catch {
        if (run !== runId.current) return;
        setMessages((current) =>
          current.map((message) =>
            message.id === replyId
              ? {
                  ...message,
                  text: "Something went wrong on my side. Try asking again, or reach Hanan directly at hananzahoorr@gmail.com.",
                  streaming: false,
                  failed: true,
                  followUps: ["What is his tech stack?", "What has he built?"],
                }
              : message,
          ),
        );
        setStatus("error");
      }
    },
    [assistant, busy],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void ask(input);
  };

  const reset = () => {
    runId.current += 1;
    contextRef.current = { asked: [] };
    nextId.current = 1;
    setMessages([SYSTEM_MESSAGE]);
    setStatus("ready");
    setInput("");
    inputRef.current?.focus();
  };

  const lastAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant" && !message.streaming);

  const chips =
    lastAssistant?.followUps && lastAssistant.followUps.length > 0
      ? lastAssistant.followUps
      : [...SUGGESTED_QUESTIONS].slice(0, 4);

  return (
    <div className="relative flex min-h-[420px] flex-col rounded-[14px] border border-line bg-surface p-4 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset] sm:p-[18px] lg:min-h-[460px]">
      <PanelCorners />

      {/* Panel chrome */}
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3 font-mono text-[11px] text-fg-dim sm:text-[12px]">
        <div className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="size-[9px] rounded-full bg-line-strong" />
          <span className="size-[9px] rounded-full bg-line-strong" />
          <span className="size-[9px] rounded-full bg-accent shadow-[0_0_8px_var(--accent-glow)]" />
        </div>

        <span className="truncate tracking-[0.04em]">~/ask-hanan.sh</span>

        <span className="flex shrink-0 items-center gap-1.5">
          {messages.length > 1 ? (
            <button
              type="button"
              onClick={reset}
              className="mr-1 rounded px-1.5 py-0.5 text-fg-faint transition-colors hover:text-accent"
            >
              clear
            </button>
          ) : null}
          <span
            className={`size-[6px] rounded-full ${
              status === "error" ? "bg-signal" : "anim-blip bg-accent"
            }`}
            aria-hidden="true"
          />
          <span className={status === "error" ? "text-signal" : undefined}>
            {STATUS_LABEL[status]}
          </span>
        </span>
      </div>

      {/* Transcript */}
      <div
        ref={transcriptRef}
        role="log"
        aria-live="polite"
        aria-label="Assistant conversation"
        className="flex min-h-[220px] flex-1 flex-col gap-4 overflow-y-auto px-1 pt-3.5 pb-3 text-[14px] leading-[1.6] sm:max-h-[340px]"
      >
        {messages.map((message) => (
          <MessageBlock key={message.id} message={message} />
        ))}

        {status === "thinking" ? (
          <p className="font-mono text-[12px] text-fg-faint" aria-hidden="true">
            <span className="caret" />
          </p>
        ) : null}
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5 border-t border-dashed border-line pt-2.5 pb-3">
        {chips.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => void ask(question)}
            disabled={busy}
            className="rounded-full border border-line bg-surface-2 px-2.5 py-1.5 font-mono text-[11px] text-fg-dim transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-45"
          >
            {question}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="mt-auto">
        <div className="flex items-center gap-2 rounded-[10px] border border-line bg-surface-2 px-3 py-2.5 transition-colors focus-within:border-accent/60">
          <span className="font-mono text-[13px] text-accent" aria-hidden="true">
            &rsaquo;
          </span>

          <label htmlFor="assistant-input" className="sr-only">
            Ask a question about Hanan
          </label>
          <input
            id="assistant-input"
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="ask anything about Hanan..."
            autoComplete="off"
            maxLength={MAX_QUESTION_LENGTH}
            disabled={busy}
            className="min-w-0 flex-1 border-none bg-transparent font-mono text-[13.5px] text-fg-bright outline-none placeholder:text-fg-faint disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={busy || input.trim().length === 0}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-line-strong px-2.5 py-1.5 font-mono text-[11px] text-fg-dim transition-colors hover:border-accent/60 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="hidden sm:inline">send</span>
            <span aria-hidden="true">&crarr;</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageBlock({ message }: { message: Message }) {
  if (message.role === "system") {
    return (
      <div className="max-w-[94%]">
        <p className="mb-1 font-mono text-[11px] tracking-[0.05em] text-fg-dim">
          {"// system"}
        </p>
        <p className="text-fg">{message.text}</p>
      </div>
    );
  }

  if (message.role === "user") {
    return (
      <div className="max-w-[94%] self-end text-right">
        <p className="mb-1 font-mono text-[11px] tracking-[0.05em] text-fg-faint">
          {"// you"}
        </p>
        <p className="inline-block rounded-lg border border-line bg-surface-2 px-3 py-2 text-left text-fg-bright">
          {message.text}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[94%]">
      <p
        className={`mb-1 font-mono text-[11px] tracking-[0.05em] ${
          message.failed ? "text-signal" : "text-accent"
        }`}
      >
        {"// hanan.sh"}
      </p>

      {message.text ? (
        <div className="text-fg">
          <Markdown text={message.text} streaming={message.streaming} />
          {message.streaming ? <span className="caret ml-0.5" /> : null}
        </div>
      ) : null}

      {message.links && message.links.length > 0 && !message.streaming ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {message.links.map((link) => (
            <AnswerLinkChip key={`${link.href}-${link.label}`} link={link} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AnswerLinkChip({ link }: { link: AnswerLink }) {
  const className =
    "inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-1.5 font-mono text-[11px] text-fg-dim transition-colors hover:border-accent/50 hover:text-accent";

  if (link.external) {
    return (
      <a
        href={link.href}
        target={link.href.startsWith("mailto:") ? undefined : "_blank"}
        rel="noreferrer noopener"
        className={className}
      >
        {link.label}
        <span aria-hidden="true">&#8599;</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => navigateInternal(link.href)}
      className={className}
    >
      {link.label}
      <span aria-hidden="true">&rarr;</span>
    </button>
  );
}
