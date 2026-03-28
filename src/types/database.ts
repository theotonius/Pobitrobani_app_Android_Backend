// Database types for Supabase

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  preferred_version: 'modern' | 'carey' | 'kitabul';
  created_at: string;
  updated_at: string;
}

export interface SavedVerse {
  id?: string;
  user_id: string;
  reference: string;
  text: string;
  version: 'modern' | 'carey' | 'kitabul';
  explanation?: VerseExplanation;
  prayer?: string;
  key_themes?: string[];
  tags?: string[];
  personal_notes?: string;
  is_favorite?: boolean;
  read_count?: number;
  last_read_at?: string;
  created_at?: string;
  updated_at?: string;
  device_id?: string;
  local_id?: string;
  sync_status?: 'synced' | 'pending' | 'conflict';
}

export interface VerseExplanation {
  theologicalMeaning?: string;
  theologicalReference?: string;
  historicalContext?: string;
  historicalReference?: string;
  practicalApplication?: string;
  practicalReference?: string;
  crossReferences?: string[];
  meditationPoint?: string;
  metaphoricalMeaning?: string;
  metaphoricalReference?: string;
  originalInsight?: string;
}

export interface SavedSnippet {
  id?: string;
  user_id: string;
  type: 'insight' | 'prayer' | 'lyrics' | 'note';
  content: string;
  source_reference?: string;
  created_at?: string;
  updated_at?: string;
  device_id?: string;
  local_id?: string;
  sync_status?: 'synced' | 'pending' | 'conflict';
}

export interface UserSettings {
  user_id: string;
  theme: 'dark' | 'light';
  font_size: 'sm' | 'base' | 'lg' | 'xl';
  font_family: string;
  language_version: 'modern' | 'carey' | 'kitabul';
  app_lang: 'bn' | 'en';
  auto_sync: boolean;
  sync_frequency: 'realtime' | '5min' | 'manual';
  last_sync_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SyncLog {
  id: string;
  user_id: string;
  device_id: string;
  action: 'push' | 'pull' | 'conflict' | 'merge';
  records_count: number;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface SyncStatus {
  lastSyncTime: Date | null;
  isSyncing: boolean;
  pendingChanges: number;
  hasConflicts: boolean;
  error: string | null;
  connectionStatus: 'online' | 'offline';
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
    provider?: string;
  };
  is_anonymous?: boolean;
}

// Database schema types for Supabase
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      saved_verses: {
        Row: SavedVerse;
        Insert: Omit<SavedVerse, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SavedVerse, 'id' | 'user_id' | 'created_at'>>;
      };
      saved_snippets: {
        Row: SavedSnippet;
        Insert: Omit<SavedSnippet, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SavedSnippet, 'id' | 'user_id' | 'created_at'>>;
      };
      user_settings: {
        Row: UserSettings;
        Insert: Omit<UserSettings, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSettings, 'user_id' | 'created_at'>>;
      };
      sync_logs: {
        Row: SyncLog;
        Insert: Omit<SyncLog, 'id' | 'created_at'>;
        Update: Partial<Omit<SyncLog, 'id' | 'user_id'>>;
      };
    };
  };
};
