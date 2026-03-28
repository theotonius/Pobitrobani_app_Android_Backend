import { useState, useCallback, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { normalizeBengali } from '../lib/bengaliSearch';

interface SearchState {
  query: string;
  isSearching: boolean;
  error: string | null;
  results: any[];
  suggestions: string[];
  history: string[];
}

const SEARCH_CACHE = new Map<string, { results: any[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50;

export function useOptimizedSearch<T extends { reference: string; text: string; keyThemes?: string[]; tags?: string[] }>(
  items: T[],
  options?: {
    debounceMs?: number;
    maxSuggestions?: number;
    threshold?: number;
  }
) {
  const { debounceMs = 300, maxSuggestions = 10, threshold = 0.3 } = options || {};
  
  const [state, setState] = useState<SearchState>({
    query: '',
    isSearching: false,
    error: null,
    results: [],
    suggestions: [],
    history: []
  });

  const fuseRef = useRef<Fuse<T> | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize Fuse instance
  useEffect(() => {
    fuseRef.current = new Fuse(items, {
      keys: [
        { name: 'reference', weight: 0.4 },
        { name: 'text', weight: 0.3 },
        { name: 'keyThemes', weight: 0.2 },
        { name: 'tags', weight: 0.1 }
      ],
      threshold,
      includeScore: true,
      ignoreLocation: true,
      getFn: (obj: any, path: string | string[]) => {
        const val = obj[path as string];
        if (Array.isArray(val)) return val.map(v => normalizeBengali(v));
        return normalizeBengali(val as string);
      }
    });
  }, [items, threshold]);

  // Load search history from localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem('sacred_word_search_history');
    if (storedHistory) {
      try {
        setState(prev => ({ ...prev, history: JSON.parse(storedHistory) }));
      } catch (e) {
        console.warn('Failed to parse search history');
      }
    }
  }, []);

  const search = useCallback((query: string) => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Cancel previous search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState(prev => ({ ...prev, query, error: null }));

    if (!query.trim()) {
      setState(prev => ({ ...prev, results: [], suggestions: [] }));
      return;
    }

    // Check cache first
    const cacheKey = normalizeBengali(query.toLowerCase());
    const cached = SEARCH_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setState(prev => ({ ...prev, results: cached.results, suggestions: [] }));
      return;
    }

    // Debounce search
    debounceTimerRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isSearching: true }));

      try {
        if (!fuseRef.current) {
          throw new Error('Search index not initialized');
        }

        const normalizedQuery = normalizeBengali(query);
        const results = fuseRef.current.search(normalizedQuery);
        const searchResults = results.map(r => r.item);

        // Cache results
        if (SEARCH_CACHE.size >= MAX_CACHE_SIZE) {
          const oldestKey = SEARCH_CACHE.keys().next().value;
          if (oldestKey) SEARCH_CACHE.delete(oldestKey);
        }
        SEARCH_CACHE.set(cacheKey, { results: searchResults, timestamp: Date.now() });

        // Generate suggestions
        const suggestions = searchResults.slice(0, maxSuggestions).map(r => r.reference);

        setState(prev => ({
          ...prev,
          results: searchResults,
          suggestions,
          isSearching: false
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: (error as Error).message,
          isSearching: false
        }));
      }
    }, debounceMs);
  }, [debounceMs, maxSuggestions]);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    setState(prev => {
      const newHistory = [query, ...prev.history.filter(h => h !== query)].slice(0, 10);
      localStorage.setItem('sacred_word_search_history', JSON.stringify(newHistory));
      return { ...prev, history: newHistory };
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem('sacred_word_search_history');
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  const clearCache = useCallback(() => {
    SEARCH_CACHE.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    search,
    addToHistory,
    clearHistory,
    clearCache,
    cacheSize: SEARCH_CACHE.size
  };
}
