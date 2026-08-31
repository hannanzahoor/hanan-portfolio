import type { SkillGroup } from "./types";

/**
 * The union of both résumés' skill sections. No percentages or ratings —
 * those numbers would be arbitrary. Grouped by domain instead.
 */
export const skillGroups: SkillGroup[] = [
  {
    id: "ai-ml",
    label: "AI / Machine Learning",
    key: "ai_ml",
    skills: [
      "LLMs",
      "Generative AI",
      "RAG",
      "AI Agents",
      "Prompt Engineering",
      "OpenAI APIs",
      "Claude",
      "Firecrawl",
      "Model Evaluation",
      "TensorFlow",
      "PyTorch",
      "Scikit-learn",
      "Pandas",
      "NumPy",
    ],
  },
  {
    id: "languages",
    label: "Languages",
    key: "languages",
    skills: ["Python", "Java", "C/C++", "JavaScript", "TypeScript", "SQL"],
  },
  {
    id: "backend",
    label: "Backend",
    key: "backend",
    skills: [
      "FastAPI",
      "Flask",
      "Node.js",
      "Express.js",
      "REST APIs",
      "Microservices",
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    key: "frontend",
    skills: ["React", "HTML5", "CSS3", "Tailwind CSS"],
  },
  {
    id: "databases",
    label: "Databases",
    key: "databases",
    skills: ["MongoDB", "MySQL", "SQLite"],
  },
  {
    id: "cloud",
    label: "Cloud & Infrastructure",
    key: "cloud_infra",
    skills: [
      "AWS",
      "Docker",
      "Kubernetes",
      "Git",
      "GitHub",
      "GitHub Actions",
      "CI/CD",
      "Linux",
      "Postman",
    ],
  },
  {
    id: "testing",
    label: "Testing",
    key: "testing",
    skills: [
      "API Testing",
      "Test Automation",
      "Debugging",
      "Regression Testing",
    ],
  },
  {
    id: "core-cs",
    label: "Core Computer Science",
    key: "core_cs",
    skills: [
      "Data Structures & Algorithms",
      "OOP",
      "DBMS",
      "Operating Systems",
      "Computer Networks",
      "System Design",
    ],
  },
];
