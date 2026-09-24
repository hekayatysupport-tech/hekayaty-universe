import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  BookOpen,
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Eye,
  AlertTriangle,
  RefreshCw,
  Check,
  X,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaPickerModal, SelectedMedia } from "@/components/admin/MediaPickerModal";
import { useAutosave } from "@/hooks/useAutosave";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { useLocalDraft } from "@/hooks/useLocalDraft";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChapterItem {
  id: string;
  issue_number: number;
  title: string;
  arabic_title?: string | null;
  content?: string | null;
  is_locked?: boolean;
  updated_at?: string | null;
}

const GENRES = [
  { value: "Horror", label: "🩸 Horror (رعب)" },
  { value: "Romance", label: "💕 Romance (رومانسية)" },
  { value: "Comedy", label: "😂 Comedy (كوميديا)" },
  { value: "Action & Adventure", label: "⚔️ Action & Adventure (أكشن ومغامرات)" },
  { value: "Fantasy", label: "🔮 Fantasy (فانتازيا)" },
  { value: "Sci-Fi", label: "🚀 Sci-Fi (خيال علمي)" },
  { value: "Drama & Thriller", label: "🎭 Drama & Thriller (دراما وإثارة)" },
  { value: "Mystery & Supernatural", label: "🔍 Mystery & Supernatural (غموض وخوارق)" },
  { value: "Historical & Mythology", label: "🏛️ Historical & Mythology (تاريخي وأساطير)" },
  { value: "Superhero & Martial Arts", label: "🦸 Superhero & Martial Arts (أبطال خارقين)" },
  { value: "Slice of Life", label: "☕ Slice of Life (شريحة من الحياة)" },
];

// ─── Publish Confirm Modal ────────────────────────────────────────────────────

interface PublishModalProps {
  open: boolean;
  title: string;
  isNovel: boolean;
  checks: { label: string; ok: boolean }[];
  publishing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function PublishModal({ open, title, isNovel, checks, publishing, onConfirm, onCancel }: PublishModalProps) {
  if (!open) return null;
  const hasBlockers = checks.some((c) => !c.ok);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0c0c10] border border-[#2a2a36] rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-[#1a1a22]">
          <h2 className="text-lg font-serif font-bold text-[#f0f0f0]">
            Publish {isNovel ? "Novel" : "Comic"}?
          </h2>
          <p className="text-xs text-[#888888] mt-1 font-mono">
            "{title || "Untitled"}"
          </p>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-xs text-[#aaaaaa]">Before publishing, confirm the following:</p>
          {checks.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              {c.ok ? (
                <Check className="w-4 h-4 text-green-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className={`text-xs ${c.ok ? "text-[#cccccc]" : "text-amber-300 font-semibold"}`}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-[#1a1a22] flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-[#aaaaaa] hover:text-white bg-[#141418] border border-[#2a2a36] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={publishing || hasBlockers}
            className="flex items-center gap-2 px-5 py-2 bg-[#d4af37] hover:bg-[#bfa030] disabled:opacity-40 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {publishing ? "Publishing..." : "Publish Live"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Draft Recovery Banner ────────────────────────────────────────────────────

interface DraftBannerProps {
  onRestore: () => void;
  onDiscard: () => void;
}
function DraftBanner({ onRestore, onDiscard }: DraftBannerProps) {
  return (
    <div className="flex items-center gap-4 px-5 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      <span className="text-amber-200 flex-1">
        We found unsaved changes from your previous session.
      </span>
      <button
        onClick={onRestore}
        className="px-3 py-1.5 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors"
      >
        Restore Changes
      </button>
      <button
        onClick={onDiscard}
        className="p-1.5 text-amber-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export const AdminComicEdit = () => {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/admin/comics/:id");
  const id = params?.id;
  const isNew = id === "new" || !id || location.endsWith("/new");

  const { session, isPublisher } = useAuth();

  // ── Loading / saving state ──
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  // ── Series metadata form ──
  const [formData, setFormData] = useState({
    title: "",
    arabic_title: "",
    description: "",
    category: "novel" as "comic" | "novel",
    genre: "Fantasy",
    is_original: false,
    status: "Ongoing",
    publishing_status: "draft",
    cover_media_id: null as string | null,
    coverUrl: null as string | null,
    slug: "",
  });

  // ── Novel chapter state ──
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterArabicTitle, setChapterArabicTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [chapterIsLocked, setChapterIsLocked] = useState(false);
  const [creatingChapter, setCreatingChapter] = useState(false);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // ── Guard duplicate create clicks ──
  const creatingRef = useRef(false);

  // ── Autosave ──
  const { saveState, saveStateLabel, manualSave } = useAutosave({
    chapterId: selectedChapterId,
    token: session?.access_token,
    title: chapterTitle,
    arabicTitle: chapterArabicTitle,
    content: chapterContent,
    isLocked: chapterIsLocked,
    onSaveSuccess: () => {
      localDraft.clearDraft();
    },
  });

  // ── Local draft ──
  const localDraft = useLocalDraft(selectedChapterId);

  // ── Unsaved changes guard ──
  const isDirty = saveState === "idle" || saveState === "error";
  useBeforeUnload(isDirty && !!selectedChapterId);

  // ── Word / read time stats ──
  const wordCount = chapterContent.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // ─────────────────────────────────────────────────────────────────────────────
  // Data fetching
  // ─────────────────────────────────────────────────────────────────────────────

  const fetchSeries = useCallback(
    async (keepActiveChapterId?: string) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/comics/${id}`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        if (!res.ok) throw new Error("Failed to load content details");

        const data = await res.json();
        setFormData({
          title: data.title || "",
          arabic_title: data.arabic_title || "",
          description: data.description || "",
          category: data.category || "novel",
          genre: data.genre || "Fantasy",
          is_original: Boolean(data.is_original),
          status: data.status || "Ongoing",
          publishing_status: data.publishing_status || "draft",
          cover_media_id: data.cover_media_id || null,
          coverUrl: data.coverUrl || null,
          slug: data.slug || "",
        });

        const list: ChapterItem[] = (data.issues || []).map((iss: any) => ({
          id: iss.id,
          issue_number: iss.issue_number,
          title: iss.title,
          arabic_title: iss.arabic_title,
          content: iss.content || iss.summary || "",
          is_locked: !!iss.is_locked,
          updated_at: iss.updated_at || null,
        }));

        setChapters(list);

        const targetId = keepActiveChapterId || (list.length > 0 ? list[0].id : null);
        if (targetId) {
          const ch = list.find((c) => c.id === targetId);
          if (ch) {
            setSelectedChapterId(ch.id);
            setChapterTitle(ch.title || "");
            setChapterArabicTitle(ch.arabic_title || "");
            setChapterContent(ch.content || "");
            setChapterIsLocked(!!ch.is_locked);

            // Check local draft
            const localDraftData = localDraft.readDraft();
            if (localDraft.hasFresherDraft(ch.updated_at)) {
              setShowDraftBanner(true);
            }
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not fetch content series");
      } finally {
        setLoading(false);
      }
    },
    [id, session]
  );

  useEffect(() => {
    if (!isNew && id && session) {
      fetchSeries();
    }
  }, [id, isNew, session]);

  // When selecting a different chapter, load its data
  const selectChapter = (ch: ChapterItem) => {
    if (ch.id === selectedChapterId) return;
    setSelectedChapterId(ch.id);
    setChapterTitle(ch.title || "");
    setChapterArabicTitle(ch.arabic_title || "");
    setChapterContent(ch.content || "");
    setChapterIsLocked(!!ch.is_locked);
    setShowDraftBanner(false);

    // Check local draft for this chapter
    const draftKey = `hkty_draft_${ch.id}`;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (ch.updated_at && parsed.savedAt > new Date(ch.updated_at).getTime()) {
          setShowDraftBanner(true);
        }
      }
    } catch {}
  };

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
    toast.success("Draft restored from local backup.");
  };

  const handleDiscardDraft = () => {
    localDraft.clearDraft();
    setShowDraftBanner(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Series / Novel save
  // ─────────────────────────────────────────────────────────────────────────────

  const handleSaveMainSeries = async (targetStatus?: string): Promise<string | null> => {
    if (!formData.title.trim()) {
      toast.error("Title is required.");
      return null;
    }

    setSaving(true);
    const payload = {
      ...formData,
      publishing_status: targetStatus || formData.publishing_status,
    };

    try {
      const endpoint = isNew
        ? "/api/admin/comics"
        : `/api/admin/comics/${id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      const saved = await res.json();
      toast.success(isNew ? "Created successfully!" : "Details updated!");

      if (isNew) {
        setLocation(`/admin/comics/${saved.id}`);
        return saved.id;
      }
      setFormData((prev) => ({ ...prev, publishing_status: saved.publishing_status || prev.publishing_status }));
      return id || null;
    } catch (err: any) {
      toast.error(err.message || "Error saving");
      return null;
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Publish with validation
  // ─────────────────────────────────────────────────────────────────────────────

  const getPublishChecks = () => {
    const isNovel = formData.category === "novel";
    return [
      {
        label: "Cover image is set",
        ok: !!(formData.coverUrl || formData.cover_media_id),
      },
      {
        label: "Description / Summary is filled",
        ok: !!formData.description?.trim(),
      },
      {
        label: isNovel
          ? `At least one chapter exists (${chapters.length} chapters)`
          : `At least one issue exists (${chapters.length} issues)`,
        ok: chapters.length > 0,
      },
    ];
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/comics/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ ...formData, publishing_status: "published" }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to publish");
      }

      setFormData((prev) => ({ ...prev, publishing_status: "published" }));
      toast.success(`${formData.category === "novel" ? "Novel" : "Comic"} published live! 🎉`);
      setPublishModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Chapter CRUD
  // ─────────────────────────────────────────────────────────────────────────────

  const handleCreateChapter = async () => {
    if (creatingRef.current) return; // prevent double-click
    creatingRef.current = true;
    setCreatingChapter(true);

    let currentId = id;
    if (isNew) {
      const savedId = await handleSaveMainSeries("draft");
      if (!savedId) {
        creatingRef.current = false;
        setCreatingChapter(false);
        return;
      }
      currentId = savedId;
    }

    try {
      const nextNum = chapters.length + 1;
      const res = await fetch(`/api/admin/comics/${currentId}/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          issue_number: nextNum,
          title: `Chapter ${nextNum}`,
          arabic_title: `الفصل ${nextNum}`,
          content: "",
          summary: "",
          is_locked: false,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create chapter");
      }

      const created = await res.json();
      toast.success(`Chapter ${nextNum} created — start writing!`);
      await fetchSeries(created.id);
    } catch (err: any) {
      toast.error(err.message || "Error creating chapter");
    } finally {
      setCreatingChapter(false);
      creatingRef.current = false;
    }
  };

  const handleManualSave = async () => {
    await manualSave();
    await fetchSeries(selectedChapterId || undefined);
    toast.success("Chapter saved!");
  };

  const handleSaveAndCreateNext = async () => {
    await manualSave();
    await handleCreateChapter();
  };

  const handleDeleteChapter = async (chId: string) => {
    if (!window.confirm("Delete this chapter? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/comics/issues/${chId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to delete chapter");
      toast.success("Chapter deleted");

      // Clear its local draft
      localStorage.removeItem(`hkty_draft_${chId}`);

      const remaining = chapters.filter((c) => c.id !== chId);
      if (selectedChapterId === chId) {
        setSelectedChapterId(null);
        setChapterTitle("");
        setChapterArabicTitle("");
        setChapterContent("");
      }
      setChapters(remaining);
      await fetchSeries(remaining[0]?.id);
    } catch (err: any) {
      toast.error(err.message || "Error deleting chapter");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────────

  const isNovel = formData.category === "novel";

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-[#888888]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
        <p className="font-mono text-xs">Loading studio...</p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CREATION MODE — shown when isNew = true
  // ─────────────────────────────────────────────────────────────────────────────

  if (isNew) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/comics"
            className="p-2 bg-[#121216] border border-[#222228] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              {formData.category === "novel" ? "📖 New Novel" : "📚 New Comic Series"}
            </h1>
            <p className="text-xs text-[#888888] mt-0.5">
              Fill in the basic information, then click Create to open the Writing Studio.
            </p>
          </div>
        </div>

        {/* Type selector tabs */}
        <div className="flex items-center gap-3 p-1 bg-[#0c0c10] border border-[#1e1e26] rounded-xl">
          {(["novel", "comic"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFormData((f) => ({ ...f, category: cat }))}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                formData.category === cat
                  ? cat === "novel"
                    ? "bg-purple-600 text-white shadow"
                    : "bg-[#d4af37] text-black shadow"
                  : "text-[#888888] hover:text-[#e0e0e0]"
              }`}
            >
              {cat === "novel" ? "📖 Novel / Light Novel" : "📚 Comic Series"}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-[#0a0a0d] border border-[#1f1f24] rounded-2xl p-8 space-y-6">
          {/* Title row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                Title (English) *
              </label>
              <input
                type="text"
                placeholder="e.g. Shadows of the Desert"
                value={formData.title}
                onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                Arabic Title (الاسم بالعربية)
              </label>
              <input
                type="text"
                dir="rtl"
                placeholder="مثال: ظلال الصحراء"
                value={formData.arabic_title || ""}
                onChange={(e) => setFormData((f) => ({ ...f, arabic_title: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
              />
            </div>
          </div>

          {/* Genre + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                Genre *
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData((f) => ({ ...f, genre: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#d4af37] font-bold focus:outline-none"
              >
                {GENRES.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Hiatus">Hiatus</option>
              </select>
            </div>
          </div>

          {/* Hekayaty Original Toggle */}
          <div className="p-4 bg-[#121218] border border-[#2a2a36] hover:border-[#d4af37]/50 rounded-xl transition-colors">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.is_original}
                onChange={(e) => setFormData((f) => ({ ...f, is_original: e.target.checked }))}
                className="w-4 h-4 accent-[#d4af37] rounded cursor-pointer"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <Crown className={`w-4 h-4 ${formData.is_original ? "text-[#d4af37] fill-[#d4af37]" : "text-[#666]"}`} />
                <span className="text-xs font-serif font-bold text-[#f0f0f0]">
                  Hekayaty Original Work (عمل أصل من أصول حكاياتي) 👑
                </span>
                <span className="text-[10px] text-[#888888]">
                  — Check this box to feature this work in the Hekayaty Originals section
                </span>
              </div>
            </label>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
              Cover Image
            </label>
            <button
              type="button"
              onClick={() => setMediaPickerOpen(true)}
              className="w-full h-40 border-2 border-dashed border-[#26262e] hover:border-[#d4af37] rounded-xl flex flex-col items-center justify-center gap-2 transition-colors overflow-hidden group relative"
            >
              {formData.coverUrl ? (
                <>
                  <img src={formData.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs font-bold text-white">Change Cover</span>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-[#555555]" />
                  <span className="text-xs text-[#666666]">Click to select cover from Media Library</span>
                </>
              )}
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
              Description / Summary *
            </label>
            <textarea
              rows={4}
              placeholder={
                formData.category === "novel"
                  ? "Write a compelling summary of the novel's plot, characters, and themes..."
                  : "Write an overview of the comic series, its world, and main characters..."
              }
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={() => handleSaveMainSeries("draft")}
            disabled={saving || !formData.title.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#d4af37] hover:bg-[#bfa030] disabled:opacity-40 text-black font-bold uppercase tracking-widest rounded-xl transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)] text-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {saving
              ? "Creating..."
              : formData.category === "novel"
              ? "Create Novel & Open Writing Studio →"
              : "Create Comic & Open Studio →"}
          </button>
        </div>

        <MediaPickerModal
          isOpen={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          defaultCategory="comic_cover"
          onSelect={(media: SelectedMedia) => {
            setFormData((prev) => ({
              ...prev,
              cover_media_id: media.id,
              coverUrl: media.secureUrl,
            }));
          }}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STUDIO MODE — shown when id exists
  // ─────────────────────────────────────────────────────────────────────────────

  const publishChecks = getPublishChecks();

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* ── Studio Top Bar ── */}
      <div className="flex items-center justify-between gap-3 px-6 py-3 bg-[#070709] border-b border-[#1a1a22] shrink-0 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/comics"
            className="p-1.5 bg-[#121216] border border-[#222228] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 ${
                isNovel ? "bg-purple-600/80 text-white" : "bg-[#d4af37] text-black"
              }`}>
                {isNovel ? "📖 Novel Studio" : "📚 Comic Studio"}
              </span>
              <h1 className="text-sm font-serif font-bold text-[#f0f0f0] truncate">
                {formData.title || "Untitled"}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] font-mono font-bold uppercase ${
                formData.publishing_status === "published" ? "text-green-400" : "text-[#888888]"
              }`}>
                ● {formData.publishing_status}
              </span>
              {selectedChapterId && (
                <span className={`text-[10px] font-mono ${
                  saveState === "saving" ? "text-amber-400" :
                  saveState === "saved" ? "text-green-400" :
                  saveState === "error" ? "text-red-400" :
                  "text-[#666666]"
                }`}>
                  {saveStateLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Preview as Reader */}
          <a
            href={
              isNovel
                ? (selectedChapterId || chapters[0]?.id)
                  ? `/read/${formData.slug || id}/${selectedChapterId || chapters[0]?.id}?preview=true`
                  : `/novels/${formData.slug || id}?preview=true`
                : `/comics/${id}?preview=true`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141418] border border-[#2a2a36] hover:border-[#d4af37] text-[#aaaaaa] hover:text-[#d4af37] text-xs font-bold rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Preview as Reader
          </a>


          {/* Save Details */}
          <button
            type="button"
            onClick={() => handleSaveMainSeries("draft")}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141418] border border-[#2a2a36] hover:border-[#d4af37] text-xs font-bold text-[#e0e0e0] rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            Save Details
          </button>

          {/* Publish */}
          {isPublisher && (
            <button
              type="button"
              onClick={() => setPublishModalOpen(true)}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 shadow-[0_0_12px_rgba(212,175,55,0.2)]"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {formData.publishing_status === "published" ? "Published ✓" : "Publish Live"}
            </button>
          )}
        </div>
      </div>

      {/* ── Studio Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left: Series Info + Chapter Sidebar ── */}
        <div className="w-72 shrink-0 flex flex-col border-r border-[#1a1a22] overflow-y-auto bg-[#070709]">
          {/* Cover + quick meta */}
          <div className="p-4 border-b border-[#1a1a22]">
            <button
              type="button"
              onClick={() => setMediaPickerOpen(true)}
              className="w-full aspect-[3/4] bg-[#0f0f14] border border-[#22222c] hover:border-[#d4af37] rounded-xl overflow-hidden flex items-center justify-center group relative transition-colors"
            >
              {formData.coverUrl ? (
                <>
                  <img src={formData.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-white font-bold">Change Cover</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#555]">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs">Add Cover</span>
                </div>
              )}
            </button>

            {/* Quick genre + status editors */}
            <div className="mt-3 space-y-2">
              <select
                value={formData.genre}
                onChange={(e) => setFormData((f) => ({ ...f, genre: e.target.value }))}
                className="w-full px-2.5 py-1.5 bg-[#0f0f14] border border-[#22222c] focus:border-[#d4af37] rounded-lg text-xs text-[#d4af37] font-bold focus:outline-none"
              >
                {GENRES.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
              <select
                value={formData.status}
                onChange={(e) => setFormData((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-2.5 py-1.5 bg-[#0f0f14] border border-[#22222c] focus:border-[#d4af37] rounded-lg text-xs text-[#aaaaaa] focus:outline-none"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Hiatus">Hiatus</option>
              </select>
            </div>
          </div>

          {/* Chapter / Issue list */}
          {isNovel ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a22]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#888888]">
                  Chapters ({chapters.length})
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {chapters.length === 0 ? (
                  <div className="py-8 text-center text-[#555555] text-xs">
                    No chapters yet.<br />Click below to start writing.
                  </div>
                ) : (
                  chapters.map((ch) => (
                    <div
                      key={ch.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectChapter(ch)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") selectChapter(ch); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group flex items-start justify-between gap-2 cursor-pointer ${
                        selectedChapterId === ch.id
                          ? "bg-[#1a1a28] border border-purple-600/50 text-[#f0f0f0]"
                          : "text-[#888888] hover:bg-[#0f0f14] hover:text-[#cccccc]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#d4af37] shrink-0">
                            {String(ch.issue_number).padStart(2, "0")}
                          </span>
                          <span className="text-xs font-medium truncate">{ch.title}</span>
                        </div>
                        {ch.is_locked && (
                          <span className="text-[10px] text-amber-500 font-mono">🔒 Locked</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChapter(ch.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-[#555] hover:text-red-400 transition-all shrink-0"
                        title="Delete Chapter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 border-t border-[#1a1a22]">
                <button
                  type="button"
                  onClick={handleCreateChapter}
                  disabled={creatingChapter}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-700/30 hover:bg-purple-700/50 border border-purple-600/30 hover:border-purple-500 text-purple-300 text-xs font-bold rounded-xl transition-all"
                >
                  {creatingChapter ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  + Add Chapter
                </button>
              </div>
            </div>
          ) : (
            /* Comic: redirect to issues page */
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              <Layers className="w-10 h-10 text-[#444]" />
              <p className="text-xs text-[#666666] text-center">
                Manage comic issues & page artwork in the Issues Studio.
              </p>
              <Link
                href={`/admin/comics/${id}/issues`}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow transition-colors"
              >
                <Layers className="w-3.5 h-3.5" />
                Open Issues Studio
              </Link>
            </div>
          )}
        </div>

        {/* ── Right: Chapter Editor / Description ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Draft recovery banner */}
          {showDraftBanner && (
            <div className="px-6 pt-4">
              <DraftBanner onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
            </div>
          )}

          {isNovel && selectedChapterId ? (
            /* Chapter Writing Editor */
            <>
              {/* Chapter meta bar */}
              <div className="flex items-center justify-between gap-4 px-6 py-3 border-b border-[#1a1a22] shrink-0 flex-wrap">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 rounded-lg text-[10px] font-mono font-bold">
                    Chapter {chapters.find((c) => c.id === selectedChapterId)?.issue_number}
                  </span>
                  <span className="text-[10px] font-mono text-[#666666]">
                    📝 <strong className="text-[#d4af37]">{wordCount.toLocaleString()}</strong> words &nbsp; ⏱ ~{readTime} min read
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Lock toggle */}
                  <button
                    type="button"
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

                  {/* Save chapter */}
                  <button
                    type="button"
                    onClick={handleManualSave}
                    disabled={saveState === "saving"}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shadow-[0_0_10px_rgba(212,175,55,0.2)]"
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
                  onChange={(e) => {
                    setChapterTitle(e.target.value);
                    localDraft.saveDraft({ title: e.target.value, arabicTitle: chapterArabicTitle, content: chapterContent });
                  }}
                  placeholder="Chapter title (English)"
                  className="px-3 py-2 bg-[#0c0c10] border border-[#22222c] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
                <input
                  type="text"
                  dir="rtl"
                  value={chapterArabicTitle}
                  onChange={(e) => {
                    setChapterArabicTitle(e.target.value);
                    localDraft.saveDraft({ title: chapterTitle, arabicTitle: e.target.value, content: chapterContent });
                  }}
                  placeholder="عنوان الفصل بالعربية"
                  className="px-3 py-2 bg-[#0c0c10] border border-[#22222c] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
              </div>

              {/* Rich text editor — main writing area */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                <RichTextEditor
                  value={chapterContent}
                  onChange={(val) => {
                    setChapterContent(val);
                    localDraft.saveDraft({ title: chapterTitle, arabicTitle: chapterArabicTitle, content: val });
                  }}
                  minHeight="500px"
                  placeholder="Write your chapter here. Use the toolbar for formatting. Arabic and English both supported..."
                />
              </div>

              {/* Bottom action bar */}
              <div className="flex items-center justify-between gap-4 px-6 py-3 border-t border-[#1a1a22] shrink-0 bg-[#070709] flex-wrap">
                <span className={`text-[10px] font-mono ${
                  saveState === "saving" ? "text-amber-400" :
                  saveState === "saved" ? "text-green-400" :
                  saveState === "error" ? "text-red-400" :
                  "text-[#555555]"
                }`}>
                  {saveStateLabel || "Autosave active"}
                </span>

                <button
                  type="button"
                  onClick={handleSaveAndCreateNext}
                  disabled={saveState === "saving" || creatingChapter}
                  className="flex items-center gap-2 px-5 py-2 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_12px_rgba(147,51,234,0.3)] disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save & Create Next Chapter
                </button>
              </div>
            </>
          ) : isNovel ? (
            /* No chapter selected — prompt */
            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-purple-600/10 border border-purple-600/20 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#e0e0e0]">Ready to write?</h3>
                <p className="text-sm text-[#666666] mt-1">
                  {chapters.length === 0
                    ? "Create your first chapter to start writing."
                    : "Select a chapter from the sidebar to begin editing."}
                </p>
              </div>
              {chapters.length === 0 && (
                <button
                  type="button"
                  onClick={handleCreateChapter}
                  disabled={creatingChapter}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                >
                  {creatingChapter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  + Start Writing Chapter 1
                </button>
              )}
            </div>
          ) : (
            /* Comic — description form */
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-[#0a0a0d] border border-[#1f1f24] rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-serif font-bold text-[#e0e0e0]">Series Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                      Arabic Title
                    </label>
                    <input
                      type="text"
                      dir="rtl"
                      value={formData.arabic_title || ""}
                      onChange={(e) => setFormData((f) => ({ ...f, arabic_title: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveMainSeries()}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold rounded-lg transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Picker */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        defaultCategory="comic_cover"
        onSelect={(media: SelectedMedia) => {
          setFormData((prev) => ({
            ...prev,
            cover_media_id: media.id,
            coverUrl: media.secureUrl,
          }));
        }}
      />

      {/* Publish Modal */}
      <PublishModal
        open={publishModalOpen}
        title={formData.title}
        isNovel={isNovel}
        checks={publishChecks}
        publishing={publishing}
        onConfirm={handlePublish}
        onCancel={() => setPublishModalOpen(false)}
      />
    </div>
  );
};
