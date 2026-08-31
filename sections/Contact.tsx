"use client";

import { useEffect, useState } from "react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { DownloadIcon } from "@/components/ui/Icons";
import { PanelCorners, TerminalButton } from "@/components/ui/TerminalButton";
import { profile } from "@/data/profile";
import { social } from "@/data/social";
import { MAILTO_OPPORTUNITY } from "@/lib/contact";

/** The single CV offered from the contact section. */
const CV_HREF = "/resume/hanan-zahoor-cv.pdf";

export function Contact() {
  return (
    <Section id="contact" labelledBy="contact-title">
      <SectionHeader
        num="07"
        eyebrow="GET IN TOUCH"
        title="Let's build something."
        titleId="contact-title"
        path="~/contact"
        note="● open to opportunities"
        noteAccent
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-12">
        {/* Direct contact */}
        <div data-reveal className="min-w-0">
          <a
            href={MAILTO_OPPORTUNITY}
            className="group inline-flex max-w-full items-baseline gap-3 border-b border-line-strong pb-1 font-mono text-[clamp(19px,3vw,30px)] tracking-[-0.02em] text-fg-bright transition-colors hover:border-accent hover:text-accent"
          >
            <span className="truncate">{profile.email}</span>
            <span
              className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </a>

          <div className="mt-4">
            <CopyEmailButton />
          </div>

          <dl className="mt-9 flex flex-col gap-3 font-mono text-[13px]">
            <Row label="location" value={profile.location} />
            <Row label="status" value="open to roles & freelance" accent />
            <Row label="focus" value={profile.focus} />
            <Row label="education" value="B.Tech CSE, Jain University" />
          </dl>
        </div>

        {/* Profiles */}
        <div data-reveal data-reveal-delay="100" className="min-w-0">
          <div className="relative rounded-[14px] border border-line bg-surface p-5 sm:p-6">
            <PanelCorners />

            <p className="font-mono text-[11px] tracking-[0.06em] text-fg-dim">
              {"// profiles"}
            </p>

            <ul className="mt-4 flex flex-col">
              {social.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group flex items-baseline justify-between gap-4 border-b border-dashed border-line py-3.5 font-mono text-[13px] transition-colors last:border-b-0 hover:text-accent"
                  >
                    <span className="text-fg-dim group-hover:text-accent">
                      {item.label}
                    </span>
                    <span className="flex items-baseline gap-2 text-fg-bright group-hover:text-accent">
                      {item.handle}
                      <span
                        className="text-fg-faint transition-colors group-hover:text-accent"
                        aria-hidden="true"
                      >
                        &#8599;
                      </span>
                      <span className="sr-only">(opens in a new tab)</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Single CV download, centred beneath both columns. */}
      <div data-reveal className="mt-12 flex justify-center sm:mt-14">
        <a
          href={CV_HREF}
          download
          className="card-glow inline-flex items-center gap-3 rounded-xl border border-accent/40 bg-surface px-7 py-4 font-mono text-[14px] text-accent"
        >
          <DownloadIcon size={15} />
          Download CV
          <span className="text-fg-faint" aria-hidden="true">
            pdf
          </span>
        </a>
      </div>
    </Section>
  );
}

function Row({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
      <dt className="w-20 shrink-0 text-fg-faint">{label}</dt>
      <dd className={accent ? "text-accent" : "text-fg"}>{value}</dd>
    </div>
  );
}

type CopyState = "idle" | "copied" | "failed";

const COPY_LABEL: Record<CopyState, string> = {
  idle: "copy email",
  copied: "copied ✓",
  failed: "copy failed — select it above",
};

function CopyEmailButton() {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state === "idle") return;
    const timer = window.setTimeout(() => setState("idle"), 2200);
    return () => window.clearTimeout(timer);
  }, [state]);

  /**
   * The Clipboard API is unavailable on insecure origins, so this can fail.
   * The button still renders — the email is a plain mailto link right above
   * it, so the failure message points there rather than hiding the control.
   */
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setState("copied");
    } catch {
      setState("failed");
    }
  };

  return (
    <TerminalButton onClick={copy} variant="ghost" className="text-[12px]">
      <span aria-live="polite">{COPY_LABEL[state]}</span>
    </TerminalButton>
  );
}
