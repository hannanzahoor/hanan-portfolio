import type { Project, ProjectCategory } from "./types";

/**
 * Project repository URLs come from the link annotations embedded in the
 * résumé PDFs. No demo URLs exist on either résumé, so none are shown.
 */
export const projects: Project[] = [
  {
    id: "airsense-ai",
    index: "01",
    title: "AirSense AI",
    subtitle: "LLM-Powered AQI & Health Advisor",
    year: "2026",
    dateLabel: "Jul 2026",
    categories: ["ai-ml", "software-engineering"],
    summary:
      "An LLM-powered air quality advisor that pairs live environmental data with an agentic workflow to produce personalized, context-aware health recommendations.",
    highlights: [
      "Built an LLM-powered AQI advisor using Python, GPT-4o, Agno, Firecrawl, and Gradio.",
      "Designed an agentic workflow using prompt engineering techniques to retrieve live AQI data and generate personalized recommendations from structured and unstructured sources.",
      "Integrated GPT-4o APIs to generate context-aware health recommendations from AQI, weather, medical history, and user activity — improving response quality through iterative prompt refinement and evaluation.",
      "Integrated live REST APIs with validation and error handling to improve recommendation reliability.",
    ],
    concepts: [
      "LLM applications",
      "AI agents",
      "Live data retrieval",
      "Structured & unstructured data",
      "Prompt engineering",
      "Model evaluation",
    ],
    tech: [
      "Python",
      "GPT-4o",
      "Agno",
      "Firecrawl",
      "Gradio",
      "Prompt Engineering",
      "LLM APIs",
    ],
    links: { github: "https://github.com/hannanzahoor/airsense-ai" },
  },
  {
    id: "linux-log-analyzer",
    index: "02",
    title: "Intelligent Linux Log Analyzer",
    subtitle: "ML-Driven Security Monitoring System",
    year: "2026",
    dateLabel: "Apr 2026",
    categories: ["ai-ml", "software-engineering", "full-stack", "security"],
    summary:
      "A Linux security monitoring system that combines a machine learning detection pipeline with real-time log ingestion and a live web dashboard.",
    highlights: [
      "Built a Linux log analyzer using Python, Flask, React, and MongoDB for real-time monitoring and debugging.",
      "Engineered an ML pipeline using TF-IDF, LSA, and ensemble learning to classify known attacks and detect anomalous system behavior.",
      "Developed Flask REST APIs and a real-time dashboard for log ingestion, visualization, model inference, and security alert management.",
    ],
    concepts: [
      "Machine learning pipeline",
      "Text classification",
      "Anomaly detection",
      "Log ingestion",
      "REST APIs",
      "Real-time dashboard",
      "Security monitoring",
    ],
    tech: [
      "Python",
      "Flask",
      "React",
      "MongoDB",
      "TF-IDF",
      "LSA",
      "Ensemble Learning",
      "REST APIs",
    ],
    links: { github: "https://github.com/hannanzahoor/log-analyzer" },
  },
  {
    id: "privora",
    index: "03",
    title: "Privora",
    subtitle: "Privacy-First Social Platform",
    year: "2025",
    dateLabel: "Jul 2025",
    categories: ["software-engineering", "full-stack", "security"],
    summary:
      "A privacy-first social platform built around end-to-end encrypted messaging, encrypted file sharing, and QR-based key exchange.",
    highlights: [
      "Built a privacy-first social platform using React, TypeScript, Express.js, and SQLite with secure real-time communication.",
      "Implemented AES-GCM encryption and PBKDF2 key derivation for end-to-end encrypted messaging.",
      "Developed disappearing messages, encrypted file sharing, QR-based key exchange, and secure REST APIs.",
    ],
    concepts: [
      "Full-stack development",
      "Encryption",
      "Secure communication",
      "Key exchange",
      "Backend APIs",
      "Privacy-focused product design",
    ],
    tech: [
      "React",
      "TypeScript",
      "Express.js",
      "SQLite",
      "AES-GCM",
      "PBKDF2",
      "REST APIs",
    ],
    links: {
      github:
        "https://github.com/hannanzahoor/Privora---Decentralized-P2P-Social-Platform",
    },
  },
];

/** Single source for how a category is written, wherever it is shown. */
export const categoryLabels: Record<ProjectCategory, string> = {
  "ai-ml": "AI/ML",
  "software-engineering": "Software Engineering",
  "full-stack": "Full Stack",
  security: "Security",
};

export const projectFilters: { id: ProjectCategory | "all"; label: string }[] = [
  { id: "all", label: "all" },
  { id: "ai-ml", label: "ai / ml" },
  { id: "software-engineering", label: "software engineering" },
  { id: "full-stack", label: "full stack" },
  { id: "security", label: "security" },
];
