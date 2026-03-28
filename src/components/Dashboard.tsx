import React, { memo } from 'react';
import { motion } from 'motion/react';
import { 
  User, Cloud, CloudOff, RefreshCw, Download, Upload, Trash2, 
  Check, AlertCircle, Clock, BookOpen, Bookmark, Settings, 
  LogOut, ChevronRight, Shield, Database, Wifi, WifiOff
} from 'lucide-react';
import { Profile } from '../types/database';

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  user: { email?: string; is_anonymous?: boolean } | null;
  isAnonymous: boolean;
  syncStatus: {
    lastSyncTime: Date | null;
    isSyncing: boolean;
    pendingChanges: number;
    connectionStatus: 'online' | 'offline';
  };
  savedVersesCount: number;
  savedSnippetsCount: number;
  onSyncNow: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onClearLocalData: () => void;
  onSignOut: () => void;
  onUpdateProfile: () => void;
  theme: string;
}

export const Dashboard = memo<DashboardProps>(({
  isOpen,
  onClose,
  profile,
  user,
  isAnonymous,
  syncStatus,
  savedVersesCount,
  savedSnippetsCount,
  onSyncNow,
  onExportData,
  onImportData,
  onClearLocalData,
  onSignOut,
  onUpdateProfile,
  theme,
}) => {
  if (!isOpen) return null;

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'কখনো সিঙ্ক হয়নি';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'এইমাত্র';
    if (minutes < 60) return `${minutes} মিনিট আগে`;
    if (hours < 24) return `${hours} ঘন্টা আগে`;
    return `${days} দিন আগে`;
  };

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    sublabel, 
    onClick, 
    badge,
    danger = false 
  }: { 
    icon: React.ElementType; 
    label: string; 
    sublabel?: string; 
    onClick: () => void; 
    badge?: string | number;
    danger?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${
        danger
          ? 'hover:bg-red-500/10'
          : theme === 'dark'
            ? 'hover:bg-white/5'
            : 'hover:bg-black/5'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
        danger
          ? 'bg-red-500/10 text-red-500'
          : theme === 'dark'
            ? 'bg-white/5 text-amber-500'
            : 'bg-black/5 text-amber-600'
      }`}>
        <Icon size={22} />
      </div>
      <div className="flex-1 text-left">
        <p className={`font-bold ${danger ? 'text-red-500' : theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
          {label}
        </p>
        {sublabel && (
          <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
            {sublabel}
          </p>
        )}
      </div>
      {badge && (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          theme === 'dark'
            ? 'bg-white/10 text-slate-300'
            : 'bg-black/10 text-slate-600'
        }`}>
          {badge}
        </span>
      )}
      <ChevronRight size={20} className={`transition-transform group-hover:translate-x-1 ${
        theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
      }`} />
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150]"
      />

      {/* Dashboard Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`fixed top-0 right-0 bottom-0 w-full max-w-md z-[151] overflow-y-auto ${
          theme === 'dark'
            ? 'bg-[#0a0a05]'
            : 'bg-[#fafaf9]'
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 p-6 pb-4 ${
          theme === 'dark'
            ? 'bg-[#0a0a05]/95 backdrop-blur-xl border-b border-white/5'
            : 'bg-[#fafaf9]/95 backdrop-blur-xl border-b border-black/5'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900'}`}>
              ড্যাশবোর্ড
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-white/10'
                  : 'hover:bg-black/5'
              }`}
            >
              <X size={24} />
            </button>
          </div>

          {/* Profile Card */}
          <div className={`flex items-center gap-4 p-4 rounded-2xl ${
            theme === 'dark'
              ? 'bg-white/5 border border-white/5'
              : 'bg-black/5 border border-black/5'
          }`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isAnonymous
                ? theme === 'dark'
                  ? 'bg-white/10'
                  : 'bg-black/10'
                : 'bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800'
            }`}>
              {isAnonymous ? (
                <User size={28} className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} />
              ) : profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || 'User'}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-bold text-lg ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                {profile?.display_name || user?.email?.split('@')[0] || 'ব্যবহারকারী'}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {isAnonymous ? '👻 গেস্ট ব্যবহারকারী' : (user?.email || 'Email not available')}
              </p>
            </div>
            <button
              onClick={onUpdateProfile}
              className={`p-2 rounded-xl transition-colors ${
                theme === 'dark'
                  ? 'hover:bg-white/10'
                  : 'hover:bg-black/5'
              }`}
            >
              <Settings size={20} />
            </button>
          </div>

          {/* Sync Status */}
          <div className={`flex items-center gap-3 mt-4 p-3 rounded-xl ${
            syncStatus.connectionStatus === 'offline'
              ? 'bg-amber-500/10 border border-amber-500/20'
              : theme === 'dark'
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-emerald-500/5 border border-emerald-500/20'
          }`}>
            {syncStatus.connectionStatus === 'offline' ? (
              <WifiOff size={18} className="text-amber-500" />
            ) : syncStatus.isSyncing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw size={18} className="text-emerald-500" />
              </motion.div>
            ) : (
              <Wifi size={18} className="text-emerald-500" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-bold ${
                syncStatus.connectionStatus === 'offline'
                  ? 'text-amber-500'
                  : theme === 'dark'
                    ? 'text-emerald-500'
                    : 'text-emerald-600'
              }`}>
                {syncStatus.connectionStatus === 'offline' 
                  ? 'অফলাইন'
                  : syncStatus.isSyncing 
                    ? 'সিঙ্ক হচ্ছে...'
                    : 'সংযুক্ত'
                }
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                শেষ সিঙ্ক: {formatLastSync(syncStatus.lastSyncTime)}
              </p>
            </div>
            {syncStatus.connectionStatus !== 'offline' && !syncStatus.isSyncing && (
              <button
                onClick={onSyncNow}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-lg transition-colors"
              >
                সিঙ্ক
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 pt-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${
            theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
          }`}>
            আপনার ডেটা
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-4 rounded-2xl ${
              theme === 'dark'
                ? 'bg-white/5 border border-white/5'
                : 'bg-black/5 border border-black/5'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={18} className="text-amber-500" />
                <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  সংরক্ষিত পদ
                </span>
              </div>
              <p className={`text-2xl font-black ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                {savedVersesCount}
              </p>
            </div>
            <div className={`p-4 rounded-2xl ${
              theme === 'dark'
                ? 'bg-white/5 border border-white/5'
                : 'bg-black/5 border border-black/5'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Bookmark size={18} className="text-amber-500" />
                <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  স্নিপেট
                </span>
              </div>
              <p className={`text-2xl font-black ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                {savedSnippetsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Sync & Backup */}
        <div className="px-6 pb-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${
            theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
          }`}>
            সিঙ্ক ও ব্যাকআপ
          </h3>
          <div className={`rounded-2xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-white/5 border border-white/5'
              : 'bg-black/5 border border-black/5'
          }`}>
            <MenuItem
              icon={Cloud}
              label="Cloud সিঙ্ক"
              sublabel="সব ডিভাইসে ডেটা সিঙ্ক করুন"
              onClick={onSyncNow}
              badge={syncStatus.pendingChanges > 0 ? `${syncStatus.pendingChanges} pending` : undefined}
            />
            <div className={`h-px mx-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`} />
            <MenuItem
              icon={Download}
              label="Export ডেটা"
              sublabel="JSON ফাইলে সেভ করুন"
              onClick={onExportData}
            />
            <div className={`h-px mx-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`} />
            <MenuItem
              icon={Upload}
              label="Import ডেটা"
              sublabel="পুরানো ডেটা ফিরে আনুন"
              onClick={onImportData}
            />
            <div className={`h-px mx-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`} />
            <MenuItem
              icon={Database}
              label="স্থানীয় ডেটা"
              sublabel={`${savedVersesCount + savedSnippetsCount} টি আইটেম`}
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Account */}
        <div className="px-6 pb-4">
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${
            theme === 'dark' ? 'text-slate-500' : 'text-slate-500'
          }`}>
            অ্যাকাউন্ট
          </h3>
          <div className={`rounded-2xl overflow-hidden ${
            theme === 'dark'
              ? 'bg-white/5 border border-white/5'
              : 'bg-black/5 border border-black/5'
          }`}>
            <MenuItem
              icon={Shield}
              label="প্রাইভেসি সেটিংস"
              sublabel="ডেটা শেয়ারিং কন্ট্রোল"
              onClick={() => {}}
            />
            <div className={`h-px mx-4 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`} />
            <MenuItem
              icon={LogOut}
              label="লগআউট"
              sublabel="অ্যাকাউন্ট থেকে বের হন"
              onClick={onSignOut}
              danger
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="px-6 pb-8">
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 text-red-500`}>
            বিপদজনক অঞ্চল
          </h3>
          <button
            onClick={onClearLocalData}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-red-500/20 text-red-500">
              <Trash2 size={22} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-red-500">সব ডেটা মুছুন</p>
              <p className="text-xs text-red-400">স্থানীয় ডেটা স্থায়ীভাবে মুছে যাবে</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className={`p-6 text-center text-xs ${
          theme === 'dark'
            ? 'text-slate-600 border-t border-white/5'
            : 'text-slate-400 border-t border-black/5'
        }`}>
          <p>{user?.email ? 'Signed in' : 'Guest Mode'} • পবিত্র বানী v1.0</p>
        </div>
      </motion.div>
    </>
  );
});

Dashboard.displayName = 'Dashboard';

import { X } from 'lucide-react';
