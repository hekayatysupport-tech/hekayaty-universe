import { useState, useEffect } from "react";

export type ReaderTheme = "dark" | "sepia" | "light";
export type ReaderWidth = "compact" | "comfortable" | "wide";
export type ReaderFont = "amiri" | "readex" | "noto-arabic" | "ibm-arabic" | "cairo";

export interface ReaderPreferences {
  theme: ReaderTheme;
  fontSize: number; // 16, 18, 22, 26
  width: ReaderWidth;
  fontFamily: ReaderFont;
}

const STORAGE_KEY = "hkty_reader_prefs";

const DEFAULT_PREFS: ReaderPreferences = {
  theme: "dark",
  fontSize: 18,
  width: "comfortable",
  fontFamily: "amiri",
};

export function useReaderPreferences() {
  const [prefs, setPrefs] = useState<ReaderPreferences>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_PREFS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [prefs]);

  const setTheme = (theme: ReaderTheme) => setPrefs((prev) => ({ ...prev, theme }));
  const setFontSize = (fontSize: number) => setPrefs((prev) => ({ ...prev, fontSize }));
  const setWidth = (width: ReaderWidth) => setPrefs((prev) => ({ ...prev, width }));
  const setFontFamily = (fontFamily: ReaderFont) => setPrefs((prev) => ({ ...prev, fontFamily }));

  return {
    prefs,
    setTheme,
    setFontSize,
    setWidth,
    setFontFamily,
  };
}
