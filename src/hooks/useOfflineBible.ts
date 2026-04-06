import { useState, useEffect, useCallback } from 'react';
import { offlineBible } from '../services/offlineBibleService';
import { usePWA } from './usePWA';

interface OfflineBibleState {
  isDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  storageUsage: string;
  downloadBible: () => Promise<void>;
  clearBible: () => Promise<void>;
  searchOffline: (query: string) => Promise<{ reference: string; text: string }[]>;
  getPopularVerses: () => { reference: string; text: string }[];
}

export function useOfflineBible(): OfflineBibleState {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [storageUsage, setStorageUsage] = useState('0 B');
  const { isOffline } = usePWA();

  useEffect(() => {
    const checkDownload = async () => {
      const downloaded = await offlineBible.isDownloaded();
      setIsDownloaded(downloaded);
      
      if (downloaded) {
        const usage = await offlineBible.getStorageUsage();
        setStorageUsage(usage.total);
      }
    };
    checkDownload();
  }, []);

  const downloadBible = useCallback(async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      await offlineBible.downloadBible((progress) => {
        setDownloadProgress(progress);
      });
      setIsDownloaded(true);
      
      const usage = await offlineBible.getStorageUsage();
      setStorageUsage(usage.total);
    } catch (e) {
      console.error('Failed to download Bible:', e);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const clearBible = useCallback(async () => {
    await offlineBible.clearCache();
    setIsDownloaded(false);
    setStorageUsage('0 B');
  }, []);

  const searchOffline = useCallback(async (query: string) => {
    if (!isDownloaded || !isOffline) return [];
    
    const results = await offlineBible.searchVerses(query);
    return results.map(r => ({
      reference: `গীতসংহিতা ${r.chapter}:${r.verse}`,
      text: r.text
    }));
  }, [isDownloaded, isOffline]);

  const getPopularVerses = useCallback(() => {
    if (isDownloaded) {
      return offlineBible.getPopularVerses();
    }
    return [];
  }, [isDownloaded]);

  return {
    isDownloaded,
    isDownloading,
    downloadProgress,
    storageUsage,
    downloadBible,
    clearBible,
    searchOffline,
    getPopularVerses
  };
}
