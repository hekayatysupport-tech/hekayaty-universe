import { API_BASE_URL } from '@/lib/api';
import React, { useEffect, useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Library,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaPickerModal, SelectedMedia } from "@/components/admin/MediaPickerModal";

export const AdminEncyclopediaEdit = () => {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/admin/encyclopedia/:id");
  const id = params?.id;
  const isNew = id === "new" || !id || location.endsWith("/new");

  const { session, isPublisher } = useAuth();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    arabic_title: "",
    slug: "",
    category: "Artifact",
    summary: "",
    content: "",
    status: "draft",
    cover_media_id: null as string | null,
    coverUrl: null as string | null,
  });

  useEffect(() => {
    if (!isNew && id && session) {
      fetchEntry();
    }
  }, [id, isNew, session]);

  const fetchEntry = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/encyclopedia/${id}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to load encyclopedia entry");

      const data = await res.json();
      setFormData({
        title: data.title || "",
        arabic_title: data.arabic_title || "",
        slug: data.slug || "",
        category: data.category || "Artifact",
        summary: data.summary || "",
        content: data.content || "",
        status: data.status || "draft",
        cover_media_id: data.cover_media_id || null,
        coverUrl: data.coverUrl || null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch encyclopedia entry");
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  };

  const handleSave = async (targetStatus?: string) => {
    if (!formData.title.trim()) {
      toast.error("Entry title is required.");
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      status: targetStatus || formData.status,
    };

    try {
      const endpoint = isNew
        ? `${API_BASE_URL}/api/admin/encyclopedia`
        : `${API_BASE_URL}/api/admin/encyclopedia/${id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save codex entry");

      const saved = await res.json();
      toast.success(isNew ? "Codex entry created!" : "Codex entry updated!");

      if (isNew) {
        setLocation(`/admin/encyclopedia/${saved.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving entry");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-[#888888]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
        <p className="font-mono text-xs">Loading codex scrolls...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6 sticky top-16 bg-[#050507]/95 backdrop-blur-md z-10 py-2">
        <div className="flex items-center gap-3">
          <Link href="/admin/encyclopedia">
            <a className="p-2 bg-[#121216] border border-[#222228] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </a>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              {isNew ? "New Codex Entry" : `Edit Lore: ${formData.title}`}
            </h1>
            <p className="text-xs text-[#888888] font-mono">
              Status: <span className="text-[#d4af37] uppercase font-bold">{formData.status}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#141418] border border-[#2e2e36] hover:border-[#d4af37] text-xs font-bold text-[#e0e0e0] rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>

          {isPublisher && (
            <button
              type="button"
              onClick={() => handleSave("published")}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {saving ? "Publishing..." : "Publish Live"}
            </button>
          )}
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0a0a0d] border border-[#1f1f24] p-6 rounded-xl space-y-5">
            <h2 className="text-base font-serif font-bold text-[#e0e0e0] flex items-center gap-2 border-b border-[#1f1f24] pb-3">
              <Library className="w-4 h-4 text-[#d4af37]" />
              Codex Metadata & Classification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Entry Title (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Solar Gauntlet"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
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
                  placeholder="مثال: القفاز الشمسي الأسطوري"
                  value={formData.arabic_title || ""}
                  onChange={(e) => setFormData({ ...formData, arabic_title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Classification Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                >
                  <option value="Artifact">Artifact (الآثار والأسلحة)</option>
                  <option value="Power">Power / Trait (القدرات والسمات)</option>
                  <option value="MagicSystem">Magic System (أنظمة السحر والطاقة)</option>
                  <option value="Faction">Faction / Guild (الفصائل والمنظمات)</option>
                  <option value="Creature">Creature / Entity (الكيانات والمخلوقات)</option>
                  <option value="Concept">Cosmic Concept (المفاهيم الكونية)</option>
                  <option value="Technology">Technology (التقنيات القديمة والمستقبلية)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Codex Slug (URL key)
                </label>
                <input
                  type="text"
                  placeholder="e.g. solar-gauntlet"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                Summary / Lore Overview
              </label>
              <textarea
                rows={2}
                placeholder="High-level description summary..."
                value={formData.summary || ""}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
              />
            </div>

            <RichTextEditor
              label="Deep Lore & Historical Archives (Rich Content)"
              value={formData.content || ""}
              onChange={(val) => setFormData({ ...formData, content: val })}
              placeholder="Chronicle origins, ancient wielders, magical formulas, and cosmological significance..."
              minHeight="280px"
            />
          </div>
        </div>

        {/* Cover Media */}
        <div className="space-y-6">
          <div className="bg-[#0a0a0d] border border-[#1f1f24] p-6 rounded-xl space-y-4">
            <h2 className="text-base font-serif font-bold text-[#e0e0e0] flex items-center gap-2 border-b border-[#1f1f24] pb-3">
              <ImageIcon className="w-4 h-4 text-[#d4af37]" />
              Codex Illustration
            </h2>

            <div className="aspect-[4/3] bg-[#121216] border-2 border-dashed border-[#282832] rounded-xl overflow-hidden relative group flex items-center justify-center">
              {formData.coverUrl ? (
                <>
                  <img
                    src={formData.coverUrl}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => setMediaPickerOpen(true)}
                      className="px-4 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow"
                    >
                      Change Artwork
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <Library className="w-12 h-12 text-[#555555] mx-auto" />
                  <p className="text-xs text-[#888888]">No artifact illustration selected.</p>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="px-4 py-2 bg-[#1c1c24] hover:bg-[#252532] border border-[#33333e] text-xs font-bold text-[#d4af37] rounded-lg transition-colors"
                  >
                    Select from Cloudinary
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        defaultCategory="encyclopedia_cover"
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
};
