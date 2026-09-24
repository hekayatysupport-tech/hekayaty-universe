import { API_BASE_URL } from '@/lib/api';
import React, { useEffect, useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Newspaper,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaPickerModal, SelectedMedia } from "@/components/admin/MediaPickerModal";

export const AdminNewsEdit = () => {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/admin/news/:id");
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
    category: "Announcement",
    summary: "",
    content: "",
    status: "draft",
    cover_media_id: null as string | null,
    coverUrl: null as string | null,
  });

  useEffect(() => {
    if (!isNew && id && session) {
      fetchArticle();
    }
  }, [id, isNew, session]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/news/${id}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to load article");

      const data = await res.json();
      setFormData({
        title: data.title || "",
        arabic_title: data.arabic_title || "",
        slug: data.slug || "",
        category: data.category || "Announcement",
        summary: data.summary || "",
        content: data.content || "",
        status: data.status || "draft",
        cover_media_id: data.cover_media_id || null,
        coverUrl: data.coverUrl || null,
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch article");
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
      toast.error("Article headline is required.");
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      status: targetStatus || formData.status,
    };

    try {
      const endpoint = isNew
        ? `${API_BASE_URL}/api/admin/news`
        : `${API_BASE_URL}/api/admin/news/${id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save article");

      const saved = await res.json();
      toast.success(isNew ? "Article drafted!" : "Article updated!");

      if (isNew) {
        setLocation(`/admin/news/${saved.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving article");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-[#888888]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
        <p className="font-mono text-xs">Loading dispatch archives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6 sticky top-16 bg-[#050507]/95 backdrop-blur-md z-10 py-2">
        <div className="flex items-center gap-3">
          <Link href="/admin/news">
            <a className="p-2 bg-[#121216] border border-[#222228] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </a>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              {isNew ? "Write News Dispatch" : `Edit: ${formData.title}`}
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
              <Newspaper className="w-4 h-4 text-[#d4af37]" />
              Article Headline & Categorization
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Headline (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Saqr Issue #1 Official Release"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Arabic Headline (العنوان بالعربية)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: الإطلاق الرسمي للعدد الأول من حكايات الصقر"
                  value={formData.arabic_title || ""}
                  onChange={(e) => setFormData({ ...formData, arabic_title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                >
                  <option value="Announcement">Franchise Announcement</option>
                  <option value="Comic Drop">Comic Drop / Release Alert</option>
                  <option value="Lore Spotlight">Lore & Universe Spotlight</option>
                  <option value="Dev Update">Studio & Development Update</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Article Slug (URL key)
                </label>
                <input
                  type="text"
                  placeholder="e.g. al-saqr-issue-1-release"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                Summary / Excerpt
              </label>
              <textarea
                rows={2}
                placeholder="Hook preview displayed on the community news feed..."
                value={formData.summary || ""}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
              />
            </div>

            <RichTextEditor
              label="Article Story & Content (Rich Text)"
              value={formData.content || ""}
              onChange={(val) => setFormData({ ...formData, content: val })}
              placeholder="Write the full dispatch with embedded headings, links, and details..."
              minHeight="280px"
            />
          </div>
        </div>

        {/* Cover Media */}
        <div className="space-y-6">
          <div className="bg-[#0a0a0d] border border-[#1f1f24] p-6 rounded-xl space-y-4">
            <h2 className="text-base font-serif font-bold text-[#e0e0e0] flex items-center gap-2 border-b border-[#1f1f24] pb-3">
              <ImageIcon className="w-4 h-4 text-[#d4af37]" />
              Article Cover / Banner
            </h2>

            <div className="aspect-[16/9] bg-[#121216] border-2 border-dashed border-[#282832] rounded-xl overflow-hidden relative group flex items-center justify-center">
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
                      Change Cover
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <Newspaper className="w-12 h-12 text-[#555555] mx-auto" />
                  <p className="text-xs text-[#888888]">No article cover selected.</p>
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
        defaultCategory="news_cover"
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
