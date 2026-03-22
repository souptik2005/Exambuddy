import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateTopicSummary(topic: string) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  const prompt = `
You are a helpful academic assistant.
Provide a clear, simple summary and a detailed explanation, along with educational YouTube links for the topic: "${topic}".

STRICT RULES:
- Output ONLY valid JSON.
- No markdown, no explanation.
- Even if you are not 100% sure about the topic, provide a general educational summary and search links.
- ALWAYS return a valid JSON object.

FORMAT:
{
  "topic": "${topic}",
  "summary": "A 2-3 sentence basic overview of what ${topic} is.",
  "detailedExplanation": "A deep dive into the concept, covering how it works, why it's important, and examples. Provide at least 2-3 paragraphs of detailed information.",
  "keyPoints": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3", "Key takeaway 4", "Key takeaway 5"],
  "youtubeLinks": [
    { "title": "Watch on YouTube", "url": "https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " educational")}" },
    { "title": "Learn more about ${topic}", "url": "https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " tutorial")}" },
    { "title": "${topic} Explained", "url": "https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " explained")}" }
  ]
}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let responseText = response.text();
      console.log("AI TOPIC RESPONSE SUCCESSFUL");

      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(responseText);
      // Ensure the detailedExplanation field exists and is not empty
      if (!parsed.detailedExplanation || parsed.detailedExplanation.length < 10) {
        parsed.detailedExplanation = parsed.summary || `Deep dive into ${topic}. Use the links below to explore more.`;
      }
      if (!parsed.summary || parsed.summary.length < 5) {
        parsed.summary = `Basic overview of ${topic}.`;
      }
      return parsed;
    } catch (parseError) {
      console.warn("Topic JSON parse failed, trying regex...", parseError);
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        const parsedMatch = JSON.parse(match[0]);
        if (!parsedMatch.detailedExplanation) parsedMatch.detailedExplanation = parsedMatch.summary;
        return parsedMatch;
      }
      throw new Error("JSON parse error");
    }
  } catch (error: any) {
    const isRateLimit = error.message?.includes("429") || error.message?.toLowerCase().includes("quota");
    if (isRateLimit) {
      throw new Error("API_RATE_LIMIT");
    }
    console.warn("Gemini 2.5 Flash Topic error, trying 2.0 Flash...", error.message);
    
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      const fallbackText = fallbackResult.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
      const match = fallbackText.match(/\{[\s\S]*\}/);
      const finalJson = match ? JSON.parse(match[0]) : JSON.parse(fallbackText);
      
      if (!finalJson.detailedExplanation) finalJson.detailedExplanation = finalJson.summary;
      return finalJson;
    } catch (fallbackError: any) {
      const isFallbackRateLimit = fallbackError.message?.includes("429") || fallbackError.message?.toLowerCase().includes("quota");
      if (isFallbackRateLimit) {
        throw new Error("API_RATE_LIMIT");
      }
      console.error("All AI models failed for Topic Summary, trying 1.5 Flash as last resort:", fallbackError.message);
      
      try {
        const lastResortModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const lastResortResult = await lastResortModel.generateContent(prompt);
        const lastResortText = lastResortResult.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const match = lastResortText.match(/\{[\s\S]*\}/);
        const finalJson = match ? JSON.parse(match[0]) : JSON.parse(lastResortText);
        if (!finalJson.detailedExplanation) finalJson.detailedExplanation = finalJson.summary;
        return finalJson;
      } catch (lastError: any) {
        // Ultimate hardcoded fallback if all else fails
        return {
          topic: topic,
          summary: `Overview of ${topic}.`,
          detailedExplanation: `We encountered a temporary connection issue while generating a detailed guide for ${topic}. However, you can explore this topic in depth using the curated YouTube links below.`,
          keyPoints: [`Introduction to ${topic}`, `Core Principles`, `Real-world Applications`, `Common Challenges`, `Future Outlook`],
          youtubeLinks: [
            { "title": `${topic} Educational Videos`, "url": `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " educational")}` },
            { "title": `${topic} Tutorials`, "url": `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " tutorial")}` },
            { "title": `${topic} Explained`, "url": `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + " explained")}` }
          ]
        };
      }
    }
  }
}

/**
 * Normalizes AI response to ensure it has the correct keys and structure
 */
function normalizeResponse(parsed: any) {
  const result: any = {
    importantQuestions: [],
    mcqs: []
  };

  // 1. Handle Questions
  const rawQuestions = parsed.importantQuestions || parsed.questions || parsed.important_questions || [];
  if (Array.isArray(rawQuestions)) {
    result.importantQuestions = rawQuestions.map((q: any) => ({
      question: q.question || q.q || "No Question",
      answer: q.answer || q.a || "No Answer"
    }));
  }

  // 2. Handle MCQs
  const rawMcqs = parsed.mcqs || parsed.mcq || [];
  if (Array.isArray(rawMcqs)) {
    result.mcqs = rawMcqs.map((m: any) => ({
      question: m.question || m.q || "No Question",
      options: m.options || m.choices || m.o || [],
      answer: m.answer || m.a || ""
    }));
  }

  return result;
}

export async function generateExamContent(
  text: string,
  existingQuestions: any[] = [],
  existingMcqs: any[] = []
) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables");
  }

  // Use the latest state-of-the-art model: Gemini 2.5 Flash
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", 
  });

  const prompt = `
You are an expert academic tutor. 
Analyze the following text (which might be messy OCR from notes) and extract key study materials.

STRICT REQUIREMENTS:
1. Reconstruct fragmented sentences into clear, educational content.
2. Identify the subject matter and generate relevant questions.
3. Return ONLY a JSON object with this structure:
{
  "importantQuestions": [
    { "question": "Question text", "answer": "Answer text" }
  ],
  "mcqs": [
    { "question": "Question", "options": ["A", "B", "C", "D"], "answer": "Correct Option Text" }
  ]
}

TEXT TO PROCESS:
${text.substring(0, 15000)}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();
    
    console.log("AI RAW RESPONSE:", responseText.substring(0, 200) + "...");

    // More robust JSON extraction
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON structure found");
    }

    try {
      const parsed = JSON.parse(jsonMatch[0].replace(/\\n/g, " ").replace(/\\r/g, " "));
      return normalizeResponse(parsed);
    } catch (innerParseError) {
      console.warn("JSON parse failed, trying aggressive cleaning...");
      const cleaned = jsonMatch[0]
        .replace(/,\s*([\}\]])/g, '$1')
        .replace(/\\"/g, '"')
        .replace(/\n/g, ' ');
      const parsed = JSON.parse(cleaned);
      return normalizeResponse(parsed);
    }
  } catch (error: any) {
    const isRateLimit = error.message?.includes("429") || error.message?.toLowerCase().includes("quota");
    if (isRateLimit) {
      throw new Error("API_RATE_LIMIT");
    }
    console.warn("Gemini 2.5 Flash failed, falling back to 2.0 Flash. Error:", error.message);
    
    // Fallback to gemini-2.0-flash which is also stable
    try {
      console.log("Falling back to gemini-2.0-flash...");
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      const fallbackResponse = await fallbackResult.response;
      let fallbackText = fallbackResponse.text();
      console.log("AI FALLBACK RAW RESPONSE:", fallbackText.substring(0, 100) + "... text truncated ...");

      const jsonMatch = fallbackText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON structure in fallback");
      
      const parsed = JSON.parse(jsonMatch[0].replace(/\\n/g, " ").replace(/\\r/g, " "));
      return normalizeResponse(parsed);
    } catch (fallbackError: any) {
      const isFallbackRateLimit = fallbackError.message?.includes("429") || fallbackError.message?.toLowerCase().includes("quota");
      if (isFallbackRateLimit) {
        throw new Error("API_RATE_LIMIT");
      }
      console.error("AI Fallback Error:", fallbackError.message);
      // Try gemini-1.5-flash as a last resort
      try {
        console.log("Falling back to gemini-1.5-flash...");
        const lastResortModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const lastResortResult = await lastResortModel.generateContent(prompt);
        let lastResortText = lastResortResult.response.text();
        const jsonMatch = lastResortText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in last resort");
        
        const finalJson = JSON.parse(jsonMatch[0].replace(/\\n/g, " ").replace(/\\r/g, " "));
        return normalizeResponse(finalJson);
      } catch (lastError: any) {
        console.error("All AI models failed:", lastError.message);
        
        // Final ultimate fallback: generate generic questions based on first 100 chars
        const preview = text.substring(0, 100).replace(/[^\w\s]/gi, ' ');
        return { 
          importantQuestions: [
            { question: `What are the core concepts mentioned in: "${preview}..."?`, answer: "Based on the notes, these seem to be the primary topics. Review your source document for specific details." },
            { question: "Can you summarize the main objective of these study notes?", answer: "The notes appear to cover specialized academic material. Focus on the bolded terms and definitions." },
            { question: "What are the most likely exam topics from this section?", answer: "Look for recurring keywords and technical definitions provided in the text." }
          ], 
          mcqs: [] 
        };
      }
    }
  }
}