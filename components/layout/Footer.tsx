import { LinkedInIcon, MailIcon } from "@/components/ui/Icons";
import { Shell } from "@/components/ui/Section";
import { profile } from "@/data/profile";
import { socialById } from "@/data/social";
import { EMAIL_LABEL, MAILTO } from "@/lib/contact";

/**
 * Icon-only links. The 40px box is the click/touch target, not the 15px
 * glyph inside it, so the whole control is comfortably tappable.
 */
const ICON_LINK =
  "grid size-10 place-items-center rounded-lg border border-line text-fg-dim transition-colors hover:border-accent/50 hover:text-accent";

export function Footer() {
  return (
    <footer className="relative z-[1] border-t border-line">
      <Shell className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-8 font-mono text-[12px] text-fg-dim">
        <p className="text-fg-faint">
          © {new Date().getFullYear()} {profile.name}
        </p>

        <ul className="flex items-center gap-2">
          <li>
            <a
              href={socialById.linkedin?.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="LinkedIn"
              title="LinkedIn"
              className={ICON_LINK}
            >
              <LinkedInIcon size={15} />
            </a>
          </li>
          <li>
            <a
              href={MAILTO}
              aria-label={EMAIL_LABEL}
              title={EMAIL_LABEL}
              className={ICON_LINK}
            >
              <MailIcon size={15} />
            </a>
          </li>
        </ul>
      </Shell>
    </footer>
  );
}
