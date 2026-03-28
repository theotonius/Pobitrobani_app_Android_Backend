import React, { memo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Heart, Users, MessageCircle, Send, Check, Sparkles,
  HandsPraying, Shield, ChevronUp, Eye, Clock, MoreHorizontal
} from 'lucide-react';

interface PrayerRequest {
  id: string;
  userName: string;
  userAvatar?: string;
  title: string;
  description: string;
  isAnonymous: boolean;
  prayers: number;
  isAnswered: boolean;
  createdAt: string;
}

interface CommunityNote {
  id: string;
  verseReference: string;
  userName: string;
  userAvatar?: string;
  content: string;
  likes: number;
  createdAt: string;
}

interface CommunityHubProps {
  isOpen: boolean;
  onClose: () => void;
  currentVerse?: { reference: string; text: string } | null;
  theme: string;
  user?: { id?: string; displayName?: string; avatarUrl?: string } | null;
}

export const CommunityHubModal = memo<CommunityHubProps>(({
  isOpen,
  onClose,
  currentVerse,
  theme,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<'prayers' | 'community'>('prayers');
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [communityNotes, setCommunityNotes] = useState<CommunityNote[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load mock data
  useEffect(() => {
    setPrayers([
      { id: '1', userName: 'মারিয়া', title: 'সন্তানের স্বাস্থ্যের জন্য', description: 'আমার ৫ বছরের মেয়ের জন্য প্রার্থনা করুন যে সে দ্রুত সুস্থ হোক।', isAnonymous: false, prayers: 24, isAnswered: false, createdAt: '2026-03-28T10:00:00Z' },
      { id: '2', userName: 'Anonymous', title: 'কাজের সমস্যা', description: 'নতুন চাকরি পাওয়ার জন্য প্রার্থনা করুন।', isAnonymous: true, prayers: 45, isAnswered: false, createdAt: '2026-03-27T15:00:00Z' },
      { id: '3', userName: 'জন', title: 'পরিবারের শান্তি', description: 'পরিবারে মিলন ও শান্তির জন্য।', isAnonymous: false, prayers: 32, isAnswered: true, createdAt: '2026-03-25T08:00:00Z' },
    ]);

    setCommunityNotes([
      { id: '1', verseReference: 'যোহন ৩:১৬', userName: 'প্রবীর', content: 'এই আয়াতটি আমার জীবনে সবচেয়ে গুরুত্বপূর্ণ। এটি আমাকে শিখিয়েছে যে ঈশ্বরের প্রেম কতটা বিশাল।', likes: 28, createdAt: '2026-03-28T09:00:00Z' },
      { id: '2', verseReference: 'গীতসংহিতা ২৩:১', userName: 'সুব্রত', content: 'যখন কঠিন সময়ে যাই, এই আয়াতটি আমার বিশ্বাসকে শক্তিশালী করে।', likes: 45, createdAt: '2026-03-27T14:00:00Z' },
      { id: '3', verseReference: 'মথি ১১:২৮', userName: 'রীতা', content: 'ক্লান্তি আর বোঝা নিয়ে ঈশুর কাছে এসেছি এবং শান্তি পেয়েছি।', likes: 56, createdAt: '2026-03-26T20:00:00Z' },
    ]);
  }, []);

  const handleAddPrayer = useCallback(async () => {
    if (!newTitle.trim()) return;
    
    setLoading(true);
    
    const newPrayer: PrayerRequest = {
      id: Date.now().toString(),
      userName: isAnonymous ? 'Anonymous' : (user?.displayName || 'ব্যবহারকারী'),
      title: newTitle,
      description: newDescription,
      isAnonymous,
      prayers: 1,
      isAnswered: false,
      createdAt: new Date().toISOString(),
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setPrayers(prev => [newPrayer, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setShowAddForm(false);
    setLoading(false);
  }, [newTitle, newDescription, isAnonymous, user]);

  const handleAddNote = useCallback(async () => {
    if (!newNote.trim() || !currentVerse) return;
    
    setLoading(true);
    
    const newCommunityNote: CommunityNote = {
      id: Date.now().toString(),
      verseReference: currentVerse.reference,
      userName: user?.displayName || 'ব্যবহারকারী',
      content: newNote,
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    await new Promise(resolve => setTimeout(resolve, 500));
    
    setCommunityNotes(prev => [newCommunityNote, ...prev]);
    setNewNote('');
    setShowAddForm(false);
    setLoading(false);
  }, [newNote, currentVerse, user]);

  const handlePray = useCallback((id: string) => {
    setPrayers(prev => prev.map(p => 
      p.id === id ? { ...p, prayers: p.prayers + 1 } : p
    ));
  }, []);

  const handleLike = useCallback((id: string) => {
    setCommunityNotes(prev => prev.map(n => 
      n.id === id ? { ...n, likes: n.likes + 1 } : n
    ));
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (hours < 1) return 'এইমাত্র';
    if (hours < 24) return `${hours} ঘন্টা আগে`;
    return `${days} দিন আগে`;
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
            className={`fixed inset-x-0 bottom-0 z-[201] rounded-t-3xl max-h-[85vh] flex flex-col ${
              theme === 'dark' ? 'bg-[#0a0a05]' : 'bg-white'
            } shadow-2xl`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b flex-shrink-0 ${
              theme === 'dark' ? 'bg-[#0a0a05] border-white/10' : 'bg-white border-black/5'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <h2 className={`font-bold ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900'}`}>
                    সম্প্রদায়
                  </h2>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    প্রার্থনা ও অনুপ্রেরণা শেয়ার করুন
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
            <div className={`flex border-b flex-shrink-0 ${theme === 'dark' ? 'border-white/10' : 'border-black/5'}`}>
              {[
                { id: 'prayers', label: 'প্রার্থনার অনুরোধ', icon: HandsPraying, count: prayers.length },
                { id: 'community', label: 'সম্প্রদায়ের ভাবনা', icon: MessageCircle, count: communityNotes.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 font-bold transition-all ${
                    activeTab === tab.id
                      ? 'text-violet-500 border-b-2 border-violet-500'
                      : theme === 'dark'
                        ? 'text-slate-400'
                        : 'text-slate-500'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-violet-500/20 text-violet-500'
                      : theme === 'dark'
                        ? 'bg-white/10'
                        : 'bg-black/10'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === 'prayers' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Add Prayer Button */}
                  <button
                    onClick={() => setShowAddForm('prayer')}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Heart size={20} />
                    প্রার্থনার অনুরোধ যোগ করুন
                  </button>

                  {/* Prayer List */}
                  {prayers.map((prayer) => (
                    <div
                      key={prayer.id}
                      className={`p-4 rounded-2xl ${
                        prayer.isAnswered
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : theme === 'dark'
                            ? 'bg-white/5 border border-white/5'
                            : 'bg-black/5 border border-black/5'
                      }`}
                    >
                      {prayer.isAnswered && (
                        <div className="flex items-center gap-2 mb-3 text-emerald-500">
                          <Check size={18} />
                          <span className="text-sm font-bold">উত্তরিত হয়েছে! 🎉</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          prayer.isAnonymous
                            ? 'bg-slate-500/20 text-slate-500'
                            : 'bg-violet-500/20 text-violet-500'
                        }`}>
                          {prayer.isAnonymous ? '👤' : '👤'}
                        </div>
                        <div>
                          <p className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                            {prayer.isAnonymous ? 'বেনামি' : prayer.userName}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                            {formatTime(prayer.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <h3 className={`font-bold mb-1 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                        {prayer.title}
                      </h3>
                      <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        {prayer.description}
                      </p>
                      
                      <button
                        onClick={() => handlePray(prayer.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 text-violet-500 font-bold text-sm hover:bg-violet-500/20 transition-colors"
                      >
                        <HandsPraying size={16} />
                        প্রার্থনা করেছি ({prayer.prayers})
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'community' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Add Note Button */}
                  {currentVerse && (
                    <button
                      onClick={() => setShowAddForm('note')}
                      className="w-full p-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Sparkles size={20} />
                      "{currentVerse.reference}" নিয়ে লিখুন
                    </button>
                  )}

                  {/* Community Notes */}
                  {communityNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-2xl ${
                        theme === 'dark'
                          ? 'bg-white/5 border border-white/5'
                          : 'bg-black/5 border border-black/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-violet-500 bg-violet-500/10 px-2 py-1 rounded-lg">
                            {note.verseReference}
                          </span>
                          <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {formatTime(note.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`mb-4 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                        {note.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {note.userName}
                          </span>
                        </div>
                        <button
                          onClick={() => handleLike(note.id)}
                          className="flex items-center gap-1 text-sm text-violet-500 hover:bg-violet-500/10 px-3 py-1 rounded-xl transition-colors"
                        >
                          <ChevronUp size={18} />
                          {note.likes}
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Add Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  exit={{ y: 100 }}
                  className={`p-4 border-t flex-shrink-0 ${
                    theme === 'dark' ? 'bg-[#0a0a05] border-white/10' : 'bg-white border-black/5'
                  }`}
                >
                  {showAddForm === 'prayer' ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="প্রার্থনার বিষয় লিখুন"
                        className={`w-full px-4 py-3 rounded-xl outline-none ${
                          theme === 'dark'
                            ? 'bg-white/5 text-slate-200 placeholder-slate-500 border border-white/10'
                            : 'bg-black/5 text-slate-800 placeholder-slate-400 border border-black/10'
                        }`}
                      />
                      <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="বিস্তারিত লিখুন (ঐচ্ছিক)"
                        rows={3}
                        className={`w-full px-4 py-3 rounded-xl outline-none resize-none ${
                          theme === 'dark'
                            ? 'bg-white/5 text-slate-200 placeholder-slate-500 border border-white/10'
                            : 'bg-black/5 text-slate-800 placeholder-slate-400 border border-black/10'
                        }`}
                      />
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="w-4 h-4 rounded accent-violet-500"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          বেনামে প্রকাশ করুন
                        </span>
                      </label>
                    </div>
                  ) : (
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder={`${currentVerse?.reference || 'আয়াত'} সম্পর্কে আপনার ভাবনা লিখুন...`}
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl outline-none resize-none ${
                        theme === 'dark'
                          ? 'bg-white/5 text-slate-200 placeholder-slate-500 border border-white/10'
                          : 'bg-black/5 text-slate-800 placeholder-slate-400 border border-black/10'
                      }`}
                    />
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className={`px-4 py-2 rounded-xl font-bold ${
                        theme === 'dark'
                          ? 'bg-white/10 text-slate-300'
                          : 'bg-black/5 text-slate-600'
                      }`}
                    >
                      বাতিল
                    </button>
                    <button
                      onClick={showAddForm === 'prayer' ? handleAddPrayer : handleAddNote}
                      disabled={loading || !newTitle.trim() || !newNote.trim()}
                      className="flex-1 py-2 rounded-xl bg-violet-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Send size={18} />
                        </motion.div>
                      ) : (
                        <Send size={18} />
                      )}
                      {showAddForm === 'prayer' ? 'প্রার্থনা যোগ করুন' : 'মন্তব্য যোগ করুন'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

CommunityHubModal.displayName = 'CommunityHubModal';
