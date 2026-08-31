import Image from "next/image";
import { Section, SectionHeader } from "@/components/ui/Section";
import { PanelCorners } from "@/components/ui/TerminalButton";
import { education } from "@/data/education";
import { profile } from "@/data/profile";

/**
 * The About section shows the current degree only. The full education history
 * stays in data/education.ts, where the portfolio assistant still answers from
 * it.
 */
const degree = education.find((entry) => entry.id === "jain");

export function About() {
  return (
    <Section id="about" labelledBy="about-title">
      <SectionHeader
        num="02"
        eyebrow="ABOUT"
        title="Understanding problems. Engineering solutions."
        titleId="about-title"
        path="~/about"
        note={profile.location.toLowerCase()}
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:items-start lg:gap-14">
        {/* Bio */}
        <div data-reveal className="order-2 min-w-0 lg:order-1">
          <p className="font-mono text-[13px] text-fg-dim">
            <span className="mr-1.5 text-fg-faint">$</span>whoami
          </p>

          <p className="mt-2 font-mono text-[20px] font-medium tracking-[-0.02em] text-fg-bright sm:text-[22px]">
            {profile.name}
          </p>
          <p className="mt-1 font-mono text-[13px] text-accent">
            {profile.roleDisplay}
          </p>

          <div className="mt-6 flex flex-col gap-4 text-[15px] leading-[1.7] text-fg sm:text-[16px]">
            {profile.about.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>

          {/* Education */}
          <div className="mt-9 border-t border-dashed border-line pt-6">
            <p className="font-mono text-[12px] tracking-[0.05em] text-fg-dim">
              <span className="mr-1.5 text-fg-faint">$</span>cat education.txt
            </p>

            {degree ? (
              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <div className="min-w-0">
                  <p className="text-[15px] text-fg-bright">
                    {degree.institution}
                  </p>
                  <p className="font-mono text-[12px] text-fg-dim">
                    {degree.qualification}
                  </p>
                </div>
                <p className="shrink-0 text-right font-mono text-[12px] text-fg-dim">
                  {degree.period}
                  <br />
                  <span className="text-fg-faint">{degree.result}</span>
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Portrait */}
        <figure
          data-reveal
          data-reveal-delay="100"
          className="order-1 mx-auto w-full max-w-[280px] lg:order-2 lg:mx-0 lg:max-w-none"
        >
          <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
            <PanelCorners />
            <Image
              src="/portrait.jpg"
              alt={`${profile.name}, ${profile.role}`}
              width={1178}
              height={1335}
              sizes="(max-width: 1023px) 280px, 300px"
              className="aspect-[4/5] w-full object-cover object-top"
            />
          </div>
        </figure>
      </div>
    </Section>
  );
}
