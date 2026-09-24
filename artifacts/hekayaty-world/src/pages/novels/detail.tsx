import React, { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  BookOpen,
  Star,
  Lock,
  ChevronLeft,
  Play,
  Layers,
  Sparkles,
  User,
  Clock,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  Check
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { DiscoveryEngine } from "@/components/universe/DiscoveryEngine";
import { RatingReviewWidget } from "@/components/reviews/RatingReviewWidget";
import { toast } from "sonner";
import { fetchNovelBySlug } from "@/lib/supabase-data";

export function NovelDetailPage({ params }: { params?: { slug?: string } }) {
  const [, match] = useRoute("/novels/:slug");
  const slug = params?.slug || match?.slug || "";

  const [novel, setNovel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inLibrary, setInLibrary] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const { session, isSubscriber } = useAuth();
  const { getProgress } = useReadingProgress();

  const savedProgress = getProgress(slug);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const isPreview = new URLSearchParams(window.location.search).get("preview") === "true";

    fetchNovelBySlug(slug, isPreview)
      .then((data) => {
        if (data) setNovel(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // Check if this novel is in user library
  useEffect(() => {
    if (!session?.access_token || !novel) return;

    fetch("/api/library", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.library) {
          const found = data.library.some(
            (item: any) =>
              (novel.id && (item.itemId === novel.id || item.original?.id === novel.id)) ||
              (novel.slug && (item.itemId === novel.slug || item.original?.slug === novel.slug))
          );
          setInLibrary(found);
        }
      })
      .catch((err) => console.error("Error checking library status:", err));
  }, [session, novel]);

  const handleToggleLibrary = async () => {
    if (!session?.access_token) {
      toast.error("يرجى تسجيل الدخول أولاً لإضافة الرواية إلى مكتبتك");
      return;
    }
    const targetId = novel?.id || novel?.slug || slug;
    if (!targetId) return;

    setLibraryLoading(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ itemId: targetId, itemType: 'novel' }),
      });
      const data = await res.json();
      if (res.ok) {
        setInLibrary(data.added);
        if (data.added) {
          toast.success("تمت إضافة الرواية إلى مكتبتك الخاصة 📚");
        } else {
          toast.info("تمت إزالة الرواية من مكتبتك");
        }
      } else {
        toast.error(data.error || "تعذر تحديث المكتبة");
      }
    } catch (err: any) {
      toast.error("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLibraryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] pt-32 text-center text-[#D4AF37] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="font-serif text-sm">جاري استدعاء سجل الرواية الكونية...</p>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-[#07070a] pt-32 text-center text-[#D4AF37]">
        <h1 className="text-2xl font-serif">لم يتم العثور على هذه الرواية</h1>
        <Link href="/novels" className="text-xs uppercase font-bold text-white hover:underline mt-4 inline-block">
          العودة لكافة الروايات
        </Link>
      </div>
    );
  }

  const firstChapterId = novel.chapters?.[0]?.id;

  return (
    <div className="min-h-screen bg-[#07070a] text-white pt-24 pb-24 relative overflow-hidden" dir="rtl">
      {/* Full Page Extremely Clear Cover Background Wallpaper */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={novel.coverUrl}
          alt=""
          className="w-full h-full object-cover object-center opacity-85 blur-[1px] transform scale-105 transition-all duration-700"
        />
        {/* Subtle dark gradient scrim for crystal clear image visibility while keeping text readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-[#07070a]/90" />
        <div className="absolute inset-0 bg-black/20 backdrop-brightness-90" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 md:space-y-24">
        {/* Novel Hero Header Section (Cover Far Up Left, Spaced Details Next To It) */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-start" dir="ltr">
          {/* Cover Art - Positioned Far Up Left */}
          <div className="w-56 sm:w-64 md:w-72 lg:w-80 shrink-0 aspect-[2/3] rounded-3xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-[0_20px_50px_rgba(212,175,55,0.25)] relative transform -translate-y-2 md:-translate-y-4">
            <img
              src={novel.coverUrl}
              alt={novel.arabicTitle || novel.title}
              className="w-full h-full object-cover"
            />
            {novel.isPremium && !isSubscriber && (
              <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-amber-500 text-black font-black text-[11px] uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> حصري VIP
              </div>
            )}
          </div>

          {/* Details & Description Next to Cover (Aligned Top with Spacing) */}
          <div className="flex-1 space-y-6 md:space-y-7 text-right pt-0" dir="rtl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-1.5 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-serif font-bold rounded-full shadow-sm">
                رواية سردية ملحمية
              </span>
              <span className="px-4 py-1.5 bg-black/70 text-amber-300 border border-amber-400/40 text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {novel.rating} / 5.0
              </span>
              <span className="px-4 py-1.5 bg-white/5 text-[#cccccc] text-xs font-mono rounded-full border border-white/10">
                📖 {novel.totalChapters} فصلاً
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-serif font-black text-[#FFF7D6] leading-tight tracking-tight">
              {novel.arabicTitle || novel.title}
            </h1>

            {/* Tagline */}
            {novel.arabicTagline && (
              <p className="text-base md:text-lg font-serif font-bold text-[#D4AF37]/90 leading-snug">
                {novel.arabicTagline}
              </p>
            )}

            {/* Summary / Description */}
            <p className="text-sm md:text-base text-[#d0d0d8] leading-relaxed md:leading-loose font-sans max-w-3xl">
              {novel.arabicSummary || novel.summary}
            </p>

            {/* Author Info */}
            <div className="pt-2 flex items-center gap-4 text-sm text-[#9999a0] font-serif">
              <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <User className="w-4 h-4 text-[#D4AF37]" /> الكاتب: <strong className="text-white font-bold">{novel.arabicAuthorName || novel.authorName}</strong>
              </span>
            </div>

            {/* CTA Buttons Directly Under Description */}
            <div className="pt-6 flex flex-wrap gap-4 items-center">
              {savedProgress && savedProgress.chapterId ? (
                <Link
                  href={`/read/${slug}/${savedProgress.chapterId}`}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 text-black font-serif font-bold text-sm md:text-base rounded-2xl hover:brightness-110 shadow-xl shadow-[#D4AF37]/25 transition-all flex items-center gap-2.5 active:scale-95"
                >
                  <RotateCcw className="w-5 h-5" />
                  متابعة القراءة من حيث توقفت
                </Link>
              ) : firstChapterId ? (
                <Link
                  href={`/read/${slug}/${firstChapterId}`}
                  className="px-8 py-4 bg-[#D4AF37] hover:bg-[#bfa030] text-black font-serif font-bold text-sm md:text-base rounded-2xl shadow-xl shadow-[#D4AF37]/20 transition-all flex items-center gap-2.5 active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  ابدأ قراءة الفصل الأول
                </Link>
              ) : null}

              <button
                onClick={handleToggleLibrary}
                disabled={libraryLoading}
                className={`px-7 py-4 text-sm md:text-base font-serif font-bold rounded-2xl border transition-all flex items-center gap-2.5 active:scale-95 ${
                  inLibrary
                    ? "bg-amber-500/20 text-amber-300 border-amber-400/50 hover:bg-amber-500/30 shadow-lg shadow-amber-500/10"
                    : "bg-[#181824] hover:bg-[#252536] text-white border-white/20 hover:border-[#D4AF37]/50"
                }`}
              >
                <Bookmark className={`w-5 h-5 ${inLibrary ? "fill-amber-400 text-amber-400" : "text-[#D4AF37]"}`} />
                <span>{inLibrary ? "في مكتبتك 🔖" : "إضافة إلى المكتبة"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Continue Reading Alert if present */}
        {savedProgress && savedProgress.chapterId && (
          <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <div className="text-xs font-serif">
                <span className="text-[#D4AF37] font-bold">لديك قراءة سابقة محفوظة: </span>
                <span className="text-white">توقفت عند الفصل مسبقاً ({Math.round((savedProgress.scrollRatio || 0) * 100)}% مكمل)</span>
              </div>
            </div>
            <Link
              href={`/read/${slug}/${savedProgress.chapterId}`}
              className="px-4 py-2 bg-[#D4AF37] text-black text-xs font-serif font-bold rounded-lg hover:bg-[#bfa030] transition-colors shrink-0"
            >
              استكمال القراءة
            </Link>
          </div>
        )}

        {/* Chapter Index Section (Under Buttons & Hero) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-serif font-bold text-2xl text-[#FFF7D6]">فهرس فصول الرواية</h2>
            </div>
            <span className="text-xs font-mono text-[#888888]">{novel.chapters?.length || 0} فصلاً</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(novel.chapters || []).map((ch: any) => (
              <div
                key={ch.id}
                className="bg-[#0e0e14] border border-white/10 hover:border-[#D4AF37]/60 rounded-2xl p-4 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-[#D4AF37]">
                      الفصل {ch.chapterNumber}
                    </span>
                    <span className="text-xs font-mono text-[#666666] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{ch.readTimeMinutes} د
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-white group-hover:text-[#D4AF37] transition-colors truncate">
                    {ch.arabicTitle || ch.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {ch.isLocked && !isSubscriber ? (
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-400/30 text-[10px] font-bold rounded-lg flex items-center gap-1">
                      <Lock className="w-3 h-3" /> VIP
                    </span>
                  ) : null}

                  <Link
                    href={`/read/${slug}/${ch.id}`}
                    className="px-4 py-2 bg-[#181824] hover:bg-[#D4AF37] hover:text-black text-[#cccccc] text-xs font-serif font-bold rounded-xl border border-white/10 transition-all flex items-center gap-1"
                  >
                    <span>اقرأ</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings & Reviews Section (Under Chapters) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="font-serif font-bold text-2xl text-[#FFF7D6]">التقييمات والمراجعات</h2>
          </div>
          <RatingReviewWidget novelId={novel.id} />
        </div>

        {/* Discovery Engine */}
        <DiscoveryEngine />
      </div>
    </div>
  );
}
