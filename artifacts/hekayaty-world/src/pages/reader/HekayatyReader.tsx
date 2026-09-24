import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  BookMarked,
  Sliders,
  Maximize2,
  Minimize2,
  Lock,
  Check,
  X,
  Sparkles,
  Layers,
  RefreshCw,
  Eye,
  Sun,
  Moon,
  Search,
  CheckCircle2,
  Clock,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useReaderPreferences } from "@/hooks/useReaderPreferences";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { getGenreAtmosphere } from "@/config/genreAtmospheres";

// ─── Theme configuration ────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#0a0a0d",
    surface: "#111116",
    text: "#e8e8e8",
    textMuted: "#888888",
    textFaint: "#555555",
    border: "rgba(255,255,255,0.08)",
    headerBg: "rgba(10,10,13,0.88)",
    navBtnBg: "rgba(255,255,255,0.04)",
    navBtnHover: "rgba(255,255,255,0.08)",
    navBtnBorder: "rgba(255,255,255,0.08)",
  },
  sepia: {
    bg: "#f7eed8",
    surface: "#f0e4c4",
    text: "#2c1d0e",
    textMuted: "#7a5c3a",
    textFaint: "#b08860",
    border: "rgba(100,70,30,0.15)",
    headerBg: "rgba(247,238,216,0.92)",
    navBtnBg: "rgba(100,70,30,0.06)",
    navBtnHover: "rgba(100,70,30,0.12)",
    navBtnBorder: "rgba(100,70,30,0.15)",
  },
  light: {
    bg: "#ffffff",
    surface: "#f4f4f8",
    text: "#111111",
    textMuted: "#555555",
    textFaint: "#aaaaaa",
    border: "rgba(0,0,0,0.08)",
    headerBg: "rgba(255,255,255,0.92)",
    navBtnBg: "rgba(0,0,0,0.04)",
    navBtnHover: "rgba(0,0,0,0.08)",
    navBtnBorder: "rgba(0,0,0,0.1)",
  },
};

export function HekayatyReader({ params }: { params?: { novelSlug?: string; chapterId?: string; id?: string } }) {
  const [, setLocation] = useLocation();
  const [, matchNovel] = useRoute("/read/:novelSlug/:chapterId");
  const [, matchReaderNovel] = useRoute("/reader/novels/:novelSlug/:chapterId");
  const [, matchStories] = useRoute("/stories/chapters/:id");

  const novelSlug = params?.novelSlug || matchNovel?.novelSlug || matchReaderNovel?.novelSlug || "";
  const chapterId = params?.chapterId || matchNovel?.chapterId || matchReaderNovel?.chapterId || params?.id || matchStories?.id || "";

  const isPreview = new URLSearchParams(window.location.search).get("preview") === "true";

  const { session, user, isSubscriber, isLoading: authLoading } = useAuth();
  const { prefs, setTheme, setFontSize, setWidth, setFontFamily } = useReaderPreferences();
  const { scrollProgress, saveReadingProgress, getProgress } = useReadingProgress(novelSlug, chapterId);

  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lockedData, setLockedData] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);

  const topRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const t = THEMES[prefs.theme];
  const atmosphere = useMemo(() => {
    return getGenreAtmosphere(chapter?.genre || chapter?.novelGenre || chapter?.genreName);
  }, [chapter]);

  // ── Browser Fullscreen listener ───────────────────────────────────────────
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // ── Immersive mode scroll behavior ────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 60) {
        setHeaderVisible(true);
      } else if (currentY > lastScrollY.current + 15) {
        setHeaderVisible(false);
      } else if (currentY < lastScrollY.current - 15) {
        setHeaderVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Fetch Chapter Data ───────────────────────────────────────────────────
  useEffect(() => {
    if (!chapterId || authLoading) return;
    setLoading(true);
    setChapter(null);
    setLockedData(null);

    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const q = isPreview ? "?preview=true" : "";
    fetch(`/api/novels/chapters/${chapterId}${q}`, { headers })
      .then((res) => {
        if (res.status === 403 || res.status === 401) {
          return res.json().then((d) => { setLockedData(d); setLoading(false); });
        }
        if (!res.ok) {
          return fetch(`/api/stories/chapters/${chapterId}${q}`, { headers })
            .then((r) => r.json())
            .then((d) => { if (d.error) setLockedData(d); else setChapter(d); setLoading(false); });
        }
        return res.json().then((d) => { setChapter(d); setLoading(false); });
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [chapterId, isPreview, session, authLoading]);

  // ── Position restoration ──────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && chapter) {
      const saved = getProgress(novelSlug || chapter.novelSlug || "");
      if (saved && saved.chapterId === chapterId && saved.scrollRatio > 0.05) {
        setTimeout(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: totalHeight * saved.scrollRatio, behavior: "smooth" });
        }, 150);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [chapterId, loading, chapter]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft" && chapter?.nextChapterId) navigateChapter(chapter.nextChapterId);
      else if (e.key === "ArrowRight" && chapter?.prevChapterId) navigateChapter(chapter.prevChapterId);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapter]);

  const navigateChapter = (targetId: string) => {
    const suffix = isPreview ? "?preview=true" : "";
    const slug = novelSlug || chapter?.novelSlug || "novel";
    setLocation(`/read/${slug}/${targetId}${suffix}`);
  };

  const widthClass = { compact: "max-w-2xl", comfortable: "max-w-3xl", wide: "max-w-5xl" }[prefs.width];
  const fontFamily = {
    amiri: "'Amiri', serif",
    readex: "'Readex Pro', sans-serif",
    "noto-arabic": "'Noto Sans Arabic', sans-serif",
    "ibm-arabic": "'IBM Plex Sans Arabic', sans-serif",
    cairo: "'Cairo', sans-serif",
  }[prefs.fontFamily] ?? "'Readex Pro', sans-serif";

  // ── Word count and read time ──────────────────────────────────────────────
  const { wordCount, readTimeMinutes } = useMemo(() => {
    const text = chapter?.arabicContent || chapter?.content || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const time = Math.max(1, Math.ceil(words / 200));
    return { wordCount: words, readTimeMinutes: time };
  }, [chapter]);

  // ── Filtered chapters for drawer ──────────────────────────────────────────
  const filteredChapters = useMemo(() => {
    const list = chapter?.chapters || [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (c: any) =>
        (c.arabicTitle && c.arabicTitle.toLowerCase().includes(q)) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        String(c.chapterNumber).includes(q)
    );
  }, [chapter?.chapters, searchQuery]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4" style={{ background: t.bg, color: atmosphere.accent }}>
        <RefreshCw className="w-10 h-10 animate-spin" />
        <p style={{ fontFamily, color: t.textMuted }} className="text-sm tracking-widest font-bold">
          جاري استدعاء الفصل...
        </p>
      </div>
    );
  }

  // ── Paywall locked state ──────────────────────────────────────────────────
  if (lockedData?.isLocked) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center" style={{ background: "#07070a" }}>
        <div className="max-w-xl w-full bg-[#0e0e14] rounded-3xl border border-[#D4AF37]/50 p-8 md:p-12 text-center space-y-6 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="w-20 h-20 bg-[#D4AF37]/15 rounded-full flex items-center justify-center mx-auto border-2 border-[#D4AF37]/40 shadow-xl">
            <Lock className="w-10 h-10 text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="px-3.5 py-1 text-[11px] font-mono font-bold uppercase tracking-widest bg-[#D4AF37]/10 text-[#D4AF37] rounded-full border border-[#D4AF37]/30 inline-block">
              🔒 VIP Locked Chapter • الفصل مغلق للمشتركين
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-black text-[#FFF7D6] pt-2" style={{ fontFamily }}>
              {lockedData.arabicTitle || lockedData.title || `الفصل ${lockedData.chapterNumber}`}
            </h1>
            <p className="text-sm text-[#aaaaaa] leading-relaxed pt-1" style={{ fontFamily }}>
              هذا الفصل حصري لأعضاء اشتراك حكاياتي أوريجينالز VIP. اشترك الآن لمتابعة القراءة وفتح جميع الفصول.
            </p>
          </div>
          <div className="bg-[#14141c] rounded-2xl p-5 border border-white/10 text-right space-y-3 text-xs text-[#dddddd] font-medium" dir="rtl">
            {["وصول كامل لكافة فصول الروايات الملحمية الحصرية.", "قراءة بدون إعلانات وبأعلى جودة.", "الاشتراك الشهري يبدأ من 59 ج.م فقط."].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span style={{ fontFamily }}>{item}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/subscription" className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 text-black font-serif font-bold uppercase tracking-wider text-xs rounded-xl hover:brightness-110 shadow-lg transition-all text-center flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> اشترك الآن وافتح الفصول
            </Link>
            <Link href={`/novels/${novelSlug || lockedData.novelSlug || ""}`} className="px-6 py-3.5 bg-[#181822] hover:bg-[#222230] text-[#cccccc] text-xs rounded-xl border border-white/10 transition-colors text-center" style={{ fontFamily }}>
              العودة لفهرس الرواية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Not found state ────────────────────────────────────────────────────────
  if (!chapter) {
    return (
      <div className="min-h-screen pt-32 px-4 text-center space-y-4" style={{ background: t.bg }}>
        <h1 className="text-2xl font-serif font-bold" style={{ color: t.text, fontFamily }}>
          {lockedData?.error?.includes("Unauthorized") ? "غير مسموح بمعاينة هذا الفصل" : "لم يتم العثور على الفصل المطلوب"}
        </h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: t.textMuted, fontFamily }}>
          {lockedData?.error?.includes("Unauthorized")
            ? "هذا الفصل لا يزال مسودة غير منشورة. للمعاينة، يجب تسجيل الدخول بحساب كاتب أو محرر أو مسؤول."
            : "قد يكون الفصل حُذف أو تم تغيير رابط الوصول إليه."}
        </p>
        <Link href="/novels" className="text-xs uppercase font-bold hover:underline pt-4 inline-block" style={{ color: atmosphere.accent, fontFamily }}>
          العودة لكافّة الروايات
        </Link>
      </div>
    );
  }

  // ── Main Reader ────────────────────────────────────────────────────────────
  return (
    <div
      ref={topRef}
      dir="rtl"
      className="min-h-screen transition-colors duration-300 relative select-text"
      style={{ background: t.bg, color: t.text, fontFamily }}
    >
      {/* Dynamic Genre Subtle Glow Effect */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 15%, ${atmosphere.glowColor} 0%, transparent 60%)`,
        }}
      />

      {/* Top Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3.5px] z-50 pointer-events-none" style={{ background: t.border }}>
        <div
          className="h-full transition-all duration-150"
          style={{ width: `${scrollProgress}%`, background: atmosphere.progressGradient }}
        />
      </div>

      {/* Preview Mode Banner */}
      {(isPreview || chapter.isDraft) && (
        <div
          className="py-2 px-4 text-center text-xs font-bold shadow-md sticky top-0 z-40 flex items-center justify-center gap-2"
          style={{ background: atmosphere.accent, color: "#000", fontFamily }}
        >
          <Eye className="w-4 h-4" />
          <span>وضع المعاينة الحصري (PREVIEW MODE) — هذا النص لم يُنشر للعامة بعد</span>
        </div>
      )}

      {/* Watermark for Authenticated Users */}
      {user?.email && (
        <div className="pointer-events-none select-none fixed inset-0 z-30 flex items-center justify-center -rotate-12" style={{ opacity: 0.02 }}>
          <span className="text-3xl font-mono uppercase font-black tracking-widest whitespace-nowrap" style={{ color: t.text }}>
            {user.email} • HEKAYATY READER
          </span>
        </div>
      )}

      {/* Header Toolbar (Auto-hiding on scroll) */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b py-3 px-4 shadow-sm transition-transform duration-300 ${
          headerVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        style={{ background: t.headerBg, borderColor: atmosphere.headerBorder }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Right: Back */}
          <Link
            href={`/novels/${novelSlug || chapter.novelSlug || ""}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors hover:opacity-80"
            style={{ color: atmosphere.accent, fontFamily }}
          >
            <ChevronRight className="w-4 h-4" />
            <span className="hidden sm:inline">العودة للرواية</span>
          </Link>

          {/* Center: Title */}
          <div className="text-center min-w-0 flex-1 px-2">
            <p className="text-[11px] font-mono truncate" style={{ color: t.textMuted }}>
              {chapter.novelArabicTitle || chapter.novelTitle || "رواية حكاياتي"}
            </p>
            <h2 className="text-sm md:text-base font-bold truncate" style={{ color: t.text, fontFamily }}>
              الفصل {chapter.chapterNumber}: {chapter.arabicTitle || chapter.title}
            </h2>
          </div>

          {/* Left: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded hidden md:inline-block"
              style={{ background: atmosphere.badgeBg, color: atmosphere.accent, border: `1px solid ${atmosphere.badgeBorder}` }}
            >
              {scrollProgress}%
            </span>
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all"
              style={{ background: t.navBtnBg, color: atmosphere.accent, border: `1px solid ${t.border}`, fontFamily }}
              title="فهرس الفصول"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">الفصول</span>
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg text-xs flex items-center gap-1 transition-all font-bold"
              style={{ background: atmosphere.badgeBg, color: atmosphere.accent, border: `1px solid ${atmosphere.badgeBorder}`, fontFamily }}
              title="إعدادات القراءة"
            >
              <Sliders className="w-4 h-4" />
              <span>Aa</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg transition-all hidden sm:block"
              style={{ background: t.navBtnBg, color: t.textMuted, border: `1px solid ${t.border}` }}
              title={isFullscreen ? "إنهاء ملء الشاشة" : "ملء الشاشة"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Reading Content */}
      <main className={`mx-auto px-4 sm:px-8 py-10 md:py-16 ${widthClass} relative z-10`}>
        {/* Chapter Header Card */}
        <div className="border-b pb-8 mb-10 text-center space-y-4" style={{ borderColor: atmosphere.headerBorder }}>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold"
              style={{ background: atmosphere.badgeBg, color: atmosphere.accent, border: `1px solid ${atmosphere.badgeBorder}`, fontFamily }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>الفصل {chapter.chapterNumber}</span>
              <span className="opacity-60">•</span>
              <Clock className="w-3.5 h-3.5" />
              <span>~{readTimeMinutes} دقائق قراءة</span>
            </div>
            {atmosphere.nameArabic && (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-bold font-mono"
                style={{ background: t.navBtnBg, color: t.textMuted, border: `1px solid ${t.border}` }}
              >
                {atmosphere.nameArabic}
              </span>
            )}
          </div>
          <h1
            className="font-black tracking-tight leading-tight"
            style={{
              fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
              color: t.text,
              fontFamily,
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {chapter.arabicTitle || chapter.title}
          </h1>
        </div>

        {/* Chapter Body Prose */}
        <article
          dir="rtl"
          style={{
            fontSize: `${prefs.fontSize}px`,
            lineHeight: 2.15,
            color: t.text,
            fontFamily,
            wordBreak: "break-word",
            overflowWrap: "break-word",
            wordSpacing: "0.05em",
          }}
        >
          {(chapter.arabicContent || chapter.content || "")
            .split(/\n\n+/)
            .map((paragraph: string, idx: number) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;
              if (trimmed === "***" || trimmed === "---" || trimmed === "❖") {
                return (
                  <div key={idx} className="my-10 text-center tracking-[0.5em] text-lg font-bold" style={{ color: atmosphere.accent }}>
                    {atmosphere.dividerSymbol}
                  </div>
                );
              }
              return (
                <p
                  key={idx}
                  className="text-justify"
                  style={{
                    marginBottom: `${Math.max(prefs.fontSize * 0.85, 18)}px`,
                    lineHeight: 2.15,
                    color: t.text,
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {trimmed}
                </p>
              );
            })}
        </article>

        {/* End of Chapter Section */}
        <div className="mt-16 pt-10 border-t space-y-8" style={{ borderColor: atmosphere.headerBorder }}>
          <div
            className="p-6 md:p-8 rounded-2xl border text-center space-y-4"
            style={{ background: t.surface, borderColor: atmosphere.badgeBorder }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: atmosphere.badgeBg }}>
              <CheckCircle2 className="w-6 h-6" style={{ color: atmosphere.accent }} />
            </div>
            <h3 className="font-bold text-lg md:text-xl" style={{ fontFamily }}>
              اكتملت قراءة الفصل {chapter.chapterNumber} ✓
            </h3>
            <div className="flex items-center justify-center gap-6 text-xs font-mono" style={{ color: t.textMuted }}>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> {wordCount.toLocaleString()} كلمة
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> ~{readTimeMinutes} دقائق
              </span>
            </div>
          </div>

          {/* Bottom Chapter Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {chapter.prevChapterId ? (
              <button
                onClick={() => navigateChapter(chapter.prevChapterId)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                style={{ background: t.navBtnBg, color: t.text, border: `1px solid ${t.border}`, fontFamily }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: atmosphere.accent }} />
                <span>الفصل السابق</span>
              </button>
            ) : (
              <div className="hidden sm:block" />
            )}

            <Link
              href={`/novels/${novelSlug || chapter.novelSlug || ""}`}
              className="text-xs py-2 transition-colors hover:opacity-80 font-bold"
              style={{ color: t.textMuted, fontFamily }}
            >
              فهرس فصول الرواية
            </Link>

            {chapter.nextChapterId ? (
              <button
                onClick={() => navigateChapter(chapter.nextChapterId)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
                style={{ background: atmosphere.accent, color: "#000", fontFamily }}
              >
                <span>الفصل التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-xs font-bold px-4 py-2 rounded-xl" style={{ background: t.surface, color: t.textMuted, fontFamily }}>
                وصلت لنهاية الفصول المتاحة حالياً 🎉
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Reader Settings Modal (Aa) */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#121218] border border-[#D4AF37]/40 rounded-3xl p-6 w-full max-w-md text-white space-y-6 shadow-2xl relative" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-lg text-[#FFF7D6]" style={{ fontFamily }}>تخصيص تجربة القراءة</h3>
              </div>
              <button onClick={() => setSettingsOpen(false)} className="p-1.5 text-[#888] hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#aaaaaa]" style={{ fontFamily }}>نمط المظهر</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { id: "dark", label: "داكن", icon: <Moon className="w-3.5 h-3.5" />, preview: "bg-[#0a0a0d] border-[#0a0a0d]" },
                  { id: "sepia", label: "دافئ", icon: <BookMarked className="w-3.5 h-3.5" />, preview: "bg-[#f7eed8] border-[#f7eed8]" },
                  { id: "light", label: "فاتح", icon: <Sun className="w-3.5 h-3.5" />, preview: "bg-white border-white" },
                ] as const).map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`py-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                      prefs.theme === th.id ? "border-[#D4AF37] text-[#D4AF37]" : "border-white/10 text-[#888] bg-[#181820]"
                    }`}
                    style={{ fontFamily }}
                  >
                    <span className={`w-6 h-6 rounded-full border-2 ${th.preview}`} />
                    <span className="flex items-center gap-1">{th.icon} {th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#aaaaaa]" style={{ fontFamily }}>حجم الخط ({prefs.fontSize}px)</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFontSize(Math.max(14, prefs.fontSize - 2))}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-[#181820] text-[#888] text-lg font-bold hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all"
                >−</button>
                <div className="flex-1 py-2.5 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-bold text-center flex items-center justify-center" style={{ fontFamily }}>
                  {prefs.fontSize}px
                </div>
                <button
                  onClick={() => setFontSize(Math.min(32, prefs.fontSize + 2))}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-[#181820] text-[#888] text-lg font-bold hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all"
                >+</button>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[15, 18, 21, 25].map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                      prefs.fontSize === size ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-[#181820] text-[#888] border-white/10"
                    }`}
                    style={{ fontFamily }}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>

            {/* Font family */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#aaaaaa]" style={{ fontFamily }}>نوع الخط العربي</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "readex", name: "Readex Pro", family: "'Readex Pro', sans-serif" },
                  { id: "noto-arabic", name: "Noto Sans", family: "'Noto Sans Arabic', sans-serif" },
                  { id: "ibm-arabic", name: "IBM Plex Sans", family: "'IBM Plex Sans Arabic', sans-serif" },
                  { id: "cairo", name: "خط القاهرة", family: "'Cairo', sans-serif" },
                  { id: "amiri", name: "خط أميري", family: "'Amiri', serif" },
                ].map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setFontFamily(font.id as any)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-right ${
                      prefs.fontFamily === font.id ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]" : "bg-[#181820] text-[#aaaaaa] border-white/10"
                    }`}
                    style={{ fontFamily: font.family }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading width */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#aaaaaa]" style={{ fontFamily }}>عرض عمود القراءة</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "compact", label: "مضغوط" },
                  { id: "comfortable", label: "مريح" },
                  { id: "wide", label: "عريض" },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWidth(w.id as any)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      prefs.width === w.id ? "bg-[#D4AF37] text-black border-[#D4AF37]" : "bg-[#181820] text-[#888] border-white/10"
                    }`}
                    style={{ fontFamily }}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Drawer with Search */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-start" onClick={() => setDrawerOpen(false)}>
          <div className="bg-[#0e0e14] border-l border-[#D4AF37]/40 w-full max-w-sm h-full flex flex-col p-6 text-white" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-lg text-[#FFF7D6]" style={{ fontFamily }}>فهرس الفصول</h3>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 text-[#888] hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chapter Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-[#888] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في فصول الرواية..."
                className="w-full bg-[#161622] border border-white/10 rounded-xl py-2.5 pr-9 pl-3 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#D4AF37]"
                style={{ fontFamily }}
              />
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {filteredChapters.length === 0 ? (
                <p className="text-xs text-[#888] text-center py-6" style={{ fontFamily }}>لا توجد فصول مطابقة</p>
              ) : (
                filteredChapters.map((ch: any) => {
                  const isCurrent = ch.id === chapter.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => { setDrawerOpen(false); navigateChapter(ch.id); }}
                      className={`w-full text-right p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#FFF7D6]" : "bg-[#14141c] border-white/5 text-[#aaaaaa] hover:bg-[#1c1c28] hover:text-white"
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#D4AF37] shrink-0">
                          {String(ch.chapterNumber).padStart(2, "0")}
                        </span>
                        <span className="text-xs font-bold truncate" style={{ fontFamily }}>{ch.arabicTitle || ch.title}</span>
                      </div>
                      {ch.isLocked && !isSubscriber && <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
