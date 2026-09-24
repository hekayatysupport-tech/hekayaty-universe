import React, { useCallback, useEffect, useState } from "react";
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
  Sparkles,
  Tv,
  Film,
  Compass,
  FileText,
  Star,
  Flame
} from "lucide-react";
import { toast } from "sonner";
import { MediaPickerModal, SelectedMedia } from "@/components/admin/MediaPickerModal";
import { useAutosave } from "@/hooks/useAutosave";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { useLocalDraft } from "@/hooks/useLocalDraft";

// ─── Content Types Definition ──────────────────────────────────────────────────
const CONTENT_TYPES = [
  { value: "story", label: "Story / Novel (رواية / قصة)", icon: BookOpen, desc: "Written prose, original stories, and light novels" },
  { value: "comic", label: "Comic / Manga (كوميكس / مانجا)", icon: Layers, desc: "Visual storytelling with panel art and illustrated pages" },
  { value: "episode", label: "Episode / Chapter (حلقة / فصل)", icon: FileText, desc: "Standalone episode, webisode, or serialized installment" },
  { value: "universe", label: "Universe / Franchise (عالم / امتياز)", icon: Compass, desc: "Multiverse, lore hub, or multi-series intellectual property" },
  { value: "animation", label: "Animation (أنيميشن)", icon: Tv, desc: "Animated series, motion comics, or animated short" },
  { value: "movie", label: "Movie / Feature (فيلم)", icon: Film, desc: "Original cinematic movie or feature presentation" },
];

const ACCESS_LEVELS = [
  { value: "subscriber", label: "👑 VIP Subscribers Only (للمشتركين فقط)" },
  { value: "free", label: "🌐 Free for All (مجاني للجميع)" },
  { value: "purchased", label: "💎 Premium Purchase (شراء مباشر)" },
];

// ─── Publish Confirm Modal ────────────────────────────────────────────────────
interface PublishModalProps {
  open: boolean;
  title: string;
  checks: { label: string; ok: boolean }[];
  publishing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function PublishModal({ open, title, checks, publishing, onConfirm, onCancel }: PublishModalProps) {
  if (!open) return null;
  const hasBlockers = checks.some((c) => !c.ok);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0c0c10] border border-[#2a2a36] rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-[#1a1a22]">
          <h2 className="text-lg font-serif font-bold text-[#f0f0f0]">
            Publish Original Work?
          </h2>
          <p className="text-xs text-[#888888] mt-1 font-mono">
            "{title || "Untitled"}"
          </p>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-xs text-[#aaa] font-sans">
            Pre-publish validation checklist:
          </p>
          <div className="space-y-2 bg-[#121218] p-4 rounded-xl border border-[#222230]">
            {checks.map((check, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs">
                {check.ok ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className={check.ok ? "text-[#e0e0e0]" : "text-rose-300"}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>

          {hasBlockers && (
            <p className="text-[11px] text-amber-400 flex items-center gap-1.5 mt-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Some recommended fields are missing, but you can still publish.
            </p>
          )}
        </div>

        <div className="p-4 bg-[#08080a] border-t border-[#1a1a22] rounded-b-2xl flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={publishing}
            className="px-4 py-2 text-xs font-medium text-[#aaa] hover:text-white rounded-lg hover:bg-[#1a1a22] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={publishing}
            className="px-5 py-2 text-xs font-semibold text-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 rounded-lg shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
          >
            {publishing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Publish Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Editor Component ─────────────────────────────────────────────────────

export function AdminOriginalsEdit() {
  const [, params] = useRoute("/admin/originals/:id");
  const [, setLocation] = useLocation();
  const { session } = useAuth();

  const isNew = !params?.id || params.id === "new";
  const originalId = isNew ? null : params?.id;

  // State
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [arabicTitle, setArabicTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [arabicDescription, setArabicDescription] = useState("");
  const [contentType, setContentType] = useState("story");
  const [accessLevel, setAccessLevel] = useState("subscriber");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isNewBadge, setIsNewBadge] = useState(true);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [creatorName, setCreatorName] = useState("Hekayaty Studios");

  // Media Pickers
  const [coverUrl, setCoverUrl] = useState("");
  const [coverMediaId, setCoverMediaId] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerMediaId, setBannerMediaId] = useState<string | null>(null);
  
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showBannerPicker, setShowBannerPicker] = useState(false);

  // Autosave & Draft Key
  const draftKey = `original-draft-${originalId || "new"}`;
  const { clearDraft } = useLocalDraft(draftKey);

  // Fetch Existing Data
  useEffect(() => {
    if (!originalId || !session) return;
    setLoading(true);

    fetch(`/api/admin/originals/${originalId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load original work");
        return res.json();
      })
      .then((data) => {
        setTitle(data.title || "");
        setArabicTitle(data.arabic_title || data.arabicTitle || "");
        setSlug(data.slug || "");
        setTagline(data.tagline || "");
        setDescription(data.description || "");
        setArabicDescription(data.arabic_description || data.arabicDescription || "");
        setContentType(data.content_type || data.contentType || "story");
        setAccessLevel(data.access_level || data.accessLevel || "subscriber");
        setStatus(data.status || "draft");
        setIsFeatured(Boolean(data.is_featured ?? data.isFeatured));
        setIsTrending(Boolean(data.is_trending ?? data.isTrending));
        setIsNewBadge(Boolean(data.is_new ?? data.isNew));
        setIsComingSoon(Boolean(data.is_coming_soon ?? data.isComingSoon));
        setCreatorName(data.creator_name || "Hekayaty Studios");
        setCoverUrl(data.coverUrl || data.cover_url || "");
        setCoverMediaId(data.cover_media_id || null);
        setBannerUrl(data.bannerUrl || data.banner_url || "");
        setBannerMediaId(data.banner_media_id || null);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load item");
      })
      .finally(() => setLoading(false));
  }, [originalId, session]);

  // Auto slug generation from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew && !slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  // Save Function
  const saveOriginal = async (overrideStatus?: "draft" | "published" | "archived") => {
    if (!session) {
      toast.error("Not authenticated");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setSaving(true);
    const targetStatus = overrideStatus || status;

    const payload = {
      title,
      arabic_title: arabicTitle || title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      tagline,
      description,
      arabic_description: arabicDescription || description,
      content_type: contentType,
      access_level: accessLevel,
      status: targetStatus,
      is_featured: isFeatured,
      is_trending: isTrending,
      is_new: isNewBadge,
      is_coming_soon: isComingSoon,
      creator_name: creatorName,
      cover_url: coverUrl || null,
      cover_media_id: coverMediaId || null,
      banner_url: bannerUrl || null,
      banner_media_id: bannerMediaId || null,
    };

    try {
      const url = isNew ? "/api/admin/originals" : `/api/admin/originals/${originalId}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save");
      }

      const savedData = await res.json();
      setStatus(savedData.status);
      clearDraft();
      toast.success(isNew ? "Hekayaty Original created!" : "Hekayaty Original saved!");

      if (isNew && savedData.id) {
        setLocation(`/admin/originals/${savedData.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save project");
    } finally {
      setSaving(false);
      setPublishing(false);
      setShowPublishModal(false);
    }
  };

  // Pre-publish checks
  const publishChecks = [
    { label: "Title in English & Arabic", ok: Boolean(title.trim() && arabicTitle.trim()) },
    { label: "Tagline or pitch line added", ok: Boolean(tagline.trim()) },
    { label: "Cover poster image attached", ok: Boolean(coverUrl) },
    { label: "Synopsis description provided", ok: Boolean(description.trim()) },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-amber-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-sm font-medium">Loading Hekayaty Original Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-[#e0e0e8] font-sans pb-24">
      {/* ── Top Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0a0a0e]/90 backdrop-blur-md border-b border-[#1e1e28]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/originals"
              className="p-2 text-[#888] hover:text-white hover:bg-[#1a1a24] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <h1 className="text-base font-bold text-white tracking-tight">
                  {isNew ? "New Hekayaty Original" : title || "Edit Hekayaty Original"}
                </h1>
                <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {status}
                </span>
              </div>
              <p className="text-xs text-[#777] hidden sm:block">
                Hekayaty Story & Content Studio Editor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => saveOriginal("draft")}
              disabled={saving}
              className="px-4 py-2 text-xs font-medium text-[#ccc] bg-[#14141c] hover:bg-[#1f1f2c] border border-[#2a2a3a] rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>

            {status !== "published" ? (
              <button
                onClick={() => setShowPublishModal(true)}
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 rounded-lg shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publish</span>
              </button>
            ) : (
              <button
                onClick={() => saveOriginal("published")}
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold text-black bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Update Published</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Workspace Content ─────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Section 1: Content Type Selection Wizard */}
        <section className="bg-[#0b0b10] border border-[#1c1c28] rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                Select Original Type
              </h2>
              <p className="text-xs text-[#777] mt-0.5">
                Choose the medium format for this Hekayaty Original creation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONTENT_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = contentType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setContentType(type.value)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/5"
                      : "bg-[#101016] border-[#1e1e2c] text-[#888] hover:border-[#333348] hover:text-[#ddd]"
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className={`p-2.5 rounded-lg ${isSelected ? "bg-amber-500/20 text-amber-400" : "bg-[#181822] text-[#666]"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && <CheckCircle className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="mt-3">
                    <div className="text-xs font-bold text-white">{type.label}</div>
                    <div className="text-[11px] text-[#777] mt-1 line-clamp-2 leading-relaxed">{type.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2: Core Details & Arabic Titles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Title & Slug */}
            <div className="bg-[#0b0b10] border border-[#1c1c28] rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2">
                Title & Branding
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#aaa] mb-1">
                    English Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Shadow of the Sands"
                    className="w-full px-3.5 py-2.5 bg-[#12121a] border border-[#222230] rounded-xl text-xs text-white placeholder-[#444] focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#aaa] mb-1">
                    Arabic Title (الاسم بالعربية) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={arabicTitle}
                    onChange={(e) => setArabicTitle(e.target.value)}
                    placeholder="مثال: ظلال الرمال"
                    dir="rtl"
                    className="w-full px-3.5 py-2.5 bg-[#12121a] border border-[#222230] rounded-xl text-xs text-white placeholder-[#444] focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#aaa] mb-1">
                  Tagline / Pitch (عبارة تشويقية)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. An ancient secret awakened beneath the dunes..."
                  className="w-full px-3.5 py-2.5 bg-[#12121a] border border-[#222230] rounded-xl text-xs text-white placeholder-[#444] focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#aaa] mb-1">
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-[#181824] border border-r-0 border-[#222230] rounded-l-xl text-xs text-[#666] font-mono">
                    /originals/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="shadow-of-the-sands"
                    className="w-full px-3.5 py-2.5 bg-[#12121a] border border-[#222230] rounded-r-xl text-xs text-amber-300 font-mono placeholder-[#444] focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Synopsis & Descriptions */}
            <div className="bg-[#0b0b10] border border-[#1c1c28] rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2">
                Synopsis & Narrative
              </h2>

              <div>
                <label className="block text-xs font-medium text-[#aaa] mb-1">
                  English Synopsis
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed storyline summary..."
                  className="w-full px-3.5 py-2.5 bg-[#12121a] border border-[#222230] rounded-xl text-xs text-white placeholder-[#444] focus:outline-none focus:border-amber-500/50 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#aaa] mb-1">
                  Arabic Synopsis (القصة بالعربية)
                </label>
                <textarea
                  rows={4}
                  value={arabicDescription}
                  onChange={(e) => setArabicDescription(e.target.value)}
                  placeholder="ملخص القصة بالتفصيل..."
                  dir="rtl"
                  className="w-full px-3.5 py-2.5 bg-[#12121a] border border-[#222230] rounded-xl text-xs text-white placeholder-[#444] focus:outline-none focus:border-amber-500/50 leading-relaxed"
                />
              </div>
            </div>

          </div>

          {/* Sidebar / Media / Settings (Right 1 Column) */}
          <div className="space-y-6">

            {/* Access & Status */}
            <div className="bg-[#0b0b10] border border-[#1c1c28] rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2">
                Access & Visibility
              </h2>

              <div>
                <label className="block text-xs font-medium text-[#aaa] mb-1">
                  Access Model
                </label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#12121a] border border-[#222230] rounded-xl text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500/50"
                >
                  {ACCESS_LEVELS.map((acc) => (
                    <option key={acc.value} value={acc.value}>
                      {acc.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#aaa] mb-1">
                  Creator / Studio Name
                </label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#12121a] border border-[#222230] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Badges / Toggles */}
              <div className="pt-2 border-t border-[#1a1a24] space-y-3">
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="flex items-center gap-2 text-[#ccc]">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    Feature in Originals Hero
                  </span>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-[#333] accent-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="flex items-center gap-2 text-[#ccc]">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    Mark as Trending
                  </span>
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 rounded border-[#333] accent-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="flex items-center gap-2 text-[#ccc]">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    New Release Badge
                  </span>
                  <input
                    type="checkbox"
                    checked={isNewBadge}
                    onChange={(e) => setIsNewBadge(e.target.checked)}
                    className="w-4 h-4 rounded border-[#333] accent-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="flex items-center gap-2 text-[#ccc]">
                    <Star className="w-3.5 h-3.5 text-purple-400" />
                    Coming Soon Teaser
                  </span>
                  <input
                    type="checkbox"
                    checked={isComingSoon}
                    onChange={(e) => setIsComingSoon(e.target.checked)}
                    className="w-4 h-4 rounded border-[#333] accent-amber-500"
                  />
                </label>
              </div>
            </div>

            {/* Cover & Banner Images */}
            <div className="bg-[#0b0b10] border border-[#1c1c28] rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-xs font-bold text-[#888] uppercase tracking-wider mb-2">
                Artwork & Media
              </h2>

              {/* Cover Poster */}
              <div>
                <label className="block text-xs font-medium text-[#aaa] mb-1">
                  Poster Cover Image
                </label>
                {coverUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-[#2a2a3a]">
                    <img src={coverUrl} alt="Cover" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCoverPicker(true)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-semibold"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCoverUrl(""); setCoverMediaId(null); }}
                        className="p-2 bg-rose-500/80 hover:bg-rose-500 rounded-lg text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCoverPicker(true)}
                    className="w-full h-36 border-2 border-dashed border-[#222230] hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-[#666] hover:text-amber-400 transition-all bg-[#0e0e14]"
                  >
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-xs">Select Poster Image</span>
                  </button>
                )}
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-xs font-medium text-[#aaa] mb-1">
                  Wide Banner Backdrop
                </label>
                {bannerUrl ? (
                  <div className="relative group rounded-xl overflow-hidden border border-[#2a2a3a]">
                    <img src={bannerUrl} alt="Banner" className="w-full h-24 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBannerPicker(true)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs font-semibold"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBannerUrl(""); setBannerMediaId(null); }}
                        className="p-2 bg-rose-500/80 hover:bg-rose-500 rounded-lg text-white"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowBannerPicker(true)}
                    className="w-full h-24 border-2 border-dashed border-[#222230] hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center gap-2 text-[#666] hover:text-amber-400 transition-all bg-[#0e0e14]"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-xs">Select Banner Image</span>
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ── Pre-publish Modal ─────────────────────────────────────────────────── */}
      <PublishModal
        open={showPublishModal}
        title={title}
        checks={publishChecks}
        publishing={saving}
        onConfirm={() => saveOriginal("published")}
        onCancel={() => setShowPublishModal(false)}
      />

      {/* ── Media Picker Modals ──────────────────────────────────────────────── */}
      <MediaPickerModal
        isOpen={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        onSelect={(media: SelectedMedia) => {
          setCoverUrl(media.secureUrl);
          setCoverMediaId(media.id);
          setShowCoverPicker(false);
        }}
      />

      <MediaPickerModal
        isOpen={showBannerPicker}
        onClose={() => setShowBannerPicker(false)}
        onSelect={(media: SelectedMedia) => {
          setBannerUrl(media.secureUrl);
          setBannerMediaId(media.id);
          setShowBannerPicker(false);
        }}
      />
    </div>
  );
}
