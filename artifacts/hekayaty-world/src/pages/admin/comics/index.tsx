import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Edit2,
  Search,
  Trash2,
  CheckCircle,
  Clock,
  FileEdit,
  BookOpen,
  RefreshCw,
  Eye,
  Layers,
  Crown,
  Sparkles,
  Shield
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface ComicSeries {
  id: string;
  title: string;
  arabic_title?: string | null;
  description?: string | null;
  category?: "comic" | "novel";
  genre?: string;
  is_original?: boolean;
  status: string;
  publishing_status: string;
  coverUrl?: string | null;
  issuesCount: number;
  published_at?: string | null;
  updated_at: string;
}

export const AdminComics = () => {
  const [seriesList, setSeriesList] = useState<ComicSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "comic" | "novel" | "original">("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { session, isPublisher } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("filter") === "original") {
      setCategoryFilter("original");
    }
  }, []);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comics", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSeriesList(data);
      } else {
        toast.error("Failed to load content series");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error loading content catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchSeries();
    }
  }, [session]);

  const handleToggleOriginal = async (s: ComicSeries) => {
    const newOriginal = !s.is_original;
    setActionLoading(s.id);
    try {
      const res = await fetch(`/api/admin/comics/${s.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ is_original: newOriginal }),
      });

      if (!res.ok) throw new Error("Failed to update original status");

      setSeriesList((prev) =>
        prev.map((item) => (item.id === s.id ? { ...item, is_original: newOriginal } : item))
      );

      if (newOriginal) {
        toast.success(`👑 "${s.title}" is now marked as Hekayaty Original!`);
      } else {
        toast.info(`Removed "${s.title}" from Hekayaty Originals.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Error toggling original status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete content entry "${title}" and all its associated chapters/issues?`)) {
      return;
    }

    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/comics/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete entry");

      toast.success(`Entry "${title}" deleted`);
      setSeriesList((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Error deleting entry");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = seriesList.filter((s) => {
    const term = search.toLowerCase();
    const matchesSearch =
      s.title.toLowerCase().includes(term) ||
      (s.arabic_title && s.arabic_title.toLowerCase().includes(term));
    const matchesStatus = statusFilter === "all" || s.publishing_status === statusFilter;
    const matchesCategory =
      categoryFilter === "all"
        ? true
        : categoryFilter === "original"
        ? Boolean(s.is_original)
        : (s.category || "comic") === categoryFilter;
    const matchesGenre = genreFilter === "all" || (s.genre || "Fantasy").toLowerCase() === genreFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory && matchesGenre;
  });

  const comicsCount = seriesList.filter(s => (s.category || "comic") === "comic").length;
  const novelsCount = seriesList.filter(s => s.category === "novel").length;
  const originalsCount = seriesList.filter(s => Boolean(s.is_original)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              Comics & Novels Catalog
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              {seriesList.length} Total Titles
            </span>
            {originalsCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-[#d4af37] border border-[#d4af37]/50 flex items-center gap-1">
                <Crown className="w-3 h-3 fill-[#d4af37]" />
                {originalsCount} Originals
              </span>
            )}
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Manage your digital publishing catalog. Click the 👑 crown icon on any work to toggle it as a Hekayaty Original.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSeries}
            disabled={loading}
            className="p-2 bg-[#121216] border border-[#26262e] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          </button>

          <Link
            href="/admin/comics/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <Plus className="w-4 h-4" />
            + New Title (Comic / Novel)
          </Link>
        </div>
      </div>

      {/* Category Pills & Filter Bar */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-b border-[#1c1c24] pb-2 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              categoryFilter === "all"
                ? "bg-[#d4af37] text-black shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                : "bg-[#0f0f14] text-[#888888] hover:text-[#e0e0e0] hover:bg-[#181820]"
            }`}
          >
            <span>✨ All Content Formats</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {seriesList.length}
            </span>
          </button>

          <button
            onClick={() => setCategoryFilter("original")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              categoryFilter === "original"
                ? "bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                : "bg-[#0f0f14] text-[#d4af37] hover:bg-[#181820] border border-[#d4af37]/30"
            }`}
          >
            <Crown className="w-3.5 h-3.5 fill-[#d4af37] text-black" />
            <span>👑 Hekayaty Originals (الأعمال الأصلية)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {originalsCount}
            </span>
          </button>

          <button
            onClick={() => setCategoryFilter("comic")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              categoryFilter === "comic"
                ? "bg-[#d4af37] text-black shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                : "bg-[#0f0f14] text-[#888888] hover:text-[#e0e0e0] hover:bg-[#181820]"
            }`}
          >
            <span>📚 Comics (قصص مصورة)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {comicsCount}
            </span>
          </button>

          <button
            onClick={() => setCategoryFilter("novel")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              categoryFilter === "novel"
                ? "bg-[#d4af37] text-black shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                : "bg-[#0f0f14] text-[#888888] hover:text-[#e0e0e0] hover:bg-[#181820]"
            }`}
          >
            <span>📖 Novels (روايات)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {novelsCount}
            </span>
          </button>
        </div>

        {/* Search & Genre / Status Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
            <input
              type="text"
              placeholder="Search by title or Arabic title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0d0d10] border border-[#222228] focus:border-[#d4af37] rounded-lg text-xs text-[#e0e0e0] placeholder:text-[#555555] focus:outline-none"
            />
          </div>

          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#0d0d10] border border-[#222228] focus:border-[#d4af37] rounded-lg text-xs text-[#d4af37] font-bold focus:outline-none"
          >
            <option value="all">🎨 All Genres / Categories (جميع الأنواع)</option>
            <option value="Horror">🩸 Horror (رعب)</option>
            <option value="Romance">💕 Romance (رومانسية)</option>
            <option value="Comedy">😂 Comedy (كوميديا)</option>
            <option value="Action & Adventure">⚔️ Action & Adventure (أكشن ومغامرات)</option>
            <option value="Fantasy">🔮 Fantasy (فانتازيا)</option>
            <option value="Sci-Fi">🚀 Sci-Fi (خيال علمي)</option>
            <option value="Drama & Thriller">🎭 Drama & Thriller (دراما وإثارة)</option>
            <option value="Mystery & Supernatural">🔍 Mystery & Supernatural (غموض وخوارق)</option>
            <option value="Historical & Mythology">🏛️ Historical & Mythology (تاريخي وأساطير)</option>
            <option value="Superhero & Martial Arts">🦸 Superhero & Martial Arts (أابطال خارقين)</option>
            <option value="Slice of Life">☕ Slice of Life (شريحة من الحياة)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#0d0d10] border border-[#222228] focus:border-[#d4af37] rounded-lg text-xs text-[#e0e0e0] focus:outline-none"
          >
            <option value="all">All Publishing Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
          </select>
        </div>
      </div>

      {/* Series Grid */}
      {loading ? (
        <div className="py-24 text-center text-[#888888] font-mono text-xs flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
          Loading digital publishing universe repository...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-[#666666] bg-[#0a0a0d] border border-[#1f1f24] rounded-xl space-y-3">
          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-25" />
          <p className="text-sm font-medium">No title found matching the selected filters.</p>
          <Link
            href="/admin/comics/new"
            className="inline-block px-4 py-2 bg-[#181820] border border-[#333] text-xs text-[#d4af37] font-bold uppercase tracking-wider rounded-lg hover:border-[#d4af37]"
          >
            + Create New Title
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => {
            const isNovel = s.category === "novel";
            const genreName = s.genre || "Fantasy";

            return (
              <div
                key={s.id}
                className={`bg-[#0a0a0d] border rounded-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col group ${
                  s.is_original
                    ? "border-[#d4af37]/60 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                    : "border-[#1f1f24] hover:border-[#d4af37]/40"
                }`}
              >
                {/* Cover Banner */}
                <div className="h-48 bg-[#141418] relative overflow-hidden flex items-center justify-center">
                  {s.coverUrl ? (
                    <img
                      src={s.coverUrl}
                      alt={s.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <BookOpen className="w-10 h-10 text-[#444444]" />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-transparent to-black/60 pointer-events-none" />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 flex-wrap z-10">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Format Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow ${
                        isNovel
                          ? "bg-purple-600/90 text-white border border-purple-400/40"
                          : "bg-[#d4af37] text-black font-bold"
                      }`}>
                        {isNovel ? "📖 NOVEL" : "📚 COMIC"}
                      </span>

                      {/* Genre Badge */}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#14141c]/90 text-[#d4af37] border border-[#d4af37]/40 shadow backdrop-blur-md">
                        {genreName}
                      </span>
                    </div>

                    {/* Interactive Crown Toggle Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleOriginal(s);
                      }}
                      disabled={actionLoading === s.id}
                      className={`px-2.5 py-1 rounded-full backdrop-blur-md border transition-all duration-300 shadow-xl flex items-center gap-1.5 cursor-pointer ${
                        s.is_original
                          ? "bg-[#d4af37] text-black border-[#ffd700] shadow-[0_0_15px_rgba(212,175,55,0.6)] font-bold scale-105"
                          : "bg-black/70 text-[#888888] border-[#333] hover:text-[#d4af37] hover:border-[#d4af37]/50"
                      }`}
                      title={s.is_original ? "Press to remove from Hekayaty Originals" : "Press to make this a Hekayaty Original (أعمال حكاياتي الأصلية)"}
                    >
                      <Crown className={`w-3.5 h-3.5 ${s.is_original ? "fill-black text-black" : ""}`} />
                      <span className="text-[10px] font-serif tracking-wider uppercase">
                        {s.is_original ? "ORIGINAL 👑" : "Make Original"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#d4af37] uppercase font-bold flex items-center gap-1">
                        {s.status} {isNovel ? "Novel" : "Series"}
                        {s.is_original && (
                          <span className="text-[9px] bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 px-1.5 py-0.2 rounded font-sans">
                            أصلي
                          </span>
                        )}
                      </span>
                      <span className="text-xs font-mono text-[#888888] flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {s.issuesCount} {isNovel ? "Chapters" : "Issues"}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#f0f0f0] mt-1 group-hover:text-[#d4af37] transition-colors flex items-center gap-2">
                      {s.title}
                      {s.is_original && (
                        <Crown className="w-4 h-4 text-[#d4af37] fill-[#d4af37] shrink-0" />
                      )}
                    </h3>
                    {s.arabic_title && (
                      <p className="text-xs text-[#888888] font-sans mt-0.5" dir="rtl">
                        {s.arabic_title}
                      </p>
                    )}
                    {s.description && (
                      <p className="text-xs text-[#999999] line-clamp-2 mt-2 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-[#1a1a20] flex items-center justify-between gap-2">
                    <Link
                      href={`/admin/comics/${s.id}/issues`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181820] hover:bg-[#252530] border border-[#33333e] text-xs font-bold text-[#d4af37] rounded-lg transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Manage {isNovel ? "Chapters" : "Issues"} ({s.issuesCount})
                    </Link>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/comics/${s.id}`}
                        className="p-1.5 bg-[#181820] hover:bg-[#252530] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDelete(s.id, s.title)}
                        disabled={actionLoading === s.id}
                        className="p-1.5 bg-[#181820] hover:bg-red-500/20 text-[#888888] hover:text-red-400 rounded-lg transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
