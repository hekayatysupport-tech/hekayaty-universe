import { useEffect, useRef, useCallback } from "react";

const DRAFT_PREFIX = "hkty_draft_";

interface LocalDraft {
  title: string;
  arabicTitle: string;
  content: string;
  savedAt: number; // epoch ms
}

/**
 * Persists chapter content to localStorage as a local draft backup.
 * On load, compares local draft timestamp vs server updatedAt timestamp
 * to decide if recovery should be offered.
 */
export function useLocalDraft(chapterId: string | null) {
  const key = chapterId ? `${DRAFT_PREFIX}${chapterId}` : null;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Save a draft locally (debounced via caller — call on every content change) */
  const saveDraft = useCallback(
    (data: Omit<LocalDraft, "savedAt">) => {
      if (!key) return;
      try {
        const draft: LocalDraft = { ...data, savedAt: Date.now() };
        localStorage.setItem(key, JSON.stringify(draft));
      } catch {
        // localStorage might be full — ignore silently
      }
    },
    [key]
  );

  /** Read the local draft if it exists */
  const readDraft = useCallback((): LocalDraft | null => {
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as LocalDraft;
    } catch {
      return null;
    }
  }, [key]);

  /**
   * Returns true if the local draft is NEWER than the server's updatedAt timestamp.
   * Call this after fetching the chapter from the server.
   */
  const hasFresherDraft = useCallback(
    (serverUpdatedAt: string | null | undefined): boolean => {
      const draft = readDraft();
      if (!draft) return false;
      if (!serverUpdatedAt) return true;
      const serverMs = new Date(serverUpdatedAt).getTime();
      return draft.savedAt > serverMs;
    },
    [readDraft]
  );

  /** Clear the local draft after a successful server save */
  const clearDraft = useCallback(() => {
    if (!key) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }, [key]);

  // Auto-clear when chapter changes
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [chapterId]);

  return { saveDraft, readDraft, hasFresherDraft, clearDraft };
}
