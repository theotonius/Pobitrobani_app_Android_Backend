import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, RefreshCw, Download, X, Check } from 'lucide-react';

interface OfflineBannerProps {
  isOffline: boolean;
  isBackOnline?: boolean;
}

export const OfflineBanner = memo<OfflineBannerProps>(({ isOffline, isBackOnline }) => (
  <AnimatePresence>
    {(isOffline || isBackOnline) && (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`fixed top-0 left-0 right-0 z-[9999] py-3 px-4 text-center font-bold text-sm flex items-center justify-center gap-2 ${
          isOffline 
            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white' 
            : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white'
        }`}
      >
        {isOffline ? (
          <>
            <WifiOff size={18} />
            <span>অফলাইন মোড - সংরক্ষিত পদ দেখুন</span>
          </>
        ) : (
          <>
            <Wifi size={18} />
            <span>আবার অনলাইনে ফিরে এসেছেন!</span>
            <Check size={18} className="ml-2" />
          </>
        )}
      </motion.div>
    )}
  </AnimatePresence>
));

OfflineBanner.displayName = 'OfflineBanner';

interface UpdateBannerProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export const UpdateBanner = memo<UpdateBannerProps>(({ onUpdate, onDismiss }) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 100, opacity: 0 }}
    className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-auto z-50"
  >
    <div className="divine-glass rounded-2xl p-4 shadow-2xl border border-amber-500/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <RefreshCw size={20} className="text-amber-500" />
        </div>
        <div>
          <p className="font-bold text-sm">নতুন আপডেট পাওয়া গেছে!</p>
          <p className="text-xs text-slate-500">পরিবর্তনগুলো প্রয়োগ করতে রিফ্রেশ করুন</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onUpdate}
          className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Download size={16} />
          আপডেট করুন
        </button>
        <button
          onClick={onDismiss}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  </motion.div>
));

UpdateBanner.displayName = 'UpdateBanner';

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss: () => void;
  appName?: string;
}

export const InstallPrompt = memo<InstallPromptProps>(({ onInstall, onDismiss, appName = 'পবিত্র বানী' }) => (
  <motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 100, opacity: 0 }}
    className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-80 z-50"
  >
    <div className={`divine-glass rounded-3xl p-6 shadow-2xl border ${document.body.classList.contains('dark-theme') ? 'border-white/10 bg-slate-900/95' : 'border-black/5 bg-white/95'}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
          <span className="text-2xl">📜</span>
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-lg mb-1 ${document.body.classList.contains('dark-theme') ? 'text-amber-100' : 'text-amber-900'}`}>
            {appName} ইনস্টল করুন
          </h3>
          <p className={`text-sm ${document.body.classList.contains('dark-theme') ? 'text-slate-400' : 'text-slate-600'}`}>
            দ্রুত অ্যাক্সেস ও অফলাইন ব্যবহারের জন্য হোম স্ক্রিনে যোগ করুন
          </p>
        </div>
        <button
          onClick={onDismiss}
          className={`p-2 rounded-xl transition-colors ${document.body.classList.contains('dark-theme') ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onInstall}
          className="flex-1 bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-6 rounded-2xl text-sm transition-colors shadow-lg"
        >
          ইনস্টল করুন
        </button>
        <button
          onClick={onDismiss}
          className={`px-6 py-3 font-bold text-sm rounded-2xl transition-colors ${
            document.body.classList.contains('dark-theme') 
              ? 'bg-white/10 hover:bg-white/20' 
              : 'bg-black/5 hover:bg-black/10'
          }`}
        >
          পরে
        </button>
      </div>
    </div>
  </motion.div>
));

InstallPrompt.displayName = 'InstallPrompt';

interface SyncStatusProps {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  onRetry?: () => void;
}

export const SyncStatus = memo<SyncStatusProps>(({ isSyncing, lastSyncTime, onRetry }) => (
  <div className="flex items-center gap-2 text-xs text-slate-500">
    {isSyncing ? (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <RefreshCw size={14} />
      </motion.div>
    ) : lastSyncTime ? (
      <>
        <Check size={14} className="text-emerald-500" />
        <span>
          সিঙ্ক হয়েছে {formatTimeAgo(lastSyncTime)}
        </span>
      </>
    ) : onRetry ? (
      <button onClick={onRetry} className="flex items-center gap-1 hover:text-amber-500 transition-colors">
        <RefreshCw size={14} />
        <span>সিঙ্ক করুন</span>
      </button>
    ) : null}
  </div>
));

SyncStatus.displayName = 'SyncStatus';

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'এইমাত্র';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} মিনিট আগে`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} ঘন্টা আগে`;
  return `${Math.floor(seconds / 86400)} দিন আগে`;
}
