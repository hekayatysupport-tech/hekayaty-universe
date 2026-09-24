import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRoute } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  BookOpen,
  Save,
  CheckCircle,
  Loader2,
  Lock,
  Unlock,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { MediaPickerModal, SelectedMedia } from "@/components/admin/MediaPickerModal";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useAutosave } from "@/hooks/useAutosave";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { useLocalDraft } from "@/hooks/useLocalDraft";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComicPageItem {
  id: string;
  pageNumber: number;
  mediaId: string;
  imageUrl: string;
}

interface IssueItem {
  id: string;
  series_id: string;
  issue_number: number;
  title: string;
  arabic_title?: string | null;
  summary?: string | null;
  content?: string | null;
  release_date?: string | null;
  page_count: number;
  status: string;
  coverUrl?: string | null;
  is_locked?: boolean;
  updated_at?: string | null;
}

// ─── Draft Recovery Banner ────────────────────────────────────────────────────

function DraftBanner({ onRestore, onDiscard }: { onRestore: () => void; onDiscard: () => void }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono mb-4">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      <span className="text-amber-200 flex-1">We found unsaved changes from your previous session.</span>
      <button onClick={onRestore} className="px-3 py-1.5 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400">
        Restore
      </button>
      <button onClick={onDiscard} className="p-1.5 text-amber-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Publish Modal ────────────────────────────────────────────────────────────

interface PublishModalProps {
  open: boolean;
  title: string;
  isNovel: boolean;
  issues: IssueItem[];
  pages: ComicPageItem[];
  publishing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function PublishModal({ open, title, isNovel, issues, pages, publishing, onConfirm, onCancel }: PublishModalProps) {
  if (!open) return null;

  const checks = [
    { label: "At least one issue / chapter exists", ok: issues.length > 0 },
    ...(isNovel
      ? []
      : [{ label: `Issues contain pages (${pages.length} pages in selected issue)`, ok: pages.length > 0 }]),
  ];
  const hasBlockers = checks.some((c) => !c.ok);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0c0c10] border border-[#2a2a36] rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-[#1a1a22]">
          <h2 className="text-lg font-serif font-bold text-[#f0f0f0]">
            Publish {isNovel ? "Novel" : "Comic Series"}?
          </h2>
          <p className="text-xs text-[#888888] mt-1 font-mono">"{title}"</p>
        </div>
        <div className="p-6 space-y-3">
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              {c.ok ? <Check className="w-4 h-4 text-green-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
              <span className={`text-xs ${c.ok ? "text-[#cccccc]" : "text-amber-300 font-semibold"}`}>{c.label}</span>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-[#1a1a22] flex items-center justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-xs font-bold text-[#aaaaaa] bg-[#141418] border border-[#2a2a36] rounded-lg">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={publishing || hasBlockers}
            className="flex items-center gap-2 px-5 py-2 bg-[#d4af37] hover:bg-[#bfa030] disabled:opacity-40 text-black text-xs font-bold uppercase tracking-wider rounded-lg"
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {publishing ? "Publishing..." : "Publish Live"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export const AdminComicIssues = () => {
  const [, params] = useRoute("/admin/comics/:id/issues");
  const seriesId = params?.id;

  const { session, isPublisher } = useAuth();
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any>(null);
  const [issues, setIssues] = useState<IssueItem[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [pages, setPages] = useState<ComicPageItem[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  // Issue lock state
  const [issueLocked, setIssueLocked] = useState(false);
  const [savingLock, setSavingLock] = useState(false);

  // Novel chapter content state
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterArabicTitle, setChapterArabicTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [chapterIsLocked, setChapterIsLocked] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // UI state
  const [newIssueModalOpen, setNewIssueModalOpen] = useState(false);
  const [coverPickerOpen, setCoverPickerOpen] = useState(false);
  const [pagePickerOpen, setPagePickerOpen] = useState(false);
  const creatingRef = useRef(false);

  // Drag & drop state for comic pages
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);
  const [dragOverPageIndex, setDragOverPageIndex] = useState<number | null>(null);

  const handleDropPage = async (targetIdx: number) => {
    if (draggedPageIndex === null || draggedPageIndex === targetIdx || !selectedIssueId) return;
    const reordered = [...pages];
    const [moved] = reordered.splice(draggedPageIndex, 1);
    reordered.splice(targetIdx, 0, moved);

    const updated = reordered.map((p, i) => ({ ...p, pageNumber: i + 1 }));
    setPages(updated);
    setDraggedPageIndex(null);
    setDragOverPageIndex(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

      const res = await fetch(`/api/admin/comics/issues/${selectedIssueId}/pages/reorder`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ pageOrders: updated.map((p) => ({ id: p.id, pageNumber: p.pageNumber })) }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      toast.success("Comic page order updated & saved ✓");
    } catch (err: any) {
      toast.error(err.message || "Failed to persist page order");
    }
  };

  const [newIssueForm, setNewIssueForm] = useState({
    issue_number: 1,
    title: "",
    arabic_title: "",
    summary: "",
    release_date: new Date().toISOString().split("T")[0],
    cover_media_id: null as string | null,
    coverUrl: null as string | null,
  });

  const isNovelSeries = series?.category === "novel";

  // ── Autosave (novel chapters only) ──
  const { saveState, saveStateLabel, manualSave } = useAutosave({
    chapterId: isNovelSeries ? selectedIssueId : null,
    token: session?.access_token,
    title: chapterTitle,
    arabicTitle: chapterArabicTitle,
    content: chapterContent,
    isLocked: chapterIsLocked,
    onSaveSuccess: () => localDraft.clearDraft(),
  });

  // ── Local draft ──
  const localDraft = useLocalDraft(selectedIssueId);

  // ── Unsaved changes guard ──
  const isDirty = isNovelSeries && (saveState === "idle" || saveState === "error");
  useBeforeUnload(isDirty && !!selectedIssueId);

  // word count
  const wordCount = chapterContent.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // ─────────────────────────────────────────────────────────────────────────────
  // Data fetching
  // ─────────────────────────────────────────────────────────────────────────────

  const fetchSeriesAndIssues = useCallback(
    async (keepIssueId?: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/comics/${seriesId}`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        if (!res.ok) throw new Error("Failed to load series");

        const data = await res.json();
        setSeries(data);
        const issueList: IssueItem[] = (data.issues || []).map((iss: any) => ({
          id: iss.id,
          series_id: iss.series_id || seriesId,
          issue_number: iss.issue_number,
          title: iss.title,
          arabic_title: iss.arabic_title,
          summary: iss.summary,
          content: iss.content || iss.summary || "",
          release_date: iss.release_date,
          page_count: iss.page_count || 0,
          status: iss.status || "draft",
          coverUrl: iss.coverUrl,
          is_locked: !!iss.is_locked,
          updated_at: iss.updated_at || null,
        }));
        setIssues(issueList);

        const targetId = keepIssueId || (issueList.length > 0 ? issueList[0].id : null);
        if (targetId) {
          setSelectedIssueId(targetId);
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not fetch issues list");
      } finally {
        setLoading(false);
      }
    },
    [seriesId, session]
  );

  useEffect(() => {
    if (seriesId && session) {
      fetchSeriesAndIssues();
    }
  }, [seriesId, session]);

  const fetchIssuePages = useCallback(
    async (issueId: string) => {
      setPagesLoading(true);
      try {
        const res = await fetch(`/api/admin/comics/issues/${issueId}`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedIssue(data);
          setPages(data.pages || []);
          setIssueLocked(!!data.is_locked);
          // Populate chapter state for novel
          setChapterTitle(data.title || "");
          setChapterArabicTitle(data.arabic_title || "");
          setChapterContent(data.content || data.summary || "");
          setChapterIsLocked(!!data.is_locked);
          // Check local draft
          setShowDraftBanner(false);
          const draftKey = `hkty_draft_${issueId}`;
          try {
            const raw = localStorage.getItem(draftKey);
            if (raw) {
              const parsed = JSON.parse(raw);
              const serverMs = data.updated_at ? new Date(data.updated_at).getTime() : 0;
              if (parsed.savedAt > serverMs) setShowDraftBanner(true);
            }
          } catch {}
        }
      } catch (err) {
        console.error(err);
      } finally {
        setPagesLoading(false);
      }
    },
    [session]
  );

  useEffect(() => {
    if (selectedIssueId && session) {
      fetchIssuePages(selectedIssueId);
    }
  }, [selectedIssueId, session]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Draft recovery
  // ─────────────────────────────────────────────────────────────────────────────

  const handleRestoreDraft = () => {
    const draft = localDraft.readDraft();
    if (!draft) return;
    setChapterTitle(draft.title);
    setChapterArabicTitle(draft.arabicTitle);
    setChapterContent(draft.content);
    setShowDraftBanner(false);
    toast.success("Draft restored.");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Issue CRUD
  // ─────────────────────────────────────────────────────────────────────────────

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creatingRef.current) return;
    creatingRef.current = true;

    if (!newIssueForm.title.trim()) {
      toast.error("Title is required.");
      creatingRef.current = false;
      return;
    }

    try {
      const res = await fetch(`/api/admin/comics/${seriesId}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify(newIssueForm),
      });
      if (!res.ok) throw new Error("Failed to create issue");

      const created = await res.json();
      toast.success(`${isNovelSeries ? "Chapter" : "Issue"} #${created.issue_number} added!`);
      setNewIssueModalOpen(false);
      setNewIssueForm({
        issue_number: (issues.length || 0) + 2,
        title: "",
        arabic_title: "",
        summary: "",
        release_date: new Date().toISOString().split("T")[0],
        cover_media_id: null,
        coverUrl: null,
      });
      await fetchSeriesAndIssues(created.id);
    } catch (err: any) {
      toast.error(err.message || "Error creating issue");
    } finally {
      creatingRef.current = false;
    }
  };

  const handleSaveIssueLock = async () => {
    if (!selectedIssueId) return;
    setSavingLock(true);
    try {
      const res = await fetch(`/api/admin/comics/issues/${selectedIssueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ is_locked: issueLocked }),
      });
      if (!res.ok) throw new Error("Failed to update lock");
      toast.success(issueLocked ? "Issue locked — subscribers only." : "Issue is now free.");
    } catch (err: any) {
      toast.error(err.message || "Error updating lock status");
    } finally {
      setSavingLock(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Novel chapter save
  // ─────────────────────────────────────────────────────────────────────────────

  const handleManualSave = async () => {
    await manualSave();
    await fetchIssuePages(selectedIssueId!);
    toast.success("Chapter saved!");
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Comic page management
  // ─────────────────────────────────────────────────────────────────────────────

  const handleAddPage = async (media: SelectedMedia) => {
    if (!selectedIssueId) return;
    try {
      const nextPageNum = (pages.length || 0) + 1;
      const res = await fetch(`/api/admin/comics/issues/${selectedIssueId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ media_id: media.id, page_number: nextPageNum, alt_text: media.altText || `Page ${nextPageNum}` }),
      });
      if (!res.ok) throw new Error("Failed to add page");
      toast.success(`Page ${nextPageNum} added!`);
      await fetchIssuePages(selectedIssueId);
      await fetchSeriesAndIssues(selectedIssueId);
    } catch (err: any) {
      toast.error(err.message || "Error adding page");
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!selectedIssueId || !window.confirm("Delete this page?")) return;
    try {
      const res = await fetch(`/api/admin/comics/issues/${selectedIssueId}/pages/${pageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to delete page");
      toast.success("Page deleted");
      await fetchIssuePages(selectedIssueId);
    } catch (err: any) {
      toast.error(err.message || "Error deleting page");
    }
  };

  const movePage = async (index: number, direction: "up" | "down") => {
    if (!selectedIssueId) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    const reordered = [...pages];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    const renumbered = reordered.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setPages(renumbered); // optimistic

    const payload = renumbered.map((p) => ({ id: p.id, pageNumber: p.pageNumber }));
    try {
      const res = await fetch(`/api/admin/comics/issues/${selectedIssueId}/pages/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ pageOrders: payload }),
      });
      if (!res.ok) throw new Error("Reorder failed");
      toast.success("Page order saved!");
    } catch {
      toast.error("Error saving page order — refreshing");
      await fetchIssuePages(selectedIssueId);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Publish
  // ─────────────────────────────────────────────────────────────────────────────

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/comics/${seriesId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ publishing_status: "published" }),
      });
      if (!res.ok) throw new Error("Failed to publish");
      setSeries((prev: any) => ({ ...prev, publishing_status: "published" }));
      toast.success("Published live! 🎉");
      setPublishModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-[#888888]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
        <p className="font-mono text-xs">Loading studio...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* ── Studio Top Bar ── */}
      <div className="flex items-center justify-between gap-3 px-6 py-3 bg-[#070709] border-b border-[#1a1a22] shrink-0 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/admin/comics/${seriesId}`}
            className="p-1.5 bg-[#121216] border border-[#222228] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 ${
                isNovelSeries ? "bg-purple-600/80 text-white" : "bg-[#d4af37] text-black"
              }`}>
                {isNovelSeries ? "📖 Novel Studio" : "📚 Comic Studio"}
              </span>
              <h1 className="text-sm font-serif font-bold text-[#f0f0f0] truncate">
                {series?.title || "Loading..."}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-mono font-bold ${
                series?.publishing_status === "published" ? "text-green-400" : "text-[#888888]"
              }`}>
                ● {series?.publishing_status || "draft"}
              </span>
              {isNovelSeries && selectedIssueId && (
                <span className={`text-[10px] font-mono ${
                  saveState === "saving" ? "text-amber-400" :
                  saveState === "saved" ? "text-green-400" :
                  saveState === "error" ? "text-red-400" : "text-[#666666]"
                }`}>
                  {saveStateLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <a
            href={
              isNovelSeries
                ? (selectedIssueId || issues[0]?.id)
                  ? `/read/${series?.slug || seriesId}/${selectedIssueId || issues[0]?.id}?preview=true`
                  : `/novels/${series?.slug || seriesId}?preview=true`
                : `/comics/${seriesId}?preview=true`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141418] border border-[#2a2a36] hover:border-[#d4af37] text-[#aaaaaa] hover:text-[#d4af37] text-xs font-bold rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Preview as Reader
          </a>

          <button
            onClick={() => {
              setNewIssueForm((prev) => ({ ...prev, issue_number: issues.length + 1 }));
              setNewIssueModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141418] border border-[#2a2a36] hover:border-[#d4af37] text-xs font-bold text-[#e0e0e0] rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {isNovelSeries ? "New Chapter" : "New Issue"}
          </button>

          {isPublisher && (
            <button
              onClick={() => setPublishModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow-[0_0_12px_rgba(212,175,55,0.2)]"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {series?.publishing_status === "published" ? "Published ✓" : "Publish Live"}
            </button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Sidebar: Issue/Chapter List ── */}
        <div className="w-72 shrink-0 flex flex-col border-r border-[#1a1a22] overflow-y-auto bg-[#070709]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a22]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#888888]">
              {isNovelSeries ? `Chapters (${issues.length})` : `Issues (${issues.length})`}
            </span>
            <button
              onClick={() => fetchSeriesAndIssues(selectedIssueId || undefined)}
              className="p-1 text-[#555555] hover:text-[#d4af37] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {issues.length === 0 ? (
              <div className="py-12 text-center text-[#555555] text-xs px-4">
                {isNovelSeries ? "No chapters yet." : "No issues yet."}<br />Click below to start.
              </div>
            ) : (
              issues.map((iss) => {
                const isSelected = iss.id === selectedIssueId;
                return (
                  <button
                    key={iss.id}
                    onClick={() => setSelectedIssueId(iss.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? isNovelSeries
                          ? "bg-[#1a1a28] border border-purple-600/50 text-[#f0f0f0]"
                          : "bg-[#1a1a18] border border-[#d4af37]/50 text-[#f0f0f0]"
                        : "text-[#888888] hover:bg-[#0f0f14] hover:text-[#cccccc]"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#d4af37] shrink-0">
                          {String(iss.issue_number).padStart(2, "0")}
                        </span>
                        <span className="text-xs font-medium truncate">{iss.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {iss.is_locked && <span className="text-[10px] text-amber-500">🔒 Locked</span>}
                        <span className="text-[10px] text-[#555555]">
                          {isNovelSeries
                            ? `${(iss.content || "").split(/\s+/).filter(Boolean).length} words`
                            : `${iss.page_count} pages`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-[#1a1a22]">
            <button
              onClick={() => {
                setNewIssueForm((prev) => ({ ...prev, issue_number: issues.length + 1 }));
                setNewIssueModalOpen(true);
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all border ${
                isNovelSeries
                  ? "bg-purple-700/30 hover:bg-purple-700/50 border-purple-600/30 hover:border-purple-500 text-purple-300"
                  : "bg-[#d4af37]/10 hover:bg-[#d4af37]/20 border-[#d4af37]/30 hover:border-[#d4af37]/60 text-[#d4af37]"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {isNovelSeries ? "+ Add Chapter" : "+ New Issue"}
            </button>
          </div>
        </div>

        {/* ── Right Content Panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedIssue ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-12">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isNovelSeries ? "bg-purple-600/10 border border-purple-600/20" : "bg-[#d4af37]/10 border border-[#d4af37]/20"
              }`}>
                {isNovelSeries ? <BookOpen className="w-8 h-8 text-purple-400" /> : <Layers className="w-8 h-8 text-[#d4af37]" />}
              </div>
              <p className="text-sm text-[#666666]">
                {issues.length === 0
                  ? isNovelSeries ? "Create your first chapter to start writing." : "Create your first issue."
                  : isNovelSeries ? "Select a chapter from the sidebar." : "Select an issue from the sidebar."}
              </p>
            </div>
          ) : isNovelSeries ? (
            /* ── Novel Chapter Editor ── */
            <>
              {showDraftBanner && (
                <div className="px-6 pt-4">
                  <DraftBanner onRestore={handleRestoreDraft} onDiscard={() => { localDraft.clearDraft(); setShowDraftBanner(false); }} />
                </div>
              )}

              {/* Chapter action bar */}
              <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-[#1a1a22] shrink-0 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded-lg text-[10px] font-mono font-bold">
                    Chapter {selectedIssue.issue_number}
                  </span>
                  <span className="text-[10px] font-mono text-[#666666]">
                    📝 <strong className="text-[#d4af37]">{wordCount.toLocaleString()}</strong> words &nbsp; ⏱ ~{readTime} min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChapterIsLocked((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      chapterIsLocked
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                        : "bg-[#111116] border-[#2a2a36] text-[#888888] hover:text-[#cccccc]"
                    }`}
                  >
                    {chapterIsLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    {chapterIsLocked ? "Locked" : "Free"}
                  </button>
                  <button
                    onClick={handleManualSave}
                    disabled={saveState === "saving"}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold rounded-lg disabled:opacity-50 shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                  >
                    {saveState === "saving" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Chapter
                  </button>
                </div>
              </div>

              {/* Chapter titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-6 py-3 border-b border-[#1a1a22] shrink-0">
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => { setChapterTitle(e.target.value); localDraft.saveDraft({ title: e.target.value, arabicTitle: chapterArabicTitle, content: chapterContent }); }}
                  placeholder="Chapter title (English)"
                  className="px-3 py-2 bg-[#0c0c10] border border-[#22222c] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
                <input
                  type="text"
                  dir="rtl"
                  value={chapterArabicTitle}
                  onChange={(e) => { setChapterArabicTitle(e.target.value); localDraft.saveDraft({ title: chapterTitle, arabicTitle: e.target.value, content: chapterContent }); }}
                  placeholder="عنوان الفصل بالعربية"
                  className="px-3 py-2 bg-[#0c0c10] border border-[#22222c] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
              </div>

              {/* Writing canvas */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <RichTextEditor
                  value={chapterContent}
                  onChange={(val) => {
                    setChapterContent(val);
                    localDraft.saveDraft({ title: chapterTitle, arabicTitle: chapterArabicTitle, content: val });
                  }}
                  minHeight="500px"
                  placeholder="Write your chapter here. Arabic and English both supported. Autosave is active..."
                />
              </div>

              {/* Bottom status bar */}
              <div className="flex items-center justify-between px-6 py-2 border-t border-[#1a1a22] bg-[#070709] shrink-0">
                <span className={`text-[10px] font-mono ${
                  saveState === "saving" ? "text-amber-400" :
                  saveState === "saved" ? "text-green-400" :
                  saveState === "error" ? "text-red-400" : "text-[#555555]"
                }`}>
                  {saveStateLabel || "Autosave active"}
                </span>
              </div>
            </>
          ) : (
            /* ── Comic Pages Manager ── */
            <div className="flex-1 overflow-y-auto p-6">
              {/* Issue header */}
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#d4af37] px-2 py-0.5 bg-[#d4af37]/10 rounded">
                      Issue #{selectedIssue.issue_number}
                    </span>
                    <h2 className="text-lg font-serif font-bold text-[#f0f0f0]">{selectedIssue.title}</h2>
                  </div>
                  <p className="text-xs text-[#888888] mt-1">
                    {pages.length} Pages &nbsp;•&nbsp; Release: {selectedIssue.release_date || "TBD"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Issue lock toggle */}
                  <button
                    onClick={() => {
                      setIssueLocked((v) => !v);
                      setTimeout(() => handleSaveIssueLock(), 100);
                    }}
                    disabled={savingLock}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      issueLocked
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                        : "bg-[#111116] border-[#2a2a36] text-[#888888] hover:text-[#cccccc]"
                    }`}
                  >
                    {issueLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    {issueLocked ? "Locked" : "Free"}
                  </button>

                  <button
                    onClick={() => setPagePickerOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Pages
                  </button>
                </div>
              </div>

              {/* Pages grid */}
              {pagesLoading ? (
                <div className="py-20 text-center text-[#888888]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#d4af37] mx-auto mb-2" />
                  <p className="text-xs font-mono">Loading pages...</p>
                </div>
              ) : pages.length === 0 ? (
                <div className="py-20 text-center text-[#666666] border-2 border-dashed border-[#1f1f24] rounded-2xl">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-25" />
                  <p className="text-sm mb-3">No comic pages uploaded yet.</p>
                  <button
                    onClick={() => setPagePickerOpen(true)}
                    className="px-5 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow"
                  >
                    + Add First Page
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {pages.map((p, idx) => {
                    const isDragging = draggedPageIndex === idx;
                    const isDragOver = dragOverPageIndex === idx;
                    return (
                      <div
                        key={p.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(idx));
                          setDraggedPageIndex(idx);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDragEnter={() => setDragOverPageIndex(idx)}
                        onDragLeave={() => setDragOverPageIndex(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleDropPage(idx);
                        }}
                        className={`bg-[#0c0c10] border rounded-xl overflow-hidden flex flex-col shadow group cursor-grab active:cursor-grabbing transition-all ${
                          isDragging ? "opacity-30 scale-95 border-amber-500/50" :
                          isDragOver ? "border-[#d4af37] ring-2 ring-[#d4af37]/40 scale-105" :
                          "border-[#22222a] hover:border-[#d4af37]/60"
                        }`}
                      >
                        <div className="aspect-[3/4] bg-[#080808] relative overflow-hidden">
                          <img src={p.imageUrl} alt={`Page ${p.pageNumber}`} className="w-full h-full object-cover pointer-events-none" />
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 text-[10px] font-mono font-bold text-[#d4af37] rounded">
                            P.{p.pageNumber}
                          </div>
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 text-[9px] font-mono text-[#aaaaaa] rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Drag to reorder
                          </div>
                        </div>
                        <div className="p-2 bg-[#0e0e12] border-t border-[#1a1a22] flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => movePage(idx, "up")}
                              disabled={idx === 0}
                              className="p-1 bg-[#1c1c24] hover:bg-[#282834] text-[#888888] hover:text-[#d4af37] rounded disabled:opacity-20 transition-colors"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => movePage(idx, "down")}
                              disabled={idx === pages.length - 1}
                              className="p-1 bg-[#1c1c24] hover:bg-[#282834] text-[#888888] hover:text-[#d4af37] rounded disabled:opacity-20 transition-colors"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleDeletePage(p.id)}
                            className="p-1 text-[#555555] hover:text-red-400 rounded transition-colors"
                            title="Delete Page"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add more tile */}
                  <button
                    onClick={() => setPagePickerOpen(true)}
                    className="aspect-[3/4] border-2 border-dashed border-[#22222a] hover:border-[#d4af37] rounded-xl flex flex-col items-center justify-center gap-2 text-[#555555] hover:text-[#d4af37] transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-xs font-bold">Add Page</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Issue / Chapter Modal ── */}
      {newIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e0e12] border border-[#2c2c34] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-bold text-[#f0f0f0]">
                {isNovelSeries ? "Add New Chapter" : "Create New Issue"}
              </h2>
              <button onClick={() => setNewIssueModalOpen(false)} className="text-[#555555] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#a0a0a0] mb-1">
                    {isNovelSeries ? "Chapter #" : "Issue #"}
                  </label>
                  <input
                    type="number" min="1" required
                    value={newIssueForm.issue_number}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, issue_number: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase text-[#a0a0a0] mb-1">Title *</label>
                  <input
                    type="text" required
                    placeholder={isNovelSeries ? "e.g. The Dark Awakening" : "e.g. Dawn of the Solar Eye"}
                    value={newIssueForm.title}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#a0a0a0] mb-1">Arabic Title</label>
                <input
                  type="text" dir="rtl"
                  placeholder={isNovelSeries ? "مثال: الصحوة المظلمة" : "مثال: فجر عين الشمس"}
                  value={newIssueForm.arabic_title}
                  onChange={(e) => setNewIssueForm({ ...newIssueForm, arabic_title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {!isNovelSeries && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#a0a0a0] mb-1">Release Date</label>
                  <input
                    type="date"
                    value={newIssueForm.release_date}
                    onChange={(e) => setNewIssueForm({ ...newIssueForm, release_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-[#1a1a22]">
                <button
                  type="button"
                  onClick={() => setNewIssueModalOpen(false)}
                  className="px-4 py-2 bg-[#181820] border border-[#2a2a36] text-xs font-bold text-[#e0e0e0] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-bold uppercase rounded-lg ${
                    isNovelSeries
                      ? "bg-purple-600 hover:bg-purple-500 text-white"
                      : "bg-[#d4af37] hover:bg-[#bfa030] text-black"
                  }`}
                >
                  {isNovelSeries ? "Create Chapter" : "Create Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Media Picker */}
      <MediaPickerModal
        isOpen={pagePickerOpen}
        onClose={() => setPagePickerOpen(false)}
        defaultCategory="comic_page"
        title="Select or Upload Comic Page"
        onSelect={handleAddPage}
      />

      {/* Cover Picker */}
      <MediaPickerModal
        isOpen={coverPickerOpen}
        onClose={() => setCoverPickerOpen(false)}
        defaultCategory="comic_cover"
        onSelect={(media: SelectedMedia) => {
          setNewIssueForm((prev) => ({ ...prev, cover_media_id: media.id, coverUrl: media.secureUrl }));
          setCoverPickerOpen(false);
        }}
      />

      {/* Publish Modal */}
      <PublishModal
        open={publishModalOpen}
        title={series?.title || ""}
        isNovel={isNovelSeries}
        issues={issues}
        pages={pages}
        publishing={publishing}
        onConfirm={handlePublish}
        onCancel={() => setPublishModalOpen(false)}
      />
    </div>
  );
};
