
import { VerseData } from "../types";

const searchCache = new Map<string, VerseData>();

function extractJson(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parsing failed:", text);
    throw new Error("সার্ভার থেকে প্রাপ্ত তথ্য সঠিক ফরম্যাটে নেই।");
  }
}

const AI_PROXY_URL = "https://pobitrobani-backend.vercel.app/api/ai/generate";

export const geminiService = {
  async fetchVerseExplanation(query: string, version: 'modern' | 'carey' | 'kitabul' = 'modern', lang: string = 'bn'): Promise<VerseData> {
    const normalizedQuery = `${query.trim().toLowerCase()}_${version}_${lang}`;
    
    if (searchCache.has(normalizedQuery)) {
      return searchCache.get(normalizedQuery)!;
    }

    const systemInstruction = `You are 'Sacred Word', a spiritual scholar. Output MUST be in ${lang} and in STRICT JSON format.`;
    const userPrompt = `Analyze: "${query}". Provide a deep spiritual explanation in ${lang}. Use JSON structure.`;

    try {
      const response = await fetch(AI_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
          ]
        })
      });

      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.error || "সার্ভার থেকে ভুল রেসপন্স এসেছে।");
      }

      const content = resultData.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("এআই কোনো উত্তর তৈরি করতে পারেনি। আপনার এপিআই কি (API Key) চেক করুন।");
      }

      const data = extractJson(content);
      
      const result = {
        ...data,
        reference: data.reference || query,
        id: Math.random().toString(36).substring(2, 11),
        timestamp: Date.now()
      };

      searchCache.set(normalizedQuery, result);
      return result;
    } catch (error: any) {
      console.error("AI Error:", error);
      throw new Error(error.message || "কানেকশন এরর। আপনার ইন্টারনেট এবং ব্যাকএন্ড চেক করুন।");
    }
  },

  async fetchDailyQuote(lang: string = 'bn'): Promise<{ text: string; author: string }> {
    try {
      const response = await fetch(AI_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "user", content: "Inspiring Bible verse JSON: {\"text\": \"...\", \"author\": \"...\"}" }]
        })
      });
      const resultData = await response.json();
      const content = resultData.choices?.[0]?.message?.content;
      return extractJson(content || '{}');
    } catch (error) {
      return { text: "ঈশ্বরই আমাদের আশ্রয় ও বল।", author: "গীতসংহিতা ৪৬:১" };
    }
  }
};
