/**
 * Behaviour tests for the local assistant.
 *
 * Run with: npm run test:assistant
 *
 * These assert routing, not prose — that a question reaches the right intent
 * and entity, that grounded answers stay grounded, and that unanswerable
 * questions are refused rather than guessed at.
 */
import { resolve } from "@/lib/assistant/resolve";
import { emptyContext, type ConversationContext } from "@/lib/assistant/types";
import { allDocs } from "@/lib/assistant/retrieve";

interface Case {
  question: string;
  intent: string;
  entity?: string;
  context?: ConversationContext;
  /** Substrings the answer must contain. */
  contains?: string[];
}

const cases: Case[] = [
  // --- The questions named in the brief -----------------------------------
  { question: "What is Hanan's tech stack?", intent: "skills.all", contains: ["Python", "FastAPI"] },
  { question: "What AI projects has he built?", intent: "projects.filter", entity: "ai-ml", contains: ["AirSense AI"] },
  { question: "Tell me about AirSense AI.", intent: "projects.detail", entity: "airsense-ai", contains: ["GPT-4o", "Gradio"] },
  { question: "What did he do at Deloitte?", intent: "experience.detail", entity: "deloitte", contains: ["OpenPyXL", "Streamlit"] },
  { question: "What backend technologies does he know?", intent: "skills.group", entity: "backend", contains: ["FastAPI", "Express.js"] },
  { question: "What are his achievements?", intent: "achievements", contains: ["22,000+", "500+"] },
  { question: "Is he open to software engineering roles?", intent: "availability", contains: ["open to"] },

  // --- Identity and meta ---------------------------------------------------
  { question: "Who is Hanan?", intent: "identity", contains: ["Hanan Zahoor", "Bangalore"] },
  { question: "hey", intent: "greeting" },
  { question: "are you a real AI?", intent: "meta", contains: ["no external AI API"] },
  { question: "how do you work?", intent: "meta" },

  // --- Entity aliases and typos -------------------------------------------
  { question: "tell me about the log analyzer", intent: "projects.detail", entity: "linux-log-analyzer" },
  { question: "what is privora", intent: "projects.detail", entity: "privora" },
  { question: "the aqi one", intent: "projects.detail", entity: "airsense-ai" },
  { question: "airsence", intent: "projects.detail", entity: "airsense-ai" },
  { question: "what did he do at motion cut", intent: "experience.detail", entity: "motion-cut" },
  { question: "deloite", intent: "experience.detail", entity: "deloitte" },

  // --- Skills routing ------------------------------------------------------
  { question: "does he know Docker?", intent: "skills.single", entity: "cloud", contains: ["Docker"] },
  { question: "has he used Kubernetes", intent: "skills.single", entity: "cloud" },
  { question: "what frontend work has he done", intent: "skills.group", entity: "frontend" },
  { question: "what ML frameworks does he use", intent: "skills.group", entity: "ai-ml", contains: ["PyTorch", "TensorFlow"] },

  // --- Other sections ------------------------------------------------------
  { question: "what is his experience", intent: "experience.list", contains: ["Deloitte", "Motion Cut"] },
  { question: "what is he doing now", intent: "experience.detail", entity: "deloitte" },
  { question: "where did he study", intent: "education", contains: ["Jain University", "7.7"] },
  { question: "what is his cgpa", intent: "education", contains: ["7.7"] },
  { question: "where is he based", intent: "location", contains: ["Bangalore"] },
  { question: "how can I contact him", intent: "contact", contains: ["hananzahoorr@gmail.com"] },
  { question: "what has he built", intent: "projects.list", contains: ["AirSense AI", "Privora"] },
  { question: "show me his security projects", intent: "projects.filter", contains: ["Privora"] },

  // --- Conversation memory -------------------------------------------------
  {
    question: "tell me more",
    intent: "projects.detail",
    entity: "privora",
    context: { asked: [], lastIntent: "projects.detail", lastEntity: "privora" },
  },
  {
    question: "the second one",
    intent: "projects.detail",
    entity: "linux-log-analyzer",
    context: { asked: [], lastIntent: "projects.list" },
  },

  // --- Must refuse rather than guess --------------------------------------
  { question: "what is his salary?", intent: "unknown" },
  { question: "does he have a girlfriend", intent: "unknown" },
  { question: "what did he do at Google?", intent: "unknown" },
  { question: "how tall is he", intent: "unknown" },
];

let passed = 0;
const failures: string[] = [];

for (const testCase of cases) {
  const context = testCase.context ?? emptyContext();
  const result = resolve(testCase.question, context);
  const problems: string[] = [];

  if (result.intent !== testCase.intent) {
    problems.push(`intent "${result.intent}" != "${testCase.intent}"`);
  }
  if (testCase.entity && result.entity !== testCase.entity) {
    problems.push(`entity "${result.entity}" != "${testCase.entity}"`);
  }
  for (const needle of testCase.contains ?? []) {
    if (!result.answer.text.includes(needle)) {
      problems.push(`missing "${needle}"`);
    }
  }

  if (problems.length === 0) passed += 1;
  else failures.push(`  "${testCase.question}"\n      ${problems.join("\n      ")}`);
}

// --- Grounding invariant --------------------------------------------------
// Every answer that claims to be grounded must cite a knowledge document.
const ids = new Set(allDocs().map((doc) => doc.id));
const groundingProblems: string[] = [];

for (const testCase of cases) {
  const result = resolve(testCase.question, testCase.context ?? emptyContext());
  const { answer } = result;

  if (answer.grounded && answer.sources.length === 0 && result.intent !== "empty") {
    groundingProblems.push(`"${testCase.question}" is grounded but cites no source`);
  }
  for (const source of answer.sources) {
    if (!ids.has(source)) {
      groundingProblems.push(`"${testCase.question}" cites unknown document "${source}"`);
    }
  }
  if (!answer.grounded && answer.text.includes("**")) {
    groundingProblems.push(`"${testCase.question}" is ungrounded but asserts detail`);
  }
}

console.log("");
console.log(`  assistant: ${passed}/${cases.length} routing cases passed`);

if (failures.length > 0) {
  console.log("\n  failures:\n" + failures.join("\n"));
}
if (groundingProblems.length > 0) {
  console.log("\n  grounding:\n    " + groundingProblems.join("\n    "));
}

console.log("");

if (failures.length > 0 || groundingProblems.length > 0) process.exit(1);
