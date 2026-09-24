import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Search, LayoutGrid, List, BookOpen, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Comics() {
  const { session } = useAuth();
  const [comics, setComics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const previewFlag = params.get('preview') === 'true';
    setIsPreview(previewFlag);

    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const endpoint = `/api/comics${previewFlag ? '?preview=true' : ''}`;
    fetch(endpoint, { headers })
      .then((res) => res.json())
      .then((data) => {
        setComics(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  const filtered = comics.filter((c) =>
    (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {isPreview && (
        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex items-center gap-3 text-amber-300 text-xs font-mono">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <span><strong>PREVIEW MODE ACTIVE:</strong> You are viewing comic series including draft content. Only authorized accounts can access this preview.</span>
        </div>
      )}

      <div className="mb-16" dir="rtl">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/40 text-primary text-xs font-bold uppercase tracking-widest bg-primary/5 rounded-full mb-3">
          <BookOpen className="w-3.5 h-3.5" /> مكتبة الكوميكس المصورة
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-foreground mb-4">
          قصص حكاياتي المصورة (HEKAYATY COMICS)
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          استكشف الملاحم المصورة العالمية والأعمال الفنية الحصرية لعوالم حكاياتي.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-8 border-b border-border">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            dir="rtl"
            placeholder="ابحث عن العناوين أو السلاسل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border text-foreground pr-10 pl-4 py-3 focus:outline-none focus:border-primary transition-colors font-serif rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-4 border border-border bg-card p-1 rounded-xl">
          <button
            onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-primary text-black' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-primary">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-serif text-sm">جاري جلب سلات الكوميكس...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground border border-dashed border-border rounded-3xl">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-serif text-base">لا توجد قصص مصورة متاحة حالياً.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filtered.map((comic) => (
            <Link key={comic.id} href={`/comics/${comic.id}${isPreview ? '?preview=true' : ''}`}>
              <div className="group cursor-pointer">
                <div className="relative aspect-[2/3] mb-4 overflow-hidden border border-border group-hover:border-primary/80 transition-all rounded-2xl shadow-xl bg-card">
                  <img
                    src={comic.coverUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800'}
                    alt={comic.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  {comic.publishingStatus === 'draft' && (
                    <div className="absolute top-2 right-2 px-2.5 py-1 bg-amber-500 text-black font-black text-[10px] uppercase rounded-md shadow">
                      مسودة Draft
                    </div>
                  )}
                </div>
                <h3 className="font-serif text-xl font-bold group-hover:text-primary transition-colors text-right" dir="rtl">
                  {comic.arabicTitle || comic.title}
                </h3>
                <p className="text-xs text-muted-foreground text-right mt-1" dir="rtl">{comic.title}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filtered.map((comic) => (
            <Link key={comic.id} href={`/comics/${comic.id}${isPreview ? '?preview=true' : ''}`}>
              <div className="flex flex-col sm:flex-row gap-6 p-5 border border-border bg-card hover:border-primary/80 transition-all rounded-3xl cursor-pointer group shadow-lg" dir="rtl">
                <div className="w-full sm:w-40 aspect-[2/3] shrink-0 border border-border rounded-2xl overflow-hidden bg-card">
                  <img
                    src={comic.coverUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800'}
                    alt={comic.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    {comic.publishingStatus === 'draft' && (
                      <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase rounded-md">
                        Draft Preview
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-1 group-hover:text-primary transition-colors">{comic.arabicTitle || comic.title}</h3>
                  <p className="text-sm font-serif text-muted-foreground mb-3">{comic.title}</p>
                  <p className="text-sm text-foreground/80 line-clamp-3 mb-4 font-light">{comic.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

