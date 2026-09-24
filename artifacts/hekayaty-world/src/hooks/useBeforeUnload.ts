import { useEffect, useRef } from "react";

/**
 * Shows a browser confirmation dialog when the user tries to leave
 * the page while there are unsaved changes.
 *
 * Pass `isDirty = true` to activate the guard.
 * The guard is automatically cleared when isDirty becomes false (e.g. after save).
 */
export function useBeforeUnload(isDirty: boolean) {
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        // Modern browsers ignore the custom message but still show a dialog
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}
