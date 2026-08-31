import { Section, SectionHeader } from "@/components/ui/Section";
import { Tag } from "@/components/ui/TerminalButton";
import { skillGroups } from "@/data/skills";

const total = skillGroups.reduce((sum, group) => sum + group.skills.length, 0);

export function Skills() {
  return (
    <Section id="skills" labelledBy="skills-title">
      <SectionHeader
        num="05"
        eyebrow="SKILLS"
        title="The stack behind the work."
        titleId="skills-title"
        path="$ cat skills.json"
        note={`${total} entries`}
      />

      {/*
        A description list is still the right semantic here — each category is
        the term, its technologies the description — so the cards are grouping
        <div>s inside the <dl>, as HTML allows.
      */}
      <dl data-reveal className="grid gap-[18px] min-[760px]:grid-cols-2">
        {skillGroups.map((group, index) => (
          <div
            key={group.id}
            className="card-glow rounded-xl border border-line bg-surface p-5 sm:p-[22px]"
          >
            <dt className="flex items-baseline border-b border-dashed border-line pb-3.5">
              <span className="min-w-0 font-mono text-[12px] tracking-[0.06em] text-fg-bright uppercase">
                <span className="mr-2 text-accent" aria-hidden="true">
                  [{String(index + 1).padStart(2, "0")}]
                </span>
                {group.label}
              </span>
            </dt>

            <dd className="mt-4">
              {/* Chips reuse the same Tag as the project and experience cards,
                  so the section reads as native rather than a new style. */}
              <ul className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li key={skill}>
                    <Tag>{skill}</Tag>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
