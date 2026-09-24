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
  Globe,
  RefreshCw,
  MapPin,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface WorldItem {
  id: string;
  name: string;
  arabic_name: string;
  description?: string | null;
  type?: string | null;
  status: string;
  coverUrl?: string | null;
  regionsCount: number;
  updated_at: string;
}

export const AdminWorlds = () => {
  const [worlds, setWorlds] = useState<WorldItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { session, isPublisher } = useAuth();

  const fetchWorlds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/worlds`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWorlds(data);
      } else {
        toast.error("Failed to load worlds");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error loading worlds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchWorlds();
    }
  }, [session]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete world realm "${name}"?`)) return;

    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/worlds/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to delete world");

      toast.success(`World "${name}" deleted`);
      setWorlds((prev) => prev.filter((w) => w.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Error deleting world");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = worlds.filter((w) => {
    const term = search.toLowerCase();
    const matchesSearch =
      w.name.toLowerCase().includes(term) ||
      (w.arabic_name && w.arabic_name.toLowerCase().includes(term));
    const matchesStatus = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              Worlds & Atlas Registry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              {worlds.length} Realms
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Configure universe dimensions, celestial realms, regions, and key mythic locations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWorlds}
            disabled={loading}
            className="p-2 bg-[#121216] border border-[#26262e] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          </button>

          <Link href="/admin/worlds/new">
            <a className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Plus className="w-4 h-4" />
              New World Realm
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
            placeholder="Search realms by name or Arabic name..."
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

      {/* Worlds Grid */}
      {loading ? (
        <div className="py-24 text-center text-[#888888] font-mono text-xs flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
          Loading world atlas coordinates...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-[#666666] bg-[#0a0a0d] border border-[#1f1f24] rounded-xl">
          <Globe className="w-12 h-12 mx-auto mb-2 opacity-25" />
          <p className="text-sm font-medium">No world realms found.</p>
          <Link href="/admin/worlds/new">
            <a className="inline-block mt-3 text-xs text-[#d4af37] hover:underline font-bold uppercase tracking-wider">
              + Create the first world
            </a>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((w) => (
            <div
              key={w.id}
              className="bg-[#0a0a0d] border border-[#1f1f24] hover:border-[#d4af37]/50 rounded-xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col group"
            >
              <div className="h-44 bg-[#141418] relative overflow-hidden flex items-center justify-center">
                {w.coverUrl ? (
                  <img
                    src={w.coverUrl}
                    alt={w.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Globe className="w-10 h-10 text-[#444444]" />
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow ${
                    w.status === "published"
                      ? "bg-green-500/90 text-black"
                      : "bg-[#18181e]/90 text-[#a0a0a0] border border-[#333]"
                  }`}>
                    {w.status}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#d4af37] uppercase font-bold">
                      {w.type || "Dimension"}
                    </span>
                    <span className="text-xs font-mono text-[#888888] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {w.regionsCount} Regions
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-base text-[#f0f0f0] mt-1 group-hover:text-[#d4af37] transition-colors">
                    {w.name}
                  </h3>
                  {w.arabic_name && (
                    <p className="text-xs text-[#888888] font-sans mt-0.5" dir="rtl">
                      {w.arabic_name}
                    </p>
                  )}
                  {w.description && (
                    <p className="text-xs text-[#999999] line-clamp-2 mt-2 leading-relaxed">
                      {w.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#1a1a20] flex items-center justify-between gap-2">
                  <Link href={`/admin/worlds/${w.id}`}>
                    <a className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181820] hover:bg-[#252530] border border-[#33333e] text-xs font-bold text-[#d4af37] rounded-lg transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                      Configure World & Regions
                    </a>
                  </Link>

                  <button
                    onClick={() => handleDelete(w.id, w.name)}
                    disabled={actionLoading === w.id}
                    className="p-1.5 bg-[#181820] hover:bg-red-500/20 text-[#888888] hover:text-red-400 rounded-lg transition-colors"
                    title="Delete World"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
