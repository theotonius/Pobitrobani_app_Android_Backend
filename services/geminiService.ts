
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
    console.error("JSON Parsing failed:", e);
    throw new Error("সার্ভার থেকে প্রাপ্ত তথ্য সঠিক ফরম্যাটে নেই।");
  }
}

const AI_PROXY_URL = "/api/ai/generate";

export const geminiService = {
  async fetchVerseExplanation(query: string, version: 'modern' | 'carey' | 'kitabul' = 'modern', lang: string = 'bn'): Promise<VerseData> {
    const normalizedQuery = `${query.trim().toLowerCase()}_${version}_${lang}`;
    
    if (searchCache.has(normalizedQuery)) {
      return searchCache.get(normalizedQuery)!;
    }
    
    let explanationStyle = "";
    if (version === 'carey' && lang === 'bn') {
      explanationStyle = "Carey Style (Traditional Sadhu Bhasha, classical tone)";
    } else if (version === 'kitabul' && lang === 'bn') {
      explanationStyle = "Kitabul Mukkadas Style (Commonly used by the Muslim community in Bangladesh, using specific terminology like 'Allah', 'Isa Masih', 'Injil Sharif', 'Mabud', etc.)";
    } else {
      explanationStyle = `Modern Simple ${lang === 'bn' ? 'Bengali' : lang} (Soulful, contemporary tone)`;
    }

    const systemInstruction = `You are 'Sacred Word', a world-class spiritual scholar, theologian, and hymnologist specializing in Bengali and English biblical studies. 
    You excel at interpreting varied search queries, including:
    - Bengali Bible verse references with different spellings or formats (e.g., "যোহন ৩.১৬", "যোহন ৩-১৬", "৩ যোহন").
    - Common spiritual topics and theological concepts.
    - Christian hymn and song lyrics.
    
    Provide rapid yet profoundly deep and extensive spiritual analysis. 
    The output MUST be in ${lang}.
    Ensure deep theological, historical, and practical accuracy. Do not be brief; be comprehensive and enriching.`;

    const userPrompt = `Analyze: "${query}". 
    This could be a Bible verse (e.g., "যোহন ৩:১৬", "John 3:16", "গীতসংহিতা ২৩", "Psalm 23"), a Christian song/hymn lyric, or a spiritual concept (e.g., "ঈশ্বরের প্রেম", "Love of God", "Faith").
    
    IMPORTANT RULES:
    1. Handle variations in Bengali Bible references gracefully. Recognize abbreviations (e.g., "যোহন" for "যোহন লিখিত সুসমাচার", "গীত" for "গীতসংহিতা") and different punctuation styles.
    2. If the query is a spiritual topic or concept, provide a comprehensive theological analysis based on biblical principles.
    3. The output MUST be in the language: ${lang}.
    4. The "reference" field should contain a canonical, standardized reference (e.g., "যোহন ৩:১৬" or "John 3:16").
    5. The "text" field MUST contain the core verse, lyric, or a comprehensive definition of the concept in Modern Simple ${lang}.
    6. If multiple verses are included, ALWAYS prefix each verse with its number in brackets like [1], [2], etc. for clarity.
    7. The "explanation" fields MUST be in ${explanationStyle} and should be very detailed, rich, and insightful (at least 3-4 sentences per field).
    8. Provide deep, comprehensive insights. If it's a song, explain its spiritual background and author. If it's a concept, explain its biblical foundation thoroughly.
    9. Include multiple cross-references and deep original language (Hebrew/Greek) insights if applicable.
    10. Output STRICT JSON with the following structure:
    {
      "reference": string,
      "text": string,
      "explanation": {
        "theologicalMeaning": string,
        "theologicalReference": string,
        "historicalContext": string,
        "historicalReference": string,
        "practicalApplication": string,
        "practicalReference": string,
        "crossReferences": string[],
        "meditationPoint": string,
        "originalInsight": string
      },
      "prayer": string,
      "keyThemes": string[]
    }`;

    try {
      const response = await fetch(AI_PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userPrompt }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "AI request failed.";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorData.error || errorMessage;
        } catch (e) {
          console.error("Non-JSON error response:", errorText);
        }
        throw new Error(errorMessage);
      }

      const resultText = await response.text();
      let resultData;
      try {
        resultData = JSON.parse(resultText);
      } catch (e) {
        console.error("Failed to parse AI response as JSON:", resultText);
        throw new Error("সার্ভার থেকে প্রাপ্ত তথ্য সঠিক ফরম্যাটে নেই।");
      }
      
      const content = resultData.choices[0].message.content;
      const data = extractJson(content || '');
      
      const result = {
        ...data,
        reference: data.reference || query,
        id: Math.random().toString(36).substring(2, 11),
        timestamp: Date.now()
      };

      searchCache.set(normalizedQuery, result);
      return result;
    } catch (error: any) {
      console.error("AI Proxy Request Error:", error);
      throw new Error(error.message || "এপিআই এর সাথে সংযোগ করা যাচ্ছে না।");
    }
  },

  async fetchDailyQuote(lang: string = 'bn'): Promise<{ text: string; author: string }> {
    const today = new Date().toDateString();
    
    try {
      const response = await fetch(AI_PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "user", content: `Generate a short, powerful Bible verse for today (${today}) in ${lang}. 
            It should be inspiring and wise. 
            Output JSON with "text" (the verse text) and "author" (the Bible reference) fields.` }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Daily Quote AI request failed:", errorText);
        throw new Error("AI request failed.");
      }

      const resultText = await response.text();
      let resultData;
      try {
        resultData = JSON.parse(resultText);
      } catch (e) {
        console.error("Failed to parse Daily Quote response as JSON:", resultText);
        throw new Error("Invalid JSON response.");
      }
      const content = resultData.choices[0].message.content;
      return extractJson(content || '');
    } catch (error) {
      console.error("Daily Quote Error:", error);
      return lang === 'bn' 
        ? { text: "ঈশ্বরই আমাদের আশ্রয় ও বল, সংকটে তিনি অতিশয় সুলভ সহায়।", author: "গীতসংহিতা ৪৬:১" }
        : { text: "God is our refuge and strength, an ever-present help in trouble.", author: "Psalm 46:1" };
    }
  }
};
