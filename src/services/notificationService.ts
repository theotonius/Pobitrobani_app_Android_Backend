export interface NotificationSettings {
  enabled: boolean;
  morningEnabled: boolean;
  morningTime: string;
  eveningEnabled: boolean;
  eveningTime: string;
  soundEnabled: boolean;
}

const NOTIFICATION_SETTINGS_KEY = 'sacred_word_notification_settings';

export const defaultNotificationSettings: NotificationSettings = {
  enabled: false,
  morningEnabled: true,
  morningTime: '07:00',
  eveningEnabled: true,
  eveningTime: '20:00',
  soundEnabled: true,
};

export const getNotificationSettings = (): NotificationSettings => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      return { ...defaultNotificationSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load notification settings:', e);
  }
  return defaultNotificationSettings;
};

export const saveNotificationSettings = (settings: NotificationSettings): void => {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const showNotification = async (
  title: string,
  body: string,
  icon?: string
): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'sacred-word-notification',
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    setTimeout(() => notification.close(), 10000);

    return true;
  } catch (e) {
    console.error('Failed to show notification:', e);
    return false;
  }
};

export const isNotificationTime = (
  settings: NotificationSettings,
  type: 'morning' | 'evening'
): boolean => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  if (type === 'morning' && settings.morningEnabled) {
    return currentTime === settings.morningTime;
  }
  
  if (type === 'evening' && settings.eveningEnabled) {
    return currentTime === settings.eveningTime;
  }
  
  return false;
};

export const scheduleNotificationCheck = (
  settings: NotificationSettings,
  onNotify: (type: 'morning' | 'evening') => void,
  intervalMs: number = 60000
): (() => void) => {
  if (!settings.enabled) {
    return () => {};
  }

  const interval = setInterval(() => {
    if (isNotificationTime(settings, 'morning')) {
      onNotify('morning');
    }
    if (isNotificationTime(settings, 'evening')) {
      onNotify('evening');
    }
  }, intervalMs);

  return () => clearInterval(interval);
};

export const DAILY_VERSES = [
  { reference: 'যোহন ৩:১৬', text: 'কেননা ঈশ্বর জগতকে এমন প্রেম করিলেন যে, তিনি আপনার একজাত পুত্রকে দান করিলেন, যেন যে কেহ তাঁহার বিশ্বাস করে, সে বিনষ্ট না হইয়া চিরজীবন লাভ করে।' },
  { reference: 'গীতসংহিতা ২৩:১', text: 'প্রভু আমার পালক, আমার অভাব হইবে না।' },
  { reference: 'ফিলিপীয় ৪:১৩', text: 'যাহা বলিতে ইচ্ছা করি, সেই সকলেই আমার ভিতরে শক্তি সাধন করিতে পারি।' },
  { reference: 'যিশাইয় ৪০:৩১', text: 'কিন্তু যাহারা প্রভুর আশা রাখে, তাহারা নতুন বলে উৎথিত হইবে; তাহারা বাজপাখির ন্যায় উড়িয়া যাইবে, এবং ছুটিয়াও ক্ষিদা করিবে না।' },
  { reference: 'মথি ১১:২৮', text: 'আমার কাছে আইস; সকল ক্লান্ত ও বোঝা বহনকারীরা, আমার কাছে আইস, এবং আমি তোমাদিগকে বিশ্রাম দিব।' },
  { reference: 'রোমীয় ৮:২৮', text: 'আর আমরা জানি যে, যাহারা ঈশ্বরকে প্রেম করে, তাহাদের মঙ্গলের নিমিত্ত সকলই একযোগে কার্য করিতেছে।' },
  { reference: 'গীতসংহিতা ৯১:১', text: 'যিনি পরাৎপরের গুপ্তস্থানে বাস করেন, তিনি সর্বশক্তিমানের ছায়ায় বাস করিবেন।' },
  { reference: 'হিতোপদেশ ৩:৫', text: 'তোমার সমস্ত চিত্তে সদাপ্রভুতে বিশ্বাস কর, এবং তোমার নিজের বুদ্ধির উপর নির্ভর কর না।' },
  { reference: 'কলসীয় ৩:১৪', text: 'এবং সকলের উপরে প্রেম পরিধান কর, কারণ প্রেম বন্ধনের পূর্ণতা।' },
  { reference: '১ যোহন ৪:৮', text: 'যে প্রেম করে না, সে ঈশ্বরকে জানে না; কারণ ঈশ্বর প্রেম।' },
  { reference: 'মথি ৫:৯', text: 'ধন্য তাহারা, যাহারা শান্তিপ্রিয়; কেননা তাহারা ঈশ্বরের পুত্র বলিয়া ডাকা যাইবে।' },
  { reference: 'লুকা ৬:৩৮', text: 'দান কর, তবে তোমাদিগকে দেওয়া যাইবে; সদ্যপাত্রে লইয়া ঢালা হইবে, উপরিপাতিতে চাপা হইবে।' },
  { reference: 'ইব্রীয় ১১:১', text: 'বিশ্বাস প্রত্যাশিত বস্তুর নিশ্চয়তা, অদৃশ্য বস্তুর প্রমাণ।' },
  { reference: 'ফিলিপীয় ৪:৬', text: 'কোনো বিষয়ে চিন্তা করিও না; কিন্তু সকল বিষয়ে প্রার্থনা ও বিনতি সহ সমস্ত প্রার্থনায় ঈশ্বরের কাছে তোমাদের অনুরোধ জ্ঞাপন কর।' },
  { reference: 'রোমীয় ১২:২', text: 'এই জগতের সহিত অনুকূল হইয়া না থাক, কিন্তু মনের নবীকরণ দ্বারা পরিবর্তিত হও; যাতে তোমরা ঈশ্বরের সদ্যপ্রসন্ন ও সকল ভালো ও নিখুঁত বস্তু কী তাহা পরীক্ষা করিতে পার।' },
];

export const getDailyVerse = (): { reference: string; text: string } => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
};
