import { useState, useEffect, useCallback } from "react";

const PROGRESS_KEY = "hkty_reading_progress";

export interface ReadingProgressRecord {
  novelSlug: string;
  chapterId: string;
  chapterNumber?: number;
  scrollRatio: number;
  updatedAt: number;
}

export function useReadingProgress(novelSlug?: string, chapterId?: string) {
  const [scrollProgress, setScrollProgress] = useState(0);

  // Save current progress to localStorage
  const saveReadingProgress = useCallback(
    (ratio: number) => {
      if (!novelSlug || !chapterId) return;
      try {
        const raw = localStorage.getItem(PROGRESS_KEY);
        const records: Record<string, ReadingProgressRecord> = raw ? JSON.parse(raw) : {};

        records[novelSlug] = {
          novelSlug,
          chapterId,
          scrollRatio: ratio,
          updatedAt: Date.now(),
        };

        localStorage.setItem(PROGRESS_KEY, JSON.stringify(records));
      } catch {
        // ignore
      }
    },
    [novelSlug, chapterId]
  );

  // Get saved reading progress for a given novel
  const getProgress = useCallback((slug: string): ReadingProgressRecord | null => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (!raw) return null;
      const records: Record<string, ReadingProgressRecord> = JSON.parse(raw);
      return records[slug] || null;
    } catch {
      return null;
    }
  }, []);

  // Listen for scroll events to update progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const ratio = Math.min(1, Math.max(0, window.scrollY / totalHeight));
        const percent = Math.round(ratio * 100);
        setScrollProgress(percent);
        if (novelSlug && chapterId && percent % 5 === 0) {
          saveReadingProgress(ratio);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [novelSlug, chapterId, saveReadingProgress]);

  return {
    scrollProgress,
    saveReadingProgress,
    getProgress,
  };
}
