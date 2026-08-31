import { profile } from "@/data/profile";

/**
 * Every email action on the site is built from this module, so the address
 * exists in exactly one place and no call site can drift from it.
 *
 * These are plain `mailto:` hrefs on real <a> elements — no JavaScript is
 * involved, so they stay keyboard accessible and support "copy email
 * address" from the browser's context menu. Whether a composer actually
 * opens is up to the visitor's OS/browser mail handler, which is the
 * correct behaviour for a portfolio: a recruiter on Outlook gets Outlook.
 */

export const EMAIL_ADDRESS = profile.email;

/** Builds the one canonical mailto href, optionally with a subject. */
export function mailtoHref(subject?: string): string {
  return subject
    ? `mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent(subject)}`
    : `mailto:${EMAIL_ADDRESS}`;
}

/** Plain composer — icon buttons and the hero pill. */
export const MAILTO = mailtoHref();

/** Primary contact CTA, with the subject line prefilled. */
export const MAILTO_OPPORTUNITY = mailtoHref("Opportunity for Hanan Zahoor");

/** Accessible name for controls that render only an envelope icon. */
export const EMAIL_LABEL = `Email ${profile.shortName}`;
