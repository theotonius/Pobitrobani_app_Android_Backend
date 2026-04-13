import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured, getDeviceId } from '../lib/supabase';
import { SavedVerse, SavedSnippet, SyncStatus, UserSettings } from '../types/database';

interface UseSyncReturn {
  syncStatus: SyncStatus;
  syncNow: () => Promise<void>;
  syncVerses: () => Promise<void>;
  syncSnippets: () => Promise<void>;
  syncSettings: () => Promise<void>;
  clearLocalData: () => Promise<void>;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<boolean>;
}

export function useSync(userId: string | null): UseSyncReturn {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: null,
    isSyncing: false,
    pendingChanges: 0,
    hasConflicts: false,
    error: null,
  });

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync verses from local storage to Supabase
  const syncVerses = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) return;

    setSyncStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      // Get local saved verses
      const localVersesData = localStorage.getItem('sacred_word_verses');
      const localVerses: SavedVerse[] = localVersesData ? JSON.parse(localVersesData) : [];

      if (localVerses.length === 0) {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        return;
      }

      const deviceId = getDeviceId();

      // Prepare verses for sync
      const versesToSync = localVerses.map(verse => ({
        ...verse,
        user_id: userId,
        device_id: deviceId,
        local_id: verse.id,
        sync_status: 'pending' as const,
        version: verse.version || 'modern',
      }));

      // Upsert to Supabase (insert or update)
      const { data, error } = await supabase
        .from('saved_verses')
        .upsert(versesToSync, {
          onConflict: 'user_id,reference,version',
        })
        .select();

      if (error) {
        throw error;
      }

      // Log sync
      await supabase.from('sync_logs').insert({
        user_id: userId,
        device_id: deviceId,
        action: 'push',
        records_count: data?.length || 0,
        details: { type: 'verses', count: versesToSync.length },
      });

      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        pendingChanges: 0,
        isSyncing: false,
      }));
    } catch (err: any) {
      console.error('Sync verses error:', err);
      setSyncStatus(prev => ({
        ...prev,
        error: err.message,
        isSyncing: false,
      }));
    }
  }, [userId]);

  // Pull verses from Supabase to local
  const pullVerses = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('saved_verses')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Merge with local data
        const localVersesData = localStorage.getItem('sacred_word_verses');
        const localVerses: SavedVerse[] = localVersesData ? JSON.parse(localVersesData) : [];

        // Create map of local verses
        const localMap = new Map(
          localVerses.map(v => [`${v.reference}-${v.version || 'modern'}`, v])
        );

        // Merge cloud verses (cloud wins for conflicts)
        data.forEach((cloudVerse: any) => {
          const key = `${cloudVerse.reference}-${cloudVerse.version}`;
          const localVerse = localMap.get(key);

          if (!localVerse) {
            // New verse from cloud
            localMap.set(key, cloudVerse);
          } else if (cloudVerse.updated_at > (localVerse.updated_at || (localVerse as any).timestamp)) {
            // Cloud is newer
            localMap.set(key, cloudVerse);
          }
        });

        // Save merged data to local
        const mergedVerses = Array.from(localMap.values());
        localStorage.setItem('sacred_word_verses', JSON.stringify(mergedVerses));

        // Update sync status on cloud
        await supabase
          .from('saved_verses')
          .update({ sync_status: 'synced' })
          .eq('user_id', userId);
      }
    } catch (err) {
      console.error('Pull verses error:', err);
    }
  }, [userId]);

  // Sync snippets
  const syncSnippets = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) return;

    try {
      const localSnippetsData = localStorage.getItem('sacred_word_snippets');
      const localSnippets: SavedSnippet[] = localSnippetsData ? JSON.parse(localSnippetsData) : [];

      if (localSnippets.length === 0) return;

      const deviceId = getDeviceId();

      const snippetsToSync = localSnippets.map(snippet => ({
        ...snippet,
        user_id: userId,
        device_id: deviceId,
        local_id: snippet.id,
        sync_status: 'pending' as const,
      }));

      await supabase
        .from('saved_snippets')
        .upsert(snippetsToSync, {
          onConflict: 'user_id,content,type',
        });

      // Pull snippets from cloud
      const { data } = await supabase
        .from('saved_snippets')
        .select('*')
        .eq('user_id', userId);

      if (data && data.length > 0) {
        localStorage.setItem('sacred_word_snippets', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Sync snippets error:', err);
    }
  }, [userId]);

  // Sync settings
  const syncSettings = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) return;

    try {
      const settings: Partial<UserSettings> = {
        theme: localStorage.getItem('sacred_word_theme') as 'dark' | 'light' || 'dark',
        font_size: localStorage.getItem('sacred_word_font_size') as any || 'base',
        font_family: localStorage.getItem('sacred_word_font') || 'SolaimanLipi',
        language_version: localStorage.getItem('sacred_word_lang_version') as any || 'modern',
        app_lang: localStorage.getItem('sacred_word_app_lang') as any || 'bn',
        auto_sync: true,
        sync_frequency: 'realtime',
        last_sync_at: new Date().toISOString(),
      };

      await supabase
        .from('user_settings')
        .upsert({
          ...settings,
          user_id: userId,
        }, {
          onConflict: 'user_id',
        });
    } catch (err) {
      console.error('Sync settings error:', err);
    }
  }, [userId]);

  // Full sync
  const syncNow = useCallback(async () => {
    if (!userId || !isSupabaseConfigured) {
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Push local changes
      await syncVerses();
      await syncSnippets();
      await syncSettings();

      // Pull cloud changes
      await pullVerses();

      setSyncStatus(prev => ({
        ...prev,
        lastSyncTime: new Date(),
        isSyncing: false,
      }));
    } catch (err: any) {
      setSyncStatus(prev => ({
        ...prev,
        error: err.message,
        isSyncing: false,
      }));
    }
  }, [userId, syncStatus.connectionStatus, syncVerses, syncSnippets, syncSettings, pullVerses]);

  // Clear local data
  const clearLocalData = useCallback(async () => {
    localStorage.removeItem('sacred_word_verses');
    localStorage.removeItem('sacred_word_snippets');
    localStorage.removeItem('sacred_word_search_history');
    localStorage.removeItem('sacred_word_user_api_key');
    
    setSyncStatus(prev => ({
      ...prev,
      pendingChanges: 0,
      lastSyncTime: null,
    }));
  }, []);

  // Export data as JSON
  const exportData = useCallback(async (): Promise<string> => {
    const verses = localStorage.getItem('sacred_word_verses') || '[]';
    const snippets = localStorage.getItem('sacred_word_snippets') || '[]';
    const settings = {
      theme: localStorage.getItem('sacred_word_theme'),
      fontSize: localStorage.getItem('sacred_word_font_size'),
      fontFamily: localStorage.getItem('sacred_word_font'),
      languageVersion: localStorage.getItem('sacred_word_lang_version'),
      appLang: localStorage.getItem('sacred_word_app_lang'),
    };

    const exportObj = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      verses: JSON.parse(verses),
      snippets: JSON.parse(snippets),
      settings,
    };

    return JSON.stringify(exportObj, null, 2);
  }, []);

  // Import data from JSON
  const importData = useCallback(async (data: string): Promise<boolean> => {
    try {
      const importObj = JSON.parse(data);

      if (importObj.verses) {
        localStorage.setItem('sacred_word_verses', JSON.stringify(importObj.verses));
      }

      if (importObj.snippets) {
        localStorage.setItem('sacred_word_snippets', JSON.stringify(importObj.snippets));
      }

      if (importObj.settings) {
        const { settings } = importObj;
        if (settings.theme) localStorage.setItem('sacred_word_theme', settings.theme);
        if (settings.fontSize) localStorage.setItem('sacred_word_font_size', settings.fontSize);
        if (settings.fontFamily) localStorage.setItem('sacred_word_font', settings.fontFamily);
        if (settings.languageVersion) localStorage.setItem('sacred_word_lang_version', settings.languageVersion);
        if (settings.appLang) localStorage.setItem('sacred_word_app_lang', settings.appLang);
      }

      // Trigger sync after import
      if (userId) {
        await syncNow();
      }

      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  }, [userId, syncNow]);

  // Real-time sync subscription
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;

    const channel = supabase
      .channel('sync-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_verses',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Real-time sync:', payload);
          // Handle real-time changes
          pullVerses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, pullVerses]);

  // Auto sync every 5 minutes
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return;

    syncIntervalRef.current = setInterval(() => {
      syncNow();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [userId, syncNow]);

  return {
    syncStatus,
    syncNow,
    syncVerses,
    syncSnippets,
    syncSettings,
    clearLocalData,
    exportData,
    importData,
  };
}
