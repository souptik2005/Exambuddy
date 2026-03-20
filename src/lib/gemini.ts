import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateExamContent(
  text: string,
  existingQuestions: any[] = [],
  existingMcqs: any[] = []
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
  });

  const prompt = `
You are an expert educator.

STRICT RULES:
- Output ONLY valid JSON
- No markdown, no explanation
- Avoid repetition
- Focus ONLY on most important exam questions

Generate:
1. 8 VERY IMPORTANT Questions with answers
2. 8 HIGH-QUALITY MCQs

FORMAT:
{
  "importantQuestions": [
    { "question": "string", "answer": "string" }
  ],
  "mcqs": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "FULL correct option text"
    }
  ]
}

TEXT:
${text.substring(0, 8000)}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();

    // clean markdown if present
    responseText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      return JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);

      throw new Error("Invalid JSON");
    }
  } catch (error) {
    console.error("AI Error:", error);

    return {
      importantQuestions: [],
      mcqs: [],
    };
  }
}