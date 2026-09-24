import { API_BASE_URL } from '@/lib/api';
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  UploadCloud,
  Search,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  RefreshCw,
  Filter,
  ExternalLink,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface MediaAsset {
  id: string;
  publicId: string;
  secureUrl: string;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  resourceType?: string | null;
  category: string;
  altText?: string | null;
  createdAt: string;
}

export const AdminMedia = () => {
  const { session, roles } = useAuth();
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState("general");
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/admin/media`;
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (search.trim()) params.append("search", search.trim());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading media library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchMedia();
    }
  }, [session, categoryFilter]);

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("CDN URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this media asset from database and Cloudinary?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/media/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to delete media asset");

      toast.success("Media asset deleted");
      setMediaList((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Error deleting asset");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);

    const reader = new FileReader();
    reader.onload = () => setUploadPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPreview) return;

    setUploading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadPreview,
          category: uploadCategory,
          altText: uploadAltText,
          folder: `hekayaty/${uploadCategory}`,
        }),
      });

      if (!res.ok) throw new Error("Upload to Cloudinary failed");

      toast.success("Image uploaded to Cloudinary CDN!");
      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadPreview(null);
      setUploadAltText("");
      await fetchMedia();
    } catch (err: any) {
      toast.error(err.message || "Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const categories = [
    { key: "all", label: "All Assets" },
    { key: "character_portrait", label: "Character Portraits" },
    { key: "comic_cover", label: "Comic Covers" },
    { key: "comic_page", label: "Comic Pages" },
    { key: "world_cover", label: "World Covers" },
    { key: "encyclopedia_cover", label: "Encyclopedia" },
    { key: "news_cover", label: "News Covers" },
    { key: "general", label: "General" },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              Cloudinary Media Library
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              {mediaList.length} Assets
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Global media asset storage powered by Cloudinary CDN. Inspect dimensions, categories, and copy direct links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMedia}
            disabled={loading}
            className="p-2 bg-[#121216] border border-[#26262e] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          </button>

          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <UploadCloud className="w-4 h-4" />
            Upload Image
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat.key
                  ? "bg-[#d4af37] text-black shadow"
                  : "bg-[#0f0f14] text-[#888888] hover:text-[#e0e0e0] border border-[#1f1f24]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            placeholder="Search media by alt text or identifier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchMedia()}
            className="w-full pl-9 pr-4 py-2 bg-[#0d0d10] border border-[#222228] focus:border-[#d4af37] rounded-lg text-xs text-[#e0e0e0] placeholder:text-[#555555] focus:outline-none"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-24 text-center text-[#888888] font-mono text-xs flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
          Loading Cloudinary assets...
        </div>
      ) : mediaList.length === 0 ? (
        <div className="py-20 text-center text-[#666666] bg-[#0a0a0d] border border-[#1f1f24] rounded-xl">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-25" />
          <p className="text-sm font-medium">No media assets found.</p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="mt-3 text-xs text-[#d4af37] hover:underline font-bold uppercase tracking-wider"
          >
            + Upload an image to Cloudinary
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaList.map((m) => (
            <div
              key={m.id}
              className="bg-[#0a0a0d] border border-[#1f1f24] hover:border-[#d4af37]/60 rounded-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col group"
            >
              {/* Image Preview */}
              <div className="aspect-square bg-[#121216] relative overflow-hidden flex items-center justify-center">
                <img
                  src={m.secureUrl}
                  alt={m.altText || "asset"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyUrl(m.id, m.secureUrl)}
                    title="Copy CDN URL"
                    className="p-1.5 bg-black/80 hover:bg-black text-[#d4af37] rounded-md shadow"
                  >
                    {copiedId === m.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <a
                    href={m.secureUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Open Full Image"
                    className="p-1.5 bg-black/80 hover:bg-black text-[#e0e0e0] rounded-md shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Asset Meta */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2 text-xs">
                <div>
                  <p className="font-bold text-[#f0f0f0] truncate" title={m.altText || m.publicId}>
                    {m.altText || m.publicId}
                  </p>
                  <span className="text-[10px] font-mono text-[#d4af37] uppercase">
                    {m.category}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#181820] flex items-center justify-between text-[10px] font-mono text-[#777777]">
                  <span>{m.width && m.height ? `${m.width}x${m.height}` : m.format?.toUpperCase()}</span>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-[#666666] hover:text-red-400"
                    title="Delete Media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e0e12] border border-[#2c2c34] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-serif font-bold text-[#f0f0f0]">Upload Asset to Cloudinary</h2>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="border-2 border-dashed border-[#2e2e36] hover:border-[#d4af37] bg-[#121216] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                  <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  {uploadPreview ? (
                    <img src={uploadPreview} alt="preview" className="w-32 h-32 object-cover rounded-lg border border-[#333]" />
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-[#666666] group-hover:text-[#d4af37] mb-2" />
                      <p className="text-xs font-semibold text-[#e0e0e0]">Click to select an image</p>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-xs uppercase text-[#a0a0a0] mb-1">Asset Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0]"
                >
                  <option value="character_portrait">Character Portrait</option>
                  <option value="comic_cover">Comic Cover</option>
                  <option value="comic_page">Comic Page</option>
                  <option value="world_cover">World Cover</option>
                  <option value="encyclopedia_cover">Encyclopedia Cover</option>
                  <option value="news_cover">News Cover</option>
                  <option value="general">General Media</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase text-[#a0a0a0] mb-1">Alt Text / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Al-Saqr flying above ancient pyramid"
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141418] border border-[#282830] rounded-lg text-sm text-[#f0f0f0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#222228]">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-[#181820] text-xs text-[#e0e0e0] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-5 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase rounded-lg disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {uploading ? "Uploading..." : "Upload to CDN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
