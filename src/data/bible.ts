export interface BibleBook {
  id: string;
  name: string;
  nameBn: string;
  chapters: number;
}

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: 'modern' | 'carey';
}

export const BIBLE_BOOKS: BibleBook[] = [
  { id: 'genesis', name: 'Genesis', nameBn: 'আদিপুস্তক', chapters: 50 },
  { id: 'exodus', name: 'Exodus', nameBn: 'যাত্রাপুস্তক', chapters: 40 },
  { id: 'leviticus', name: 'Leviticus', nameBn: 'লেবীয়ক', chapters: 27 },
  { id: 'numbers', name: 'Numbers', nameBn: 'সংখ্যাপুস্তক', chapters: 36 },
  { id: 'deuteronomy', name: 'Deuteronomy', nameBn: 'ব্যবস্থাপনা', chapters: 34 },
  { id: 'joshua', name: 'Joshua', nameBn: 'যোশু', chapters: 24 },
  { id: 'judges', name: 'Judges', nameBn: 'বিচারক', chapters: 21 },
  { id: 'ruth', name: 'Ruth', nameBn: 'রূথ', chapters: 4 },
  { id: '1samuel', name: '1 Samuel', nameBn: '১ শামুয়েল', chapters: 31 },
  { id: '2samuel', name: '2 Samuel', nameBn: '২ শামুয়েল', chapters: 24 },
  { id: '1kings', name: '1 Kings', nameBn: '১ রাজাবলি', chapters: 22 },
  { id: '2kings', name: '2 Kings', nameBn: '২ রাজাবলি', chapters: 25 },
  { id: '1chronicles', name: '1 Chronicles', nameBn: '১ বংশাবলি', chapters: 29 },
  { id: '2chronicles', name: '2 Chronicles', nameBn: '২ বংশাবলি', chapters: 36 },
  { id: 'ezra', name: 'Ezra', nameBn: 'এসরা', chapters: 10 },
  { id: 'nehemiah', name: 'Nehemiah', nameBn: 'নেহেমিয়া', chapters: 13 },
  { id: 'esther', name: 'Esther', nameBn: 'এস্থের', chapters: 10 },
  { id: 'job', name: 'Job', nameBn: 'আয়োব', chapters: 42 },
  { id: 'psalms', name: 'Psalms', nameBn: 'গীতসংহিতা', chapters: 150 },
  { id: 'proverbs', name: 'Proverbs', nameBn: 'হিতোপদেশ', chapters: 31 },
  { id: 'ecclesiastes', name: 'Ecclesiastes', nameBn: 'উপদেশক', chapters: 12 },
  { id: 'songs', name: 'Song of Solomon', nameBn: 'প্রভুর গান', chapters: 8 },
  { id: 'isaiah', name: 'Isaiah', nameBn: 'যিশাইয়', chapters: 66 },
  { id: 'jeremiah', name: 'Jeremiah', nameBn: 'যিরমিয়া', chapters: 52 },
  { id: 'lamentations', name: 'Lamentations', nameBn: 'বিলাপ', chapters: 5 },
  { id: 'ezekiel', name: 'Ezekiel', nameBn: 'যেকেলিয়েল', chapters: 48 },
  { id: 'daniel', name: 'Daniel', nameBn: 'দানিয়েল', chapters: 12 },
  { id: 'hosea', name: 'Hosea', nameBn: 'হোশেয়', chapters: 14 },
  { id: 'joel', name: 'Joel', nameBn: 'যোয়েল', chapters: 3 },
  { id: 'amos', name: 'Amos', nameBn: 'আমোস', chapters: 9 },
  { id: 'obadiah', name: 'Obadiah', nameBn: 'ওবদিয়া', chapters: 1 },
  { id: 'jonah', name: 'Jonah', nameBn: 'যোনা', chapters: 4 },
  { id: 'micah', name: 'Micah', nameBn: 'মীকা', chapters: 7 },
  { id: 'nahum', name: 'Nahum', nameBn: 'নাহূম', chapters: 3 },
  { id: 'habakkuk', name: 'Habakkuk', nameBn: 'হাবাকুক', chapters: 3 },
  { id: 'zephaniah', name: 'Zephaniah', nameBn: 'সফানিয়া', chapters: 3 },
  { id: 'haggai', name: 'Haggai', nameBn: 'হাগয়', chapters: 2 },
  { id: 'zechariah', name: 'Zechariah', nameBn: 'সাখারিয়া', chapters: 14 },
  { id: 'malachi', name: 'Malachi', nameBn: 'মালাখি', chapters: 4 },
  { id: 'matthew', name: 'Matthew', nameBn: 'মথি', chapters: 28 },
  { id: 'mark', name: 'Mark', nameBn: 'মার্ক', chapters: 16 },
  { id: 'luke', name: 'Luke', nameBn: 'লুকা', chapters: 24 },
  { id: 'john', name: 'John', nameBn: 'যোহন', chapters: 21 },
  { id: 'acts', name: 'Acts', nameBn: 'প্রেরিত', chapters: 28 },
  { id: 'romans', name: 'Romans', nameBn: 'রোমীয়', chapters: 16 },
  { id: '1corinthians', name: '1 Corinthians', nameBn: '১ করিন্থীয়', chapters: 16 },
  { id: '2corinthians', name: '2 Corinthians', nameBn: '২ করিন্থীয়', chapters: 13 },
  { id: 'galatians', name: 'Galatians', nameBn: 'গালাতীয়', chapters: 6 },
  { id: 'ephesians', name: 'Ephesians', nameBn: 'ইফিসীয়', chapters: 6 },
  { id: 'philippians', name: 'Philippians', nameBn: 'ফিলিপীয়', chapters: 4 },
  { id: 'colossians', name: 'Colossians', nameBn: 'কলসীয়', chapters: 4 },
  { id: '1thessalonians', name: '1 Thessalonians', nameBn: '১ থেসালোনীয়', chapters: 5 },
  { id: '2thessalonians', name: '2 Thessalonians', nameBn: '২ থেসালোনীয়', chapters: 3 },
  { id: '1timothy', name: '1 Timothy', nameBn: '১ তিমথি', chapters: 6 },
  { id: '2timothy', name: '2 Timothy', nameBn: '২ তিমথি', chapters: 4 },
  { id: 'titus', name: 'Titus', nameBn: 'তীত', chapters: 3 },
  { id: 'philemon', name: 'Philemon', nameBn: 'ফিলেমন', chapters: 1 },
  { id: 'hebrews', name: 'Hebrews', nameBn: 'ইব্রীয়', chapters: 13 },
  { id: 'james', name: 'James', nameBn: 'যখূথ', chapters: 5 },
  { id: '1peter', name: '1 Peter', nameBn: '১ পিতর', chapters: 5 },
  { id: '2peter', name: '2 Peter', nameBn: '২ পিতর', chapters: 3 },
  { id: '1john', name: '1 John', nameBn: '১ যোহন', chapters: 5 },
  { id: '2john', name: '2 John', nameBn: '২ যোহন', chapters: 1 },
  { id: '3john', name: '3 John', nameBn: '৩ যোহন', chapters: 1 },
  { id: 'jude', name: 'Jude', nameBn: 'যয়ূদা', chapters: 1 },
  { id: 'revelation', name: 'Revelation', nameBn: 'প্রকাশ', chapters: 22 },
];

export const POPULAR_VERSES: Omit<BibleVerse, 'book'>[] = [
  { chapter: 23, verse: 1, text: "প্রভু আমার পালক, আমার অভাব হইবে না।", version: 'modern' },
  { chapter: 3, verse: 16, text: "কেননা ঈশ্বর জগতকে এমন প্রেম করিলেন যে, তিনি আপনার একজাত পুত্রকে দান করিলেন, যেন যে কেহ তাঁহার বিশ্বাস করে, সে বিনষ্ট না হইয়া চিরজীবন লাভ করে।", version: 'modern' },
  { chapter: 13, verse: 1, text: "প্রেম চিরসহিষ্ণু, প্রেম দয়াবান; প্রেম ঈর্ষা করে না; প্রেম অহংকার করে না।", version: 'modern' },
  { chapter: 91, verse: 1, text: "যিনি পরাৎপরের গুপ্তস্থানে বাস করেন, তিনি সর্বশক্তিমানের ছায়ায় বাস করিবেন।", version: 'modern' },
  { chapter: 8, verse: 28, text: "আর আমরা জানি যে, যাহারা ঈশ্বরকে প্রেম করে, তাহাদের মঙ্গলের নিমিত্ত সকলই একযোগে কার্য করিতেছে।", version: 'modern' },
  { chapter: 40, verse: 31, text: "কিন্তু যাহারা প্রভুর আশা রাখে, তাহারা নতুন বলে উৎথিত হইবে; তাহারা বাজপাখির ন্যায় উড়িয়া যাইবে, এবং ছুটিয়াও ক্ষিদা করিবে না।", version: 'modern' },
  { chapter: 6, verse: 9, text: "আমাদের পিতা যিনি স্বর্গে বাস করেন, তোমার নাম পবিত্র হউক।", version: 'modern' },
  { chapter: 11, verse: 28, text: "আমার কাছে আইস; সকল ক্লান্ত ও বোঝা বহনকারীরা, আমার কাছে আইস, এবং আমি তোমাদিগকে বিশ্রাম দিব।", version: 'modern' },
  { chapter: 4, verse: 13, text: "যাহা বলিতে ইচ্ছা করি, সেই সকলেই আমার ভিতরে শক্তি সাধন করিতে পারি।", version: 'modern' },
  { chapter: 3, verse: 5, text: "তোমার সমস্ত চিত্তে সদাপ্রভুতে বিশ্বাস কর, এবং তোমার নিজের বুদ্ধির উপর নির্ভর কর না।", version: 'modern' },
  { chapter: 1, verse: 1, text: "প্রভুর বাক্য সত্য এবং চিরন্তন।", version: 'modern' },
  { chapter: 14, verse: 6, text: "যীশু তাহাদিগকে বলিলেন, আমিই পথ, সত্য ও জীবন; পিতার নিকটে যাইতে কেহ আমার মাধ্যম ব্যতীত পারে না।", version: 'modern' },
  { chapter: 16, verse: 33, text: "আমি তোমাদিগকে এই সকল কথা বলিয়াছি, যেন আমার মধ্যে শান্তি পাও। জগতে তোমরা ক্লান্ত হইবে, কিন্তু সাহসী হও; আমি জগতকে জয় করিয়াছি।", version: 'modern' },
  { chapter: 1, verse: 14, text: "আর সেই বাক্য মনুষ্যদেহে পরিণত হইয়া, আমাদের মধ্যে বাস করিল; এবং আমরা তাহার মহিমা দেখিলাম, যেমন পিতার একজাত পুত্রের মহিমা, করুণা ও সত্যে পূর্ণ।", version: 'modern' },
  { chapter: 5, verse: 9, text: "ধন্য তাহারা, যাহারা দয়া করে, কেননা তাহারা দয়া লাভ করিবে।", version: 'modern' },
  { chapter: 2, verse: 10, text: "কেননা যাহারা ধৈর্যের সহিত কাজ করে, তাহারা মুকুট পাইবে, যাহা প্রভু, ন্যায়বিচারক ও রাজা, প্রেমিকদের প্রতি দান করিতে পারেন।", version: 'modern' },
  { chapter: 10, verse: 27, text: "যাহারা আমার সাক্ষাৎ করিবে না, তাহারা আমার শত্রু।", version: 'modern' },
  { chapter: 12, verse: 12, text: "প্রতিটি ভালো কাজের ফল দেওয়া হইবে।", version: 'modern' },
  { chapter: 10, verse: 22, text: "প্রভু আমার আলো ও আমার রক্ষাকর্তা; কাহার ভয় করিব? প্রভু জীবনের দুর্গ; কাহার ভয় করিব?", version: 'modern' },
  { chapter: 2, verse: 4, text: "প্রেম চিরন্তন।", version: 'modern' },
];

export const getBookByName = (name: string): BibleBook | undefined => {
  const normalized = name.toLowerCase().replace(/\s+/g, '');
  return BIBLE_BOOKS.find(b => 
    b.name.toLowerCase().replace(/\s+/g, '') === normalized ||
    b.nameBn.replace(/\s+/g, '') === normalized ||
    b.id.toLowerCase() === normalized
  );
};

export const parseReference = (ref: string): { book: string; chapter: number; verse: number } | null => {
  const match = ref.match(/^(.+?)\s*০?(\d+)(?::০?(\d+))?$/);
  if (!match) {
    const enMatch = ref.match(/^(.+?)\s*(\d+)(?::(\d+))?$/);
    if (!enMatch) return null;
    return { book: enMatch[1], chapter: parseInt(enMatch[2]), verse: enMatch[3] ? parseInt(enMatch[3]) : 1 };
  }
  return { book: match[1], chapter: parseInt(match[2]), verse: match[3] ? parseInt(match[3]) : 1 };
};

export const formatReference = (book: string, chapter: number, verse: number): string => {
  return `${book} ${chapter}:${verse}`;
};
