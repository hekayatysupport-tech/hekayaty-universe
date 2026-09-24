import React, { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';
import { BookOpen, Crown, Lock, ChevronLeft, Check, Sparkles, Sun, Moon, Maximize2, Minimize2, Type, Sliders } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ChapterCommentsWidget } from '@/components/comments/ChapterCommentsWidget';
import { RatingReviewWidget } from '@/components/reviews/RatingReviewWidget';
import { DiscoverySection } from '@/components/universe/DiscoverySection';
import { fetchNovelChapter } from '@/lib/supabase-data';

export function StoryReader({ params }: { params?: { id?: string } }) {
  const [, match] = useRoute('/stories/chapters/:id');
  const chapterId = params?.id || match?.id || '';
  const { session, user } = useAuth();

  const [chapter, setChapter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lockedData, setLockedData] = useState<any>(null);

  // Reader Customization State
  const [fontSize, setFontSize] = useState<number>(18); // px
  const [lineHeight, setLineHeight] = useState<number>(1.8);
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'light'>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!chapterId) return;

    fetchNovelChapter(chapterId)
      .then((data) => {
        if (data) setChapter(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [chapterId]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.round((window.scrollY / totalHeight) * 100)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  // Premium Locked State
  if (lockedData) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="max-w-xl w-full bg-card rounded-2xl border border-primary/40 p-8 md:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto border border-primary/40">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary rounded-full border border-primary/30">
              Hekayaty Originals Locked Chapter
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">This chapter is part of Hekayaty Originals</h1>
            <p className="text-sm text-muted-foreground">{lockedData.message || 'Subscribe to Hekayaty Originals to unlock full story chapters, exclusive comics, and early access releases.'}</p>
          </div>

          <div className="bg-secondary/40 rounded-xl p-4 border border-border text-left space-y-2 text-xs text-foreground/90 font-medium">
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Full access to all premium Hekayaty Originals stories</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Exclusive comic series and early release issues</div>
            <div className="flex items-center gap-2"><Check className="w-4 h-4 text-amber-400" /> Choose Monthly (59 EGP), 3 Months (139 EGP), or Yearly (499 EGP - Best Value)</div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/subscription"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-primary text-black font-bold uppercase tracking-wider text-xs rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all text-center"
            >
              View Subscription Plans
            </Link>
            {!session && (
              <Link
                href="/auth"
                className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-bold uppercase tracking-wider text-xs rounded-lg border border-border transition-colors text-center"
              >
                Sign In to Account
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background pt-32 text-center">
        <h1 className="text-2xl font-serif text-primary">Chapter Not Found</h1>
        <Link href="/stories" className="text-xs uppercase font-bold text-foreground hover:underline mt-4 inline-block">
          Return to Stories
        </Link>
      </div>
    );
  }

  // Theme styling mapping
  const themeStyles = {
    dark: 'bg-[#0a0a0d] text-[#e0e0e0]',
    sepia: 'bg-[#fbf0d9] text-[#433422]',
    light: 'bg-[#ffffff] text-[#111111]',
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-20 pb-20 relative ${themeStyles[readerTheme]}`}>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50">
        <div className="h-full bg-gradient-to-r from-amber-500 to-primary transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Dynamic Watermark Overlay */}
      {user?.email && (
        <div className="pointer-events-none select-none fixed inset-0 z-30 opacity-[0.03] flex items-center justify-center rotate-[-25deg]">
          <span className="text-4xl font-mono uppercase font-black tracking-widest text-foreground whitespace-nowrap">
            {user.email} • {new Date().toISOString().slice(0, 10)} • HEKAYATY PROTECTED
          </span>
        </div>
      )}

      {/* Reader Controls Toolbar */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 py-2.5 px-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link href="/stories" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary hover:underline">
            <ChevronLeft className="w-4 h-4" /> Exit Reader
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/40">
              <button onClick={() => setReaderTheme('dark')} className={`px-2 py-1 rounded text-xs font-bold ${readerTheme === 'dark' ? 'bg-black text-amber-400' : 'text-muted-foreground'}`}>Dark</button>
              <button onClick={() => setReaderTheme('sepia')} className={`px-2 py-1 rounded text-xs font-bold ${readerTheme === 'sepia' ? 'bg-[#e8d7b8] text-[#433422]' : 'text-muted-foreground'}`}>Sepia</button>
              <button onClick={() => setReaderTheme('light')} className={`px-2 py-1 rounded text-xs font-bold ${readerTheme === 'light' ? 'bg-white text-black shadow' : 'text-muted-foreground'}`}>Light</button>
            </div>

            {/* Font size adjustments */}
            <div className="hidden sm:flex items-center gap-1 bg-muted/60 px-2 py-1 rounded-lg border border-border/40 text-xs font-bold">
              <button onClick={() => setFontSize(Math.max(14, fontSize - 2))} className="px-1 hover:text-primary">A-</button>
              <span className="text-[10px] text-muted-foreground font-mono">{fontSize}px</span>
              <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="px-1 hover:text-primary">A+</button>
            </div>
          </div>
        </div>
      </div>

      {/* Reader Content Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
        <div className="border-b border-border/60 pb-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-primary">
            {chapter.storyArabicTitle || 'قصة حكاياتي'} • {chapter.readTimeMinutes || 5} min read
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-extrabold tracking-tight">
            {chapter.arabicTitle || chapter.title}
          </h1>
        </div>

        {/* Chapter Text Content */}
        <div
          style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
          className="prose max-w-none font-serif space-y-6 dir-rtl text-right leading-relaxed select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          {chapter.arabicContent || chapter.content}
        </div>

        {/* Community Discussion Widget */}
        <ChapterCommentsWidget storyChapterId={chapterId} />

        {/* Rating & Review Widget */}
        <RatingReviewWidget originalId={chapter.originalId} />

        {/* Connected Lore Discovery Engine */}
        <DiscoverySection currentCategory="Stories" />
      </div>
    </div>
  );
}

