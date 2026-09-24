import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { DiscoveryEngine } from '@/components/universe/DiscoveryEngine';
import { BookOpen, Star, Sparkles, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function NovelsPage() {
  const { isSubscriber } = useAuth();
  const [novels, setNovels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/novels')
      .then((res) => res.json())
      .then((data) => {
        setNovels(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-20 text-center text-primary h-screen flex items-center justify-center">
        <div className="space-y-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif">جاري استدعاء سجل الروايات الكونية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-12 text-right" dir="rtl">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/40 text-primary text-xs font-bold uppercase tracking-widest bg-primary/5 rounded-full mb-3">
          <BookOpen className="w-3.5 h-3.5" /> الروايات السردية الكبرى
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-foreground mb-4">
          روايات عالم حكاياتي (HEKAYATY NOVELS)
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          انغمس في السرد النثري الملحمي الأسبوعي لعالم الأبطال الخارقين والأساطير الشرقية.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {novels.map((novel) => (
          <div key={novel.id} className="bg-card border border-border hover:border-primary/60 rounded-3xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col md:flex-row h-full">
            <div className="w-full md:w-2/5 h-64 md:h-auto overflow-hidden relative">
              <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
              {novel.isPremium && !isSubscriber && (
                <div className="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-black font-black text-[10px] uppercase rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3" /> حصري VIP
                </div>
              )}
            </div>

            <div className="p-6 md:w-3/5 flex flex-col justify-between" dir="rtl">
              <div>
                <div className="flex items-center gap-2 text-xs text-primary font-bold mb-2">
                  <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
                  <span>{novel.rating} / 5.0</span>
                  <span>• {novel.totalChapters} فصلاً</span>
                </div>
                <h3 className="font-serif font-black text-2xl text-foreground mb-2">{novel.arabicTitle}</h3>
                <p className="text-xs text-primary font-bold mb-3">{novel.arabicTagline || novel.tagline}</p>
                <p className="text-sm text-muted-foreground line-clamp-3">{novel.arabicSummary}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">الكاتب: <strong className="text-foreground">{novel.arabicAuthorName}</strong></span>
                <Link href={`/novels/${novel.slug}`} className="px-5 py-2 bg-primary text-black font-bold text-xs uppercase rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2">
                  <span>اقرأ الرواية</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DiscoveryEngine />
    </div>
  );
}
