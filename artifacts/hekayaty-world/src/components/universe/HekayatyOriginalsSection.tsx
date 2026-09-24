import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Crown,
  Sparkles,
  Play,
  Star,
  Bookmark,
  Share2,
  ChevronLeft,
  Compass,
  Layers,
  Flame,
  Loader2,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

import { getImageUrl } from '@/assets';

export function HekayatyOriginalsSection() {
  const { session, isSubscriber } = useAuth();
  const [originalsList, setOriginalsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [savedItems, setSavedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    fetch('/api/originals/showcase')
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          if (Array.isArray(data.originals) && data.originals.length > 0) {
            setOriginalsList(data.originals);
          } else if (Array.isArray(data.allOriginals) && data.allOriginals.length > 0) {
            setOriginalsList(data.allOriginals);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Error fetching originals showcase:', err);
        setLoading(false);
      });
  }, []);

  const filteredOriginals = originalsList.filter((item) => {
    if (selectedType === 'All') return true;
    const typeStr = (item.contentType || item.content_type || item.type || '').toLowerCase();
    return typeStr.includes(selectedType.toLowerCase());
  });

  const handleShare = (title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ رابط أوريجينالز للحافظة!');
    }
  };

  const handleToggleSave = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedItems((prev) => {
      const nextState = !prev[id];
      toast.success(nextState ? 'تمت إضافة العمل إلى مكتبتك 🔖' : 'تمت الإزالة من المكتبة');
      return { ...prev, [id]: nextState };
    });
  };

  if (loading) {
    return (
      <section className="w-full bg-[#050508] py-20 text-center text-amber-400 font-serif border-b border-white/10 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
        <p className="text-sm font-bold tracking-wider uppercase text-amber-300/90">جاري استدعاء قائمة أعمال حكاياتي أوريجينالز...</p>
      </section>
    );
  }

  return (
    <section className="w-full bg-[#050508] text-foreground relative overflow-hidden py-16 md:py-24 border-b border-white/10" dir="rtl">
      {/* Custom Background Image - Ultra Clear & Very Visible */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src={getImageUrl('originals-bg.png')} 
          alt="Hekayaty Originals Backdrop" 
          className="w-full h-full object-cover object-center opacity-100 brightness-110 contrast-105 filter"
        />
        {/* Dark Vignette Overlay to enhance readability without obscuring art */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-[#050508]" />
      </div>

      {/* Background Ambient Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-96 h-96 bg-yellow-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* ── 1. HEADER (Cinematic, Super Clear & Glassmorphic) ────────────────────────── */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-black/90 via-black/80 to-black/90 border-2 border-[#D4AF37]/60 shadow-[0_10px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
          {/* Subtle Golden Accent Glow Inside Card */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/90 border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-xs font-serif font-black uppercase tracking-widest text-[#FFF7D6] drop-shadow">
                استوديو حكاياتي الأصلي • HEKAYATY ORIGINALS STUDIO
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight text-[#FFF7D6] drop-shadow-[0_4px_16px_rgba(0,0,0,1)]">
              إنتاجات حكاياتي <span className="text-amber-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]">أوريجينالز</span>
            </h2>

            <p className="text-sm sm:text-base text-gray-200 max-w-xl font-serif leading-relaxed drop-shadow-md">
              سلاسل وقصص حصرية تم إنتاجها بواسطة استوديو حكاياتي. أعمال لن تجدها في أي مكان آخر.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
            {[
              { id: 'All', label: 'الكل' },
              { id: 'novel', label: 'روايات' },
              { id: 'comic', label: 'كوميكس' },
              { id: 'animation', label: 'أنيميشن' },
              { id: 'universe', label: 'عوالم' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-serif font-bold transition-all shadow-md ${
                  selectedType === tab.id
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black border-2 border-yellow-300 shadow-[0_0_20px_rgba(212,175,55,0.5)] scale-105 font-black'
                    : 'bg-black/80 hover:bg-black text-white hover:text-amber-300 border border-[#D4AF37]/40 hover:border-[#D4AF37] backdrop-blur-md'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 2. HEROIC COVER POSTER CARD GRID (Wow Effect, Main Cover Visual) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredOriginals.map((item) => {
            const itemUrl = item.slug ? `/novels/${item.slug}` : '/originals';
            const isLocked = item.accessLevel === 'subscriber' && !isSubscriber;
            const coverImage = item.coverUrl || item.bannerUrl;

            return (
              <Link
                key={item.id}
                href={itemUrl}
                className="group relative bg-[#0a0a0f] border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_15px_45px_rgba(212,175,55,0.3)] hover:-translate-y-2 flex flex-col justify-end min-h-[460px]"
              >
                {/* Main Cover Image - Dominates 100% of Card Canvas */}
                <div className="absolute inset-0 z-0 bg-[#12121c] overflow-hidden">
                  <img
                    src={coverImage}
                    alt={item.arabicTitle || item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 brightness-105 contrast-105"
                  />
                  
                  {/* Premium Vignette & Dark Gradient Base */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06060a] via-[#06060a]/60 60% to-transparent" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>

                {/* Top Badges Overlay */}
                <div className="absolute top-4 right-4 left-4 z-10 flex items-center justify-between pointer-events-none">
                  {/* Metallic Gold Original Badge */}
                  <div className="px-3 py-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-serif font-black text-[10px] uppercase rounded-full shadow-xl border border-yellow-300 flex items-center gap-1.5 backdrop-blur-md">
                    <Crown className="w-3.5 h-3.5 fill-black text-black" />
                    <span>ORIGINAL</span>
                  </div>

                  {/* Rating / Lock Badge */}
                  <div className="flex items-center gap-2">
                    {isLocked && (
                      <span className="p-1.5 bg-black/80 text-amber-400 rounded-lg border border-amber-400/40 backdrop-blur-md">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <span className="px-2.5 py-1 bg-black/80 text-amber-300 text-xs font-mono font-bold rounded-lg border border-amber-400/30 flex items-center gap-1 backdrop-blur-md">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating || '4.9'}</span>
                    </span>
                  </div>
                </div>

                {/* Card Content Overlay (Bottom 40%) */}
                <div className="relative z-10 p-6 space-y-3.5 text-right bg-gradient-to-t from-[#06060a] via-[#06060a]/95 to-transparent pt-14">
                  {/* Type Tag & Status */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[11px] font-bold rounded-md font-serif">
                      {item.arabicType || item.contentType || 'رواية ملحمية'}
                    </span>
                    <span className="text-[11px] font-mono text-[#aaaaaa]">
                      {item.arabicStatus || item.status || 'مستمر'}
                    </span>
                  </div>

                  {/* Main Title */}
                  <h3 className="font-serif font-black text-2xl text-white group-hover:text-amber-300 transition-colors drop-shadow-md leading-tight">
                    {item.arabicTitle || item.title}
                  </h3>

                  {/* Tagline Pitch */}
                  <p className="text-xs text-[#d0d0dc] line-clamp-2 leading-relaxed font-serif">
                    {item.arabicTagline || item.tagline || item.arabicDescription || item.description}
                  </p>

                  {/* Action Buttons & CTA */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <div className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 text-black font-serif font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 group-hover:brightness-110 transition-all flex items-center gap-2">
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>اقرأ العمل الآن</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleSave(item.id, e)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          savedItems[item.id]
                            ? 'bg-amber-500/20 text-amber-300 border-amber-400/60'
                            : 'bg-black/60 text-white/80 border-white/15 hover:border-amber-400 hover:text-white'
                        }`}
                        title="حفظ"
                      >
                        <Bookmark className={`w-4 h-4 ${savedItems[item.id] ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleShare(item.arabicTitle || item.title, e)}
                        className="p-2.5 bg-black/60 text-white/80 hover:text-white rounded-xl border border-white/15 hover:border-amber-400 transition-all"
                        title="مشاركة"
                      >
                        <Share2 className="w-4 h-4 text-amber-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── 3. BOTTOM VIEW ALL CTA ──────────────────────────────────── */}
        <div className="pt-6 flex justify-center">
          <Link
            href="/originals"
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 text-black font-serif font-bold text-sm uppercase tracking-wider rounded-2xl hover:brightness-110 shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105 active:scale-95"
          >
            <Compass className="w-5 h-5" />
            <span>استكشف كافة إنتاجات ومشاريع حكاياتي أوريجينالز</span>
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
