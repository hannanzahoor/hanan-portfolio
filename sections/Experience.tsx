import { Section, SectionHeader } from "@/components/ui/Section";
import { Tag } from "@/components/ui/TerminalButton";
import { experience } from "@/data/experience";

export function Experience() {
  const lastIndex = experience.length - 1;

  return (
    <Section id="experience" labelledBy="experience-title">
      <SectionHeader
        num="03"
        eyebrow="EXPERIENCE"
        title="Where I’ve built."
        titleId="experience-title"
        path="~/career"
        note={`${experience.length} roles`}
      />

      <ol className="flex flex-col">
        {experience.map((role, index) => (
          <li
            key={role.id}
            data-reveal
            data-reveal-delay={index * 90}
            className="grid gap-x-6 sm:grid-cols-[88px_1fr]"
          >
            {/* Year marker — deliberately quiet so it anchors the entry
                without competing with the company name. */}
            <div className="mb-3 flex items-center gap-3 sm:mb-0 sm:flex-col sm:items-end sm:gap-2 sm:pt-1">
              <span className="font-mono text-[13px] text-fg-dim">
                {role.period}
              </span>
              {role.current ? (
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.06em] text-accent">
                  <span
                    className="anim-blip size-[6px] rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  CURRENT
                </span>
              ) : null}
            </div>

            {/* Timeline rail + entry body */}
            <div
              className={`relative border-l border-line pl-6 sm:pl-8 ${
                index === lastIndex ? "pb-0" : "pb-12"
              }`}
            >
              {/* Node sits on the rail; the ring punches a gap in the line. */}
              <span
                className={`absolute -left-[5px] top-[9px] size-[9px] rounded-full ring-4 ring-bg ${
                  role.current
                    ? "bg-accent shadow-[0_0_10px_var(--accent-glow)]"
                    : "bg-line-strong"
                }`}
                aria-hidden="true"
              />

              <h3 className="font-mono text-[21px] leading-tight font-medium tracking-[-0.02em] text-fg-bright sm:text-[24px]">
                {role.company}
              </h3>

              <p className="mt-1.5 font-mono text-[13px]">
                <span className="text-accent">{role.title}</span>
                <span className="mx-2 text-fg-faint" aria-hidden="true">
                  ·
                </span>
                <span className="text-fg-dim">{role.location}</span>
              </p>

              {/* Period kept, but subordinate to company and role. */}
              <p className="mt-1 font-mono text-[11.5px] text-fg-faint">
                {role.start} &ndash; {role.end}
              </p>

              <p className="mt-5 font-mono text-[11px] tracking-[0.06em] text-fg-dim">
                {"// highlights"}
              </p>
              <ul className="mt-2.5 flex flex-col gap-2.5 text-[15px] leading-[1.65] text-fg">
                {role.highlights.map((highlight) => (
                  <li key={highlight.slice(0, 32)} className="flex gap-3">
                    <span
                      className="mt-[0.6em] size-1 shrink-0 rounded-full bg-accent-muted"
                      aria-hidden="true"
                    />
                    <span className="min-w-0">{highlight}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 font-mono text-[11px] tracking-[0.06em] text-fg-dim">
                {"// stack"}
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {role.tech.map((tech) => (
                  <li key={tech}>
                    <Tag>{tech}</Tag>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
