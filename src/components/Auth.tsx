import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, User, Shield, Cloud, RefreshCw, Loader2, AlertCircle, Check, Settings, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => Promise<void>;
  onAnonymousSignIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const LoginModal = memo<LoginModalProps>(({
  isOpen,
  onClose,
  onGoogleSignIn,
  onAnonymousSignIn,
  isLoading,
  error,
}) => {
  const [showBenefits, setShowBenefits] = useState(false);
  const supabaseReady = isSupabaseConfigured;

  const benefits = [
    { icon: Cloud, title: 'Cloud Sync', desc: 'সব ডিভাইসে ডেটা সিঙ্ক' },
    { icon: RefreshCw, title: 'Backup', desc: 'স্বয়ংক্রিয় ব্যাকআপ' },
    { icon: Shield, title: 'Secure', desc: 'encrypted সংরক্ষণ' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            {!supabaseReady && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 max-w-md w-full px-4 pointer-events-auto">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-500 text-sm">Supabase কনফিগার করা হয়নি!</p>
                    <p className="text-xs text-amber-400/80 mt-1">
                      Cloud sync ব্যবহার করতে <code className="bg-amber-500/20 px-1 rounded">.env</code> ফাইলে Supabase URL এবং Key যোগ করুন।
                    </p>
                    <a
                      href="SUPABASE_SETUP.md"
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 mt-2 font-bold"
                    >
                      <ExternalLink size={12} />
                      সেটআপ গাইড দেখুন
                    </a>
                  </div>
                </div>
              </div>
            )}
            <div className={`w-full max-w-md pointer-events-auto rounded-3xl overflow-hidden ${
              document.body.classList.contains('dark-theme')
                ? 'bg-[#0a0a05]/95 border border-white/10'
                : 'bg-white/95 border border-black/5'
            } shadow-2xl backdrop-blur-xl`}>
              {/* Header */}
              <div className="relative p-6 pb-4">
                <button
                  onClick={onClose}
                  className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
                    document.body.classList.contains('dark-theme')
                      ? 'hover:bg-white/10'
                      : 'hover:bg-black/5'
                  }`}
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">📜</span>
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${
                      document.body.classList.contains('dark-theme')
                        ? 'text-amber-100'
                        : 'text-amber-900'
                    }`}>
                      স্বাগতম!
                    </h2>
                    <p className={`text-sm ${
                      document.body.classList.contains('dark-theme')
                        ? 'text-slate-400'
                        : 'text-slate-600'
                    }`}>
                      আপনার অ্যাকাউন্টে লগইন করুন
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mx-6 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {/* Benefits Section */}
              <div className="px-6 pb-4">
                <button
                  onClick={() => setShowBenefits(!showBenefits)}
                  className={`w-full text-left text-sm font-bold mb-3 flex items-center gap-2 ${
                    document.body.classList.contains('dark-theme')
                      ? 'text-amber-400'
                      : 'text-amber-700'
                  }`}
                >
                  <Check size={16} />
                  লগইন করলে যা পাবেন
                  <span className="ml-auto">{showBenefits ? '▲' : '▼'}</span>
                </button>

                <AnimatePresence>
                  {showBenefits && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-3 gap-3 pb-2">
                        {benefits.map((benefit, index) => (
                          <div
                            key={index}
                            className={`p-3 rounded-xl text-center ${
                              document.body.classList.contains('dark-theme')
                                ? 'bg-white/5'
                                : 'bg-black/5'
                            }`}
                          >
                            <benefit.icon size={24} className="mx-auto mb-2 text-amber-500" />
                            <p className={`text-xs font-bold ${
                              document.body.classList.contains('dark-theme')
                                ? 'text-slate-200'
                                : 'text-slate-700'
                            }`}>
                              {benefit.title}
                            </p>
                            <p className={`text-[10px] ${
                              document.body.classList.contains('dark-theme')
                                ? 'text-slate-400'
                                : 'text-slate-500'
                            }`}>
                              {benefit.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Buttons */}
              <div className="p-6 pt-2 space-y-3">
                {/* Google Sign In */}
                <button
                  onClick={onGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl transition-all shadow-lg border border-gray-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span>Google দিয়ে লগইন</span>
                </button>

                {/* Divider */}
                <div className={`flex items-center gap-4 py-2 ${
                  document.body.classList.contains('dark-theme')
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}>
                  <div className="flex-1 h-px bg-current opacity-20" />
                  <span className="text-xs font-bold">অথবা</span>
                  <div className="flex-1 h-px bg-current opacity-20" />
                </div>

                {/* Anonymous Sign In */}
                <button
                  onClick={onAnonymousSignIn}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 font-bold rounded-2xl transition-all ${
                    document.body.classList.contains('dark-theme')
                      ? 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
                      : 'bg-black/5 hover:bg-black/10 text-slate-700 border border-black/5'
                  } disabled:opacity-50`}
                >
                  <User size={22} />
                  <span>গেস্ট হিসেবে চালিয়ে যান</span>
                </button>

                {/* Skip Button */}
                <button
                  onClick={onClose}
                  className={`w-full py-3 text-sm font-bold transition-colors ${
                    document.body.classList.contains('dark-theme')
                      ? 'text-slate-400 hover:text-slate-300'
                      : 'text-slate-500 hover:text-slate-600'
                  }`}
                >
                  এড়িয়ে যান
                </button>
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 border-t text-center text-xs ${
                document.body.classList.contains('dark-theme')
                  ? 'border-white/5 text-slate-500'
                  : 'border-black/5 text-slate-400'
              }`}>
                লগইন করলে আপনি আমাদের{' '}
                <span className={`font-bold ${
                  document.body.classList.contains('dark-theme')
                    ? 'text-slate-400'
                    : 'text-slate-600'
                }`}>
                  Terms of Service
                </span>{' '}
                এবং{' '}
                <span className={`font-bold ${
                  document.body.classList.contains('dark-theme')
                    ? 'text-slate-400'
                    : 'text-slate-600'
                }`}>
                  Privacy Policy
                </span>{' '}
                এর সাথে সম্মত হন।
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

LoginModal.displayName = 'LoginModal';
