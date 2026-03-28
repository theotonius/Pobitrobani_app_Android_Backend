// Reading Plan Types
export interface ReadingPlan {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  duration: number; // days
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readings: PlanReading[];
  createdAt: string;
}

export interface PlanReading {
  day: number;
  title: string;
  titleBn: string;
  passages: string[];
  meditation: string;
  completed?: boolean;
  completedAt?: string;
}

export interface ReadingProgress {
  planId: string;
  currentDay: number;
  completedDays: number[];
  startedAt: string;
  lastReadAt: string;
}

export interface DailyDevotional {
  date: string;
  verse: {
    reference: string;
    text: string;
    version: string;
  };
  title: string;
  meditation: string;
  prayer: string;
  theme: string;
}

export interface NotificationSettings {
  enabled: boolean;
  morningVerse: boolean;
  morningTime: string; // "08:00"
  nightMeditation: boolean;
  nightTime: string; // "21:00"
  weeklyReminder: boolean;
  weeklyDay: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
}

export interface CommunityNote {
  id: string;
  verseReference: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

export interface PrayerRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  description: string;
  isAnonymous: boolean;
  prayers: number;
  prayedBy: string[];
  isAnswered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShareCard {
  template: 'classic' | 'modern' | 'minimal' | 'gradient';
  verse: {
    reference: string;
    text: string;
  };
  background: string;
  textColor: string;
  showLogo: boolean;
  showTranslation: boolean;
}

// Predefined Reading Plans
export const BIBLE_READING_PLANS: ReadingPlan[] = [
  {
    id: 'one-year',
    name: 'One Year Bible',
    nameBn: 'এক বছরে বাইবেল',
    description: 'প্রতিদিন পড়ে এক বছরে সম্পূর্ণ বাইবেল শেষ করুন',
    duration: 365,
    difficulty: 'intermediate',
    readings: generateOneYearReadings(),
    createdAt: '2026-01-01'
  },
  {
    id: 'psalm-proverbs',
    name: 'Psalms & Proverbs',
    nameBn: 'গীতসংহিতা ও হিতোপদেশ',
    description: 'গীতসংহিতা ও হিতোপদেশ প্রতিদিন পড়ুন',
    duration: 180,
    difficulty: 'beginner',
    readings: generatePsalmProverbsReadings(),
    createdAt: '2026-01-01'
  },
  {
    id: 'gospels',
    name: 'Four Gospels',
    nameBn: 'চারটি সুসমাচার',
    description: 'যীশুর জীবন ও শিক্ষা গভীরভাবে অধ্যয়ন করুন',
    duration: 90,
    difficulty: 'intermediate',
    readings: generateGospelsReadings(),
    createdAt: '2026-01-01'
  },
  {
    id: 'quick-start',
    name: 'Quick Start',
    nameBn: 'দ্রুত শুরু',
    description: 'নতুনদের জন্য ৩০ দিনের পরিচয়',
    duration: 30,
    difficulty: 'beginner',
    readings: generateQuickStartReadings(),
    createdAt: '2026-01-01'
  }
];

function generateOneYearReadings(): PlanReading[] {
  const readings: PlanReading[] = [];
  const schedule = [
    { old: ['genesis', 'matthew'], new: ['acts', 'romans'] },
    { old: ['exodus', 'mark'], new: ['1corinthians', '2corinthians'] },
    { old: ['leviticus', 'luke'], new: ['galatians', 'ephesians'] },
    { old: ['numbers', 'john'], new: ['philippians', 'colossians'] },
    { old: ['deuteronomy', 'acts'], new: ['1thessalonians', '2thessalonians'] },
    { old: ['joshua', 'romans'], new: ['1timothy', '2timothy'] },
  ];

  for (let day = 1; day <= 365; day++) {
    const scheduleIndex = Math.floor((day - 1) / 7) % schedule.length;
    const dayOfWeek = (day - 1) % 7;
    
    readings.push({
      day,
      title: `Day ${day}`,
      titleBn: `দিন ${day}`,
      passages: [`${schedule[scheduleIndex].old[dayOfWeek % 2]} ${day}`, `${schedule[scheduleIndex].new[dayOfWeek % 2]} ${day % 10 + 1}`],
      meditation: 'আজকের পড়া নিয়ে ঈশ্বরের সাথে কথা বলুন।'
    });
  }
  return readings;
}

function generatePsalmProverbsReadings(): PlanReading[] {
  const readings: PlanReading[] = [];
  for (let day = 1; day <= 180; day++) {
    const psalmStart = Math.floor((day - 1) / 2) * 3 + 1;
    const proverbChapter = Math.floor((day - 1) / 3) + 1;
    
    readings.push({
      day,
      title: `Psalms ${psalmStart}-${psalmStart + 2} & Proverbs ${proverbChapter}`,
      titleBn: `গীতসংহিতা ${psalmStart}-${psalmStart + 2} ও হিতোপদেশ ${proverbChapter}`,
      passages: [`psalm ${psalmStart}-${psalmStart + 2}`, `proverbs ${proverbChapter}`],
      meditation: 'প্রতিদিন একটি আয়াত মুখস্থ করুন।'
    });
  }
  return readings;
}

function generateGospelsReadings(): PlanReading[] {
  const readings: PlanReading[] = [];
  const gospels = [
    { name: 'Matthew', nameBn: 'মথি', chapters: 28 },
    { name: 'Mark', nameBn: 'মার্ক', chapters: 16 },
    { name: 'Luke', nameBn: 'লুক', chapters: 24 },
    { name: 'John', nameBn: 'যোহন', chapters: 21 }
  ];

  let day = 1;
  for (const gospel of gospels) {
    const chaptersPerDay = Math.ceil(gospel.chapters / 25);
    for (let i = 0; i < gospel.chapters; i++) {
      readings.push({
        day: day++,
        title: `${gospel.name} ${i + 1}`,
        titleBn: `${gospel.nameBn} ${i + 1}`,
        passages: [`${gospel.name.toLowerCase()} ${i + 1}`],
        meditation: `যীশুর এই শিক্ষা আজকের জীবনে কীভাবে প্রয়োগ করবেন?`
      });
    }
  }
  return readings;
}

function generateQuickStartReadings(): PlanReading[] {
  const keyPassages = [
    { passage: 'john 3:16', title: 'ঈশ্বরের ভালোবাসা', meditation: 'ঈশ্বর আমাকে কতটা ভালোবাসেন?' },
    { passage: 'psalm 23', title: 'প্রভু আমার রাখাল', meditation: 'প্রভু আমার জীবনে কী করছেন?' },
    { passage: 'proverbs 3:5', title: 'বিশ্বাস', meditation: 'ঈশ্বরকে বিশ্বাস করতে শিখি।' },
    { passage: 'philippians 4:13', title: 'শক্তি', meditation: 'খ্রীষ্টে সব সম্ভব।' },
    { passage: 'matthew 11:28', title: 'বিশ্রাম', meditation: 'যীশুর কাছে বিশ্রাম পাই।' },
    { passage: 'romans 8:28', title: 'মহত্তর পরিকল্পনা', meditation: 'ঈশ্বরের পরিকল্পনা ভালো।' },
    { passage: 'genesis 1:1', title: 'সৃষ্টি', meditation: 'ঈশ্বর সব কিছুর স্রষ্টা।' },
    { passage: 'john 14:6', title: 'পথ', meditation: 'যীশুই একমাত্র পথ।' },
  ];

  return keyPassages.flatMap((passage, index) => {
    const readings = [];
    for (let i = 0; i < 4; i++) {
      readings.push({
        day: index * 4 + i + 1,
        title: passage.title,
        titleBn: passage.title,
        passages: [passage.passage],
        meditation: passage.meditation
      });
    }
    return readings;
  });
}
