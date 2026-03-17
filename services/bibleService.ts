
import { VerseData } from "../types";

const searchCache = new Map<string, VerseData>();

export const bibleService = {
  async fetchVerseExplanation(query: string, version: 'modern' | 'carey' = 'modern', lang: string = 'bn'): Promise<VerseData> {
    const normalizedQuery = `${query.trim().toLowerCase()}_${version}_${lang}`;
    
    if (searchCache.has(normalizedQuery)) {
      return searchCache.get(normalizedQuery)!;
    }

    try {
      // Use bible-api.com for the verse text
      // Note: bible-api.com works best with English references. 
      // We might need to translate the query if it's in Bengali.
      // But since we can't use Gemini, we'll assume the query is in a format bible-api.com understands or we'll try to handle common ones.
      
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error("পদটি খুঁজে পাওয়া যায়নি। সঠিক রেফারেন্স দিন (যেমন: John 3:16)।");
      }
      
      const data = await response.json();
      
      // Since bible-api.com doesn't provide explanations, and we can't use Gemini,
      // we provide a structured response with the verse text and placeholders/static info.
      // In a real scenario without an LLM, we'd need a commentary database.
      
      const result: VerseData = {
        id: Math.random().toString(36).substring(2, 11),
        reference: data.reference,
        text: data.text.trim(),
        explanation: {
          theologicalMeaning: "এই পদের গভীর তাত্ত্বিক অর্থ অনুসন্ধানের জন্য শাস্ত্রীয় ভাষ্যকারদের সাহায্য নিন। (AI ব্যাখ্যা বর্তমানে নিষ্ক্রিয়)",
          theologicalReference: "Bible Commentary",
          historicalContext: "এই পদের ঐতিহাসিক প্রেক্ষাপট জানতে বাইবেলের ভূমিকা অংশটি দেখুন।",
          historicalReference: "Biblical History",
          practicalApplication: "আপনার প্রতিদিনের জীবনে এই পদের প্রয়োগ নিয়ে প্রার্থনা করুন।",
          practicalReference: "Christian Living",
          crossReferences: ["John 1:1", "Genesis 1:1"], // Mock cross references
          meditationPoint: "ঈশ্বরের বাক্য নিয়ে ধ্যান করুন।"
        },
        prayer: "প্রভু, তোমার বাক্যের মাধ্যমে আমাদের পথ দেখাও। আমেন।",
        keyThemes: ["Faith", "Love", "Grace"],
        timestamp: Date.now()
      };

      searchCache.set(normalizedQuery, result);
      return result;
    } catch (error: any) {
      console.error("Bible API Error:", error);
      throw new Error(error.message || "এপিআই এর সাথে সংযোগ করা যাচ্ছে না।");
    }
  },

  async fetchDailyQuote(lang: string = 'bn'): Promise<{ text: string; author: string }> {
    // Return a random verse from a static list since we can't use Gemini
    const quotes = [
      { text: "ঈশ্বরই আমাদের আশ্রয় ও বল, সংকটে তিনি অতিশয় সুলভ সহায়।", author: "গীতসংহিতা ৪৬:১" },
      { text: "প্রভু আমার পালক, আমার অভাব হবে না।", author: "গীতসংহিতা ২৩:১" },
      { text: "কেননা ঈশ্বর জগতকে এমন প্রেম করিলেন যে, আপনার একজাত পুত্রকে দান করিলেন...", author: "যোহন ৩:১৬" }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
};
