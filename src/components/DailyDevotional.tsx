import React, { memo, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, BookOpen, Calendar, Check, ChevronRight, ChevronLeft, 
  Flame, Clock, Target, Trophy, RefreshCw, Play
} from 'lucide-react';
import { ReadingPlan, PlanReading, BIBLE_READING_PLANS, ReadingProgress } from '../types/community';

interface DailyDevotionalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchVerse: (query: string) => void;
  theme: string;
}

export const DailyDevotionalModal = memo<DailyDevotionalProps>(({
  isOpen,
  onClose,
  onSearchVerse,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'plan'>('today');
  const [selectedPlan, setSelectedPlan] = useState<ReadingPlan | null>(null);
  const [progress, setProgress] = useState<ReadingProgress | null>(null);

  // Generate daily devotional content
  const todayDevotional = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const verses = [
      { reference: 'যোহন ৩:১৬', text: 'কেননা ঈশ্বর জগতকে এমন প্রেম করিলেন যে, তিনি আপনার একজাত পুত্রকে দান করিলেন, যেন যে কেহ তাঁহার বিশ্বাস করে, সে বিনষ্ট না হইয়া চিরজীবন লাভ করে।', meditation: 'ঈশ্বরের অসীম প্রেম আজ আপনার হৃদয়ে কীভাবে প্রতিফলিত হচ্ছে?' },
      { reference: 'গীতসংহিতা ২৩:১', text: 'প্রভু আমার পালক, আমার অভাব হইবে না।', meditation: 'প্রতিদিন আপনি কোন বিশ্বাসে আশ্রয় খুঁজছেন?' },
      { reference: 'ফিলিপীয় ৪:১৩', text: 'যাহা বলিতে ইচ্ছা করি, সেই সকলেই আমার ভিতরে শক্তি সাধন করিতে পারি।', meditation: 'আজ কোন চ্যালেঞ্জে আপনার শক্তি প্রয়োজন?' },
      { reference: 'যিশাইয় ৪০:৩১', text: 'কিন্তু যাহারা প্রভুর আশা রাখে, তাহারা নতুন বলে উৎথিত হইবে; তাহারা বাজপাখির ন্যায় উড়িয়া যাইবে, এবং ছুটিয়াও ক্ষিদা করিবে না।', meditation: 'আজ কী নতুন উচ্চতায় পৌঁছাতে চান?' },
      { reference: 'মথি ১১:২৮', text: 'আমার কাছে আইস; সকল ক্লান্ত ও বোঝা বহনকারীরা, আমার কাছে আইস, এবং আমি তোমাদিগকে বিশ্রাম দিব।', meditation: 'কোন বোঝা আজ আপনি ঈশুর হাতে তুলে দিতে চান?' },
    ];
    return verses[dayOfYear % verses.length];
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('sacred_word_reading_progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load progress');
      }
    }
  }, []);

  const handleStartPlan = (plan: ReadingPlan) => {
    const newProgress: ReadingProgress = {
      planId: plan.id,
      currentDay: 1,
      completedDays: [],
      startedAt: new Date().toISOString(),
      lastReadAt: new Date().toISOString(),
    };
    setProgress(newProgress);
    setSelectedPlan(plan);
    localStorage.setItem('sacred_word_reading_progress', JSON.stringify(newProgress));
  };

  const handleCompleteDay = (day: number) => {
    if (!progress) return;
    
    const updated: ReadingProgress = {
      ...progress,
      completedDays: progress.completedDays.includes(day) 
        ? progress.completedDays.filter(d => d !== day)
        : [...progress.completedDays, day],
      lastReadAt: new Date().toISOString(),
    };
    setProgress(updated);
    localStorage.setItem('sacred_word_reading_progress', JSON.stringify(updated));
  };

  const getPlanProgress = (plan: ReadingPlan) => {
    if (!progress || progress.planId !== plan.id) return 0;
    return Math.round((progress.completedDays.length / plan.readings.length) * 100);
  };

  const getStreak = () => {
    if (!progress) return 0;
    let streak = 0;
    const sorted = [...progress.completedDays].sort((a, b) => a - b);
    for (let i = 1; i <= sorted.length; i++) {
      if (sorted.includes(i)) streak++;
      else break;
    }
    return streak;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`fixed inset-x-0 bottom-0 z-[201] rounded-t-3xl max-h-[85vh] overflow-hidden ${
              theme === 'dark' ? 'bg-[#0a0a05]' : 'bg-white'
            } shadow-2xl`}
          >
            {/* Header */}
            <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
              theme === 'dark' ? 'bg-[#0a0a05] border-white/10' : 'bg-white border-black/5'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <BookOpen size={20} className="text-amber-500" />
                </div>
                <div>
                  <h2 className={`font-bold ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900'}`}>
                    প্রতিদিনের বাইবেল পাঠ
                  </h2>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    আজকের পড়া ও প্ল্যান
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className={`flex border-b ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}`}>
              {[
                { id: 'today', label: 'আজকের পাঠ', icon: Calendar },
                { id: 'plan', label: 'পড়ার প্ল্যান', icon: Target },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-bold transition-all ${
                    activeTab === tab.id
                      ? 'text-amber-500 border-b-2 border-amber-500'
                      : theme === 'dark'
                        ? 'text-slate-400'
                        : 'text-slate-500'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {activeTab === 'today' && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Today's Verse */}
                  <div className={`p-4 rounded-2xl ${
                    theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-amber-50 border border-amber-100'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Flame size={16} className="text-amber-500" />
                      </div>
                      <span className="text-sm font-bold text-amber-500">আজকের আয়াত</span>
                    </div>
                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                      "{todayDevotional.text}"
                    </p>
                    <p className={`text-xs font-bold text-amber-500 mb-4`}>— {todayDevotional.reference}</p>
                    
                    <button
                      onClick={() => onSearchVerse(todayDevotional.reference)}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <BookOpen size={16} />
                      বিস্তারিত পড়ুন
                    </button>
                  </div>

                  {/* Meditation */}
                  <div className={`p-4 rounded-2xl ${
                    theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-black/5 border border-black/5'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        <Target size={16} className="text-violet-500" />
                      </div>
                      <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                        ধ্যানের বিষয়
                      </span>
                    </div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      {todayDevotional.meditation}
                    </p>
                  </div>

                  {/* Streak */}
                  {progress && (
                    <div className={`p-4 rounded-2xl ${
                      theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-black/5 border border-black/5'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Trophy size={20} className="text-emerald-500" />
                          </div>
                          <div>
                            <p className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                              {getStreak()} দিন ধারাবাহিকতা
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              আজও পড়া শেষ করুন!
                            </p>
                          </div>
                        </div>
                        <RefreshCw size={20} className="text-emerald-500" />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'plan' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Current Plan */}
                  {progress && (
                    <div className={`p-4 rounded-2xl ${
                      theme === 'dark' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                    }`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                          <Play size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900'}`}>
                            চলমান প্ল্যান
                          </p>
                          <p className={`text-sm ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
                            {BIBLE_READING_PLANS.find(p => p.id === progress.planId)?.nameBn}
                          </p>
                        </div>
                        <span className="text-2xl font-black text-amber-500">
                          {getPlanProgress(BIBLE_READING_PLANS.find(p => p.id === progress.planId)!) + '%'}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className={`h-2 rounded-full overflow-hidden ${
                        theme === 'dark' ? 'bg-white/10' : 'bg-black/10'
                      }`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: getPlanProgress(BIBLE_READING_PLANS.find(p => p.id === progress.planId)!) + '%' }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          দিন {progress.currentDay} চলছে
                        </span>
                        <button
                          onClick={() => {
                            const plan = BIBLE_READING_PLANS.find(p => p.id === progress.planId);
                            if (plan) setSelectedPlan(plan);
                          }}
                          className="text-sm font-bold text-amber-500"
                        >
                          পড়া চালিয়ে যান →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Plan List */}
                  <div className="space-y-3">
                    <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      বিদ্যমান প্ল্যান
                    </h3>
                    {BIBLE_READING_PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => handleStartPlan(plan)}
                        className={`w-full p-4 rounded-2xl text-left transition-all ${
                          theme === 'dark'
                            ? 'bg-white/5 hover:bg-white/10 border border-white/5'
                            : 'bg-black/5 hover:bg-black/10 border border-black/5'
                        } ${progress?.planId === plan.id ? 'ring-2 ring-amber-500' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            plan.difficulty === 'beginner' 
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : plan.difficulty === 'intermediate'
                                ? 'bg-amber-500/20 text-amber-500'
                                : 'bg-red-500/20 text-red-500'
                          }`}>
                            <BookOpen size={20} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                              {plan.nameBn}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                              {plan.duration} দিন • {plan.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                plan.difficulty === 'beginner'
                                  ? 'bg-emerald-500/20 text-emerald-500'
                                  : plan.difficulty === 'intermediate'
                                    ? 'bg-amber-500/20 text-amber-500'
                                    : 'bg-red-500/20 text-red-500'
                              }`}>
                                {plan.difficulty === 'beginner' ? 'সহজ' : plan.difficulty === 'intermediate' ? 'মাঝারি' : 'কঠিন'}
                              </span>
                              {getPlanProgress(plan) > 0 && (
                                <span className="text-xs text-amber-500 font-bold">
                                  {getPlanProgress(plan)}% সম্পন্ন
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight size={20} className={theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

DailyDevotionalModal.displayName = 'DailyDevotionalModal';
