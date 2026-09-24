import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, BookOpen, Lock, Layers, Calendar, AlertCircle, ChevronRight, X, ChevronLeft, Bookmark, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RatingReviewWidget } from '@/components/reviews/RatingReviewWidget';
import { toast } from 'sonner';
import { fetchComicById, fetchComicPages } from '@/lib/supabase-data';

export function ComicDetail({ params }: { params: { id: string } }) {
  const { session, isSubscriber } = useAuth();
  const [series, setSeries] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);

  // Active Issue Reader State
  const [activeIssueId, setActiveIssueId] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [lockedData, setLockedData] = useState<any>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const previewFlag = searchParams.get('preview') === 'true';
    setIsPreview(previewFlag);

    fetchComicById(params.id, previewFlag)
      .then((data) => {
        if (!data) throw new Error('Comic series not found or not published');
        setSeries(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  // Check if this comic series is in user library
  useEffect(() => {
    if (!session?.access_token || !params.id) return;

    fetch('/api/library', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => res.json())
      .then((data) => {
          const targetComicId = series?.id || params.id;
          const found = data.library.some(
            (item: any) =>
              item.itemId === params.id ||
              item.original?.id === params.id ||
              (targetComicId && (item.itemId === targetComicId || item.original?.id === targetComicId))
          );
          setInLibrary(found);
      })
      .catch((err) => console.error('Error checking library status:', err));
  }, [session, params.id]);

  const handleToggleLibrary = async () => {
    if (!session?.access_token) {
      toast.error('يرجى تسجيل الدخول أولاً لإضافة الكوميكس إلى مكتبتك');
      return;
    }
    if (!params.id) return;

    setLibraryLoading(true);
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ itemId: params.id, itemType: 'comic' }),
      });
      const data = await res.json();
      if (res.ok) {
        setInLibrary(data.added);
        if (data.added) {
          toast.success('تمت إضافة القصة المصورة إلى مكتبتك الخاصة 📚');
        } else {
          toast.info('تمت إزالة القصة المصورة من مكتبتك');
        }
      } else {
        toast.error(data.error || 'تعذر تحديث المكتبة');
      }
    } catch (err: any) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLibraryLoading(false);
    }
  };

  const openIssueReader = (issueId: string) => {
    setActiveIssueId(issueId);
    setPagesLoading(true);
    setLockedData(null);
    setActivePageIndex(0);

    fetchComicPages(issueId)
      .then((data) => {
        if (data.error) {
          setLockedData(data);
        } else {
          setPages(data.pages || []);
        }
        setPagesLoading(false);
      })
      .catch(() => setPagesLoading(false));
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 text-center text-primary">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="font-serif text-sm">جاري تحميل القصة المصورة...</p>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen pt-32 text-center px-4">
        <h2 className="text-2xl font-serif text-primary mb-4">{error || 'Comic not found'}</h2>
        <Link href="/comics" className="px-6 py-2 bg-secondary border border-border text-xs font-bold uppercase tracking-wider rounded-xl">
          Return to Library
        </Link>
      </div>
    );
  }

  const firstIssueId = series.issues?.[0]?.id;

  return (
    <div className="min-h-screen bg-[#07070a] text-white pt-24 pb-24 relative overflow-hidden" dir="rtl">
      {/* Full Page Extremely Clear Comic Cover Background Wallpaper */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={series.coverUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800'}
          alt=""
          className="w-full h-full object-cover object-center opacity-85 blur-[1px] transform scale-105 transition-all duration-700"
        />
        {/* Subtle dark gradient scrim for crystal clear image visibility while keeping text readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-[#07070a]/90" />
        <div className="absolute inset-0 bg-black/20 backdrop-brightness-90" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 md:space-y-24">
        {isPreview && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex items-center gap-3 text-amber-300 text-xs font-mono">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
            <span><strong>PREVIEW MODE ACTIVE:</strong> Viewing draft content of "{series.title}". Authorized editor session validated.</span>
          </div>
        )}

        <Link href="/comics" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm uppercase tracking-widest font-bold">
          <ArrowLeft className="w-4 h-4" /> العودة إلى الكوميكس
        </Link>

        {/* Comic Hero Header Section (Cover Far Up Left, Spaced Details Next To It) */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start" dir="ltr">
          {/* Cover Art - Positioned Far Up Left */}
          <div className="w-56 sm:w-64 md:w-72 lg:w-80 shrink-0 aspect-[2/3] rounded-3xl overflow-hidden border-2 border-primary/60 shadow-[0_20px_50px_rgba(212,175,55,0.25)] relative transform -translate-y-2 md:-translate-y-4">
            <img
              src={series.coverUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800'}
              alt={series.title}
              className="w-full h-full object-cover"
            />
            {series.publishingStatus === 'draft' && (
              <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-amber-500 text-black font-black text-[11px] uppercase tracking-wider rounded-full shadow-lg">
                مسودة Draft
              </div>
            )}
          </div>

          {/* Details & Description Next to Cover */}
          <div className="flex-1 space-y-6 md:space-y-7 text-right pt-0" dir="rtl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-1.5 bg-primary/15 text-primary border border-primary/40 text-xs font-serif font-bold rounded-full shadow-sm">
                سلسلة كوميكس مصورة
              </span>
              <span className="px-4 py-1.5 bg-white/5 text-[#cccccc] text-xs font-mono rounded-full border border-white/10">
                📖 {series.issues?.length || 0} أعداد (Issues)
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-black text-foreground leading-tight tracking-tight">
              {series.arabicTitle || series.title}
            </h1>
            <p className="text-xl font-serif text-primary/90">{series.title}</p>

            <p className="text-sm md:text-base text-[#d0d0d8] leading-relaxed md:leading-loose font-sans max-w-3xl">
              {series.description || 'لا يوجد ملخص متاح حالياً.'}
            </p>

            {/* CTA Buttons Directly Under Description */}
            <div className="pt-6 flex flex-wrap gap-4 items-center">
              {firstIssueId && (
                <button
                  onClick={() => openIssueReader(firstIssueId)}
                  className="px-8 py-4 bg-primary text-black font-serif font-bold text-sm md:text-base rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all flex items-center gap-2.5 active:scale-95"
                >
                  <BookOpen className="w-5 h-5" />
                  اقرأ العدد الأول
                </button>
              )}

              <button
                onClick={handleToggleLibrary}
                disabled={libraryLoading}
                className={`px-7 py-4 text-sm md:text-base font-serif font-bold rounded-2xl border transition-all flex items-center gap-2.5 active:scale-95 ${
                  inLibrary
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30 shadow-lg shadow-amber-500/10'
                    : 'bg-[#181824] hover:bg-[#252536] text-white border-white/20 hover:border-primary/50'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${inLibrary ? 'fill-amber-400 text-amber-400' : 'text-primary'}`} />
                <span>{inLibrary ? 'في مكتبتك الخاصة 🔖' : 'إضافة إلى المكتبة'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Issues List Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <h2 className="font-serif font-bold text-2xl text-foreground">الأعداد المتاحة للقراءة</h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{series.issues?.length || 0} أعداد</span>
          </div>

          <div className="space-y-4">
            {(!series.issues || series.issues.length === 0) ? (
              <p className="text-xs text-muted-foreground">لا توجد أعداد منشورة لهذه السلسلة بعد.</p>
            ) : (
              series.issues.map((issue: any) => (
                <div
                  key={issue.id}
                  onClick={() => openIssueReader(issue.id)}
                  className="p-5 bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/80 rounded-2xl transition-all flex items-center justify-between cursor-pointer group shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-20 bg-secondary rounded-xl overflow-hidden shrink-0 border border-border shadow-sm">
                      {issue.coverUrl ? (
                        <img src={issue.coverUrl} alt={issue.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-mono font-bold text-primary">#{issue.issueNumber}</div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-primary">العدد #{issue.issueNumber}</span>
                        {issue.accessLevel === 'subscriber' && !isSubscriber && (
                          <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded-md flex items-center gap-1">
                            <Lock className="w-3 h-3" /> VIP
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-base md:text-lg text-foreground group-hover:text-primary transition-colors">
                        {issue.arabicTitle || issue.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs rounded-xl transition-all">
                    <span>اقرأ العدد</span>
                    <ChevronLeft className="w-4 h-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="font-serif font-bold text-2xl text-foreground">التقييمات والمراجعات</h2>
          </div>
          <RatingReviewWidget originalId={series.id} />
        </div>
      </div>

      {/* Reader Modal Overlay */}
      {activeIssueId && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          {/* Reader Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-black/80">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveIssueId(null)} className="p-2 text-muted-foreground hover:text-white rounded-lg">
                <X className="w-6 h-6" />
              </button>
              <span className="font-serif font-bold text-base text-foreground">{series.arabicTitle || series.title}</span>
            </div>
            {pages.length > 0 && (
              <span className="font-mono text-xs text-primary">
                صفحة {activePageIndex + 1} من {pages.length}
              </span>
            )}
          </div>

          {/* Reader Canvas */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
            {pagesLoading ? (
              <div className="text-center text-primary space-y-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="font-serif text-xs">جاري تحميل صفحات الكوميكس...</p>
              </div>
            ) : lockedData ? (
              <div className="max-w-md w-full p-8 bg-card border border-primary/40 rounded-3xl text-center space-y-5 shadow-2xl" dir="rtl">
                <Lock className="w-12 h-12 text-amber-400 mx-auto" />
                <h3 className="font-serif font-bold text-2xl text-foreground">محتوى VIP حصري</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lockedData.message || 'انتهت فترة اشتراكك المميز أو هذه القصة مخصصة لمشتركي VIP فقط. يرجى تجديد الاشتراك للوصول للقراءة.'}
                </p>
                <Link href="/subscription" className="block py-3 bg-gradient-to-r from-amber-500 to-primary text-black font-bold text-xs uppercase rounded-xl hover:brightness-110 transition-all shadow-lg">
                  تجديد / تفعيل اشتراك VIP
                </Link>
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center text-muted-foreground font-serif">لا توجد صفحات مرفوعة لهذا العدد.</div>
            ) : (
              <div className="relative max-w-4xl w-full flex items-center justify-center">
                <img
                  src={pages[activePageIndex]?.imageUrl}
                  alt={`Page ${activePageIndex + 1}`}
                  className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
                />

                {/* Page Nav Controls */}
                {activePageIndex > 0 && (
                  <button
                    onClick={() => setActivePageIndex((p) => p - 1)}
                    className="absolute left-4 p-3 bg-black/70 text-white rounded-full hover:bg-primary hover:text-black transition-all shadow-xl"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {activePageIndex < pages.length - 1 && (
                  <button
                    onClick={() => setActivePageIndex((p) => p + 1)}
                    className="absolute right-4 p-3 bg-black/70 text-white rounded-full hover:bg-primary hover:text-black transition-all shadow-xl"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

