import { useState, useEffect, useCallback } from 'react';
import {
  NotificationSettings,
  defaultNotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  showNotification,
  scheduleNotificationCheck,
  getDailyVerse,
  DAILY_VERSES,
} from '../services/notificationService';

interface UseNotificationsReturn {
  settings: NotificationSettings;
  updateSettings: (settings: NotificationSettings) => void;
  isPermissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  testNotification: () => Promise<void>;
  getVerseOfDay: () => { reference: string; text: string };
}

export function useNotifications(): UseNotificationsReturn {
  const [settings, setSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  useEffect(() => {
    const loaded = getNotificationSettings();
    setSettings(loaded);
    setIsPermissionGranted(Notification.permission === 'granted');
  }, []);

  useEffect(() => {
    const cleanup = scheduleNotificationCheck(settings, async (type) => {
      const verse = DAILY_VERSES[Math.floor(Math.random() * DAILY_VERSES.length)];
      const title = type === 'morning' ? '🌅 সকালের আশীর্বচন' : '🌙 সন্ধ্যার প্রার্থনা';
      await showNotification(title, `${verse.reference}: ${verse.text.slice(0, 100)}...`);
    }, 60000);

    return cleanup;
  }, [settings]);

  const updateSettings = useCallback((newSettings: NotificationSettings) => {
    setSettings(newSettings);
    saveNotificationSettings(newSettings);
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setIsPermissionGranted(granted);
    return granted;
  }, []);

  const testNotification = useCallback(async () => {
    const verse = getDailyVerse();
    await showNotification('📜 পবিত্র বানী', `${verse.reference}: ${verse.text.slice(0, 100)}...`);
  }, []);

  const getVerseOfDay = useCallback(() => {
    return getDailyVerse();
  }, []);

  return {
    settings,
    updateSettings,
    isPermissionGranted,
    requestPermission,
    testNotification,
    getVerseOfDay,
  };
}
