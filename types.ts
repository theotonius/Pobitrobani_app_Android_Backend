
export interface SnippetData {
  id: string;
  verseId: string;
  reference: string;
  type: 'insight' | 'lyric' | 'prayer';
  content: string;
  label: string;
  timestamp: number;
}

export interface VerseData {
  id: string;
  reference: string;
  text: string;
  explanation: {
    theologicalMeaning: string;
    theologicalReference: string;
    historicalContext: string;
    historicalReference: string;
    practicalApplication: string;
    practicalReference: string;
    metaphoricalMeaning: string;
    metaphoricalReference: string;
    crossReferences: string[];
    meditationPoint: string;
    originalInsight?: string;
  };
  prayer: string;
  keyThemes: string[];
  tags?: string[];
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ERROR = 'ERROR'
}

export type View = 'SEARCH' | 'SAVED' | 'SETTINGS';

export type Language = 'bn' | 'en';
