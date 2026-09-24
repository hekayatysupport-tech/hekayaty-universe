import React from "react";
import { Link } from "wouter";
import { Plus, Edit2, Trash2, Search, CheckCircle, Clock, FileEdit, EyeOff } from "lucide-react";
import { format } from "date-fns";

export type ContentRow = {
  id: string;
  title?: string;
  name?: string;
  status: string;
  updated_at: string;
  [key: string]: any;
};

export const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    published:  { label: "Published",  className: "bg-green-500/10 text-green-400 border-green-500/20",  icon: <CheckCircle className="w-3.5 h-3.5" /> },
    draft:      { label: "Draft",      className: "bg-[#333]/60 text-[#a0a0a0] border-[#444]",           icon: <FileEdit className="w-3.5 h-3.5" /> },
    in_review:  { label: "In Review",  className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: <Clock className="w-3.5 h-3.5" /> },
    archived:   { label: "Archived",   className: "bg-red-500/10 text-red-400 border-red-500/20",         icon: <EyeOff className="w-3.5 h-3.5" /> },
  };
  const cfg = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.className}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

interface AdminContentTableProps {
  title: string;
  description: string;
  rows: ContentRow[];
  loading: boolean;
  editBase: string;          // e.g. "/admin/comics"
  extraColumns?: { label: string; key: string }[];
  onDelete?: (id: string) => void;
}

export const AdminContentTable = ({
  title, description, rows, loading, editBase, extraColumns = [], onDelete
}: AdminContentTableProps) => {
  const [search, setSearch] = React.useState("");

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase();
    return (r.title ?? r.name ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#e0e0e0] tracking-wide">{title}</h1>
          <p className="text-[#a0a0a0] mt-1 font-mono text-sm">{description}</p>
        </div>
        <Link href={`${editBase}/new`}>
          <a className="inline-flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-black font-serif font-bold uppercase tracking-wider text-sm rounded hover:bg-[#f3e5ab] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
            <Plus className="w-4 h-4" />
            New Entry
          </a>
        </Link>
      </div>

      <div className="bg-[#0a0a0c] border border-[#222] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#222]">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full bg-[#111] border border-[#333] rounded px-10 py-2 text-sm text-[#e0e0e0] placeholder-[#666] focus:outline-none focus:border-[#d4af37] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#111] text-[#888] font-serif uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Name / Title</th>
                <th className="px-6 py-4 font-medium">Status</th>
                {extraColumns.map((col) => (
                  <th key={col.key} className="px-6 py-4 font-medium">{col.label}</th>
                ))}
                <th className="px-6 py-4 font-medium">Last Updated</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {loading ? (
                <tr><td colSpan={4 + extraColumns.length} className="px-6 py-12 text-center text-[#555]">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4 + extraColumns.length} className="px-6 py-12 text-center text-[#555]">No entries found.</td></tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-[#151515] transition-colors group">
                    <td className="px-6 py-4 font-medium text-[#e0e0e0]">{row.title ?? row.name ?? "—"}</td>
                    <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                    {extraColumns.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-[#a0a0a0]">{row[col.key] ?? "—"}</td>
                    ))}
                    <td className="px-6 py-4 text-[#666] font-mono text-xs">
                      {format(new Date(row.updated_at), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`${editBase}/${row.id}`}>
                          <a className="p-2 text-[#a0a0a0] hover:text-[#d4af37] bg-[#1a1a1a] rounded hover:bg-[#2a2a2a] transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </a>
                        </Link>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row.id)}
                            className="p-2 text-[#a0a0a0] hover:text-red-400 bg-[#1a1a1a] rounded hover:bg-[#2a2a2a] transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
