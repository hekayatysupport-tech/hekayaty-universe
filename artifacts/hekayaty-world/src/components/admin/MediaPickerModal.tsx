import { API_BASE_URL } from '@/lib/api';
import React, { useEffect, useState } from "react";
import {
  X,
  UploadCloud,
  Search,
  Check,
  Image as ImageIcon,
  Loader2,
  Filter,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export interface SelectedMedia {
  id: string;
  secureUrl: string;
  altText?: string | null;
}

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: SelectedMedia) => void;
  title?: string;
  defaultCategory?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = "Select Media Asset",
  defaultCategory = "all",
}) => {
  const [tab, setTab] = useState<"browse" | "upload">("browse");
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(defaultCategory);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState("character_portrait");
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/gallery`;
      if (categoryFilter !== "all") {
        url += `?category=${encodeURIComponent(categoryFilter)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      }
    } catch (err) {
      console.error("Error fetching media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, categoryFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPreview) {
      toast.error("Please select an image file first.");
      return;
    }

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

      const createdMedia = await res.json();
      toast.success("Image uploaded successfully to Cloudinary!");
      
      // Auto select and close
      onSelect({
        id: createdMedia.id,
        secureUrl: createdMedia.secure_url || createdMedia.secureUrl,
        altText: createdMedia.alt_text || createdMedia.altText,
      });
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const filteredMedia = mediaList.filter((m) => {
    const term = search.toLowerCase();
    return (
      (m.altText && m.altText.toLowerCase().includes(term)) ||
      (m.category && m.category.toLowerCase().includes(term)) ||
      (m.publicId && m.publicId.toLowerCase().includes(term))
    );
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0e0e12] border border-[#2c2c34] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#222228] bg-[#141418]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#d4af37]/10 text-[#d4af37] rounded-lg">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-serif font-bold text-[#f0f0f0]">{title}</h2>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 bg-[#08080a] p-1 rounded-lg border border-[#222226]">
              <button
                onClick={() => setTab("browse")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                  tab === "browse" ? "bg-[#d4af37] text-black shadow" : "text-[#888888] hover:text-[#e0e0e0]"
                }`}
              >
                Browse Assets
              </button>
              <button
                onClick={() => setTab("upload")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                  tab === "upload" ? "bg-[#d4af37] text-black shadow" : "text-[#888888] hover:text-[#e0e0e0]"
                }`}
              >
                Upload New
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#888888] hover:text-[#e0e0e0] hover:bg-[#202026] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {tab === "browse" && (
              <div className="space-y-4">
                {/* Search & Filter bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                    <input
                      type="text"
                      placeholder="Search assets by alt text, category, or ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#141418] border border-[#2a2a30] rounded-lg text-sm text-[#e0e0e0] placeholder:text-[#555555] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-[#141418] border border-[#2a2a30] rounded-lg text-sm text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="all">All Categories</option>
                    <option value="character_portrait">Character Portraits</option>
                    <option value="character_gallery">Character Gallery</option>
                    <option value="comic_cover">Comic Covers</option>
                    <option value="comic_page">Comic Pages</option>
                    <option value="world_cover">World Covers</option>
                    <option value="world_gallery">World Gallery</option>
                    <option value="encyclopedia_cover">Encyclopedia Covers</option>
                    <option value="news_cover">News Covers</option>
                    <option value="general">General Media</option>
                  </select>
                </div>

                {/* Grid */}
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-[#888888]">
                    <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
                    <p className="text-xs font-mono">Loading media assets from Cloudinary...</p>
                  </div>
                ) : filteredMedia.length === 0 ? (
                  <div className="py-20 text-center text-[#666666]">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No media found matching your filter.</p>
                    <button
                      onClick={() => setTab("upload")}
                      className="mt-3 text-xs text-[#d4af37] hover:underline font-semibold"
                    >
                      + Upload an image now
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredMedia.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onSelect({
                            id: m.id,
                            secureUrl: m.secureUrl || m.secure_url,
                            altText: m.altText || m.alt_text,
                          });
                          onClose();
                        }}
                        className="group relative aspect-square bg-[#141418] border border-[#26262c] hover:border-[#d4af37] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                      >
                        <img
                          src={m.secureUrl || m.secure_url}
                          alt={m.altText || m.alt_text || "media"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                          <p className="text-[11px] font-bold text-white truncate">{m.altText || m.publicId}</p>
                          <span className="text-[9px] font-mono text-[#d4af37] uppercase">{m.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "upload" && (
              <form onSubmit={handleUploadSubmit} className="space-y-5 max-w-xl mx-auto py-2">
                {/* Drag drop / file zone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-2">
                    Image File
                  </label>
                  <label className="border-2 border-dashed border-[#2e2e36] hover:border-[#d4af37] bg-[#121216] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {uploadPreview ? (
                      <div className="space-y-3 text-center">
                        <img
                          src={uploadPreview}
                          alt="Upload preview"
                          className="w-40 h-40 object-cover rounded-lg border border-[#333] mx-auto"
                        />
                        <p className="text-xs text-[#d4af37] font-mono">{uploadFile?.name}</p>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="w-12 h-12 text-[#666666] group-hover:text-[#d4af37] mb-2 transition-colors" />
                        <p className="text-sm font-medium text-[#e0e0e0]">Click to select an image from your computer</p>
                        <p className="text-xs text-[#666666] mt-1 font-mono">PNG, JPG, WEBP up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                      Category
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#141418] border border-[#2a2a30] rounded-lg text-sm text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
                    >
                      <option value="character_portrait">Character Portrait</option>
                      <option value="character_gallery">Character Gallery</option>
                      <option value="comic_cover">Comic Cover</option>
                      <option value="comic_page">Comic Page</option>
                      <option value="world_cover">World Cover</option>
                      <option value="world_gallery">World Gallery</option>
                      <option value="encyclopedia_cover">Encyclopedia Cover</option>
                      <option value="news_cover">News Cover</option>
                      <option value="general">General Media</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                      Alt Text / Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tarek in solar armor"
                      value={uploadAltText}
                      onChange={(e) => setUploadAltText(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#141418] border border-[#2a2a30] rounded-lg text-sm text-[#e0e0e0] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-[#222228]">
                  <button
                    type="button"
                    onClick={() => setTab("browse")}
                    className="px-4 py-2 bg-[#1a1a20] hover:bg-[#25252c] text-sm text-[#e0e0e0] font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="px-6 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-sm font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {uploading ? "Uploading to Cloudinary..." : "Upload & Select"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
