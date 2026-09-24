import { API_BASE_URL } from '@/lib/api';
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Edit2,
  Search,
  Trash2,
  CheckCircle,
  Clock,
  FileEdit,
  EyeOff,
  Filter,
  Swords,
  RefreshCw,
  Send,
  MoreVertical,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Character {
  id: string;
  name: string;
  arabic_name: string;
  alias?: string | null;
  alignment: string;
  character_status: string;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  portraitUrl?: string | null;
}

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "published":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
          <CheckCircle className="w-3 h-3" /> Published
        </span>
      );
    case "draft":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2a2a30] text-[#a0a0a0] border border-[#3a3a44]">
          <FileEdit className="w-3 h-3" /> Draft
        </span>
      );
    case "in_review":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          <Clock className="w-3 h-3" /> In Review
        </span>
      );
    case "archived":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          <EyeOff className="w-3 h-3" /> Archived
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2a2a30] text-[#a0a0a0]">
          {status}
        </span>
      );
  }
};

export const AdminCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [alignmentFilter, setAlignmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { session, isPublisher } = useAuth();
  const [, setLocation] = useLocation();

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/characters`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCharacters(data);
      } else {
        toast.error("Failed to load characters list");
      }
    } catch (error) {
      console.error("Error fetching characters:", error);
      toast.error("Network error while loading characters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchCharacters();
    }
  }, [session]);

  const handleWorkflowChange = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/characters/${id}/workflow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update workflow");
      }

      toast.success(`Character status changed to ${newStatus.toUpperCase()}`);
      await fetchCharacters();
    } catch (err: any) {
      toast.error(err.message || "Failed to change status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete character "${name}"?`)) {
      return;
    }

    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/characters/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete character");

      toast.success(`Character "${name}" deleted`);
      setCharacters((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Error deleting character");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = characters.filter((c) => {
    const term = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(term) ||
      (c.arabic_name && c.arabic_name.toLowerCase().includes(term)) ||
      (c.alias && c.alias.toLowerCase().includes(term));

    const matchesAlignment = alignmentFilter === "all" || c.alignment === alignmentFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;

    return matchesSearch && matchesAlignment && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              Characters Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              {characters.length} Total
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Create, edit, power-scale, and publish heroes, villains, and cosmic entities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCharacters}
            disabled={loading}
            className="p-2 bg-[#121216] border border-[#26262e] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          </button>

          <Link
            href="/admin/characters/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Create Character
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
          <input
            type="text"
            placeholder="Search by name, Arabic name, or alias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0d0d10] border border-[#222228] focus:border-[#d4af37] rounded-lg text-xs text-[#e0e0e0] placeholder:text-[#555555] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#666666] shrink-0" />
          <select
            value={alignmentFilter}
            onChange={(e) => setAlignmentFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#0d0d10] border border-[#222228] focus:border-[#d4af37] rounded-lg text-xs text-[#e0e0e0] focus:outline-none"
          >
            <option value="all">All Alignments</option>
            <option value="Hero">Heroes</option>
            <option value="Villain">Villains</option>
            <option value="Antihero">Antiheroes</option>
            <option value="Neutral">Neutral</option>
          </select>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 bg-[#0d0d10] border border-[#222228] focus:border-[#d4af37] rounded-lg text-xs text-[#e0e0e0] focus:outline-none"
        >
          <option value="all">All Workflow Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="in_review">In Review</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Characters Table */}
      <div className="bg-[#0a0a0d] border border-[#1f1f24] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 text-center text-[#888888] font-mono text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
            Synchronizing universe character registry...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-[#666666]">
            <Swords className="w-12 h-12 mx-auto mb-2 opacity-25" />
            <p className="text-sm font-medium">No characters found matching your filters.</p>
            <Link href="/admin/characters/new">
              <a className="inline-block mt-3 text-xs text-[#d4af37] hover:underline font-bold uppercase tracking-wider">
                + Create the first character
              </a>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121216] border-b border-[#1f1f24] text-[#888888] uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-6 py-3.5">Entity</th>
                  <th className="px-6 py-3.5">Alignment</th>
                  <th className="px-6 py-3.5">Lore State</th>
                  <th className="px-6 py-3.5">Workflow</th>
                  <th className="px-6 py-3.5">Last Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181f]">
                {filtered.map((char) => (
                  <tr key={char.id} className="hover:bg-[#111116] transition-colors group">
                    {/* Entity Name & Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#181820] border border-[#2a2a34] overflow-hidden shrink-0 flex items-center justify-center">
                          {char.portraitUrl ? (
                            <img
                              src={char.portraitUrl}
                              alt={char.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Swords className="w-4 h-4 text-[#666666]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/characters/${char.id}`}>
                            <a className="font-serif font-bold text-sm text-[#f0f0f0] hover:text-[#d4af37] transition-colors block truncate">
                              {char.name}
                            </a>
                          </Link>
                          <p className="text-[11px] text-[#888888] font-sans">
                            {char.arabic_name} {char.alias && `• "${char.alias}"`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Alignment */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider ${
                        char.alignment === "Hero" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        char.alignment === "Villain" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                        char.alignment === "Antihero" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                        "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                        {char.alignment}
                      </span>
                    </td>

                    {/* Lore Status */}
                    <td className="px-6 py-4 font-mono text-[#a0a0a0]">
                      {char.character_status || "Active"}
                    </td>

                    {/* Workflow Status Badge */}
                    <td className="px-6 py-4">
                      <StatusBadge status={char.status} />
                    </td>

                    {/* Last Updated */}
                    <td className="px-6 py-4 font-mono text-[11px] text-[#777777]">
                      {char.updated_at ? format(new Date(char.updated_at), "MMM d, yyyy") : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Publish / Review toggle */}
                        {char.status !== "published" && isPublisher && (
                          <button
                            onClick={() => handleWorkflowChange(char.id, "published")}
                            disabled={actionLoading === char.id}
                            title="Publish Live"
                            className="px-2.5 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-[11px] font-bold uppercase tracking-wider rounded transition-colors"
                          >
                            Publish
                          </button>
                        )}

                        {char.status === "draft" && (
                          <button
                            onClick={() => handleWorkflowChange(char.id, "in_review")}
                            disabled={actionLoading === char.id}
                            title="Submit for Review"
                            className="px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-[11px] font-bold uppercase tracking-wider rounded transition-colors"
                          >
                            Review
                          </button>
                        )}

                        <Link href={`/admin/characters/${char.id}`}>
                          <a
                            title="Edit Character"
                            className="p-1.5 bg-[#181820] hover:bg-[#252530] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </a>
                        </Link>

                        <button
                          onClick={() => handleDelete(char.id, char.name)}
                          disabled={actionLoading === char.id}
                          title="Delete Character"
                          className="p-1.5 bg-[#181820] hover:bg-red-500/20 text-[#888888] hover:text-red-400 rounded-lg transition-colors"
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
