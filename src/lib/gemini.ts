import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined in the environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function generateExamContent(text: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1" });

  const prompt = `
    You are an expert educator. Based on the provided text extracted from a study material, generate the following:
    1. A list of 10-15 "Important Questions" with detailed answers.
    2. A list of 10-15 "Multiple Choice Questions (MCQs)" with 4 options and the correct answer.

    Text:
    ${text.substring(0, 10000)} // Limiting text to 10k characters for stability

    Please format the output as a JSON object with the following structure:
    {
      "importantQuestions": [
        { "question": "...", "answer": "..." }
      ],
      "mcqs": [
        { "question": "...", "options": ["...", "...", "...", "..."], "answer": "..." }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();
    
    console.log("Raw AI Response Text:", responseText);
    
    // Clean up JSON if necessary (sometimes AI includes markdown backticks)
    if (responseText.includes("```json")) {
      responseText = responseText.split("```json")[1].split("```")[0];
    } else if (responseText.includes("```")) {
      responseText = responseText.split("```")[1].split("```")[0];
    }
    
    return JSON.parse(responseText.trim());
  } catch (error) {
    console.error("Error generating exam content:", error);
    throw new Error(`Failed to generate content from the PDF: ${error}`);
  }
}
