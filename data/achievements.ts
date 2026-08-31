import type { Achievement } from "./types";
import { socialById } from "./social";

/** Exactly the four achievements listed on both résumés. Nothing added. */
export const achievements: Achievement[] = [
  {
    id: "hacksplosion",
    figure: "TOP 10",
    title: "Deloitte Hacksplosion 2026",
    detail: "Finalist among 22,000+ participants",
  },
  {
    id: "leetcode",
    figure: "500+",
    title: "LeetCode problems solved",
    detail: "Data structures, algorithms, problem solving",
    href: socialById.leetcode?.href,
  },
  {
    id: "codeup",
    figure: "1ST",
    title: "CodeUp Intercollege Hackathon",
    detail: "First place",
  },
  {
    id: "certifications",
    figure: "20+",
    title: "Certifications earned",
    detail: "Software Engineering · AI/ML · Cloud Computing · Web Development",
  },
];
