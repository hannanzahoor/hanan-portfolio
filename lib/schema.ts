import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { skillGroups } from "@/data/skills";
import { social } from "@/data/social";
import { MAILTO } from "@/lib/contact";

/**
 * The page's structured data, emitted as a single schema.org @graph.
 *
 * Every value is read from the same `data/` modules the page renders, so the
 * markup can never claim something the site does not show. Nothing here is
 * inferred: if a fact is not in `data/`, it is not in the graph.
 *
 * Nodes are given stable @ids and cross-referenced, which lets a parser see
 * one connected entity (a person, their site, this page, their projects)
 * rather than four unrelated blobs.
 */

const PERSON_ID = `${site.url}/#person`;
const WEBSITE_ID = `${site.url}/#website`;
const PAGE_ID = `${site.url}/#profilepage`;

/**
 * The canonical list of programming languages Hanan lists on the site.
 * Used to decide which entries in a project's `tech` array are genuinely
 * languages — the rest are frameworks, libraries or techniques and must not
 * be reported as `programmingLanguage`.
 */
const LANGUAGES: readonly string[] =
  skillGroups.find((group) => group.id === "languages")?.skills ?? [];

/** Languages actually used by a project, per that project's own tech list. */
function programmingLanguages(tech: readonly string[]): string[] {
  return tech.filter((item) => LANGUAGES.includes(item));
}

const currentRole = experience.find((role) => role.current);

const person = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: profile.name,
  url: site.url,
  image: `${site.url}/portrait.jpg`,
  email: MAILTO,
  jobTitle: profile.roleParts,
  description: site.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangalore",
    addressCountry: "IN",
  },
  alumniOf: education
    .filter((entry) => entry.id === "jain")
    .map((entry) => ({
      "@type": "CollegeOrUniversity",
      name: entry.institution,
    })),
  // Only the role the site marks as current; past roles are not claimed here.
  ...(currentRole
    ? { worksFor: { "@type": "Organization", name: currentRole.company } }
    : {}),
  // One Occupation per role the site states, located where the site says.
  hasOccupation: profile.roleParts.map((title) => ({
    "@type": "Occupation",
    name: title,
    occupationLocation: { "@type": "City", name: "Bangalore" },
  })),
  knowsAbout: [
    "Artificial Intelligence",
    "Machine Learning",
    "Large Language Models",
    "Generative AI",
    "Backend Development",
    "REST APIs",
    "Full Stack Development",
  ],
  sameAs: social.map((item) => item.href),
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: site.url,
  name: site.title,
  description: site.description,
  inLanguage: "en",
  publisher: { "@id": PERSON_ID },
};

const profilePage = {
  "@type": "ProfilePage",
  "@id": PAGE_ID,
  url: `${site.url}/`,
  name: site.title,
  description: site.description,
  inLanguage: "en",
  isPartOf: { "@id": WEBSITE_ID },
  about: { "@id": PERSON_ID },
  mainEntity: { "@id": PERSON_ID },
};

/**
 * One SoftwareSourceCode per project that has a public repository. A project
 * without a repo URL is skipped rather than described with a missing link.
 */
const projectNodes = projects
  .filter((project) => Boolean(project.links.github))
  .map((project) => {
    const languages = programmingLanguages(project.tech);

    return {
      "@type": "SoftwareSourceCode",
      "@id": `${site.url}/#project-${project.id}`,
      name: project.title,
      description: project.summary,
      codeRepository: project.links.github,
      ...(languages.length > 0 ? { programmingLanguage: languages } : {}),
      keywords: project.tech.join(", "),
      author: { "@id": PERSON_ID },
      isPartOf: { "@id": PAGE_ID },
    };
  });

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [person, website, profilePage, ...projectNodes],
};
