import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Crown, Sparkles, Play, Star, Bookmark, Share2, Lock, ChevronLeft, Check, Compass, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getImageUrl } from '@/assets';
import { fetchOriginalsShowcase } from '@/lib/supabase-data';

export function Originals() {
  const { isSubscriber } = useAuth();
  const [originals, setOriginals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [savedItems, setSavedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    fetchOriginalsShowcase()
      .then((data) => {
        if (data) {
          if (Array.isArray(data.originals) && data.originals.length > 0) {
            setOriginals(data.originals);
          } else if (Array.isArray(data.allOriginals) && data.allOriginals.length > 0) {
            setOriginals(data.allOriginals);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filteredOriginals = originals.filter((item) => {
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

  const featured = originals.find((o) => o.isFeatured || o.is_featured) || originals[0];

  return (
    <div className="min-h-screen bg-[#050508] text-foreground relative overflow-hidden pt-28 pb-24" dir="rtl">
      {/* ── BACKGROUND IMAGE (Same background as homepage section) ── */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src={getImageUrl('originals-bg.png')} 
          alt="Hekayaty Originals Backdrop" 
          className="w-full h-full object-cover object-center opacity-100 brightness-110 contrast-105 filter"
        />
        {/* Dark Vignette Overlay for 100% legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/80 via-black/40 to-[#050508]" />
      </div>

      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/20 via-amber-500/5 to-transparent blur-3xl pointer-events-none z-0" />
      <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* ── 1. HEADER PAGE BANNER (Glassmorphic Container) ── */}
        <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-black/90 via-black/85 to-black/90 border-2 border-[#D4AF37]/60 shadow-[0_15px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/90 border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-xs font-serif font-black uppercase tracking-widest text-[#FFF7D6]">
                استوديو حكاياتي الأصلي • HEKAYATY ORIGINALS CATALOG
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight text-[#FFF7D6] drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">
              مكتبة إنتاجات <span className="text-amber-400 drop-shadow-[0_0_20px_rgba(212,175,55,0.7)]">حكاياتي أوريجينالز</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-200 max-w-2xl font-serif leading-relaxed drop-shadow-md">
              استكشف جميع السلاسل، الكوميكس، والروايات الحصرية المصممة خصيصاً في استوديو حكاياتي. أعمال ملحمية لا تتاح في أي منصة أخرى.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
            {[
              { id: 'All', label: 'كافة الأعمال' },
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

        {/* ── 2. FEATURED SPOTLIGHT HERO BANNER ── */}
        {featured && (
          <div className="relative rounded-3xl overflow-hidden bg-black/90 border-2 border-[#D4AF37]/60 shadow-[0_15px_45px_rgba(0,0,0,0.85)] min-h-[440px] flex flex-col justify-end p-8 md:p-12">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-45 brightness-105 contrast-110 filter transform hover:scale-105 transition-transform duration-1000"
              style={{ backgroundImage: `url(${featured.coverUrl || featured.bannerUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40" />

            <div className="relative z-10 max-w-3xl space-y-4 text-right">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 text-xs font-serif font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-600 text-black rounded-full flex items-center gap-1.5 shadow-lg border border-yellow-300">
                  <Crown className="w-3.5 h-3.5 fill-black" /> عمل أوريجينال رئيسي
                </span>
                <span className="px-3 py-1 text-xs font-serif font-bold uppercase tracking-wider bg-black/80 text-amber-300 rounded-lg border border-[#D4AF37]/40 backdrop-blur-md">
                  {featured.arabicType || featured.contentType || 'رواية ملحمية'}
                </span>
              </div>

              <h2 className="text-3xl md:text-5xl font-serif font-black text-[#FFF7D6] drop-shadow-[0_4px_15px_rgba(0,0,0,1)]">
                {featured.arabicTitle || featured.title}
              </h2>

              <p className="text-base md:text-lg text-amber-300 font-serif italic font-semibold drop-shadow">
                "{featured.arabicTagline || featured.tagline || 'عمل حكاياتي أوريجينال حصري'}"
              </p>

              <p className="text-gray-200 text-sm md:text-base line-clamp-3 leading-relaxed font-serif max-w-2xl">
                {featured.arabicDescription || featured.description || featured.summary}
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href={featured.slug ? `/novels/${featured.slug}` : `/originals/${featured.id}`}
                  className="px-7 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-serif font-bold text-sm rounded-xl hover:brightness-110 shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2 transform hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-black" /> اقرأ العمل الآن
                </Link>
                <Link
                  href="/subscription"
                  className="px-7 py-3 bg-black/80 hover:bg-black text-[#FFF7D6] font-serif font-bold text-sm rounded-xl border border-[#D4AF37]/60 hover:border-[#D4AF37] backdrop-blur-md transition-all flex items-center gap-2"
                >
                  <Crown className="w-4 h-4 text-amber-400" /> اشترك في VIP لمتابعة الأوريجينالز
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. MAIN CATALOG GRID ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-4">
            <h3 className="text-2xl font-serif font-bold text-[#FFF7D6] flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" /> جميع إنتاجات الأوريجينالز ({filteredOriginals.length})
            </h3>
            <span className="text-xs text-amber-300/80 font-mono font-bold uppercase tracking-wider">
              HEKAYATY CATALOG
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-amber-400 font-serif flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
              <p className="text-sm font-bold tracking-wider uppercase">جاري تحميل كتالوج حكاياتي أوريجينالز...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredOriginals.map((item) => {
                const itemUrl = item.slug ? `/novels/${item.slug}` : `/originals/${item.id}`;
                const isLocked = item.accessLevel === 'subscriber' && !isSubscriber;
                const coverImage = item.coverUrl || item.bannerUrl;

                return (
                  <Link
                    key={item.id}
                    href={itemUrl}
                    className="group relative bg-[#0a0a0f] border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_15px_45px_rgba(212,175,55,0.35)] hover:-translate-y-2 flex flex-col justify-end min-h-[460px]"
                  >
                    {/* Main Cover Image */}
                    <div className="absolute inset-0 z-0 bg-[#12121c] overflow-hidden">
                      <img
                        src={coverImage}
                        alt={item.arabicTitle || item.title}
                        className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 brightness-105 contrast-105"
                      />
                      
                      {/* Premium Vignette & Dark Gradient */}
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

                    {/* Card Content Overlay */}
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
                          <span>اقرأ العمل</span>
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
          )}
        </div>

        {/* ── 4. SUBSCRIPTION MEMBERSHIP CARD ── */}
        <div className="rounded-3xl bg-gradient-to-r from-black/95 via-[#1a120b]/90 to-black/95 border-2 border-[#D4AF37]/60 p-8 md:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center mx-auto text-amber-400 shadow-xl">
            <Crown className="w-8 h-8 fill-amber-400" />
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-black text-[#FFF7D6] drop-shadow">
            اشترك في عضوية حكاياتي VIP الممتازة
          </h2>

          <p className="text-gray-200 max-w-2xl mx-auto text-sm md:text-base font-serif leading-relaxed">
            احصل على وصول غير محدود لكافة الفصول والروايات الحصرية، إصدارات أوريجينال المبكرة، وجودة عالية لكافة أعمال الكوميكس والوسائط.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#FFF7D6] font-serif font-bold">
            <span className="flex items-center gap-2 bg-black/70 px-4 py-2 rounded-xl border border-[#D4AF37]/40">
              <Check className="w-4 h-4 text-emerald-400" /> اشتراك شهري (59 ج.م)
            </span>
            <span className="flex items-center gap-2 bg-black/70 px-4 py-2 rounded-xl border border-[#D4AF37]/40">
              <Check className="w-4 h-4 text-emerald-400" /> اشتراك 3 أشهر (139 ج.م)
            </span>
            <span className="flex items-center gap-2 bg-black/70 px-4 py-2 rounded-xl border border-[#D4AF37]/60 text-amber-300">
              <Check className="w-4 h-4 text-amber-400" /> اشتراك سنوي (499 ج.م - الأفضل قيمة)
            </span>
          </div>

          <div className="pt-2">
            <Link
              href="/subscription"
              className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-serif font-black text-sm uppercase tracking-wider rounded-2xl hover:brightness-110 shadow-xl shadow-amber-500/25 transition-all transform hover:scale-105"
            >
              <span>اختر خطة الاشتراك وانضم الآن</span>
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
