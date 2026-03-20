"use server";

import { generateExamContent } from "@/lib/gemini";

const pdfParse = require("pdf-parse");

export type ExamContent = {
  importantQuestions: { question: string; answer: string }[];
  mcqs: { question: string; options: string[]; answer: string }[];
};

export async function processText(
  input: File | string,
  currentQuestions: any[] = [],
  currentMcqs: any[] = []
): Promise<ExamContent> {
  try {
    let text = "";

    // 📄 Handle file
    if (typeof input !== "string") {
      const buffer = Buffer.from(await input.arrayBuffer());

      if (input.type === "application/pdf") {
        const data = await pdfParse(buffer);
        text = data.text;
      } else {
        text = await input.text();
      }
    } else {
      text = input;
    }

    if (!text || text.length < 50) {
      throw new Error("Not enough content");
    }

    // 🔥 Split into chunks
    const chunks = splitText(text, 6000);

    let allQuestions = [...currentQuestions];
    let allMcqs = [...currentMcqs];

    for (const chunk of chunks) {
      const result = await generateExamContent(chunk);

      if (result) {
        allQuestions = mergeUnique(allQuestions, result.importantQuestions);
        allMcqs = mergeUnique(allMcqs, result.mcqs);
      }
    }

    // 🎯 LIMIT TO 30 TOTAL
    return {
      importantQuestions: allQuestions.slice(0, 15),
      mcqs: allMcqs.slice(0, 15),
    };

  } catch (error) {
    console.error(error);

    return {
      importantQuestions: [],
      mcqs: [],
    };
  }
}

// ✂️ Split text
function splitText(text: string, size: number) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
}

// 🧠 Remove duplicates
function mergeUnique(existing: any[], incoming: any[]) {
  const seen = new Set(existing.map((q) => q.question));

  for (const item of incoming || []) {
    if (!seen.has(item.question)) {
      existing.push(item);
      seen.add(item.question);
    }
  }

  return existing;
}