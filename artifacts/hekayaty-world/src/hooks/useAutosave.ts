import { useEffect, useRef, useState, useCallback } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface UseAutosaveOptions {
  chapterId: string | null;
  token: string | undefined;
  title: string;
  arabicTitle: string;
  content: string;
  isLocked: boolean;
  debounceMs?: number;
  onSaveSuccess?: () => void;
  onSaveError?: (err: string) => void;
}

export function useAutosave({
  chapterId,
  token,
  title,
  arabicTitle,
  content,
  isLocked,
  debounceMs = 2000,
  onSaveSuccess,
  onSaveError,
}: UseAutosaveOptions) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const prevChapterId = useRef<string | null>(null);

  const saveNow = useCallback(
    async (
      tid: string,
      t: string,
      at: string,
      c: string,
      locked: boolean
    ) => {
      if (!tid || !token) return;
      setSaveState("saving");
      setSaveError(null);
      try {
        const res = await fetch(
          `/api/admin/comics/issues/${tid}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: t,
              arabic_title: at,
              content: c,
              summary: c,
              is_locked: locked,
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Save failed" }));
          throw new Error(err.error || "Save failed");
        }
        setSaveState("saved");
        setLastSavedAt(new Date());
        onSaveSuccess?.();
      } catch (err: any) {
        setSaveState("error");
        setSaveError(err.message || "Unable to save");
        onSaveError?.(err.message || "Unable to save");
      }
    },
    [token, onSaveSuccess, onSaveError]
  );

  // Reset idle when chapter changes
  useEffect(() => {
    if (prevChapterId.current !== chapterId) {
      prevChapterId.current = chapterId;
      isFirstRender.current = true;
      setSaveState("idle");
      setSaveError(null);
      setLastSavedAt(null);
    }
  }, [chapterId]);

  // Debounced autosave on content change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!chapterId) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    setSaveState("idle"); // show as "pending" until timer fires

    timerRef.current = setTimeout(() => {
      saveNow(chapterId, title, arabicTitle, content, isLocked);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [chapterId, title, arabicTitle, content, isLocked]);

  const manualSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!chapterId) return Promise.resolve();
    return saveNow(chapterId, title, arabicTitle, content, isLocked);
  }, [chapterId, title, arabicTitle, content, isLocked, saveNow]);

  const saveStateLabel = (() => {
    switch (saveState) {
      case "saving":
        return "Saving...";
      case "saved": {
        if (!lastSavedAt) return "Saved ✓";
        const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
        if (seconds < 10) return "Saved ✓";
        if (seconds < 60) return `Saved ${seconds}s ago`;
        return `Saved ${Math.floor(seconds / 60)}m ago`;
      }
      case "error":
        return saveError || "Unable to save";
      default:
        return "";
    }
  })();

  return { saveState, lastSavedAt, saveStateLabel, saveError, manualSave };
}
