import { env, pipeline } from "@xenova/transformers";
import * as fs from "fs/promises";
import path from "path";

env.cacheDir = "models";
env.allowRemoteModels = false;

let candidateLabels = [
  "Accessibility",
  "Angular",
  "Animations",
  "Architecture",
  "Cache",
  "Change Detection",
  "CI/CD",
  "Css",
  "Decorators",
  "Dependecy Injection",
  "Entrevista",
  "File Streams",
  "Forms",
  "HTML",
  "JavaScript",
  "LINT",
  "Micro Front end",
  "Modules",
  "Node",
  "OOP",
  "Perfomance",
  "React",
  "RUST",
  "RXJS",
  "Security",
  "SEO",
  "Signals",
  "Under The Hood",
  "Vite",
  "WEB Assembly",
  "WEB Components",
];

async function tagArticle() {
  console.log("Loading model... (this will download on the first run)");

  const classifier = await pipeline(
    "zero-shot-classification",
    "Xenova/bart-large-mnli",
  );

  const title = `
    Demystifying the Magic: How Modern Browsers Transform Your Code Into Interactive Experiences
    What Every Full-Stack JavaScript Engineer Should Know About Browser Architecture in 2026
    Aryan Garg
    Aryan Garg
    
    Follow
    Bootcamp
    Bootcamp
    
    androidstudio
    ~10 min read
    ·
  `;
  const candidateLabels = [
    "Accessibility",
    "Angular",
    "Animations",
    "ARCH",
    "Cache",
    "CD",
    "CI/CD",
    "Css",
    "Decorators",
    "DI",
    "Entrevista",
    "File-Streams",
    "Forms",
    "HTML",
    "JS",
    "LINT",
    "MF",
    "Modules",
    "Node",
    "OOP",
    "Perfomance",
    "React",
    "RUST",
    "RXJS",
    "Security",
    "SEO",
    "Signals",
    "Under-The-Hood",
    "Vite",
    "WEB-A",
    "WEB-C",
  ];

  const options = {
    multi_label: true,
    hypothesis_template: "The topic of this article is {}.",
  };

  console.log(`Analyzing title: "${title}"`);

  const result = await classifier(title, candidateLabels, options);

  candidateLabels.forEach((label, i) => {
    console.log(`Tag ${label}: ${result.scores[i]}`);
  });

  console.log("Full Output:", result);
}

function chunkText(text, maxWords = 8) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
}

async function tagArticleWithChunking() {
  console.log("Loading model...");
  const classifier = await pipeline(
    "zero-shot-classification",
    "Xenova/bart-large-mnli",
    { device: "gpu" },
  );

  const filePath = path.join(process.cwd(), "article.txt");
  const title = await fs.readFile(filePath, "utf8");

  const chunks = chunkText(title.toLocaleLowerCase().trim(), 250);
  console.log(`\nOriginal text split into ${chunks.length} chunks.`);

  const scoreTotals = {};
  candidateLabels = candidateLabels.map((l) => l.toLocaleLowerCase());
  candidateLabels.forEach((label) => (scoreTotals[label] = 0));

  const options = {
    multi_label: false,
    hypothesis_template: "The topic of this article is {}.",
  };

  console.log("\nAnalyzing chunks...");
  for (let i = 0; i < chunks.length; i++) {
    const result = await classifier(chunks[i], candidateLabels, options);

    console.log(`- Chunk ${i + 1}`, result.scores);

    for (let j = 0; j < result.labels.length; j++) {
      const label = result.labels[j];
      const score = result.scores[j];
      scoreTotals[label] += score;
    }
  }

  const finalResults = candidateLabels.map((label) => {
    return {
      label: label,
      score: scoreTotals[label] / chunks.length,
    };
  });

  finalResults.sort((a, b) => b.score - a.score);

  console.log("\n--- Final Averaged Results ---");
  finalResults.forEach((res) => {
    console.log(`- ${res.label}: ${(res.score * 100).toFixed(2)}%`);
  });
}

tagArticleWithChunking();
