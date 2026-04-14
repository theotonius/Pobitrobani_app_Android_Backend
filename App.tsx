
import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bird, Cross, Search, Bookmark, Settings, Sparkles, Quote, Share2, ArrowUp, RefreshCcw, BookOpen, Book, Church, Link as LinkIcon, Lightbulb, Languages, HandHeart, XCircle, CircleAlert, Loader2, History, ArrowRight, Trash2, Info as CircleInfo, Phone, Github, Linkedin, Mail, Check, Globe, Moon, Sun, Menu, User, Cloud, Wifi, WifiOff, Download } from 'lucide-react';
import Fuse from 'fuse.js';
import { geminiService } from './services/geminiService';
import { VerseData, AppState, View, SnippetData, Language } from './types';
import { translations } from './translations';
import { normalizeBengali, transliterateToBengali, BENGALI_SEARCH_INDEX } from './src/lib/bengaliSearch';
import { lightThemePresets, applyLightThemeColors, getThemeColorsFromStorage, saveThemeColorsToStorage, ThemeColors } from './src/config/themeConfig';
import { useAuth } from './src/hooks/useAuth';
import { useSync } from './src/hooks/useSync';
import { LoginModal } from './src/components/Auth';
import { Dashboard } from './src/components/Dashboard';
import { SyncIndicator, UserAvatar } from './src/components/SyncStatus';

const NavItem = memo<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void; theme: string }>(({ icon, label, active, onClick, theme }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 lg:gap-3 transition-all px-4 lg:px-6 py-3 rounded-2xl group relative ${active ? (theme === 'dark' ? 'text-amber-400' : 'text-amber-700') : (theme === 'dark' ? 'text-slate-300 hover:text-slate-200' : 'text-slate-500 hover:text-amber-700')}`}
  >
    {active && (
      <motion.div 
        layoutId="nav-pill"
        className={`absolute inset-0 rounded-2xl ${theme === 'dark' ? 'bg-amber-500/10 shadow-[0_0_20px_rgba(139,115,85,0.1)]' : 'bg-amber-100/80 shadow-[0_0_20px_rgba(251,191,36,0.1)]'}`}
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-2">
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wide">{label}</span>
    </span>
  </button>
));

const SnippetBookmark = memo<{ 
  saved: boolean; 
  onClick: (e: React.MouseEvent) => void;
  theme: string;
}>(({ saved, onClick, theme }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-xl transition-all duration-300 ${saved ? 'bg-amber-500 text-white shadow-lg scale-110' : (theme === 'dark' ? 'bg-white/5 text-slate-300 hover:text-amber-500 hover:bg-white/10' : 'bg-black/5 text-slate-600 hover:text-amber-600 hover:bg-black/10')}`}
  >
    <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
  </button>
));

const HolyDove = memo<{ size?: number; className?: string; isSearching?: boolean }>(({ size = 24, className = "", isSearching = false }) => (
  <motion.div
    className={`relative flex items-center justify-center ${className}`}
    animate={isSearching ? { 
      y: [0, -15, 0],
    } : {}}
    transition={{ 
      duration: 4, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
  >
    {/* Divine Halo - Outer Ring */}
    <motion.div
      animate={{ 
        rotate: 360,
        opacity: [0.1, 0.3, 0.1],
        scale: [0.95, 1.05, 0.95]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute border border-amber-400/20 rounded-full"
      style={{ width: size * 2.5, height: size * 2.5 }}
    />

    {/* Divine Halo - Inner Ring */}
    <motion.div
      animate={{ 
        rotate: -360,
        opacity: [0.2, 0.4, 0.2],
        scale: [1.05, 0.95, 1.05]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute border border-amber-200/30 rounded-full"
      style={{ width: size * 1.8, height: size * 1.8 }}
    />

    {/* Light Rays */}
    <div className="absolute inset-0 flex items-center justify-center overflow-visible">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ rotate: i * 45, opacity: 0 }}
          animate={{ 
            opacity: [0, 0.15, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            delay: i * 0.4,
            ease: "easeInOut" 
          }}
          className="absolute w-1 bg-gradient-to-t from-transparent via-amber-400/40 to-transparent rounded-full"
          style={{ height: size * 3, transformOrigin: 'center' }}
        />
      ))}
    </div>

    {/* Multi-layered Divine Glow */}
    <motion.div
      animate={{ 
        scale: [1, 1.5, 1],
        opacity: [0.3, 0.6, 0.3] 
      }}
      transition={{ duration: 3, repeat: Infinity }}
      className="absolute bg-amber-500/20 blur-3xl rounded-full"
      style={{ width: size * 2, height: size * 2 }}
    />
    <motion.div
      animate={{ 
        scale: [1.2, 0.8, 1.2],
        opacity: [0.2, 0.4, 0.2] 
      }}
      transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
      className="absolute bg-white/10 blur-2xl rounded-full"
      style={{ width: size * 1.5, height: size * 1.5 }}
    />
    
    <div className="relative z-10">
      <motion.div
        animate={isSearching ? { 
          rotateY: [0, 15, -15, 0],
          rotateX: [0, 10, -10, 0],
          scale: [1, 1.05, 1]
        } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Bird 
          size={size} 
          className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)] filter brightness-110" 
          strokeWidth={1.5}
        />
      </motion.div>
      
      {/* Refined Particles */}
      {isSearching && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                x: [0, (i - 2) * 20],
                y: [0, -30 - Math.random() * 20],
              }}
              transition={{ 
                duration: 2 + Math.random(), 
                repeat: Infinity, 
                delay: i * 0.5,
                ease: "easeOut"
              }}
              className="absolute left-1/2 top-1/2 w-1 h-1 bg-amber-200 rounded-full blur-[1px]"
            />
          ))}
        </div>
      )}
    </div>
  </motion.div>
));

const fonts = [
  { id: 'SolaimanLipi', name: 'সোলায়মান লিপি' },
  { id: 'Nikosh', name: 'নিকষ' },
  { id: 'Hind Siliguri', name: 'হিন্দ শিলিগুড়ি' },
  { id: 'Mukti', name: 'মুক্তি' },
  { id: 'Ananda', name: 'আনন্দ' },
  { id: 'Kalpurush', name: 'কালপুরুষ' },
  { id: 'SiyamRupali', name: 'সিয়াম রূপালী' },
  { id: 'AdorshoLipi', name: 'আদর্শ লিপি' },
  { id: 'Noto Sans Bengali', name: 'নোটো সান্স' }
];

const SPIRITUAL_SUGGESTIONS = [
  "গীতসংহিতা ২৩", "যোহন ৩:১৬", "১ করিন্থীয় ১৩", "রোমীয় ৮:২৮", 
  "যিশাইয় ৪০:৩১", "হিতোপদেশ ৩:৫-৬", "ফিলিপীয় ৪:১৩", "মথি ১১:২৮",
  "ঈশ্বরের ভালোবাসা", "শান্তি ও সান্ত্বনা", "ক্ষমা ও মুক্তি", "সুরক্ষা প্রার্থনা",
  "যীশু খ্রিস্টের জীবন", "বিশ্বাস ও ধৈর্য", "আশীর্বাদ ও অনুগ্রহ",
  "যোহন ১৪:৬", "গীতসংহিতা ৯১", "মথি ৬:৯-১৩"
];

export default function App() {
  // Auth & Sync hooks
  const { 
    user, 
    profile, 
    isLoading: authLoading, 
    isAuthenticated, 
    isAnonymous, 
    error: authError, 
    signInWithGoogle, 
    signInAnonymously, 
    signOut 
  } = useAuth();

  const { 
    syncStatus, 
    syncNow, 
    exportData, 
    importData, 
    clearLocalData 
  } = useSync(user?.id || null);

  const [activeView, setActiveView] = useState<View>('SEARCH');
  const [savedViewMode, setSavedViewMode] = useState<'VERSES' | 'SNIPPETS'>('VERSES');
  const [query, setQuery] = useState('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [highlightVerseNum, setHighlightVerseNum] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<VerseData | null>(null);
  const [savedVerses, setSavedVerses] = useState<VerseData[]>([]);
  const [savedSnippets, setSavedSnippets] = useState<SnippetData[]>([]);
  const [fontSize, setFontSize] = useState('base'); 
  const [fontFamily, setFontFamily] = useState('SolaimanLipi');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('sacred_word_theme');
    if (!stored) localStorage.setItem('sacred_word_theme', 'dark');
    return (stored === 'light' || stored === 'dark') ? stored : 'dark';
  });
  const [languageVersion, setLanguageVersion] = useState<'modern' | 'carey' | 'kitabul'>('modern');
  const [appLang, setAppLang] = useState<Language>('bn');
  const [error, setError] = useState('');
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isStartup, setIsStartup] = useState(true);
  const [startupExit, setStartupExit] = useState(false);
  
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterTheme, setFilterTheme] = useState<string | null>(null);
  const [newTagInputId, setNewTagInputId] = useState<string | null>(null);
  const [newTagValue, setNewTagValue] = useState('');
  const [dailyQuote, setDailyQuote] = useState<{ text: string; author: string } | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [readerMode, setReaderMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lightThemeColors, setLightThemeColors] = useState<ThemeColors | null>(null);
  const [lightThemePreset, setLightThemePreset] = useState<string>('default');
  const [userApiKey, setUserApiKey] = useState<string>('');

  // Login & Dashboard modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Pull to refresh states
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const suggestionRef = useRef<HTMLDivElement>(null);

  const t = translations[appLang];

  useEffect(() => {
    const storedVerses = localStorage.getItem('sacred_word_verses');
    if (storedVerses) {
      try { setSavedVerses(JSON.parse(storedVerses)); } catch (e) { setSavedVerses([]); }
    }
    const storedSnippets = localStorage.getItem('sacred_word_snippets');
    if (storedSnippets) {
      try { setSavedSnippets(JSON.parse(storedSnippets)); } catch (e) { setSavedSnippets([]); }
    }
    const storedFontSize = localStorage.getItem('sacred_word_font_size');
    if (storedFontSize) setFontSize(storedFontSize);
    const storedAppLang = localStorage.getItem('sacred_word_app_lang');
    if (storedAppLang) setAppLang(storedAppLang as Language);
    const storedFont = localStorage.getItem('sacred_word_font');
    if (storedFont) setFontFamily(storedFont);
    const storedLangVersion = localStorage.getItem('sacred_word_lang_version');
    if (storedLangVersion) setLanguageVersion(storedLangVersion as any);
    const storedHistory = localStorage.getItem('sacred_word_search_history');
    if (storedHistory) {
      try { setSearchHistory(JSON.parse(storedHistory)); } catch (e) { setSearchHistory([]); }
    }
    const storedApiKey = localStorage.getItem('sacred_word_user_api_key');
    if (storedApiKey) setUserApiKey(storedApiKey);

    // Startup animation timer
    const timer = setTimeout(() => {
      setStartupExit(true);
      setTimeout(() => setIsStartup(false), 400);
    }, 1200);

    const fetchQuote = async () => {
      try {
        const quote = await geminiService.fetchDailyQuote(appLang);
        setDailyQuote(quote);
      } catch (e) {
        console.error("Failed to fetch daily quote", e);
      }
    };
    fetchQuote();

    return () => {
      clearTimeout(timer);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [appLang]);

  // Auth handlers
  const handleOpenLogin = useCallback(() => {
    setShowLoginModal(true);
  }, []);

  const handleCloseLogin = useCallback(() => {
    setShowLoginModal(false);
  }, []);

  const handleGoogleSignIn = useCallback(async () => {
    await signInWithGoogle();
  }, [signInWithGoogle]);

  const handleAnonymousSignIn = useCallback(async () => {
    await signInAnonymously();
    setShowLoginModal(false);
  }, [signInAnonymously]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setShowDashboard(false);
  }, [signOut]);

  const handleOpenDashboard = useCallback(() => {
    setShowDashboard(true);
  }, []);

  const handleCloseDashboard = useCallback(() => {
    setShowDashboard(false);
  }, []);

  const handleSync = useCallback(async () => {
    await syncNow();
  }, [syncNow]);

  const handleExportData = useCallback(async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sacred_word_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [exportData]);

  const handleImportData = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event: any) => {
        const success = await importData(event.target.result);
        if (success) {
          // Reload saved data
          const storedVerses = localStorage.getItem('sacred_word_verses');
          if (storedVerses) {
            try { setSavedVerses(JSON.parse(storedVerses)); } catch (e) {}
          }
          const storedSnippets = localStorage.getItem('sacred_word_snippets');
          if (storedSnippets) {
            try { setSavedSnippets(JSON.parse(storedSnippets)); } catch (e) {}
          }
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [importData]);

  const handleClearData = useCallback(async () => {
    if (confirm('সতর্কতা: স্থানীয় ডেটা মুছে যাবে। আপনি কি নিশ্চিত?')) {
      await clearLocalData();
      setSavedVerses([]);
      setSavedSnippets([]);
    }
  }, [clearLocalData]);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  useEffect(() => {
    const storedColors = getThemeColorsFromStorage();
    if (storedColors) {
      setLightThemeColors(storedColors);
      setLightThemePreset('custom');
      applyLightThemeColors(storedColors);
    }
  }, []);

  useEffect(() => {
    if (lightThemeColors && lightThemePreset === 'custom') {
      applyLightThemeColors(lightThemeColors);
      saveThemeColorsToStorage(lightThemeColors);
    }
  }, [lightThemeColors, lightThemePreset]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font', `'${fontFamily}', 'Noto Sans Bengali', 'Hind Siliguri', system-ui, -apple-system, sans-serif`);
  }, [fontFamily]);

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;
    
    if (distance > 0) {
      const dampedDistance = Math.min(distance * 0.4, 100);
      setPullDistance(dampedDistance);
    } else {
      isPulling.current = false;
      setPullDistance(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance > 70) {
      triggerRefresh();
    } else {
      setPullDistance(0);
    }
  };

  const triggerRefresh = useCallback(() => {
    setIsRefreshing(true);
    setPullDistance(70);

    setTimeout(() => {
      if (activeView === 'SEARCH') {
        setQuery('');
        setCurrentVerse(null);
        setError('');
        setState(AppState.IDLE);
      } else if (activeView === 'SAVED') {
        setFilterTag(null);
        setFilterTheme(null);
      }
      setIsRefreshing(false);
      setPullDistance(0);
    }, 1000);
  }, [activeView]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveToLocal = (verses: VerseData[]) => {
    localStorage.setItem('sacred_word_verses', JSON.stringify(verses));
    setSavedVerses(verses);
  };

  const toggleSnippet = (snippet: Omit<SnippetData, 'id' | 'timestamp'>) => {
    const existing = savedSnippets.find(s => s.content === snippet.content && s.type === snippet.type);
    if (existing) {
      const updated = savedSnippets.filter(s => s.id !== existing.id);
      setSavedSnippets(updated);
      localStorage.setItem('sacred_word_snippets', JSON.stringify(updated));
    } else {
      const newSnippet: SnippetData = {
        ...snippet,
        id: Math.random().toString(36).substring(2, 11),
        timestamp: Date.now()
      };
      const updated = [newSnippet, ...savedSnippets];
      setSavedSnippets(updated);
      localStorage.setItem('sacred_word_snippets', JSON.stringify(updated));
    }
  };

  const isSnippetSaved = (content: string, type: string) => {
    return !!savedSnippets.find(s => s.content === content && s.type === type);
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    localStorage.setItem('sacred_word_font_size', size);
  };

  const handleFontChange = (font: string) => {
    setFontFamily(font);
    localStorage.setItem('sacred_word_font', font);
  };

  const handleAppLangChange = (lang: Language) => {
    setAppLang(lang);
    localStorage.setItem('sacred_word_app_lang', lang);
  };

  const handleLangVersionChange = (version: 'modern' | 'carey' | 'kitabul') => {
    setLanguageVersion(version);
    localStorage.setItem('sacred_word_lang_version', version);
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    localStorage.setItem('sacred_word_theme', newTheme);
  };

  // Memoized Fuse instances for better performance
  const indexFuse = useMemo(() => new Fuse(BENGALI_SEARCH_INDEX, {
    keys: [
      { name: 'reference', weight: 0.4 },
      { name: 'themes', weight: 0.3 },
      { name: 'text', weight: 0.3 }
    ],
    threshold: 0.3,
    getFn: (obj: any, path: string | string[]) => {
      const val = obj[path as string];
      if (Array.isArray(val)) return val.map(v => normalizeBengali(v));
      return normalizeBengali(val as string);
    }
  }), []);

  const localFuse = useMemo(() => new Fuse(savedVerses, {
    keys: [
      { name: 'reference', weight: 0.4 },
      { name: 'text', weight: 0.3 },
      { name: 'keyThemes', weight: 0.2 },
      { name: 'tags', weight: 0.1 }
    ],
    threshold: 0.3,
    includeScore: true,
    getFn: (obj: any, path: string | string[]) => {
      const val = obj[path as string];
      if (Array.isArray(val)) return val.map(v => normalizeBengali(v));
      return normalizeBengali(val as string);
    }
  }), [savedVerses]);

  // Debounced search for better performance
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSearch = useCallback(async (searchQuery?: string) => {
    // Cancel previous search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    let finalQuery = (typeof searchQuery === 'string' ? searchQuery : query).trim();
    if (!finalQuery || state === AppState.SEARCHING) return;

    // Transliterate if it looks like Romanized Bengali
    const isRomanizedBengali = /^[a-zA-Z0-9\s:,\-.]+$/.test(finalQuery) && appLang === 'bn';
    if (isRomanizedBengali) {
      const transliterated = transliterateToBengali(finalQuery);
      if (transliterated !== finalQuery) {
        finalQuery = transliterated;
      }
    }

    if (typeof searchQuery === 'string') {
      setQuery(finalQuery);
    }
    
    setShowSuggestions(false);
    setState(AppState.SEARCHING);
    setError('');
    setCurrentVerse(null);
    setHighlightVerseNum(false);
    
    // Normalize query for better matching
    const normalizedQuery = normalizeBengali(finalQuery);

    // 1. Search in BENGALI_SEARCH_INDEX
    indexFuse.search(normalizedQuery);

    // 2. Fuzzy search in saved verses
    const localResults = localFuse.search(normalizedQuery);
    if (localResults.length > 0 && localResults[0].score! < 0.15) {
      searchTimeoutRef.current = setTimeout(() => {
        setCurrentVerse(localResults[0].item);
        setState(AppState.IDLE);
        setHighlightVerseNum(true);
        setTimeout(() => setHighlightVerseNum(false), 5000);
      }, 300);
      return;
    }
    
    try {
      abortControllerRef.current = new AbortController();
      const data = await geminiService.fetchVerseExplanation(finalQuery, languageVersion, appLang);
      setCurrentVerse(data);
      setHighlightVerseNum(true);
      setTimeout(() => setHighlightVerseNum(false), 5000);
      
      // Update search history
      const updatedHistory = [finalQuery, ...searchHistory.filter(h => h !== finalQuery)].slice(0, 10);
      setSearchHistory(updatedHistory);
      localStorage.setItem('sacred_word_search_history', JSON.stringify(updatedHistory));

      setState(AppState.IDLE);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error(err);
      setError(err.message || 'সংযোগ বিচ্ছিন্ন হয়েছে। পুনরায় চেষ্টা করুন।');
      setState(AppState.ERROR);
    }
  }, [query, state, appLang, languageVersion, searchHistory, indexFuse, localFuse]);

  const filteredAutoSuggestions = useMemo(() => {
    // Combine search history, predefined suggestions, themes/references from saved verses, and the new index
    const savedThemes = savedVerses.flatMap(v => v.keyThemes || []);
    const savedRefs = savedVerses.map(v => v.reference);
    const indexRefs = BENGALI_SEARCH_INDEX.map(v => v.reference);
    const indexThemes = BENGALI_SEARCH_INDEX.flatMap(v => v.themes);
    
    const combinedSuggestions = Array.from(new Set([
      ...searchHistory, 
      ...t.suggestions,
      ...savedThemes,
      ...savedRefs,
      ...indexRefs,
      ...indexThemes
    ]));
    
    if (!query.trim()) return combinedSuggestions.slice(0, 10);
    
    const fuse = new Fuse(combinedSuggestions, {
      includeScore: true,
      threshold: 0.4,
      distance: 100,
      getFn: (item) => normalizeBengali(item)
    });
    
    const results = fuse.search(normalizeBengali(query));
    return results.map(result => result.item).slice(0, 10);
  }, [query, searchHistory, t.suggestions, savedVerses]);

  const toggleSave = () => {
    if (!currentVerse) return;
    const isSaved = savedVerses.find(v => v.reference === currentVerse.reference);
    if (isSaved) {
      saveToLocal(savedVerses.filter(v => v.reference !== currentVerse.reference));
    } else {
      saveToLocal([{ ...currentVerse, tags: [] }, ...savedVerses]);
    }
  };

  const addTagToVerse = (verseId: string, tag: string) => {
    const cleanTag = tag.trim();
    if (!cleanTag) return;
    const updated = savedVerses.map(v => {
      if (v.id === verseId) {
        const existingTags = v.tags || [];
        if (!existingTags.includes(cleanTag)) {
          return { ...v, tags: [...existingTags, cleanTag] };
        }
      }
      return v;
    });
    saveToLocal(updated);
    setNewTagInputId(null);
    setNewTagValue('');
  };

  const removeTagFromVerse = (verseId: string, tag: string) => {
    const updated = savedVerses.map(v => {
      if (v.id === verseId) {
        return { ...v, tags: (v.tags || []).filter(t => t !== tag) };
      }
      return v;
    });
    saveToLocal(updated);
  };

  const uniqueTags = useMemo(() => {
    const allTags = savedVerses.flatMap(v => v.tags || []);
    return Array.from(new Set(allTags));
  }, [savedVerses]);

  const uniqueThemes = useMemo(() => {
    const allThemes = savedVerses.flatMap(v => v.keyThemes || []);
    return Array.from(new Set(allThemes));
  }, [savedVerses]);

  const filteredVerses = useMemo(() => {
    return savedVerses.filter(v => {
      const matchesTag = !filterTag || (v.tags || []).includes(filterTag);
      const matchesTheme = !filterTheme || (v.keyThemes || []).includes(filterTheme);
      return matchesTag && matchesTheme;
    });
  }, [savedVerses, filterTag, filterTheme]);

  const exportSavedVerses = () => {
    if (savedVerses.length === 0) return;
    
    let content = "পবিত্র বানী - সংরক্ষিত পদসমূহ\n";
    content += "====================================\n\n";
    
    savedVerses.forEach((v, index) => {
      content += `${index + 1}. ${v.reference}\n`;
      content += `পদ: ${v.text}\n`;
      if (v.tags && v.tags.length > 0) {
        content += `ট্যাগ: ${v.tags.join(', ')}\n`;
      }
      content += `থিম: ${v.keyThemes.join(', ')}\n`;
      content += "\n------------------------------------\n\n";
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sacred_Word_Saved_Verses_${new Date().toLocaleDateString()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    });
  };

  const handleShare = async () => {
    if (!currentVerse) return;
    
    let shareText = `📜 ${currentVerse.reference}\n\n"${currentVerse.text}"\n\n`;
    
    const labels = t.versionLabels[languageVersion];
    shareText += `✨ ${labels.theologicalMeaning}:\n${currentVerse.explanation.theologicalMeaning}\n\n`;
    shareText += `🏛️ ${labels.historicalContext}:\n${currentVerse.explanation.historicalContext}\n\n`;
    shareText += `💡 ${labels.practicalApplication}:\n${currentVerse.explanation.practicalApplication}\n\n`;
    shareText += `🦋 ${labels.metaphoricalMeaning}:\n${currentVerse.explanation.metaphoricalMeaning}\n\n`;
    
    if (currentVerse.explanation.meditationPoint) {
      shareText += `🧘 ${labels.meditationPoint}:\n${currentVerse.explanation.meditationPoint}\n\n`;
    }
    
    if (currentVerse.explanation.originalInsight) {
      shareText += `🔍 ${labels.originalInsight}:\n${currentVerse.explanation.originalInsight}\n\n`;
    }
    
    if (currentVerse.prayer) {
      shareText += `🙏 ${labels.prayer}:\n${currentVerse.prayer}\n\n`;
    }
    
    if (currentVerse.explanation.crossReferences && currentVerse.explanation.crossReferences.length > 0) {
      shareText += `🔗 ${labels.crossReferences}:\n${currentVerse.explanation.crossReferences.join(', ')}\n\n`;
    }
    
    shareText += `--- ${t.appName} অ্যাপ থেকে সংগৃহীত ---`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t.appName} - ${currentVerse.reference}`,
          text: shareText,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const renderVerseText = (text: string, color: string = 'amber', isExplanation: boolean = false) => {
    const toArabic = (num: string) => num.replace(/[০-৯]/g, (d: string) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
    const parts = text.split(/(\[[\d০-৯]+\])/g);
    
    const colorClasses: Record<string, string> = {
      amber: 'bg-amber-600 border-amber-400/30 shadow-[0_0_25px_rgba(217,119,6,0.4)] hover:bg-amber-500',
      blue: 'bg-blue-600 border-blue-400/30 shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:bg-blue-500',
      emerald: 'bg-emerald-600 border-emerald-400/30 shadow-[0_0_25px_rgba(5,150,105,0.4)] hover:bg-emerald-500',
      rose: 'bg-rose-600 border-rose-400/30 shadow-[0_0_25px_rgba(225,29,72,0.4)] hover:bg-rose-500',
      indigo: 'bg-indigo-600 border-indigo-400/30 shadow-[0_0_25px_rgba(79,70,229,0.4)] hover:bg-indigo-500',
      violet: 'bg-violet-600 border-violet-400/30 shadow-[0_0_25px_rgba(124,58,237,0.4)] hover:bg-violet-500',
    };

    const selectedColor = colorClasses[color] || colorClasses.amber;

    if (isExplanation && parts.some(p => p.match(/\[(\d+)\]/))) {
      const blocks: React.ReactNode[] = [];
      let currentContent: React.ReactNode[] = [];
      let currentVerseNum: string | null = null;
      
      parts.forEach((part, i) => {
        const match = part.match(/\[([\d০-৯]+)\]/);
        if (match) {
          if (currentContent.length > 0) {
            blocks.push(
              <motion.div 
                key={`block-${i}`} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 last:mb-0 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/verse"
              >
                {currentContent}
              </motion.div>
            );
            currentContent = [];
          }
          currentVerseNum = match[1];
          currentContent.push(
            <motion.span 
              key={`num-${i}`} 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
              className={`inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 ${selectedColor} text-white rounded-full text-[10px] md:text-sm font-black mr-3 align-middle border-2 shadow-lg group-hover/verse:scale-110 transition-transform ${highlightVerseNum ? 'ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]' : ''}`}
            >
              {toArabic(currentVerseNum)}
            </motion.span>
          );
        } else if (part.trim()) {
          currentContent.push(part);
        }
      });
      
      if (currentContent.length > 0) {
        blocks.push(
          <motion.div 
            key="block-last" 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 last:mb-0 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/verse"
          >
            {currentContent}
          </motion.div>
        );
      }
      
      return <div className="space-y-2">{blocks}</div>;
    }

    return parts.map((part, i) => {
      const match = part.match(/\[([\d০-৯]+)\]/);
      if (match) {
        return (
          <motion.span 
            key={i} 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3, delay: i * 0.3 }}
            className={`inline-flex items-center justify-center w-6 h-6 md:w-10 md:h-10 ${selectedColor} text-white rounded-full text-[10px] md:text-lg font-black mx-1.5 mb-1.5 align-middle border-2 transition-all hover:scale-110 ${highlightVerseNum ? 'ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]' : ''}`}
          >
            {toArabic(match[1])}
          </motion.span>
        );
      }
      return part;
    });
  };

  const isLongText = currentVerse && currentVerse.text.length > 250;
  const mainTextSizeClass = {
    sm: isLongText ? 'text-sm md:text-base' : 'text-base md:text-lg',
    base: isLongText ? 'text-base md:text-lg lg:text-xl' : 'text-lg md:text-xl lg:text-2xl',
    lg: isLongText ? 'text-lg md:text-xl lg:text-2xl' : 'text-xl md:text-2xl lg:text-3xl',
    xl: isLongText ? 'text-xl md:text-2xl lg:text-3xl' : 'text-2xl md:text-3xl lg:text-4xl'
  }[fontSize as keyof typeof mainTextSizeClass] || (isLongText ? 'text-base md:text-lg lg:text-xl' : 'text-lg md:text-xl lg:text-2xl');

  const explanationSizeClass = {
    sm: 'text-sm md:text-base',
    base: 'text-lg md:text-xl',
    lg: 'text-xl md:text-2xl',
    xl: 'text-2xl md:text-3xl'
  }[fontSize as keyof typeof explanationSizeClass] || 'text-lg md:text-xl';

  const isCurrentVerseSaved = currentVerse ? !!savedVerses.find(v => v.reference === currentVerse.reference) : false;

  if (isStartup) {
    return (
      <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center ${theme === 'dark' ? 'bg-[#0a0a05]' : 'bg-[#fafaf9]'} transition-all duration-500 ease-in-out ${startupExit ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.03, 0.06, 0.03],
              rotate: [0, 25, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] bg-amber-500/15 blur-[100px] rounded-full"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.02, 0.05, 0.02],
              rotate: [0, -20, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] bg-amber-700/15 blur-[80px] rounded-full"
          />
          
          {/* Floating light particles */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * 100 - 50 + '%', 
                y: Math.random() * 100 - 50 + '%',
                opacity: 0 
              }}
              animate={{ 
                y: ['-10%', '110%'],
                opacity: [0, 0.2, 0],
                scale: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 4 + Math.random() * 3, 
                repeat: Infinity, 
                delay: Math.random() * 3,
                ease: "linear"
              }}
              className="absolute w-1 h-1 bg-amber-400/60 rounded-full blur-[1px]"
            />
          ))}
        </div>
        
        <div className="relative mb-12">
          {/* Concentric pulsing rings */}
          {[1, 2].map((i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.3 + i * 0.15, 1], 
                opacity: [0.08, 0, 0.08] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3, 
                delay: i * 0.6,
                ease: "easeOut"
              }}
              className="absolute inset-0 border border-amber-500/20 rounded-full"
              style={{ margin: `-${i * 15}px` }}
            />
          ))}
          
          <motion.div 
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 120, 
              damping: 18,
              duration: 0.8 
            }}
            className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 rounded-[2rem] flex items-center justify-center shadow-[0_0_60px_rgba(139,115,85,0.4)] relative overflow-hidden group"
          >
            {/* Shimmer effect */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 0.5 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
            />
            <Cross className="text-white w-12 h-12 md:w-16 md:h-16 drop-shadow-xl" />
          </motion.div>
        </div>

        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-6xl font-black text-amber-100 leading-none tracking-tighter bn-serif"
          >
            পবিত্র <span className="text-amber-600 relative inline-block">
              বানী
              <motion.span 
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute bottom-1 left-0 h-1 bg-amber-500/20 rounded-full"
              />
            </span>
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-center justify-center gap-3"
          >
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: 30 }} 
              transition={{ delay: 0.8, duration: 0.6 }}
              className="h-px bg-gradient-to-r from-transparent to-amber-500/40" 
            />
            <p className="text-amber-200/70 font-bold tracking-wide text-[10px] md:text-xs uppercase bn-serif">Sacred Word</p>
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: 30 }} 
              transition={{ delay: 0.8, duration: 0.6 }}
              className="h-px bg-gradient-to-l from-transparent to-amber-500/40" 
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen flex flex-col relative transition-all duration-300 ease-in-out overflow-x-hidden animate-in fade-in duration-500 no-scrollbar`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 flex justify-center z-[100] pointer-events-none transition-transform duration-300"
        style={{ transform: `translateY(${pullDistance - 50}px)`, opacity: pullDistance / 70 }}
      >
        <div className={`w-12 h-12 rounded-full divine-glass flex items-center justify-center shadow-2xl border-amber-500/30 ${isRefreshing ? 'animate-spin' : ''}`}>
          {isRefreshing ? <Loader2 className="animate-spin text-amber-500" size={20} /> : <Cross className="text-amber-500" size={20} />}
        </div>
      </div>

      {/* Atmospheric Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[80vh] md:w-[80vw] md:h-[600px] ${theme === 'dark' ? 'bg-amber-900/10' : 'bg-amber-100/80'} blur-[100px] rounded-full`}
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -30, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className={`absolute bottom-0 right-0 w-[60vw] h-[60vh] ${theme === 'dark' ? 'bg-olive-900/10' : 'bg-amber-50/80'} blur-[120px] rounded-full`}
        />
      </div>

      <header className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-6 flex flex-col md:flex-row md:justify-between items-center gap-4 z-20">
        {/* Desktop Logo - Left Side */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden md:flex items-center gap-3 md:gap-5 flex-shrink-0"
        >
          <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(139,115,85,0.3)]">
            <Cross className="text-white w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className={`text-2xl md:text-4xl font-black ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900'} leading-none bn-serif tracking-tight transition-colors duration-300`}>
              {t.appName.split(' ')[0]} <span className="text-divine-gold">{t.appName.split(' ')[1] || ''}</span>
            </h1>
            <p className={`text-[10px] md:text-[14px] ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'} font-bold mt-1 md:mt-2 bn-serif transition-colors duration-300`}>{t.collectionSub}</p>
          </div>
        </motion.div>
        
        {/* Desktop Navigation - Right Side */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden md:flex items-center gap-3 md:gap-4 flex-shrink-0"
        >
          {/* Sync Status (only when authenticated) */}
          {isAuthenticated && (
            <SyncIndicator
              isSyncing={syncStatus.isSyncing}
              lastSyncTime={syncStatus.lastSyncTime}
              pendingChanges={syncStatus.pendingChanges}
              onClick={handleOpenDashboard}
              compact
              theme={theme}
            />
          )}
          
          {/* Login Button (when not authenticated) */}
          {!isAuthenticated && !authLoading && (
            <button
              onClick={handleOpenLogin}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                theme === 'dark'
                  ? 'bg-amber-500 hover:bg-amber-400 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              <User size={18} />
              <span>লগইন</span>
            </button>
          )}
          
          {/* User Avatar (when authenticated) */}
          {isAuthenticated && (
            <UserAvatar
              profile={profile}
              isAnonymous={isAnonymous}
              onClick={handleOpenDashboard}
              theme={theme}
            />
          )}
          
          <div className="divine-glass px-2 py-2 rounded-3xl flex items-center gap-1">
            <NavItem icon={<Search size={18} />} label={t.navSearch} active={activeView === 'SEARCH'} onClick={() => setActiveView('SEARCH')} theme={theme} />
            <NavItem icon={<Bookmark size={18} />} label={t.navSaved} active={activeView === 'SAVED'} onClick={() => setActiveView('SAVED')} theme={theme} />
            <NavItem icon={<Settings size={18} />} label={t.navSettings} active={activeView === 'SETTINGS'} onClick={() => setActiveView('SETTINGS')} theme={theme} />
          </div>
        </motion.div>
        
        {/* Mobile Header - Right side (after hamburger) */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex md:hidden items-center justify-end gap-3 flex-1 pr-16"
        >
          {/* User Avatar or Login Button (Mobile) */}
          {isAuthenticated ? (
            <UserAvatar
              profile={profile}
              isAnonymous={isAnonymous}
              onClick={handleOpenDashboard}
              theme={theme}
            />
          ) : !authLoading && (
            <button
              onClick={handleOpenLogin}
              className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${
                theme === 'dark'
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400'
                  : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-600'
              }`}
            >
              <User size={20} />
            </button>
          )}
          
          <div className="text-right">
            <h1 className={`text-lg font-black ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900'} leading-none bn-serif tracking-tight transition-colors duration-300`}>
              {t.appName.split(' ')[0]} <span className="text-divine-gold">{t.appName.split(' ')[1] || ''}</span>
            </h1>
            <p className={`text-[9px] ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'} font-bold bn-serif transition-colors duration-300`}>
              {t.collectionSub}
            </p>
          </div>
        </motion.div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 pb-8 md:pb-10 relative z-10">
        {activeView === 'SEARCH' && (
          <div className="space-y-8 md:space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-300">
            <div className="max-w-4xl mx-auto mt-2 md:mt-8 relative" ref={suggestionRef}>
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/20 to-amber-300/10 rounded-[1.5rem] md:rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
                <div className="relative">
                  <input 
                    value={query} 
                    onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={t.searchPlaceholder}
                    className={`w-full ${theme === 'dark' ? 'bg-slate-900/60' : 'bg-white/95'} backdrop-blur-xl border ${theme === 'dark' ? 'border-white/10' : 'border-amber-200/50'} pl-5 pr-20 sm:pr-24 md:pl-10 md:pr-64 py-4 sm:py-5 md:py-8 rounded-[1.5rem] md:rounded-[2.5rem] text-base sm:text-lg md:text-2xl outline-none focus:ring-2 ring-amber-500/50 transition-all duration-300 ${theme === 'dark' ? 'placeholder-slate-400 text-amber-50' : 'placeholder-amber-400/60 text-slate-800'} font-bold shadow-2xl md:shadow-3xl bn-serif ${theme === 'light' ? 'shadow-amber-100/50' : ''}`}
                  />
                  <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 md:gap-2">
                    {query && (
                      <button 
                        type="button"
                        onClick={() => { setQuery(''); setShowSuggestions(true); }}
                        className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center text-slate-300 hover:text-amber-500 transition-colors rounded-full"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                    <button 
                      type="submit"
                      disabled={state === AppState.SEARCHING}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-black px-4 md:px-12 py-3 md:py-5 rounded-full shadow-lg transition-all flex items-center gap-2 md:gap-3 disabled:opacity-40 active:scale-95 group/btn overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform"></div>
                      {state === AppState.SEARCHING ? <HolyDove size={20} isSearching={true} /> : <Search size={20} />}
                      <span className="relative z-10 hidden sm:inline text-sm md:text-base">সার্চ</span>
                    </button>
                  </div>
                </div>
              </form>

              {showSuggestions && filteredAutoSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-3 md:mt-4 divine-glass rounded-[1.5rem] md:rounded-[2rem] p-3 md:p-4 shadow-3xl z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center px-4 py-2">
                    <p className="text-[9px] md:text-[10px] font-black uppercase tracking-wide text-amber-600/60">প্রস্তাবিত বিষয়সমূহ</p>
                    {searchHistory.length > 0 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSearchHistory([]); localStorage.removeItem('sacred_word_search_history'); }}
                        className="text-[8px] md:text-[9px] font-black uppercase text-rose-400/70 hover:text-rose-500 transition-colors"
                      >
                        ইতিহাস মুছুন
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1 md:mt-2">
                    {filteredAutoSuggestions.map((suggestion, idx) => {
                      const isHistory = searchHistory.includes(suggestion);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSearch(suggestion)}
                          className={`text-left px-4 md:px-6 py-3 md:py-4 rounded-xl transition-all duration-300 ${theme === 'dark' ? 'hover:bg-white/5 text-amber-50' : 'hover:bg-black/5 text-slate-800'} font-bold bn-serif flex items-center justify-between group text-sm md:text-base`}
                        >
                          <div className="flex items-center gap-3 md:gap-4">
                            {isHistory ? <History className="text-amber-500/40 group-hover:text-amber-500 transition-colors" size={14} /> : <Search className="text-amber-500/40 group-hover:text-amber-500 transition-colors" size={14} />}
                            {suggestion}
                          </div>
                          <ArrowRight className="text-amber-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" size={12} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {state === AppState.SEARCHING && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center py-16 md:py-24 gap-6 md:gap-8"
              >
                <div className="relative w-24 h-24 md:w-32 md:h-32">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-amber-500/10 rounded-full"
                  />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-4 border-transparent border-t-amber-500 rounded-full shadow-[0_0_20px_rgba(139,115,85,0.2)]"
                  />
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <HolyDove size={48} isSearching={true} />
                  </motion.div>
                </div>
                <div className="text-center space-y-3 md:space-y-4">
                  <h3 className={`text-2xl md:text-4xl font-black ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900'} bn-serif transition-colors duration-300`}>{t.searching}</h3>
                  <div className="flex justify-center gap-2 pt-2">
                    {[0, 1, 2].map(i => (
                      <motion.span 
                        key={i}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 bg-amber-500 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {state === AppState.ERROR && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto divine-glass p-8 md:p-16 rounded-[2rem] md:rounded-[4rem] text-center border-rose-500/20 shadow-2xl"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6 md:mb-8 shadow-inner">
                  <CircleAlert size={32} />
                </div>
                <h3 className={`text-xl md:text-3xl font-black ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} mb-3 md:mb-4 bn-serif transition-colors duration-300`}>{t.errorTitle}</h3>
                <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} text-base md:text-lg mb-8 md:mb-10 bn-serif text-center md:text-justify px-2`}>{error}</p>
                <button onClick={() => setState(AppState.IDLE)} className={`px-10 py-4 md:px-12 md:py-5 bg-rose-600 hover:bg-rose-500 rounded-2xl text-white font-black transition-all shadow-lg active:scale-95 text-sm md:text-base`}>{t.retry}</button>
              </motion.div>
            )}

            {currentVerse && state === AppState.IDLE && (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-5xl mx-auto space-y-8 md:space-y-16 pb-12 md:pb-24"
              >
                <div className="relative group">
                  <div className="absolute -inset-2 md:-inset-4 bg-amber-500/5 rounded-[2rem] md:rounded-[4rem] blur-xl md:blur-2xl group-hover:bg-amber-500/10 transition-all duration-300"></div>
                  <div className={`relative ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white/70'} backdrop-blur-3xl p-6 md:p-16 lg:p-20 rounded-[2rem] md:rounded-[4rem] border border-white/5 overflow-hidden text-center shadow-3xl transition-all duration-300 ${readerMode ? 'max-w-4xl mx-auto' : ''}`}>
                    <div className="flex flex-col md:flex-row md:justify-between items-center gap-6 mb-8 md:mb-12">
                      <div className="divine-glass px-4 py-2 rounded-xl flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wide text-amber-400/70">
                          {languageVersion === 'modern' ? t.modernVersion : languageVersion === 'carey' ? t.careyVersion : t.kitabulVersion}
                        </span>
                      </div>
                      <button 
                        onClick={() => setReaderMode(!readerMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-500 ${readerMode ? 'bg-amber-700 text-white border-amber-700 shadow-lg' : 'text-amber-700 border-amber-500/20 hover:border-amber-500/40'}`}
                      >
                        {readerMode ? <BookOpen size={14} /> : <Book size={14} />}
                        <span className="text-[10px] font-black uppercase tracking-wide">{readerMode ? 'সাধারণ মোড' : 'রিডার মোড'}</span>
                      </button>
                    </div>

                    <div className="mb-8 md:mb-12 relative px-2 md:px-8">
                      <h2 className={`${readerMode ? (isLongText ? 'text-2xl md:text-4xl' : 'text-3xl md:text-5xl') : mainTextSizeClass} font-normal ${theme === 'dark' ? 'text-amber-50' : 'text-body'} leading-relaxed bn-serif drop-shadow-sm max-w-4xl mx-auto relative z-10 text-justify transition-all duration-300`}>
                        {renderVerseText(currentVerse.text)}
                      </h2>
                    </div>
                    
                    <div className="inline-flex items-center gap-4 md:gap-6">
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0 0 rgba(251, 191, 36, 0)', '0 0 20px 5px rgba(251, 191, 36, 0.3)', '0 0 0 0 rgba(251, 191, 36, 0)'] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="hidden sm:flex w-3 h-3 bg-amber-500 rounded-full"
                      />
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="relative px-6 md:px-10 py-3 md:py-4 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full shadow-lg shadow-amber-500/30 border-2 border-amber-300/50"
                      >
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full opacity-0"
                          animate={{ opacity: [0, 0.3, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                        <p className={`relative z-10 text-amber-900 font-black tracking-wide md:tracking-wide text-base md:text-xl lg:text-2xl bn-serif drop-shadow-sm`}>{currentVerse.reference}</p>
                      </motion.div>
                      <motion.div 
                        animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0 0 rgba(251, 191, 36, 0)', '0 0 20px 5px rgba(251, 191, 36, 0.3)', '0 0 0 0 rgba(251, 191, 36, 0)'] }}
                        transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                        className="hidden sm:flex w-3 h-3 bg-amber-500 rounded-full"
                      />
                      <SnippetBookmark 
                        saved={isSnippetSaved(currentVerse.text, 'lyric')}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSnippet({
                            verseId: currentVerse.id,
                            reference: currentVerse.reference,
                            type: 'lyric',
                            content: currentVerse.text,
                            label: 'মূল পাঠ/লিরিক'
                          });
                        }}
                        theme={theme}
                      />
                    </div>
                  </div>
                </div>

                <div className={`grid grid-cols-1 ${readerMode ? 'md:grid-cols-1 max-w-4xl mx-auto' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6 md:gap-8`}>
                  <div className={`divine-card ${readerMode ? 'p-10 md:p-16' : 'p-8 md:p-10'} rounded-[2rem] md:rounded-[3rem] flex flex-col justify-between hover:border-amber-500/20 transition-all duration-300 group`}>
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-amber-700 shadow-inner group-hover:scale-110 transition-transform">
                            <Church size={24} />
                          </div>
                          {readerMode && <h4 className={`text-xl md:text-2xl font-black text-amber-400 bn-serif`}>{t.versionLabels[languageVersion].theologicalMeaning}</h4>}
                        </div>
                        <SnippetBookmark 
                          saved={isSnippetSaved(currentVerse.explanation.theologicalMeaning, 'insight')}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSnippet({
                              verseId: currentVerse.id,
                              reference: currentVerse.reference,
                              type: 'insight',
                              content: currentVerse.explanation.theologicalMeaning,
                              label: t.versionLabels[languageVersion].theologicalMeaning
                            });
                          }}
                          theme={theme}
                        />
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        {!readerMode && <h4 className={`text-lg md:text-xl font-black text-amber-400 bn-serif`}>{t.versionLabels[languageVersion].theologicalMeaning}</h4>}
                        <div className="h-0.5 w-10 bg-amber-500/20 rounded-full"></div>
                        <div className={`${readerMode ? 'text-lg md:text-xl' : explanationSizeClass} ${theme === 'dark' ? 'text-slate-300' : 'text-body'} leading-relaxed bn-serif font-medium text-justify transition-all duration-300`}>
                          {renderVerseText(currentVerse.explanation.theologicalMeaning, 'amber', true)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/5">
                       <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-wide ${theme === 'dark' ? 'text-amber-400/70' : 'text-amber-600/70'} flex items-center gap-2`}>
                         <Bookmark size={10} />
                         সূত্র: {currentVerse.explanation.theologicalReference}
                       </p>
                    </div>
                  </div>

                  <div className={`divine-card ${readerMode ? 'p-10 md:p-16' : 'p-8 md:p-10'} rounded-[2rem] md:rounded-[3rem] flex flex-col justify-between hover:border-blue-500/20 transition-all duration-300 group`}>
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                            <BookOpen size={24} />
                          </div>
                          {readerMode && <h4 className="text-xl md:text-2xl font-black text-amber-400 bn-serif">{t.versionLabels[languageVersion].historicalContext}</h4>}
                        </div>
                        <SnippetBookmark 
                          saved={isSnippetSaved(currentVerse.explanation.historicalContext, 'insight')}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSnippet({
                              verseId: currentVerse.id,
                              reference: currentVerse.reference,
                              type: 'insight',
                              content: currentVerse.explanation.historicalContext,
                              label: t.versionLabels[languageVersion].historicalContext
                            });
                          }}
                          theme={theme}
                        />
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        {!readerMode && <h4 className="text-lg md:text-xl font-black text-amber-400 bn-serif">{t.versionLabels[languageVersion].historicalContext}</h4>}
                        <div className="h-0.5 w-10 bg-blue-500/20 rounded-full"></div>
                        <div className={`${readerMode ? 'text-lg md:text-xl' : explanationSizeClass} ${theme === 'dark' ? 'text-slate-300' : 'text-body'} leading-relaxed bn-serif font-medium text-justify transition-all duration-300`}>
                          {renderVerseText(currentVerse.explanation.historicalContext, 'blue', true)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/5">
                       <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-wide ${theme === 'dark' ? 'text-blue-400/70' : 'text-blue-600/70'} flex items-center gap-2`}>
                         <Bookmark size={10} />
                         সূত্র: {currentVerse.explanation.historicalReference}
                       </p>
                    </div>
                  </div>

                  <div className={`divine-card ${readerMode ? 'p-10 md:p-16' : 'p-8 md:p-10'} rounded-[2rem] md:rounded-[3rem] flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300 group`}>
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform">
                            <Cross size={24} />
                          </div>
                          {readerMode && <h4 className="text-xl md:text-2xl font-black text-amber-400 bn-serif">{t.versionLabels[languageVersion].practicalApplication}</h4>}
                        </div>
                        <SnippetBookmark 
                          saved={isSnippetSaved(currentVerse.explanation.practicalApplication, 'insight')}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSnippet({
                              verseId: currentVerse.id,
                              reference: currentVerse.reference,
                              type: 'insight',
                              content: currentVerse.explanation.practicalApplication,
                              label: t.versionLabels[languageVersion].practicalApplication
                            });
                          }}
                          theme={theme}
                        />
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        {!readerMode && <h4 className="text-lg md:text-xl font-black text-amber-400 bn-serif">{t.versionLabels[languageVersion].practicalApplication}</h4>}
                        <div className="h-0.5 w-10 bg-emerald-500/20 rounded-full"></div>
                        <div className={`${readerMode ? 'text-lg md:text-xl' : explanationSizeClass} ${theme === 'dark' ? 'text-slate-300' : 'text-body'} leading-relaxed bn-serif font-medium text-justify transition-all duration-300`}>
                          {renderVerseText(currentVerse.explanation.practicalApplication, 'emerald', true)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/5">
                       <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-wide ${theme === 'dark' ? 'text-emerald-400/70' : 'text-emerald-600/70'} flex items-center gap-2`}>
                          <Bookmark size={10} />
                          সূত্র: {currentVerse.explanation.practicalReference}
                        </p>
                     </div>
                   </div>

                  <div className={`divine-card ${readerMode ? 'p-10 md:p-16' : 'p-8 md:p-10'} rounded-[2rem] md:rounded-[3rem] flex flex-col justify-between hover:border-violet-500/20 transition-all duration-300 group`}>
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-violet-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-violet-600 shadow-inner group-hover:scale-110 transition-transform">
                            <Bird size={24} />
                          </div>
                          {readerMode && <h4 className="text-xl md:text-2xl font-black text-amber-400 bn-serif">{t.versionLabels[languageVersion].metaphoricalMeaning}</h4>}
                        </div>
                        <SnippetBookmark 
                          saved={isSnippetSaved(currentVerse.explanation.metaphoricalMeaning, 'insight')}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSnippet({
                              verseId: currentVerse.id,
                              reference: currentVerse.reference,
                              type: 'insight',
                              content: currentVerse.explanation.metaphoricalMeaning,
                              label: t.versionLabels[languageVersion].metaphoricalMeaning
                            });
                          }}
                          theme={theme}
                        />
                      </div>
                      <div className="space-y-3 md:space-y-4">
                        {!readerMode && <h4 className="text-lg md:text-xl font-black text-amber-400 bn-serif">{t.versionLabels[languageVersion].metaphoricalMeaning}</h4>}
                        <div className="h-0.5 w-10 bg-violet-500/20 rounded-full"></div>
                        <div className={`${readerMode ? 'text-lg md:text-xl' : explanationSizeClass} ${theme === 'dark' ? 'text-slate-300' : 'text-body'} leading-relaxed bn-serif font-medium italic text-justify transition-all duration-300`}>
                          {renderVerseText(currentVerse.explanation.metaphoricalMeaning, 'violet', true)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/5">
                       <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-wide ${theme === 'dark' ? 'text-violet-400/70' : 'text-violet-600/70'} flex items-center gap-2`}>
                          <Bookmark size={10} />
                          সূত্র: {currentVerse.explanation.metaphoricalReference}
                        </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="divine-card p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border-violet-500/10 hover:border-violet-500/30 transition-all duration-300 group">
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center text-violet-600 group-hover:rotate-12 transition-transform">
                          <LinkIcon size={20} />
                        </div>
                        <h4 className="text-lg font-black text-amber-400 bn-serif">{t.versionLabels[languageVersion].crossReferences}</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentVerse.explanation.crossReferences.map((ref, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleSearch(ref)}
                            className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] md:text-xs font-medium text-amber-800 dark:text-amber-200 bn-serif hover:bg-amber-500/25 hover:border-amber-500/40 hover:text-amber-900 dark:hover:text-amber-100 transition-all cursor-pointer active:scale-95"
                          >
                            {ref}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`divine-card ${readerMode ? 'p-10 md:p-16' : 'p-8 md:p-10'} rounded-[2rem] md:rounded-[3rem] border-rose-500/10 hover:border-rose-500/30 transition-all duration-300 group`}>
                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                            <Lightbulb size={20} />
                          </div>
                          <h4 className={`${readerMode ? 'text-xl md:text-2xl' : 'text-lg'} font-black text-amber-400 bn-serif`}>{t.versionLabels[languageVersion].meditationPoint}</h4>
                        </div>
                        <SnippetBookmark 
                          saved={isSnippetSaved(currentVerse.explanation.meditationPoint, 'insight')}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSnippet({
                              verseId: currentVerse.id,
                              reference: currentVerse.reference,
                              type: 'insight',
                              content: currentVerse.explanation.meditationPoint,
                              label: t.versionLabels[languageVersion].meditationPoint
                            });
                          }}
                          theme={theme}
                        />
                      </div>
                      <div className={`${readerMode ? 'text-lg md:text-xl' : explanationSizeClass} ${theme === 'dark' ? 'text-slate-300' : 'text-body'} leading-relaxed bn-serif font-medium italic transition-all duration-300`}>
                        {renderVerseText(currentVerse.explanation.meditationPoint, 'rose', true)}
                      </div>
                    </div>
                  </div>
                </div>

                {currentVerse.explanation.originalInsight && (
                  <div className={`divine-glass ${readerMode ? 'p-10 md:p-16 max-w-4xl mx-auto' : 'p-8 md:p-10'} rounded-[2rem] md:rounded-[3rem] border-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300`}>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600">
                          <Languages size={20} />
                        </div>
                        <h4 className={`${readerMode ? 'text-xl md:text-2xl' : 'text-lg'} font-black text-amber-400 bn-serif`}>{t.versionLabels[languageVersion].originalInsight}</h4>
                      </div>
                      <SnippetBookmark 
                        saved={isSnippetSaved(currentVerse.explanation.originalInsight || '', 'insight')}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSnippet({
                            verseId: currentVerse.id,
                            reference: currentVerse.reference,
                            type: 'insight',
                            content: currentVerse.explanation.originalInsight || '',
                            label: t.versionLabels[languageVersion].originalInsight
                          });
                        }}
                        theme={theme}
                      />
                    </div>
                    <div className={`${readerMode ? 'text-lg md:text-xl' : explanationSizeClass} ${theme === 'dark' ? 'text-slate-300' : 'text-body'} leading-relaxed bn-serif font-medium transition-all duration-300`}>
                      {renderVerseText(currentVerse.explanation.originalInsight, 'indigo', true)}
                    </div>
                  </div>
                )}

                <div className={`${readerMode ? 'max-w-4xl' : 'max-w-4xl'} mx-auto divine-glass p-8 md:p-12 rounded-[2rem] md:rounded-[4rem] space-y-6 md:space-y-8 border-amber-500/20 shadow-3xl text-center transition-all duration-300`}>
                  <div className="flex flex-col items-center gap-4 md:gap-6 relative">
                    <div className="absolute right-0 top-0">
                      <SnippetBookmark 
                        saved={isSnippetSaved(currentVerse.prayer, 'prayer')}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSnippet({
                            verseId: currentVerse.id,
                            reference: currentVerse.reference,
                            type: 'prayer',
                            content: currentVerse.prayer,
                            label: t.versionLabels[languageVersion].prayer
                          });
                        }}
                        theme={theme}
                      />
                    </div>
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="w-12 h-12 md:w-16 md:h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600 shadow-inner"
                    >
                      <HandHeart size={28} />
                    </motion.div>
                    <h4 className={`text-xl md:text-2xl font-black text-amber-400 bn-serif`}>ঐশ্বরিক প্রার্থনা</h4>
                  </div>
                  <div className={`${readerMode ? 'text-lg md:text-xl' : explanationSizeClass} ${theme === 'dark' ? 'text-slate-200' : 'text-body'} leading-relaxed bn-serif font-medium text-center sm:text-justify relative z-10 px-2 md:px-4 transition-all duration-300`}>
                    {renderVerseText(currentVerse.prayer, 'amber', true)}
                  </div>
                  <p className={`${theme === 'dark' ? 'text-amber-400/60' : 'text-amber-400/70'} font-black text-[10px] md:text-xs uppercase tracking-wide bn-serif`}>আমেন</p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 md:gap-3 pt-4">
                   {currentVerse.keyThemes.map((themeStr, i) => (
                     <span key={i} className="px-4 md:px-6 py-2 md:py-3 rounded-full divine-glass text-[9px] md:text-xs font-black text-amber-400/80 uppercase tracking-wide border border-amber-500/10 hover:border-amber-500/40 transition-all duration-300 cursor-default shadow-sm">{themeStr}</span>
                   ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-6 pt-6 md:pt-10">
                  <button onClick={toggleSave} className={`w-full sm:w-auto flex items-center justify-center gap-3 md:gap-4 px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] divine-glass transition-all duration-300 border-2 ${isCurrentVerseSaved ? 'text-amber-800 bg-amber-500/10 border-amber-500/40 shadow-[0_0_40px_rgba(139,115,85,0.2)]' : `${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} border-white/5 hover:border-amber-500/20 hover:text-slate-200`} active:scale-95`}>
                    <Bookmark size={20} className={isCurrentVerseSaved ? 'fill-current' : ''} />
                    <span className="font-black bn-serif tracking-wide uppercase text-sm md:text-base">{isCurrentVerseSaved ? t.removeFromCollection : t.saveToCollection}</span>
                  </button>

                  <button onClick={handleShare} className={`w-full sm:w-auto flex items-center justify-center gap-3 md:gap-4 px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] divine-glass transition-all duration-300 border-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} border-white/5 hover:border-amber-500/20 hover:text-slate-200 active:scale-95 relative group`}>
                    <AnimatePresence>
                      {showCopyFeedback && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[9px] px-4 py-2 rounded-full font-black uppercase tracking-wide shadow-lg z-50"
                        >
                          {t.copied}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="font-black bn-serif tracking-wide uppercase text-sm md:text-base">{t.share}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {!currentVerse && state === AppState.IDLE && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8 md:space-y-12 pb-8"
              >
                {dailyQuote && (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="divine-glass p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border-amber-500/20 shadow-2xl text-center relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Quote size={64} className="text-amber-500" />
                    </div>
                    <div className="space-y-4 md:space-y-6 relative z-10">
                      <p className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'} text-[10px] md:text-xs font-black uppercase tracking-wide`}>{t.dailyQuote}</p>
                      <h3 className={`text-xl md:text-3xl font-bold ${theme === 'dark' ? 'text-amber-100' : 'text-amber-950'} bn-serif leading-relaxed italic text-justify transition-colors duration-300`}>
                        "{dailyQuote.text}"
                      </h3>
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-8 bg-amber-500/30"></div>
                        <p className={`text-amber-800/80 font-black bn-serif text-sm md:text-base transition-colors duration-300 ${theme === 'dark' ? 'text-amber-200/80' : 'text-amber-800/80'}`}>— {dailyQuote.author}</p>
                        <div className="h-px w-8 bg-amber-500/30"></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="text-center opacity-40">
                  <p className="text-[10px] md:text-[11px] font-black uppercase tracking-wide md:tracking-wide mb-4 md:mb-6 text-amber-700">{t.suggestedVerses}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                  {t.recommendations.map((rec, idx) => (
                    <RecommendItem 
                      key={idx}
                      title={rec.title} 
                      desc={rec.desc} 
                      icon={idx === 0 ? <HandHeart size={24} /> : idx === 1 ? <Bird size={24} /> : idx === 2 ? <Sparkles size={24} /> : <BookOpen size={24} />} 
                      onClick={() => handleSearch(rec.title)} 
                      theme={theme} 
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeView === 'SAVED' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8 md:space-y-12 py-6 md:py-10"
          >
            <div className="flex flex-col items-center text-center gap-4 md:gap-6 mb-8 md:mb-12">
               <div className="flex items-center gap-4 md:gap-8">
                 <motion.div initial={{ width: 0 }} animate={{ width: 96 }} className="hidden sm:block h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent transition-all duration-300" />
                 <Bookmark className="text-amber-500/30 w-6 h-6 md:w-8 md:h-8" />
                 <h2 className={`text-2xl md:text-5xl font-black ${theme === 'dark' ? 'text-amber-50' : 'text-amber-950'} bn-serif leading-none tracking-tight transition-colors duration-300`}>আপনার <span className="text-divine-gold">সংগ্রহ</span></h2>
                 <Bookmark className="text-amber-500/30 w-6 h-6 md:w-8 md:h-8" />
                 <motion.div initial={{ width: 0 }} animate={{ width: 96 }} className="hidden sm:block h-px bg-gradient-to-l from-transparent via-amber-500/40 to-transparent transition-all duration-300" />
               </div>
               <p className={`text-[9px] md:text-[11px] ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'} font-black uppercase tracking-wide md:tracking-wide bg-amber-500/5 px-6 md:px-8 py-2 md:py-2.5 rounded-full border border-amber-500/10`}>পবিত্র হৃদয়ে সংরক্ষিত জ্ঞান</p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <button 
                onClick={() => setSavedViewMode('VERSES')}
                className={`px-6 py-2 rounded-full transition-all duration-500 text-[10px] font-black uppercase tracking-wide border-2 ${savedViewMode === 'VERSES' ? 'bg-amber-700 text-white border-amber-700 shadow-lg' : 'text-amber-700 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40'}`}
              >
                বাইবেলের পদ
              </button>
              <button 
                onClick={() => setSavedViewMode('SNIPPETS')}
                className={`px-6 py-2 rounded-full transition-all duration-500 text-[10px] font-black uppercase tracking-wide border-2 ${savedViewMode === 'SNIPPETS' ? 'bg-amber-700 text-white border-amber-700 shadow-lg' : 'text-amber-700 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40'}`}
              >
                অন্তর্দৃষ্টি ও লিরিক্স
              </button>
            </div>

            {savedViewMode === 'VERSES' && (
              <>

            {savedVerses.length > 0 && (
              <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between divine-glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[3rem] border-white/5 shadow-2xl transition-all duration-300">
                   <div className="w-full lg:w-2/3 space-y-4">
                      <div className="flex justify-between items-center pr-2">
                        <p className="text-[10px] font-black uppercase tracking-wide text-amber-400/60 px-2 transition-colors duration-300">ট্যাগ ফিল্টার</p>
                        <button 
                          onClick={exportSavedVerses}
                          className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-wide text-amber-700 hover:text-amber-600 transition-colors py-1.5 px-3 divine-glass rounded-lg border-white/5"
                        >
                          <Share2 size={12} />
                          এক্সপোর্ট
                        </button>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                        <button 
                          onClick={() => setFilterTag(null)}
                          className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-full transition-all duration-300 text-[10px] md:text-[11px] font-black uppercase tracking-wide border-2 ${!filterTag ? 'bg-amber-700 text-white border-amber-700 shadow-lg' : `bg-white/5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} border-white/5 hover:border-amber-500/20`}`}
                        >
                          সব ট্যাগ
                        </button>
                        {uniqueTags.map(tag => (
                          <button 
                            key={tag}
                            onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                            className={`whitespace-nowrap px-4 md:px-6 py-2 rounded-full transition-all duration-300 text-[10px] md:text-[11px] font-black uppercase tracking-wide border-2 ${filterTag === tag ? 'bg-amber-700 text-white border-amber-700 shadow-lg' : `bg-white/5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} border-white/5 hover:border-amber-500/20`}`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                   </div>

                   <div className="w-full lg:w-1/3 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-wide text-amber-400/60 px-2 transition-colors duration-300">মূল থিম ফিল্টার</p>
                      <div className="relative group/theme-select">
                        <select 
                          value={filterTheme || ''} 
                          onChange={(e) => setFilterTheme(e.target.value || null)}
                          className={`w-full p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all duration-300 appearance-none cursor-pointer outline-none focus:border-amber-500/50 shadow-inner ${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-200' : 'bg-white border-black/5 text-slate-800'} bn-serif text-xs md:text-sm font-bold`}
                        >
                          <option value="" className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>সব থিম</option>
                          {uniqueThemes.map(themeName => (
                            <option key={themeName} value={themeName} className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>{themeName}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500/50 group-hover/theme-select:text-amber-500 transition-colors">
                          <ArrowUp className="rotate-180" size={12} />
                        </div>
                      </div>
                   </div>
                </div>
                
                {(filterTag || filterTheme) && (
                  <div className="flex justify-center">
                    <button 
                      onClick={() => { setFilterTag(null); setFilterTheme(null); }}
                      className="text-[9px] md:text-[10px] font-black uppercase tracking-wide text-amber-400/70 hover:text-amber-700 transition-colors flex items-center gap-2 group"
                    >
                      <XCircle size={12} className="group-hover:rotate-90 transition-transform" />
                      ফিল্টার পরিষ্কার করুন
                    </button>
                  </div>
                )}
              </div>
            )}

            {filteredVerses.length === 0 ? (
              <div className="divine-glass p-12 md:p-24 lg:p-32 text-center rounded-[2rem] md:rounded-[5rem] opacity-50 shadow-2xl max-w-4xl mx-auto border-dashed border-2 border-white/10 transition-all duration-300">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-500/10 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-10">
                  <Bookmark size={48} className={`${theme === 'dark' ? 'text-slate-300/50' : 'text-slate-500/50'}`} />
                </div>
                <p className={`text-lg md:text-2xl bn-serif font-medium ${theme === 'dark' ? 'text-amber-100' : 'text-amber-950'} mb-6 md:mb-10 transition-colors duration-300`}>
                  { (filterTag || filterTheme) ? "এই ফিল্টারে কোনো পদ পাওয়া যায়নি" : "বর্তমানে কোনো সংরক্ষিত পদ নেই" }
                </p>
                <button onClick={() => { setFilterTag(null); setFilterTheme(null); setActiveView('SEARCH'); }} className="px-10 py-4 md:px-14 md:py-6 bg-amber-700 hover:bg-amber-600 text-white font-black rounded-xl md:rounded-2xl transition-all shadow-xl active:scale-95 text-sm md:text-base">বাইবেলের পদ খুঁজুন</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                <AnimatePresence mode="popLayout">
                  {filteredVerses.map(v => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={v.id} 
                      className="divine-card p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] group flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl hover:border-amber-500/20" 
                      onClick={() => { setCurrentVerse(v); setActiveView('SEARCH'); }}
                    >
                      <div className="space-y-6 md:space-y-8">
                        <div className="flex justify-between items-start">
                          <div className="bg-amber-500/10 px-3 md:px-4 py-1.5 rounded-full border border-amber-500/10">
                            <span className="text-amber-700 font-black text-[10px] md:text-xs bn-serif tracking-wide">{v.reference}</span>
                          </div>
                          <div className="flex gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); setNewTagInputId(v.id); }} className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} hover:text-amber-700 transition-colors p-2 divine-glass rounded-xl h-8 w-8 md:h-10 md:w-10 flex items-center justify-center`}>
                              <Sparkles size={16} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); saveToLocal(savedVerses.filter(item => item.id !== v.id)); }} className="text-rose-500/50 hover:text-rose-500 transition-colors p-2 divine-glass rounded-xl h-8 w-8 md:h-10 md:w-10 flex items-center justify-center">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className={`${theme === 'dark' ? 'text-slate-200' : 'text-body'} bn-serif text-base md:text-lg leading-relaxed line-clamp-4 font-medium text-justify transition-colors duration-300`}>{renderVerseText(v.text)}</p>
                      </div>

                      <div className="mt-8 md:mt-10 space-y-4">
                        <div className="flex flex-wrap gap-2">
                           {v.keyThemes.slice(0, 3).map((themeStr, i) => (
                             <span key={i} className="text-[9px] md:text-[10px] font-black uppercase tracking-wide text-amber-400/70 bn-serif transition-colors duration-300">{themeStr}</span>
                           ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(v.tags || []).map(tag => (
                            <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/5 border border-amber-500/10 rounded-full text-[9px] md:text-[10px] font-black text-amber-700 uppercase tracking-wide group/tag hover:border-amber-500/30 transition-all duration-300 shadow-sm">
                              {tag}
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeTagFromVerse(v.id, tag); }}
                                className="opacity-40 hover:opacity-100 hover:text-rose-500"
                              >
                                <XCircle size={12} />
                              </button>
                            </span>
                          ))}
                        </div>

                        {newTagInputId === v.id && (
                          <div className="mt-4 md:mt-6 space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300" onClick={e => e.stopPropagation()}>
                            <div className="flex gap-2">
                              <input 
                                autoFocus
                                value={newTagValue}
                                onChange={e => setNewTagValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') addTagToVerse(v.id, newTagValue); if (e.key === 'Escape') setNewTagInputId(null); }}
                                placeholder="ট্যাগ.."
                                className={`flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] outline-none focus:ring-1 ring-amber-500/50 duration-300 ${theme === 'dark' ? 'text-white' : 'text-slate-900'} bn-serif transition-all`}
                              />
                              <button 
                                onClick={() => addTagToVerse(v.id, newTagValue)}
                                className="bg-amber-700 text-white p-2 md:p-3 rounded-xl shadow-lg active:scale-90"
                              >
                                <Check size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            </>
          )}

          {savedViewMode === 'SNIPPETS' && (
            <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
              {savedSnippets.length === 0 ? (
                <div className="divine-glass p-12 md:p-24 text-center rounded-[2rem] md:rounded-[4rem] opacity-50 shadow-2xl border-dashed border-2 border-white/10 transition-all duration-300">
                  <Sparkles size={48} className={`${theme === 'dark' ? 'text-slate-300/50' : 'text-slate-500/50'} mx-auto mb-6`} />
                  <p className={`text-lg md:text-xl bn-serif font-medium ${theme === 'dark' ? 'text-amber-100' : 'text-amber-950'} transition-colors duration-300`}>বর্তমানে কোনো সংরক্ষিত অন্তর্দৃষ্টি নেই</p>
                  <button onClick={() => setActiveView('SEARCH')} className="mt-8 px-8 py-3 bg-amber-700 text-white rounded-xl font-black text-xs uppercase tracking-wide shadow-lg active:scale-95">অন্বেষণ শুরু করুন</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <AnimatePresence mode="popLayout">
                    {savedSnippets.map(snippet => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={snippet.id}
                        className="divine-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-amber-500/10 hover:border-amber-500/30 transition-all duration-300 group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                              <span className={`text-[9px] font-black uppercase tracking-wide ${theme === 'dark' ? 'text-amber-400/70' : 'text-amber-400/70'} bn-serif`}>{snippet.label}</span>
                              <p className={`text-xs md:text-sm font-black ${theme === 'dark' ? 'text-amber-200' : 'text-amber-800'} bn-serif`}>{snippet.reference}</p>
                            </div>
                            <button 
                              onClick={() => toggleSnippet(snippet)}
                              className="text-rose-500/50 hover:text-rose-500 transition-colors p-2 divine-glass rounded-xl h-8 w-8 md:h-10 md:w-10 flex items-center justify-center"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
<p className={`text-sm md:text-base leading-relaxed bn-serif font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-body'} transition-colors duration-300 text-justify`}>
                            {snippet.content.length > 200 ? snippet.content.substring(0, 200) + '...' : snippet.content}
                          </p>
                        </div>
                        <div className="mt-8 flex justify-end">
                           <button 
                             onClick={() => handleSearch(snippet.reference)}
                             className="text-[10px] font-black uppercase tracking-wide text-amber-700 hover:text-amber-600 flex items-center gap-2 group/link"
                           >
                             মূল পদে যান 
                             <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                           </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}
          </motion.div>
        )}

        {activeView === 'SETTINGS' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto py-6 md:py-12 space-y-10 md:space-y-16"
          >
             <div className="flex items-center gap-4 md:gap-8 px-2 md:px-4">
               <div className={`w-16 h-16 md:w-20 md:h-20 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'} rounded-2xl md:rounded-[2rem] flex items-center justify-center text-amber-500/50 shadow-inner border border-white/5 transition-all duration-300`}>
                 <Settings size={32} />
               </div>
               <div className="space-y-1 md:space-y-2">
                 <h2 className={`text-2xl md:text-4xl font-black ${theme === 'dark' ? 'text-amber-100' : 'text-amber-950'} bn-serif transition-colors duration-300`}>অ্যাপ সেটিংস</h2>
                 <p className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'} text-[10px] md:text-xs font-black uppercase tracking-wide`}>ব্যক্তিগত পাঠ অভিজ্ঞতা কাস্টমাইজ করুন</p>
               </div>
             </div>

             <div className="space-y-8 md:space-y-10">
                <div className="divine-glass p-6 md:p-14 rounded-[2rem] md:rounded-[4rem] space-y-10 md:space-y-12 shadow-3xl transition-all duration-300">
                     <div className="space-y-6 md:space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                        <h4 className="text-xs md:text-base font-black text-amber-700 uppercase tracking-wide">{t.language}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                          <button 
                            onClick={() => handleAppLangChange('bn')} 
                            className={`p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 md:gap-4 ${appLang === 'bn' ? 'bg-amber-500/10 border-amber-500/50 text-amber-700 shadow-[0_0_50px_rgba(251,191,36,0.15)]' : `bg-white/5 border-transparent ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} hover:bg-white/10`}`}
                          >
                            <Languages size={24} className="opacity-50" />
                            <span className="font-black tracking-wide text-[10px] md:text-[11px] uppercase bn-serif">{t.bengali}</span>
                          </button>
                          <button 
                            onClick={() => handleAppLangChange('en')} 
                            className={`p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 md:gap-4 ${appLang === 'en' ? 'bg-amber-500/10 border-amber-500/50 text-amber-700 shadow-[0_0_50px_rgba(251,191,36,0.15)]' : `bg-white/5 border-transparent ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} hover:bg-white/10`}`}
                          >
                            <Languages size={24} className="opacity-50" />
                            <span className="font-black tracking-wide text-[10px] md:text-[11px] uppercase bn-serif">{t.english}</span>
                          </button>
                      </div>
                    </div>

                    <div className={`pt-10 md:pt-12 border-t ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} space-y-6 md:space-y-8 transition-colors duration-300`}>
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                        <h4 className="text-xs md:text-base font-black text-amber-700 uppercase tracking-wide">{appLang === 'bn' ? 'থিম' : 'Theme'}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <button 
                          onClick={() => handleThemeChange('dark')} 
                          className={`p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 md:gap-4 ${theme === 'dark' ? 'bg-amber-500/10 border-amber-500/50 text-amber-700 shadow-[0_0_50px_rgba(251,191,36,0.15)]' : `bg-white/5 border-transparent ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} hover:bg-white/10`}`}
                        >
                          <Moon size={24} className="opacity-50" />
                          <span className="font-black tracking-wide text-[10px] md:text-[11px] uppercase bn-serif">{appLang === 'bn' ? 'ডার্ক' : 'Dark'}</span>
                        </button>
                        <button 
                          onClick={() => handleThemeChange('light')} 
                          className={`p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 md:gap-4 ${theme === 'light' ? 'bg-amber-500/10 border-amber-500/50 text-amber-700 shadow-[0_0_50px_rgba(251,191,36,0.15)]' : `bg-white/5 border-transparent ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} hover:bg-white/10`}`}
                        >
                          <Sun size={24} className="opacity-50" />
                          <span className="font-black tracking-wide text-[10px] md:text-[11px] uppercase bn-serif">{appLang === 'bn' ? 'লাইট' : 'Light'}</span>
                        </button>
                      </div>
                    </div>

                      <div className={`pt-10 md:pt-12 border-t ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} space-y-6 md:space-y-8 transition-colors duration-300`}>
                        <div className="flex items-center gap-4">
                          <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                          <h4 className="text-xs md:text-base font-black text-amber-700 uppercase tracking-wide">{t.modernVersion} / {t.careyVersion} / {t.kitabulVersion}</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                            <button 
                              onClick={() => handleLangVersionChange('modern')} 
                              className={`p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 md:gap-4 ${languageVersion === 'modern' ? 'bg-amber-500/10 border-amber-500/50 text-amber-700 shadow-[0_0_50px_rgba(251,191,36,0.15)]' : `bg-white/5 border-transparent ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} hover:bg-white/10`}`}
                            >
                              <BookOpen size={24} className="opacity-50" />
                              <span className="font-black tracking-wide text-[10px] md:text-[11px] uppercase bn-serif">{t.modernVersion}</span>
                            </button>
                            <button 
                              onClick={() => handleLangVersionChange('carey')} 
                              className={`p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 md:gap-4 ${languageVersion === 'carey' ? 'bg-amber-500/10 border-amber-500/50 text-amber-700 shadow-[0_0_50px_rgba(251,191,36,0.15)]' : `bg-white/5 border-transparent ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} hover:bg-white/10`}`}
                            >
                              <Book size={24} className="opacity-50" />
                              <span className="font-black tracking-wide text-[10px] md:text-[11px] uppercase bn-serif">{t.careyVersion}</span>
                            </button>
                            <button 
                              onClick={() => handleLangVersionChange('kitabul')} 
                              className={`p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center gap-3 md:gap-4 ${languageVersion === 'kitabul' ? 'bg-amber-500/10 border-amber-500/50 text-amber-700 shadow-[0_0_50px_rgba(251,191,36,0.15)]' : `bg-white/5 border-transparent ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} hover:bg-white/10`}`}
                            >
                              <Sparkles size={24} className="opacity-50" />
                              <span className="font-black tracking-wide text-[10px] md:text-[11px] uppercase bn-serif">{t.kitabulVersion}</span>
                            </button>
                        </div>
                      </div>

                    <div className={`pt-10 md:pt-12 border-t border-black/5 space-y-6 md:space-y-8 transition-colors duration-300`}>
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                        <h4 className="text-xs md:text-base font-black text-amber-700 uppercase tracking-wide">{t.fontFamily}</h4>
                      </div>
                      <div className="relative group/select">
                        <select 
                          value={fontFamily} 
                          onChange={(e) => handleFontChange(e.target.value)}
                          className={`w-full p-4 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all duration-300 appearance-none cursor-pointer outline-none focus:border-amber-500/50 shadow-inner ${theme === 'dark' ? 'bg-slate-900 border-white/5 text-slate-200' : 'bg-white border-black/5 text-slate-800'} bn-serif text-base md:text-lg`}
                          style={{ fontFamily: `'${fontFamily}', 'Noto Sans Bengali', 'Hind Siliguri', system-ui, sans-serif` }}
                        >
                          {fonts.map(f => (
                            <option key={f.id} value={f.id} className={theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'} style={{ fontFamily: `'Noto Sans Bengali', system-ui, sans-serif` }}>{f.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500/50 group-hover/select:text-amber-500 transition-colors">
                          <ArrowUp className="rotate-180" size={16} />
                        </div>
                      </div>
                    </div>

                    <div className={`pt-10 md:pt-12 border-t ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} space-y-6 md:space-y-8 transition-colors duration-300`}>
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 bg-rose-500 rounded-full"></div>
                        <h4 className="text-xs md:text-base font-black text-amber-600 uppercase tracking-wide">{t.fontSize}</h4>
                      </div>
                      <div className="flex flex-wrap gap-3 md:gap-4">
                          {[{ id: 'sm', label: t.small }, { id: 'base', label: t.base }, { id: 'lg', label: t.large }, { id: 'xl', label: 'Extra' }].map(size => (
                            <button key={size.id} onClick={() => handleFontSizeChange(size.id)} className={`px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl border-2 transition-all font-black bn-serif text-sm md:text-lg ${fontSize === size.id ? 'bg-amber-500 text-white border-amber-500 shadow-xl' : `bg-white/5 border-white/5 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} hover:bg-white/10`}`}>{size.label}</button>
                          ))}
                      </div>
                    </div>

                    {theme === 'light' && (
                      <div className={`pt-10 md:pt-12 border-t ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} space-y-6 md:space-y-8 transition-colors duration-300`}>
                        <div className="flex items-center gap-4">
                          <div className="h-2 w-2 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"></div>
                          <h4 className="text-xs md:text-base font-black text-amber-600 uppercase tracking-wide">লাইট থিম রঙ</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                          {Object.entries(lightThemePresets).map(([key, colors]) => (
                            <button
                              key={key}
                              onClick={() => {
                                setLightThemePreset(key);
                                setLightThemeColors(colors);
                                applyLightThemeColors(colors);
                              }}
                              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${lightThemePreset === key ? 'border-amber-500 bg-amber-500/10' : 'border-transparent hover:border-amber-300'}`}
                            >
                              <div className="flex gap-1">
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colors.primary }}></div>
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colors.accent }}></div>
                                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: colors.background }}></div>
                              </div>
                              <span className={`text-xs font-black uppercase tracking-wide ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                {key === 'default' ? 'ডিফল্ট' : key === 'warm' ? 'উarm' : key === 'ocean' ? 'সমুদ্র' : key === 'forest' ? 'বন' : key === 'royal' ? 'রাজকীয়' : 'আধুনিক'}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-3">
                            <div className="flex-1 min-w-[120px]">
                              <label className={`text-xs font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} block mb-2`}>প্রাথমিক রঙ</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={lightThemeColors?.primary || lightThemePresets.default.primary}
                                  onChange={(e) => {
                                    const newColors = { ...(lightThemeColors || lightThemePresets.default), primary: e.target.value, accent: e.target.value };
                                    setLightThemePreset('custom');
                                    setLightThemeColors(newColors);
                                  }}
                                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                                />
                                <input
                                  type="text"
                                  value={lightThemeColors?.primary || lightThemePresets.default.primary}
                                  onChange={(e) => {
                                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                                      const newColors = { ...(lightThemeColors || lightThemePresets.default), primary: e.target.value, accent: e.target.value };
                                      setLightThemePreset('custom');
                                      setLightThemeColors(newColors);
                                    }
                                  }}
                                  className={`flex-1 p-2 rounded-lg border-2 text-xs font-mono ${theme === 'dark' ? 'bg-slate-900 border-white/10 text-slate-200' : 'bg-white border-black/5 text-slate-800'}`}
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-[120px]">
                              <label className={`text-xs font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} block mb-2`}>টেক্সট রঙ</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={lightThemeColors?.textPrimary || lightThemePresets.default.textPrimary}
                                  onChange={(e) => {
                                    const newColors = { ...(lightThemeColors || lightThemePresets.default), textPrimary: e.target.value, textSecondary: e.target.value };
                                    setLightThemePreset('custom');
                                    setLightThemeColors(newColors);
                                  }}
                                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                                />
                                <input
                                  type="text"
                                  value={lightThemeColors?.textPrimary || lightThemePresets.default.textPrimary}
                                  onChange={(e) => {
                                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                                      const newColors = { ...(lightThemeColors || lightThemePresets.default), textPrimary: e.target.value, textSecondary: e.target.value };
                                      setLightThemePreset('custom');
                                      setLightThemeColors(newColors);
                                    }
                                  }}
                                  className={`flex-1 p-2 rounded-lg border-2 text-xs font-mono ${theme === 'dark' ? 'bg-slate-900 border-white/10 text-slate-200' : 'bg-white border-black/5 text-slate-800'}`}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <div className="flex-1 min-w-[120px]">
                              <label className={`text-xs font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} block mb-2`}>ব্যাকগ্রাউন্ড</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={lightThemeColors?.background || lightThemePresets.default.background}
                                  onChange={(e) => {
                                    const newColors = { ...(lightThemeColors || lightThemePresets.default), background: e.target.value, backgroundAlt: e.target.value };
                                    setLightThemePreset('custom');
                                    setLightThemeColors(newColors);
                                  }}
                                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                                />
                                <input
                                  type="text"
                                  value={lightThemeColors?.background || lightThemePresets.default.background}
                                  onChange={(e) => {
                                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                                      const newColors = { ...(lightThemeColors || lightThemePresets.default), background: e.target.value, backgroundAlt: e.target.value };
                                      setLightThemePreset('custom');
                                      setLightThemeColors(newColors);
                                    }
                                  }}
                                  className={`flex-1 p-2 rounded-lg border-2 text-xs font-mono ${theme === 'dark' ? 'bg-slate-900 border-white/10 text-slate-200' : 'bg-white border-black/5 text-slate-800'}`}
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-[120px]">
                              <label className={`text-xs font-bold uppercase tracking-wide ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} block mb-2`}>কার্ড রঙ</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={lightThemeColors?.cardBg ? lightThemeColors.cardBg.slice(0, 7) === 'rgba(' ? '#ffffff' : lightThemeColors.cardBg : lightThemePresets.default.cardBg.slice(0, 7) === 'rgba(' ? '#ffffff' : lightThemePresets.default.cardBg}
                                  onChange={(e) => {
                                    const newColors = { ...(lightThemeColors || lightThemePresets.default), cardBg: e.target.value + 'f2', glassBg: e.target.value + 'd9' };
                                    setLightThemePreset('custom');
                                    setLightThemeColors(newColors);
                                  }}
                                  className="w-10 h-10 rounded-lg cursor-pointer border-0"
                                />
                                <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>অপ্যাসিটি সহ</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                </div>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className={`relative group overflow-hidden divine-glass p-8 md:p-16 rounded-[2rem] md:rounded-[4.5rem] shadow-3xl border-2 transition-all duration-300 ${theme === 'dark' ? 'border-white/5 hover:border-amber-500/20' : 'border-black/5 hover:border-amber-500/30'}`}
                >
                   <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start relative z-10">
                      <div className="relative">
                        <div className={`w-32 h-32 md:w-44 md:h-44 ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'} rounded-[2rem] md:rounded-[3.5rem] flex items-center justify-center border-4 border-amber-500/10 shadow-2xl overflow-hidden ring-4 ring-amber-500/30`}>
                          <img 
                            src="https://lh3.googleusercontent.com/d/1D6PyIunFBqxInBMlP41HTdxHUxe-yMWg" 
                            alt="ডেভলপার" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector('.fallback-profile')) {
                                const fallback = document.createElement('div');
                                fallback.className = 'fallback-profile w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 text-white text-4xl md:text-6xl font-black';
                                fallback.innerText = 'S';
                                parent.appendChild(fallback);
                              }
                            }}
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 bg-amber-700 text-white px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-wide shadow-lg border-2 md:border-4 border-slate-900 transition-transform">Lead Engineer</div>
                      </div>

                      <div className="space-y-6 md:space-y-8 text-center md:text-left flex-1">
                         <div className="space-y-2 md:space-y-3">
                           <h3 className={`text-2xl md:text-4xl font-black ${theme === 'dark' ? 'text-amber-100' : 'text-amber-950'} bn-serif tracking-tight transition-colors duration-300`}>ডেভলপার <span className="text-amber-500">টিম</span></h3>
                           <p className={`${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'} font-black text-[9px] md:text-xs uppercase tracking-wide`}>শান্তি ও প্রজ্ঞার কারিগর</p>
                         </div>
                         
                         <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} leading-relaxed bn-serif text-base md:text-lg font-medium text-justify transition-colors duration-300`}>
                           "পবিত্র বানী" অ্যাপটি আধুনিক বাইবেলীয় দর্শনের এক অনবদ্য মেলবন্ধন। আমাদের লক্ষ্য প্রযুক্তির মাধ্যমে শান্তির আলো ও ঐশ্বরিক জ্ঞান পৌঁছে দেয়া।
                         </p>

                         <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                            <div className="flex items-center justify-center gap-3 px-6 py-4 bg-amber-700 text-white rounded-2xl shadow-xl transition-all duration-300">
                              <Phone size={20} />
                              <span className="font-black bn-serif text-base md:text-lg">+8801614802711</span>
                            </div>

                            <div className="flex justify-center gap-4">
                               <SocialIcon icon={<Globe size={20} />} link="https://darktheo.vercel.app" />
                               <SocialIcon icon={<Github size={20} />} link="https://github.com/theotonius" />
                               <SocialIcon icon={<Linkedin size={20} />} link="https://www.linkedin.com/in/sobujtheotonius/" />
                               <SocialIcon icon={<Mail size={20} />} link="mailto:theotonius2012@gmail.com" />
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
             </div>
            </motion.div>
        )}
      </main>

      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => setMobileMenuOpen(true)}
        className={`fixed top-4 left-4 z-[80] md:hidden p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5 text-slate-300' : 'bg-black/5 text-slate-700'} backdrop-blur-xl shadow-lg border ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}`}
      >
        <Menu size={24} />
      </button>

      {/* Mobile Left Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[90] md:hidden"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-[100] md:hidden"
            >
              <div className={`h-full ${theme === 'dark' ? 'bg-[#0a0a05]/98' : 'bg-[#fafaf9]/98'} backdrop-blur-3xl p-6 pt-20 shadow-2xl`}>
                {/* Logo in drawer */}
                <div className="flex items-center gap-3 mb-8 pb-6 border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 rounded-xl flex items-center justify-center shadow-lg">
                    <Cross className="text-white w-7 h-7" />
                  </div>
                  <div>
                    <h2 className={`text-xl font-black ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900'} bn-serif`}>
                      {t.appName}
                    </h2>
                    <p className={`text-[10px] ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'} font-bold`}>
                      {t.collectionSub}
                    </p>
                  </div>
                </div>
                
                {/* Navigation Items */}
                <div className="space-y-2">
                  {/* Account/Login Button */}
                  {isAuthenticated ? (
                    <button 
                      onClick={() => { handleOpenDashboard(); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                          : 'bg-amber-600/10 text-amber-600 hover:bg-amber-600/20'
                      }`}
                    >
                      <User size={22} />
                      <span className="font-bold">{isAnonymous ? 'ড্যাশবোর্ড' : profile?.display_name || 'ড্যাশবোর্ড'}</span>
                      <ArrowRight className="ml-auto" size={18} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-amber-500 text-white hover:bg-amber-400'
                          : 'bg-amber-600 text-white hover:bg-amber-500'
                      }`}
                    >
                      <User size={22} />
                      <span className="font-bold">লগইন / সাইন আপ</span>
                      <ArrowRight className="ml-auto" size={18} />
                    </button>
                  )}
                  
                  <div className={`h-px mx-2 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`} />
                  
                  <button 
                    onClick={() => { setActiveView('SEARCH'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeView === 'SEARCH' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' : (theme === 'dark' ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-black/5')}`}
                  >
                    <Search size={22} />
                    <span className="font-bold">{t.navSearch}</span>
                    {activeView === 'SEARCH' && <ArrowRight className="ml-auto" size={18} />}
                  </button>
                  <button 
                    onClick={() => { setActiveView('SAVED'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeView === 'SAVED' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' : (theme === 'dark' ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-black/5')}`}
                  >
                    <Bookmark size={22} />
                    <span className="font-bold">{t.navSaved}</span>
                    {activeView === 'SAVED' && <ArrowRight className="ml-auto" size={18} />}
                  </button>
                  <button 
                    onClick={() => { setActiveView('SETTINGS'); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${activeView === 'SETTINGS' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' : (theme === 'dark' ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-black/5')}`}
                  >
                    <Settings size={22} />
                    <span className="font-bold">{t.navSettings}</span>
                    {activeView === 'SETTINGS' && <ArrowRight className="ml-auto" size={18} />}
                  </button>
                </div>
                
                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t ${theme === 'dark' ? 'border-white/10' : 'border-black/10'}">
                  <p className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} text-center`}>
                    {t.appName} © 2026
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleCloseLogin}
        onGoogleSignIn={handleGoogleSignIn}
        onAnonymousSignIn={handleAnonymousSignIn}
        isLoading={authLoading}
        error={authError}
      />

      {/* Dashboard */}
      <Dashboard
        isOpen={showDashboard}
        onClose={handleCloseDashboard}
        profile={profile}
        user={user}
        isAnonymous={isAnonymous}
        syncStatus={syncStatus}
        savedVersesCount={savedVerses.length}
        savedSnippetsCount={savedSnippets.length}
        onSyncNow={handleSync}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onClearLocalData={handleClearData}
        onSignOut={handleSignOut}
        onUpdateProfile={() => setActiveView('SETTINGS')}
        theme={theme}
      />
    </div>
  );
}

const RecommendItem: React.FC<{ title: string; desc: string; icon: React.ReactNode; onClick: () => void; theme: string }> = ({ title, desc, icon, onClick, theme }) => (
  <motion.button 
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick} 
    className="divine-card p-6 md:p-12 rounded-[1.5rem] md:rounded-[3.5rem] text-left group flex items-center justify-between transition-all duration-300 hover:shadow-2xl hover:border-amber-500/30"
  >
    <div className="flex gap-4 md:gap-10 items-center">
       <div className={`w-12 h-12 md:w-20 md:h-20 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'} rounded-xl md:rounded-[2rem] flex items-center justify-center text-amber-500/50 group-hover:bg-amber-500/15 group-hover:text-amber-500 transition-all duration-300 shadow-inner border border-white/5`}>
         {icon}
       </div>
       <div className="space-y-1">
         <p className="text-[9px] md:text-[11px] font-black uppercase tracking-wide text-amber-400/60">{desc}</p>
         <h4 className={`text-base md:text-2xl font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-amber-950'} bn-serif group-hover:text-amber-600 transition-colors duration-300`}>{title}</h4>
       </div>
    </div>
    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-2 ${theme === 'dark' ? 'border-white/5' : 'border-black/5'} flex items-center justify-center text-slate-500 group-hover:text-amber-500 group-hover:border-amber-500/30 transition-all duration-300`}>
      <ArrowUp className="rotate-90" size={20} />
    </div>
  </motion.button>
);

const MobileNavItem: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void; label: string; theme: string }> = ({ icon, active, onClick, label, theme }) => (
  <button onClick={onClick} className="relative flex-1 flex flex-col items-center justify-center py-3 group">
    <div className={`relative z-10 transition-all duration-500 flex flex-col items-center ${active ? 'text-amber-500 scale-110' : (theme === 'dark' ? 'text-slate-300 group-hover:text-amber-500/50' : 'text-slate-500 group-hover:text-amber-500/50')}`}>
      {icon}
      <span className={`text-[10px] mt-1.5 font-bold tracking-wider uppercase transition-all duration-500 ${active ? 'text-amber-500' : (theme === 'dark' ? 'text-slate-300' : 'text-slate-500')}`}>{label}</span>
    </div>
    {active && (
      <motion.div 
        layoutId="mobile-nav-active"
        className="absolute inset-0 bg-amber-500/10 rounded-2xl shadow-[inset_0_0_20px_rgba(245,158,11,0.1)] border border-amber-500/20 mx-2"
      />
    )}
  </button>
);

const SocialIcon: React.FC<{ icon: React.ReactNode; link: string }> = ({ icon, link }) => {
  const isDirect = link.startsWith('mailto:') || link.startsWith('tel:');
  return (
    <motion.a 
      whileHover={{ y: -5, scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      href={link}
      target={isDirect ? undefined : "_blank"}
      rel={isDirect ? undefined : "noopener noreferrer"}
      className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 flex items-center justify-center text-slate-300 hover:text-amber-500 hover:bg-amber-500/10 transition-all duration-300 border-2 border-white/5 hover:border-amber-500/30 shadow-sm active:scale-90"
    >
      {icon}
    </motion.a>
  );
};
