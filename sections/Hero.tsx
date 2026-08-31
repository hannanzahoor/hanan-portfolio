import { ChatPanel } from "@/components/chat/ChatPanel";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/Icons";
import { Shell } from "@/components/ui/Section";
import { StatusPill, TerminalLink } from "@/components/ui/TerminalButton";
import { profile } from "@/data/profile";
import { MAILTO } from "@/lib/contact";
import { socialById } from "@/data/social";

/**
 * Hero quick links: GitHub, LinkedIn, email.
 *
 * Composed here rather than mapped from `data/social` because that list also
 * feeds the footer, contact section and JSON-LD, where LeetCode belongs. The
 * URLs still come from the shared data layer; only the selection is local.
 */
const quickLinks = [
  {
    id: "github",
    label: "github",
    href: socialById.github?.href ?? "",
    external: true,
    Icon: GitHubIcon,
  },
  {
    id: "linkedin",
    label: "linkedin",
    href: socialById.linkedin?.href ?? "",
    external: true,
    Icon: LinkedInIcon,
  },
  {
    id: "email",
    label: "email",
    href: MAILTO,
    external: false,
    Icon: MailIcon,
  },
];

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="home-title"
      className="relative scroll-mt-20 pt-12 pb-16 sm:pt-16 lg:pt-[72px] lg:pb-24"
    >
      <Shell>
        <div className="grid items-stretch gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          {/* Introduction */}
          <div data-reveal className="min-w-0">
            <StatusPill label={profile.availabilityShort} />

            {/*
              The heading text and the oversized greeting are separated on
              purpose.

              While both lived inside the h1, its text extracted as
              "$ hi, I'mHananHanan Zahoor — ..." — the decorative span and the
              screen-reader span ran together with no separator, and "Hanan"
              appeared twice. Now the h1 carries the heading text alone, and
              the greeting renders beside it as the decoration it is.

              The greeting keeps the h1's original classes, so the rendered box
              is pixel-identical; the h1 is out of flow and contributes no
              layout. Only what a screen reader or crawler reads has changed.
            */}
            <h1 id="home-title" className="sr-only">
              {profile.name} — AI/ML Engineer and Full-Stack Developer
            </h1>

            <p
              aria-hidden="true"
              className="mt-7 font-mono text-[clamp(38px,6.4vw,68px)] leading-[1.04] font-medium tracking-[-0.04em] text-fg-bright"
            >
              <span className="font-light text-fg-faint">$</span> hi, I&apos;m
              <br />
              <span className="text-accent">Hanan</span>
              <span className="caret ml-1.5" />
            </p>

            {/*
              Each unit is nowrap so the line only ever breaks at a separator —
              "Bangalore, India ↔ Remote" stays intact on narrow viewports
              instead of splitting mid-phrase.
            */}
            <p className="mt-4 font-mono text-[13px] tracking-[-0.005em] text-fg-dim sm:text-[14px]">
              <span className="whitespace-nowrap">Full-Stack Developer</span>{" "}
              <span className="text-fg-faint">·</span>{" "}
              <span className="whitespace-nowrap">AI/ML Engineer</span>{" "}
              <span className="text-fg-faint">·</span>{" "}
              <span className="whitespace-nowrap">
                {profile.location} <span className="text-fg-faint">↔</span>{" "}
                Remote
              </span>
            </p>

            <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.65] text-fg sm:text-[17px]">
              I build <em className="not-italic text-accent">intelligent systems</em>{" "}
              and <em className="not-italic text-accent">reliable software</em> by
              turning <em className="not-italic text-accent">complex problems</em>{" "}
              into <em className="not-italic text-accent">practical solutions</em> —
              from LLM-powered applications and machine learning pipelines to
              backend services and full-stack products.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <TerminalLink href="#contact" variant="primary">
                <span aria-hidden="true">&rarr;</span> get in touch
              </TerminalLink>
              <TerminalLink href="#projects">
                <span className="text-fg-faint" aria-hidden="true">$</span> ls
                projects/
              </TerminalLink>
            </div>

            <ul className="mt-7 flex flex-wrap gap-2">
              {quickLinks.map(({ id, label, href, external, Icon }) => (
                <li key={id}>
                  <a
                    href={href}
                    {...(external
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 font-mono text-[12px] text-fg-dim transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    <Icon />
                    {label}
                    <span className="sr-only">
                      {external
                        ? " (opens in a new tab)"
                        : ` ${profile.name} at ${profile.email}`}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Portfolio assistant */}
          <div data-reveal data-reveal-delay="120" className="min-w-0">
            <ChatPanel />
          </div>
        </div>
      </Shell>
    </section>
  );
}
