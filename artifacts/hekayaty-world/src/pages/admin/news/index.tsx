import { API_BASE_URL } from '@/lib/api';
import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Edit2,
  Search,
  Trash2,
  Newspaper,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface NewsItem {
  id: string;
  title: string;
  arabic_title?: string | null;
  slug?: string | null;
  category?: string | null;
  summary?: string | null;
  status: string;
  published_at?: string | null;
  updated_at: string;
  coverUrl?: string | null;
}

export const AdminNews = () => {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { session } = useAuth();

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/news`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      } else {
        toast.error("Failed to load news dispatches");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error loading news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchNews();
    }
  }, [session]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete news article "${title}"?`)) return;

    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to delete article");

      toast.success(`Article "${title}" deleted`);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Error deleting article");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = articles.filter((a) => {
    const term = search.toLowerCase();
    const matchesSearch =
      a.title.toLowerCase().includes(term) ||
      (a.arabic_title && a.arabic_title.toLowerCase().includes(term));
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              News & Community Dispatches
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              {articles.length} Articles
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Publish franchise announcements, comic drop alerts, behind-the-scenes lore, and development updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchNews}
            disabled={loading}
            className="p-2 bg-[#121216] border border-[#26262e] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          </button>

          <Link href="/admin/news/new">
            <a className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Plus className="w-4 h-4" />
              Write Article
            </a>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            placeholder="Search news by headline or Arabic title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0d0d10] border border-[#222228] focus:border-[#d4af37] rounded-lg text-xs text-[#e0e0e0] placeholder:text-[#555555] focus:outline-none"
          />
        </div>

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

      {/* Table */}
      <div className="bg-[#0a0a0d] border border-[#1f1f24] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 text-center text-[#888888] font-mono text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
            Loading dispatches archive...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-[#666666]">
            <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-25" />
            <p className="text-sm font-medium">No articles found.</p>
            <Link href="/admin/news/new">
              <a className="inline-block mt-3 text-xs text-[#d4af37] hover:underline font-bold uppercase tracking-wider">
                + Draft the first article
              </a>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121216] border-b border-[#1f1f24] text-[#888888] uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-6 py-3.5">Headline</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Publishing State</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181f]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#111116] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#181820] border border-[#2a2a34] overflow-hidden shrink-0 flex items-center justify-center">
                          {item.coverUrl ? (
                            <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <Newspaper className="w-4 h-4 text-[#666666]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/news/${item.id}`}>
                            <a className="font-serif font-bold text-sm text-[#f0f0f0] hover:text-[#d4af37] transition-colors block truncate">
                              {item.title}
                            </a>
                          </Link>
                          {item.arabic_title && (
                            <p className="text-[11px] text-[#888888] font-sans" dir="rtl">
                              {item.arabic_title}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase bg-[#181822] text-[#d4af37] border border-[#2a2a38]">
                        {item.category || "Announcement"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "published"
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-[#2a2a30] text-[#a0a0a0] border border-[#3a3a44]"
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-[11px] text-[#777777]">
                      {item.published_at ? format(new Date(item.published_at), "MMM d, yyyy") : "Draft"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/news/${item.id}`}>
                          <a className="p-1.5 bg-[#181820] hover:bg-[#252530] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors" title="Edit Article">
                            <Edit2 className="w-3.5 h-3.5" />
                          </a>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={actionLoading === item.id}
                          className="p-1.5 bg-[#181820] hover:bg-red-500/20 text-[#888888] hover:text-red-400 rounded-lg transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
