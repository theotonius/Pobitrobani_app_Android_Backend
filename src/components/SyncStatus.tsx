import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Cloud, RefreshCw, Check } from 'lucide-react';

interface SyncIndicatorProps {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  onClick?: () => void;
  compact?: boolean;
  theme: string;
}

export const SyncIndicator = memo<SyncIndicatorProps>(({
  isSyncing,
  lastSyncTime,
  pendingChanges,
  onClick,
  compact = false,
  theme,
}) => {
  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getStatus = () => {
    if (isSyncing) return { icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (pendingChanges > 0) return { icon: Cloud, color: 'text-amber-500', bg: 'bg-amber-500/10' };
    return { icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${status.bg}`}
      >
        <motion.div
          animate={isSyncing ? { rotate: 360 } : {}}
          transition={isSyncing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        >
          <StatusIcon size={14} className={status.color} />
        </motion.div>
        {pendingChanges > 0 && !isSyncing && (
          <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
            {pendingChanges}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
        theme === 'dark'
          ? 'bg-white/5 hover:bg-white/10 border border-white/5'
          : 'bg-black/5 hover:bg-black/10 border border-black/5'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <motion.div
        animate={isSyncing ? { rotate: 360 } : {}}
        transition={isSyncing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${status.bg}`}
      >
        <StatusIcon size={16} className={status.color} />
      </motion.div>
      
      <div className="flex-1 text-left">
        <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
          {isSyncing 
            ? 'Syncing...' 
            : pendingChanges > 0 
              ? `${pendingChanges} changes pending` 
              : 'Synced'
          }
        </p>
        <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
          {formatTime(lastSyncTime)}
        </p>
      </div>
    </button>
  );
});

SyncIndicator.displayName = 'SyncIndicator';

interface UserAvatarProps {
  profile: { display_name?: string | null; avatar_url?: string | null } | null;
  isAnonymous: boolean;
  onClick: () => void;
  theme: string;
}

export const UserAvatar = memo<UserAvatarProps>(({
  profile,
  isAnonymous,
  onClick,
  theme,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center transition-all overflow-hidden ${
        isAnonymous
          ? theme === 'dark'
            ? 'bg-white/10'
            : 'bg-black/10'
          : 'bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 shadow-lg'
      }`}
    >
      {isAnonymous ? (
        <span className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>👤</span>
      ) : profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.display_name || 'User'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-lg text-white">👤</span>
      )}
    </button>
  );
});

UserAvatar.displayName = 'UserAvatar';
