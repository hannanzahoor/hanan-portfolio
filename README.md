# Hanan Zahoor — Portfolio

Personal portfolio for **Hanan Zahoor**, AI/ML Engineer and Software Engineer.

A single-page, terminal-inspired site built with Next.js, TypeScript, and
Tailwind CSS. It ships as a **fully static export** and runs with **zero
recurring API or service costs** — no API keys, no backend, no paid SaaS.

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server (compiles the knowledge base first) |
| `npm run build` | Production static export into `out/` |
| `npm run knowledge` | Recompile `knowledge/**/*.md` into the assistant's index |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test:assistant` | Assistant routing + grounding tests |
| `npm test` | Typecheck, then assistant tests |

## Deployment

`next build` writes a static site to `out/`. There is no server runtime, so it
deploys as-is to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static
host.

The only environment variable is the public site URL, used for canonical links,
the sitemap, and Open Graph tags. Copy `.env.example` to `.env.local` and set it:

```bash
NEXT_PUBLIC_SITE_URL=https://hananzahoor.com
```

It falls back to `https://hananzahoor.com` if unset.

---

## Architecture

```
app/            Routes, layout, metadata, sitemap, robots, 404
components/
  layout/       Nav, Footer, background planes, reveal observer
  ui/           Section shell, headers, buttons, tags, panels
  chat/         Assistant panel, message rendering, markdown subset
sections/       The seven page sections
data/           Structured content — the source of truth for the UI
knowledge/      Markdown source of truth for the assistant
lib/
  assistant/    Retrieval, intent routing, answer composition
  hooks/        Media query and active-section hooks
scripts/        Knowledge compiler and the assistant test suite
```

### Content lives in two places, on purpose

- **`data/*.ts`** — what the *page* renders (projects, experience, skills,
  achievements, education, social links).
- **`knowledge/**/*.md`** — what the *assistant* can talk about.

Both are transcribed from Hanan's résumé. Updating a job, project,
skill, or link means editing one file in `data/`; no UI component contains
hard-coded content. If you change a fact, change it in both places so the page
and the assistant agree.

---

## The portfolio assistant

The chat panel in the hero is a **local, deterministic assistant**. It runs
entirely in the browser: no API key, no server, no request ever leaves the page,
and nothing to pay for.

### How a question becomes an answer

1. **Normalize** — lowercase, fold punctuation, expand compound technology names
   (`node.js` → `nodejs`, `c++` → `cpp`), light stemming.
2. **Resolve entities** — match projects, employers, and skill groups by alias,
   including multi-word phrases ("the aqi one") and typos ("airsence") via a
   bounded edit distance.
3. **Score intents** — weighted keyword matching across ~15 intents
   (availability, skills, projects, experience, education, achievements, …).
4. **Compose the answer** — each intent has a hand-written template filled from
   `data/`. BM25 retrieval over `knowledge/` handles anything the intents miss.
5. **Refuse if unsure** — below a confidence threshold the assistant says it
   doesn't have the information and offers the topics it does cover.

It also keeps light conversational state, so "tell me more" and "the second one"
resolve against the previous answer, and it offers contextual follow-up chips.

### Why it can't hallucinate

Answers are assembled from curated templates and knowledge files written from the
résumés. There is no generative model in the loop, so the assistant can only say
things that were written into it — or admit it doesn't know. That is a stricter
accuracy guarantee than an LLM provides.

The tradeoff is flexibility: unusual phrasings are handled less gracefully than a
model would handle them. Broad alias coverage, fuzzy entity matching, and an
honest unknown state are the mitigations.

### Adding an LLM later

The UI depends only on the `AssistantProvider` interface in
`lib/assistant/types.ts`:

```ts
interface AssistantProvider {
  ask(question: string, context: ConversationContext): AsyncGenerator<AnswerChunk>;
}
```

`LocalProvider` implements it today. A remote provider implements the same
interface, consumes the same retrieved knowledge chunks as context, and is
swapped in at the factory in `lib/assistant/index.ts`. No UI changes, no
knowledge-architecture changes.

### Editing the knowledge base

Add or edit a file under `knowledge/`, with frontmatter:

```markdown
---
id: unique-slug
title: Human readable title
section: projects
anchor: "#projects"
tags: [words, a, visitor, might, use]
---

Body text the assistant may quote verbatim.
```

Then rebuild the index:

```bash
npm run knowledge
```

`npm run dev` and `npm run build` do this automatically. The compiler validates
required frontmatter and rejects duplicate ids.

---

## Testing

```bash
npm test
```

`scripts/test-assistant.mts` covers 35 routing cases — every question in the
brief, entity aliases and typos, conversation memory, and a set of questions the
assistant **must refuse** rather than guess at ("what is his salary?"). It also
asserts a grounding invariant: every answer claiming to be grounded must cite a
real knowledge document.

## Accessibility and motion

- Semantic landmarks, one `h1`, ordered headings, skip link.
- Full keyboard support; visible focus rings; the mobile menu traps nothing but
  moves focus in and restores it on Escape.
- The assistant transcript is an `aria-live` log; controls are labelled.
- Scroll reveal is **fail-open**: content is visible unless JavaScript confirms
  the animation can run, so a blocked script or missing `IntersectionObserver`
  costs the animation, never the content.
- `prefers-reduced-motion` disables reveals, the pointer torch, and paced
  streaming.

## Notes

- The portrait is used as supplied, cropped to 4:5 with CSS only — no filters or
  alterations.
- Social and repository URLs were taken from the link annotations embedded in the
  résumé PDFs; none are invented.
- There is no contact form. Email, GitHub, LinkedIn, and LeetCode links are the
  contact path, so nothing on the page implies a capability that doesn't exist.
