import { API_BASE_URL } from '@/lib/api';
import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Edit2,
  Search,
  Trash2,
  CheckCircle,
  Library,
  RefreshCw,
  Eye,
  Tag
} from "lucide-react";
import { toast } from "sonner";

interface EncyclopediaItem {
  id: string;
  title: string;
  arabic_title?: string | null;
  slug?: string | null;
  category: string;
  summary?: string | null;
  status: string;
  coverUrl?: string | null;
  updated_at: string;
}

export const AdminEncyclopedia = () => {
  const [entries, setEntries] = useState<EncyclopediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { session } = useAuth();

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/encyclopedia`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      } else {
        toast.error("Failed to load encyclopedia entries");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error loading encyclopedia");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchEntries();
    }
  }, [session]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete encyclopedia entry "${title}"?`)) return;

    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/encyclopedia/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to delete entry");

      toast.success(`Entry "${title}" deleted`);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Error deleting entry");
    } finally {
      setActionLoading(null);
    }
  };

  const categories = [
    { key: "all", label: "All Categories" },
    { key: "Artifact", label: "Artifacts (الآثار والمقتنيات)" },
    { key: "Power", label: "Powers (القدرات)" },
    { key: "MagicSystem", label: "Magic Systems (أنظمة السحر)" },
    { key: "Faction", label: "Factions (الفصائل والمحافل)" },
    { key: "Creature", label: "Creatures (المخلوقات الأسطورية)" },
    { key: "Concept", label: "Cosmic Concepts (المفاهيم الكونية)" },
    { key: "Technology", label: "Ancient Technology (التقنيات القديمة)" },
  ];

  const filtered = entries.filter((e) => {
    const term = search.toLowerCase();
    const matchesSearch =
      e.title.toLowerCase().includes(term) ||
      (e.arabic_title && e.arabic_title.toLowerCase().includes(term));
    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              Encyclopedia & Lore Codex
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              {entries.length} Entries
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Document artifacts, magical systems, cosmological laws, ancient factions, and creature bestiaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEntries}
            disabled={loading}
            className="p-2 bg-[#121216] border border-[#26262e] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          </button>

          <Link href="/admin/encyclopedia/new">
            <a className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Plus className="w-4 h-4" />
              New Lore Entry
            </a>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Bar */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
            <input
              type="text"
              placeholder="Search codex by title or Arabic keyword..."
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
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="in_review">In Review</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0a0a0d] border border-[#1f1f24] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 text-center text-[#888888] font-mono text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
            Synchronizing codex records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-[#666666]">
            <Library className="w-12 h-12 mx-auto mb-2 opacity-25" />
            <p className="text-sm font-medium">No codex entries found matching criteria.</p>
            <Link href="/admin/encyclopedia/new">
              <a className="inline-block mt-3 text-xs text-[#d4af37] hover:underline font-bold uppercase tracking-wider">
                + Document a new entry
              </a>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121216] border-b border-[#1f1f24] text-[#888888] uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-6 py-3.5">Codex Entry</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Status</th>
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
                            <Library className="w-4 h-4 text-[#666666]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/encyclopedia/${item.id}`}>
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
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider bg-[#181822] text-[#d4af37] border border-[#2a2a38]">
                        {item.category}
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

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/encyclopedia/${item.id}`}>
                          <a className="p-1.5 bg-[#181820] hover:bg-[#252530] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors" title="Edit Entry">
                            <Edit2 className="w-3.5 h-3.5" />
                          </a>
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={actionLoading === item.id}
                          className="p-1.5 bg-[#181820] hover:bg-red-500/20 text-[#888888] hover:text-red-400 rounded-lg transition-colors"
                          title="Delete Entry"
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
