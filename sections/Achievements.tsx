import { Section, SectionHeader } from "@/components/ui/Section";
import { PanelCorners } from "@/components/ui/TerminalButton";
import { achievements } from "@/data/achievements";

export function Achievements() {
  return (
    <Section id="achievements" labelledBy="achievements-title">
      <SectionHeader
        num="06"
        eyebrow="ACHIEVEMENTS"
        title="Milestones logged."
        titleId="achievements-title"
        path="~/achievements"
        note={`${achievements.length} entries`}
      />

      <ul
        data-reveal
        className="grid gap-[18px] min-[640px]:grid-cols-2 min-[1040px]:grid-cols-4"
      >
        {achievements.map((item) => {
          const content = (
            <>
              <PanelCorners />
              <p className="font-mono text-[clamp(26px,3vw,32px)] leading-none font-medium tracking-[-0.03em] text-accent">
                {item.figure}
              </p>
              <p className="mt-3.5 text-[15px] leading-snug text-fg-bright">
                {item.title}
              </p>
              <p className="mt-2 font-mono text-[11.5px] leading-relaxed text-fg-dim">
                {item.detail}
              </p>
            </>
          );

          const shared =
            "relative flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition-[border-color,transform] duration-200";

          return (
            <li key={item.id}>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`${shared} hover:-translate-y-0.5 hover:border-accent/40`}
                >
                  {content}
                  <span className="mt-3 font-mono text-[11px] text-fg-faint transition-colors hover:text-accent">
                    view profile <span aria-hidden="true">&#8599;</span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </span>
                </a>
              ) : (
                <div className={shared}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
