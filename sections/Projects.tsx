"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Tag } from "@/components/ui/TerminalButton";
import { categoryLabels, projectFilters, projects } from "@/data/projects";
import type { Project, ProjectCategory } from "@/data/types";
import { OPEN_PROJECT_EVENT, type OpenProjectDetail, prefersReducedMotion } from "@/lib/navigation";

type Filter = ProjectCategory | "all";

export function Projects() {
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState<string[]>([]);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  const visible =
    filter === "all"
      ? projects
      : projects.filter((project) => project.categories.includes(filter));

  const toggle = useCallback((id: string) => {
    setExpanded((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  }, []);

  /** Opens a project card and brings it into view. */
  const open = useCallback((id: string) => {
    if (!projects.some((project) => project.id === id)) return;

    setFilter("all");
    setExpanded((current) => (current.includes(id) ? current : [...current, id]));

    window.setTimeout(() => {
      cardRefs.current.get(id)?.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center",
      });
    }, 60);
  }, []);

  // Deep links from the assistant, and from the address bar on first load.
  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<OpenProjectDetail>).detail;
      if (detail?.id) open(detail.id);
    };

    window.addEventListener(OPEN_PROJECT_EVENT, onOpen);

    // A deep link like #projects/airsense-ai can only be read on the client.
    // Deferring to the next frame lets the first render commit and paint
    // before the card expands, instead of cascading a second render during
    // mount — and the card needs its final layout before we scroll to it.
    const [section, projectId] = window.location.hash.slice(1).split("/");
    const frame =
      section === "projects" && projectId
        ? requestAnimationFrame(() => open(projectId))
        : 0;

    return () => {
      window.removeEventListener(OPEN_PROJECT_EVENT, onOpen);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [open]);

  return (
    <Section id="projects" labelledBy="projects-title">
      <SectionHeader
        num="04"
        eyebrow="PROJECTS"
        title="What I’ve built."
        titleId="projects-title"
        path="~/projects"
        note={`${visible.length} of ${projects.length} shown`}
      />

      {/* Filters */}
      <div
        data-reveal
        className="mb-7 flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Filter projects by category"
      >
        <span className="mr-1 font-mono text-[12px] text-fg-faint" aria-hidden="true">
          $ filter
        </span>
        {projectFilters.map((entry) => {
          const isActive = filter === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => setFilter(entry.id)}
              aria-pressed={isActive}
              className={`rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors ${
                isActive
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-line bg-surface-2 text-fg-dim hover:border-line-strong hover:text-fg-bright"
              }`}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      {/*
        `items-start` stops a grid row from stretching every card to the
        tallest one, so an expanded card grows alone and its neighbours keep
        their collapsed size.

        Uniform collapsed height comes from a shared `min-h` on the card
        itself (see ProjectCard) rather than from row stretching — a minimum,
        so an expanded card is still free to grow past it.
      */}
      <div
        data-reveal
        className="grid items-start gap-[18px] min-[940px]:grid-cols-3"
      >
        {visible.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            expanded={expanded.includes(project.id)}
            onToggle={() => toggle(project.id)}
            register={(node) => {
              if (node) cardRefs.current.set(project.id, node);
              else cardRefs.current.delete(project.id);
            }}
          />
        ))}
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-dashed border-line pt-6">
        <p className="font-mono text-[12px] text-fg-dim">
          <span className="text-fg-faint">$</span> ls -al ~/projects
          <span className="ml-3 text-[11px] text-fg-faint">
            {`// ${projects.length} repositories`}
          </span>
        </p>
      </div>
    </Section>
  );
}

function ProjectCard({
  project,
  expanded,
  onToggle,
  register,
}: {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
  register: (node: HTMLElement | null) => void;
}) {
  const detailId = `project-detail-${project.id}`;

  return (
    <article
      ref={register}
      id={`project-${project.id}`}
      /*
        min-h gives every collapsed card the same height without the grid
        stretching siblings to an expanded one. It is a *minimum*, so an
        expanded card grows past it and nothing is ever clipped.

        Two tiers because the tallest collapsed card changes with column
        width — measured at 465px @940 and 424px @1280+. No min-h below 940px:
        there the cards stack one per row and use their natural height.
      */
      className="card-glow relative flex scroll-mt-24 flex-col rounded-xl border border-line bg-surface p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong sm:p-[22px] min-[940px]:min-h-[470px] min-[1200px]:min-h-[430px]"
    >
      <p className="font-mono text-[11px] tracking-[0.08em] text-accent">
        [ {project.index} ]
      </p>

      <h3 className="mt-3.5 font-mono text-[19px] leading-snug font-medium tracking-[-0.02em] text-fg-bright sm:text-[21px]">
        {project.title}
      </h3>
      <p className="mt-1 text-[13px] text-fg-dim">{project.subtitle}</p>

      <p className="mt-3 font-mono text-[11.5px] text-fg-dim">
        {project.dateLabel}
        <span className="mx-2 text-fg-faint">·</span>
        {project.categories
          .map((category) => categoryLabels[category].toLowerCase())
          .join(" · ")}
      </p>

      <p className="mt-3.5 text-[14px] leading-[1.6] text-fg">{project.summary}</p>

      {/* Expandable detail */}
      <div id={detailId} hidden={!expanded} className="mt-4">
        <p className="font-mono text-[11px] tracking-[0.06em] text-fg-dim">
          {"// what he built"}
        </p>
        <ul className="mt-2.5 flex flex-col gap-2 text-[13.5px] leading-[1.6] text-fg">
          {project.highlights.map((highlight) => (
            <li key={highlight.slice(0, 28)} className="flex gap-2.5">
              <span
                className="mt-[0.6em] size-1 shrink-0 rounded-full bg-accent-muted"
                aria-hidden="true"
              />
              <span className="min-w-0">{highlight}</span>
            </li>
          ))}
        </ul>

        <p className="mt-4 font-mono text-[11px] tracking-[0.06em] text-fg-dim">
          {"// concepts"}
        </p>
        <p className="mt-2 text-[13px] leading-[1.6] text-fg-dim">
          {project.concepts.join(" · ")}
        </p>
      </div>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.map((tech) => (
          <li key={tech}>
            <Tag>{tech}</Tag>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center gap-3.5 border-t border-dashed border-line pt-3.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={detailId}
          className="tap-pad font-mono text-[12px] text-fg-dim transition-colors hover:text-accent"
        >
          {expanded ? "− less" : "+ details"}
        </button>

        {project.links.github ? (
          <a
            href={project.links.github}
            target="_blank"
            rel="noreferrer noopener"
            className="tap-pad ml-auto font-mono text-[12px] text-fg-dim transition-colors hover:text-accent"
          >
            github <span aria-hidden="true">&#8599;</span>
            <span className="sr-only">
              {project.title} repository (opens in a new tab)
            </span>
          </a>
        ) : null}
      </div>
    </article>
  );
}
