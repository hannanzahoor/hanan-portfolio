import type { Role } from "./types";

/** Source of truth: Hanan's résumés. Responsibilities are not embellished. */
export const experience: Role[] = [
  {
    id: "deloitte",
    company: "Deloitte",
    title: "Software Development Intern",
    location: "Bangalore, Karnataka",
    start: "Jun 2026",
    end: "Present",
    period: "2026",
    current: true,
    highlights: [
      "Developed Python-based automation tools using Pandas, OpenPyXL, and Streamlit to automate repetitive enterprise workflows and reduce manual processing.",
      "Built reusable backend components and REST APIs to support internal applications, with an emphasis on clean interfaces, maintainability, and reliable data handling.",
      "Worked with structured business data to develop automation workflows that simplified data processing, transformation, and report generation.",
      "Implemented validation and error-handling mechanisms across automation and API workflows to improve reliability and make failures easier to identify and troubleshoot.",
      "Contributed to testing, debugging, and refinement of internal software solutions, learning how production-oriented systems are designed, maintained, and improved in an enterprise environment.",
    ],
    tech: ["Python", "Pandas", "OpenPyXL", "Streamlit", "REST APIs"],
  },
  {
    id: "motion-cut",
    company: "Motion Cut",
    title: "Web Development Intern",
    location: "Bangalore, Karnataka",
    start: "Jan 2025",
    end: "Mar 2025",
    period: "2025",
    current: false,
    highlights: [
      "Built full-stack web applications using the MERN stack, contributing across frontend interfaces, backend services, database integration, and API communication.",
      "Developed and integrated REST APIs to connect application components, handle data flows, and support core functionality across the platform.",
      "Worked with MongoDB and Express.js to implement backend functionality and structure application data for reliable interaction with the frontend.",
      "Tested and debugged application workflows and APIs, identifying issues and improving overall reliability, responsiveness, and user experience.",
      "Optimized frontend performance and responsiveness across the application, contributing to a smoother user experience and achieving a reported 30% increase in user engagement.",
    ],
    tech: ["MongoDB", "Express.js", "React", "Node.js", "REST APIs", "Testing"],
  },
];
