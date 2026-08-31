import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export const dynamic = "force-static";

/**
 * The date the site's content was last meaningfully changed — not the date it
 * was last built.
 *
 * `new Date()` would stamp every rebuild as fresh even when nothing changed,
 * which tells crawlers the page is updated when it is not. Bump this by hand
 * when content actually changes: copy, projects, experience, skills,
 * achievements, or metadata.
 */
const LAST_CONTENT_UPDATE = "2026-09-01";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${site.url}/`,
      lastModified: LAST_CONTENT_UPDATE,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
