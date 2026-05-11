import React, { memo, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Share2, Copy, Check, Palette, Type, Image, Smartphone } from 'lucide-react';
import { shareContent } from '../hooks/useCapacitor';

interface ShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  verse: {
    reference: string;
    text: string;
    version?: string;
  };
  onShare?: (cardDataUrl: string) => void;
  theme: string;
}

const BACKGROUNDS = [
  { id: 'gradient1', name: 'Golden Sunrise', gradient: 'from-amber-500 via-orange-400 to-yellow-300' },
  { id: 'gradient2', name: 'Ocean Blue', gradient: 'from-blue-600 via-indigo-500 to-purple-400' },
  { id: 'gradient3', name: 'Forest Green', gradient: 'from-emerald-600 via-teal-500 to-cyan-400' },
  { id: 'gradient4', name: 'Royal Purple', gradient: 'from-violet-600 via-purple-500 to-pink-400' },
  { id: 'gradient5', name: 'Warm Brown', gradient: 'from-amber-700 via-orange-600 to-yellow-500' },
  { id: 'dark1', name: 'Night Sky', gradient: 'from-slate-900 via-slate-800 to-slate-700' },
  { id: 'dark2', name: 'Deep Navy', gradient: 'from-indigo-950 via-blue-900 to-slate-800' },
  { id: 'light1', name: 'Pure Light', gradient: 'from-white via-gray-50 to-amber-50' },
];

const TEMPLATES = [
  { id: 'classic', name: 'ক্লাসিক', icon: '📜' },
  { id: 'modern', name: 'মডার্ন', icon: '✨' },
  { id: 'minimal', name: 'মিনিমাল', icon: '◻️' },
  { id: 'gradient', name: 'গ্র্যাডিয়েন্ট', icon: '🌈' },
];

export const ShareCardModal = memo<ShareCardProps>(({
  isOpen,
  onClose,
  verse,
  theme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showLogo, setShowLogo] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fontSizes = {
    sm: { verse: 16, ref: 12, padding: 24 },
    md: { verse: 22, ref: 14, padding: 32 },
    lg: { verse: 28, ref: 16, padding: 40 },
  };

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    
    setIsExporting(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 1080;
      canvas.height = 1350;

      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      const colors = getGradientColors(selectedBg.gradient);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.5, colors[1]);
      gradient.addColorStop(1, colors[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Text settings
      ctx.textAlign = 'center';
      const size = fontSizes[fontSize];

      // Draw decorative element
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 100, 300, 0, Math.PI * 2);
      ctx.fill();

      // Draw quote marks
      ctx.font = `bold 120px Georgia, serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillText('"', 120, 350);
      ctx.fillText('"', canvas.width - 120, 650);

      // Draw verse text (wrapped)
      const isDark = selectedBg.id.includes('dark');
      ctx.fillStyle = isDark ? '#f5f5f5' : '#1a1a1a';
      ctx.font = `${size.verse}px "Noto Sans Bengali", "SolaimanLipi", sans-serif`;
      
      const maxWidth = canvas.width - size.padding * 2;
      const lines = wrapText(ctx, verse.text, maxWidth);
      const lineHeight = size.verse * 1.8;
      const startY = canvas.height / 2 - (lines.length * lineHeight) / 2 + size.verse / 2;

      lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, startY + i * lineHeight);
      });

      // Draw reference
      ctx.font = `${size.ref}px "Noto Sans Bengali", sans-serif`;
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)';
      ctx.fillText(verse.reference, canvas.width / 2, startY + lines.length * lineHeight + 60);

      // Draw logo
      if (showLogo) {
        ctx.font = 'bold 14px "Noto Sans Bengali", sans-serif';
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)';
        ctx.fillText('পবিত্র বানী', canvas.width / 2, canvas.height - 40);
      }

      // Download
      const link = document.createElement('a');
      link.download = `sacred_word_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [selectedBg, fontSize, showLogo, verse]);

  const handleCopyText = useCallback(() => {
    const text = `"${verse.text}"\n\n— ${verse.reference}\n\n📜 পবিত্র বানী - Sacred Word`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [verse]);

  const handleNativeShare = useCallback(async () => {
    const text = `"${verse.text}"\n\n— ${verse.reference}\n\n📜 পবিত্র বানী - Sacred Word`;
    try {
      await shareContent({
        title: 'পবিত্র বানী - Sacred Word',
        text,
        url: `https://sacredword.vercel.app/?verse=${encodeURIComponent(verse.reference)}`,
        dialogTitle: 'শেয়ার করুন',
      });
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, [verse]);

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
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto rounded-3xl overflow-hidden ${
              theme === 'dark' ? 'bg-slate-900' : 'bg-white'
            } shadow-2xl`}>
              
              {/* Header */}
              <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-black/5'
              }`}>
                <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900'}`}>
                  শেয়ার কার্ড তৈরি করুন
                </h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-6">
                {/* Preview */}
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedBg.gradient}`}>
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <div className="text-center">
                        <p className={`font-bold leading-relaxed ${
                          selectedBg.id.includes('dark') || selectedBg.id.includes('gradient') 
                            ? 'text-white' 
                            : 'text-gray-900'
                        }`} style={{ fontSize: fontSizes[fontSize].verse }}>
                          {verse.text.slice(0, 150)}{verse.text.length > 150 ? '...' : ''}
                        </p>
                        <p className={`mt-4 text-sm ${
                          selectedBg.id.includes('dark') || selectedBg.id.includes('gradient')
                            ? 'text-white/70'
                            : 'text-gray-600'
                        }`}>
                          — {verse.reference}
                        </p>
                        {showLogo && (
                          <p className={`mt-6 text-xs ${
                            selectedBg.id.includes('dark') || selectedBg.id.includes('gradient')
                              ? 'text-white/50'
                              : 'text-gray-400'
                          }`}>
                            📜 পবিত্র বানী
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette size={18} className="text-amber-500" />
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      ব্যাকগ্রাউন্ড
                    </h3>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => setSelectedBg(bg)}
                        className={`aspect-square rounded-xl bg-gradient-to-br ${bg.gradient} transition-all ${
                          selectedBg.id === bg.id ? 'ring-2 ring-amber-500 scale-105' : 'hover:scale-105'
                        }`}
                        title={bg.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Type size={18} className="text-amber-500" />
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                      ফন্ট সাইজ
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {(['sm', 'md', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                          fontSize === size
                            ? 'bg-amber-500 text-white'
                            : theme === 'dark'
                              ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                              : 'bg-black/5 text-slate-700 hover:bg-black/10'
                        }`}
                      >
                        {size === 'sm' ? 'ছোট' : size === 'md' ? 'মাঝারি' : 'বড়'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Toggle */}
                <div className="flex items-center justify-between">
                  <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                    লোগো দেখান
                  </span>
                  <button
                    onClick={() => setShowLogo(!showLogo)}
                    className={`w-12 h-7 rounded-full transition-all ${
                      showLogo ? 'bg-amber-500' : theme === 'dark' ? 'bg-white/20' : 'bg-black/20'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      showLogo ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCopyText}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                      theme === 'dark'
                        ? 'bg-white/10 hover:bg-white/20'
                        : 'bg-black/5 hover:bg-black/10'
                    }`}
                  >
                    {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
                    <span>{copied ? 'কপি হয়েছে!' : 'টেক্সট কপি'}</span>
                  </button>
                  <button
                    onClick={handleNativeShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition-all"
                  >
                    <Smartphone size={20} />
                    <span>নেটিভ শেয়ার</span>
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-white transition-all disabled:opacity-50"
                  >
                    {isExporting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Download size={20} />
                      </motion.div>
                    ) : (
                      <Image size={20} />
                    )}
                    <span>{isExporting ? 'তৈরি হচ্ছে...' : 'ইমেজ ডাউনলোড'}</span>
                  </button>
                </div>
              </div>

              {/* Hidden Canvas */}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

ShareCardModal.displayName = 'ShareCardModal';

function getGradientColors(gradient: string): string[] {
  const map: Record<string, string[]> = {
    'from-amber-500 via-orange-400 to-yellow-300': ['#f59e0b', '#fb923c', '#fcd34d'],
    'from-blue-600 via-indigo-500 to-purple-400': ['#2563eb', '#6366f1', '#a78bfa'],
    'from-emerald-600 via-teal-500 to-cyan-400': ['#059669', '#14b8a6', '#22d3ee'],
    'from-violet-600 via-purple-500 to-pink-400': ['#7c3aed', '#a855f7', '#f472b6'],
    'from-amber-700 via-orange-600 to-yellow-500': ['#b45309', '#ea580c', '#eab308'],
    'from-slate-900 via-slate-800 to-slate-700': ['#0f172a', '#1e293b', '#334155'],
    'from-indigo-950 via-blue-900 to-slate-800': ['#1e1b4b', '#1e40af', '#1e293b'],
    'from-white via-gray-50 to-amber-50': ['#ffffff', '#f9fafb', '#fef3c7'],
  };
  return map[gradient] || ['#f59e0b', '#fb923c', '#fcd34d'];
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split('');
  const lines: string[] = [];
  let currentLine = '';

  for (const char of words) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
