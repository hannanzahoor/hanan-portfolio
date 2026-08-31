import { Fragment, type ReactNode } from "react";

/**
 * Renders the small markdown subset the assistant emits: paragraphs,
 * "- " bullets, **bold**, and `code`.
 *
 * Everything is built as React elements — no HTML is ever injected — so a
 * knowledge file can never introduce markup into the page.
 */

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(INLINE)
    .filter((part) => part.length > 0)
    .map((part, index) => {
      const key = `${keyPrefix}-${index}`;

      if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={key} className="font-semibold text-fg-bright">
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={key}
            className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-accent"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      return <Fragment key={key}>{part}</Fragment>;
    });
}

/**
 * Hides a trailing unmatched `**` or backtick so partially streamed text
 * never flashes raw markdown syntax.
 */
function stripDangling(text: string): string {
  let output = text;

  if ((output.match(/\*\*/g) ?? []).length % 2 === 1) {
    output = output.replace(/\*\*(?![\s\S]*\*\*)/, "");
  }
  if ((output.match(/`/g) ?? []).length % 2 === 1) {
    output = output.replace(/`(?![\s\S]*`)/, "");
  }

  return output;
}

function lines(block: string): string[] {
  return block.split("\n").filter((line) => line.trim().length > 0);
}

export function Markdown({
  text,
  streaming = false,
}: {
  text: string;
  streaming?: boolean;
}) {
  const source = streaming ? stripDangling(text) : text;
  const blocks = source.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  return (
    <div className="flex flex-col gap-2.5">
      {blocks.map((block, blockIndex) => {
        const key = `b${blockIndex}`;
        const rows = lines(block);
        const isList = rows.length > 0 && rows.every((row) => row.trimStart().startsWith("- "));

        if (isList) {
          return (
            <ul key={key} className="flex flex-col gap-1.5">
              {rows.map((row, rowIndex) => (
                <li key={`${key}-${rowIndex}`} className="flex gap-2.5">
                  <span className="mt-[0.55em] size-1 shrink-0 rounded-full bg-accent-muted" aria-hidden="true" />
                  <span className="min-w-0">
                    {renderInline(row.trimStart().slice(2), `${key}-${rowIndex}`)}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={key}>
            {rows.map((row, rowIndex) => (
              <Fragment key={`${key}-${rowIndex}`}>
                {rowIndex > 0 ? <br /> : null}
                {renderInline(row, `${key}-${rowIndex}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
