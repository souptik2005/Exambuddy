"use server";

import { generateExamContent } from "@/lib/gemini";

export type ExamContent = {
  importantQuestions: { question: string; answer: string }[];
  mcqs: { question: string; options: string[]; answer: string }[];
};

export async function processText(text: string) {
  try {
    if (!text || text.trim().length === 0) {
      throw new Error("The provided text is empty.");
    }

    const examContent = await generateExamContent(text);
    return examContent as ExamContent;
  } catch (error) {
    console.error("Error processing text:", error);
    throw new Error(`An error occurred during text processing: ${error}`);
  }
}
