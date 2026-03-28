import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Bookmark, XCircle, Loader2 } from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  theme: string;
}

export const MemoizedNavItem = memo<NavItemProps>(({ icon, label, active, onClick, theme }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 lg:gap-3 transition-all px-4 lg:px-6 py-3 rounded-2xl group relative ${
      active 
        ? (theme === 'dark' ? 'text-amber-400' : 'text-amber-700') 
        : (theme === 'dark' ? 'text-slate-300 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')
    }`}
  >
    {active && (
      <motion.div 
        layoutId="nav-pill"
        className="absolute inset-0 bg-amber-500/10 rounded-2xl shadow-[0_0_20px_rgba(139,115,85,0.1)]"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-2">
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wide">{label}</span>
    </span>
  </button>
));

MemoizedNavItem.displayName = 'MemoizedNavItem';

interface MobileNavItemProps {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
  theme: string;
}

export const MemoizedMobileNavItem = memo<MobileNavItemProps>(({ icon, active, onClick, label, theme }) => (
  <button onClick={onClick} className="relative flex-1 flex flex-col items-center justify-center py-3 group">
    <div className={`relative z-10 transition-all duration-500 flex flex-col items-center ${
      active 
        ? 'text-amber-500 scale-110' 
        : (theme === 'dark' ? 'text-slate-300 group-hover:text-amber-500/50' : 'text-slate-500 group-hover:text-amber-500/50')
    }`}>
      {icon}
      <span className={`text-[10px] mt-1.5 font-bold tracking-wider uppercase transition-all duration-500 ${
        active 
          ? 'text-amber-500' 
          : (theme === 'dark' ? 'text-slate-300' : 'text-slate-500')
      }`}>{label}</span>
    </div>
    {active && (
      <motion.div 
        layoutId="mobile-nav-active"
        className="absolute inset-0 bg-amber-500/10 rounded-2xl shadow-[inset_0_0_20px_rgba(245,158,11,0.1)] border border-amber-500/20 mx-2"
      />
    )}
  </button>
));

MemoizedMobileNavItem.displayName = 'MemoizedMobileNavItem';

interface SnippetBookmarkProps {
  saved: boolean;
  onClick: (e: React.MouseEvent) => void;
  theme: string;
}

export const MemoizedSnippetBookmark = memo<SnippetBookmarkProps>(({ saved, onClick, theme }) => (
  <button 
    onClick={onClick}
    className={`p-2 rounded-xl transition-all duration-300 ${
      saved 
        ? 'bg-amber-500 text-white shadow-lg scale-110' 
        : (theme === 'dark' ? 'bg-white/5 text-slate-300 hover:text-amber-500 hover:bg-white/10' : 'bg-black/5 text-slate-600 hover:text-amber-600 hover:bg-black/10')
    }`}
  >
    <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
  </button>
));

MemoizedSnippetBookmark.displayName = 'MemoizedSnippetBookmark';

interface TagProps { 
  tag: string; 
  onRemove?: () => void; 
  theme: string;
  selected?: boolean;
  onClick?: () => void;
}

export const MemoizedTag = memo<TagProps>(({ tag, onRemove, theme, selected, onClick }) => (
  <span 
    onClick={onClick}
    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
      selected
        ? 'bg-amber-500 text-white shadow-lg'
        : (theme === 'dark' 
            ? 'bg-white/10 text-slate-300 hover:bg-amber-500/20 hover:text-amber-400' 
            : 'bg-black/5 text-slate-600 hover:bg-amber-500/10 hover:text-amber-600'
          )
    } ${onClick ? 'cursor-pointer' : ''}`}
  >
    {tag}
    {onRemove && (
      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
      >
        <XCircle size={12} />
      </button>
    )}
  </span>
));

MemoizedTag.displayName = 'MemoizedTag';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  theme: string;
  disabled?: boolean;
}

export const MemoizedActionButton = memo<ActionButtonProps>(({ icon, label, onClick, variant = 'ghost', theme, disabled }) => {
  const baseClasses = 'flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-200 disabled:opacity-40';
  const variantClasses = {
    primary: theme === 'dark' 
      ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-lg' 
      : 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg',
    secondary: theme === 'dark'
      ? 'bg-white/10 text-slate-200 hover:bg-white/20'
      : 'bg-black/5 text-slate-700 hover:bg-black/10',
    ghost: theme === 'dark'
      ? 'text-slate-300 hover:text-amber-400 hover:bg-white/5'
      : 'text-slate-600 hover:text-amber-600 hover:bg-black/5'
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${variant !== 'primary' ? 'border border-white/10' : ''}`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
});

MemoizedActionButton.displayName = 'MemoizedActionButton';

export const MemoizedLoadingSpinner = memo<{ size?: number; className?: string }>(({ size = 24, className = '' }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className={className}
  >
    <Loader2 size={size} className="text-amber-500" />
  </motion.div>
));

MemoizedLoadingSpinner.displayName = 'MemoizedLoadingSpinner';
