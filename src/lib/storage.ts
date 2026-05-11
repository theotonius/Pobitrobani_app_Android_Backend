import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const storage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // quota exceeded
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export const nativeStorage = {
  get: async (key: string): Promise<string | null> => {
    if (isNative) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    return storage.getItem(key);
  },

  set: async (key: string, value: string): Promise<void> => {
    if (isNative) {
      await Preferences.set({ key, value });
    }
    storage.setItem(key, value);
  },

  remove: async (key: string): Promise<void> => {
    if (isNative) {
      await Preferences.remove({ key });
    }
    storage.removeItem(key);
  },

  clear: async (): Promise<void> => {
    if (isNative) {
      await Preferences.clear();
    }
  },

  keys: async (): Promise<string[]> => {
    if (isNative) {
      const { keys } = await Preferences.keys();
      return keys;
    }
    return Object.keys(localStorage);
  },

  migrateToNative: async (): Promise<void> => {
    if (!isNative) return;
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        await Preferences.set({ key, value });
      }
    }
  },

  migrateFromNative: async (): Promise<void> => {
    if (!isNative) return;
    const { keys } = await Preferences.keys();
    for (const key of keys) {
      const { value } = await Preferences.get({ key });
      if (value !== null) {
        localStorage.setItem(key, value);
      }
    }
  },
};
