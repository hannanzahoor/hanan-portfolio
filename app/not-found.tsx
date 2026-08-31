import type { Metadata } from "next";
import { Shell } from "@/components/ui/Section";
import { TerminalLink } from "@/components/ui/TerminalButton";
import { profile } from "@/data/profile";

export const metadata: Metadata = {
  title: "404 — Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Shell className="flex min-h-[70vh] flex-col justify-center py-24">
      <p className="font-mono text-[13px] text-fg-dim">
        <span className="mr-1.5 text-fg-faint">$</span>cd {""}
        <span className="text-fg-bright">.</span>
      </p>

      <h1 className="mt-4 font-mono text-[clamp(38px,7vw,64px)] leading-none font-medium tracking-[-0.04em] text-fg-bright">
        404
      </h1>

      <p className="mt-4 font-mono text-[13px] text-signal">
        {"// no such file or directory"}
      </p>

      <p className="mt-5 max-w-[46ch] text-[16px] leading-[1.65] text-fg">
        That page doesn&apos;t exist. Everything about {profile.shortName} lives
        on one page — projects, experience, skills, and contact are all there.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <TerminalLink href="/" variant="primary">
          <span aria-hidden="true">&larr;</span> back home
        </TerminalLink>
        <TerminalLink href="/#projects">
          <span className="text-fg-faint" aria-hidden="true">
            $
          </span>{" "}
          ls projects/
        </TerminalLink>
      </div>
    </Shell>
  );
}
