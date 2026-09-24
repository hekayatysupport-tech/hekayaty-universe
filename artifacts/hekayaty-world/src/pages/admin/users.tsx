import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus, X, ShieldAlert, ShieldCheck, Shield, User as UserIcon,
  Feather, ExternalLink, Trash2, PenLine
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const ROLES = ["reader", "writer", "editor", "publisher", "administrator", "super_admin"] as const;
type Role = typeof ROLES[number];

const RoleIcon = ({ role }: { role: string }) => {
  if (role === "super_admin") return <ShieldAlert className="w-4 h-4 text-red-400" />;
  if (role === "administrator") return <ShieldCheck className="w-4 h-4 text-[#d4af37]" />;
  if (role === "writer") return <Feather className="w-4 h-4 text-emerald-400" />;
  if (role === "publisher") return <Shield className="w-4 h-4 text-blue-400" />;
  return <UserIcon className="w-4 h-4 text-[#888]" />;
};

type StaffUser = {
  id: string;
  username: string;
  display_name: string;
  role: string;
  roles: Role[];
};

type WriterProfile = {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  arabic_name: string;
  role: string;
  avatar_url: string;
  joined_at: string;
};

// ── Main Component ────────────────────────────────────────────────────────────
export const AdminUsers = () => {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [writerProfiles, setWriterProfiles] = useState<WriterProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const { session } = useAuth();

  const headers = { Authorization: `Bearer ${session?.access_token}`, "Content-Type": "application/json" };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [usersRes, writersRes] = await Promise.all([
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/users/writers-list", { headers }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (writersRes.ok) setWriterProfiles(await writersRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (session) fetchUsers(); }, [session]);

  const updatePrimaryRole = async (userId: string, role: string) => {
    setAssigning(userId + role);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT", headers, body: JSON.stringify({ role })
      });
      if (res.ok) {
        toast.success(role === "writer" ? "تمت ترقية المستخدم إلى كاتب مختار ✨" : `Primary role updated to "${role}"`);
        fetchUsers();
      }
      else { const e = await res.json(); toast.error(e.error); }
    } finally { setAssigning(null); }
  };

  const assignRole = async (userId: string, role: Role) => {
    setAssigning(userId + role);
    try {
      const res = await fetch(`/api/admin/users/${userId}/roles`, {
        method: "POST", headers, body: JSON.stringify({ role })
      });
      if (res.ok) { toast.success(`Role "${role}" assigned`); fetchUsers(); }
      else { const e = await res.json(); toast.error(e.error); }
    } finally { setAssigning(null); }
  };

  const revokeRole = async (userId: string, role: Role) => {
    setAssigning(userId + role);
    try {
      const res = await fetch(`/api/admin/users/${userId}/roles/${role}`, { method: "DELETE", headers });
      if (res.ok) { toast.success(`Role "${role}" revoked`); fetchUsers(); }
      else { const e = await res.json(); toast.error(e.error); }
    } finally { setAssigning(null); }
  };

  const demoteWriter = async (userId: string) => {
    if (!confirm("هل تريد إزالة ملف الكاتب وإعادة المستخدم إلى قارئ؟")) return;
    try {
      await fetch(`/api/admin/users/${userId}/demote-writer`, { method: "DELETE", headers });
      toast.success("تمت إزالة ملف الكاتب");
      fetchUsers();
    } catch { toast.error("فشل الحذف"); }
  };

  const getWriterProfile = (userId: string) => writerProfiles.find(w => w.user_id === userId);

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-serif font-bold text-[#e0e0e0] tracking-wide">User Roles</h1>
        <p className="text-[#a0a0a0] mt-1 font-mono text-sm">
          Assign roles and promote users to Chosen Writers. Changes take effect immediately.
        </p>
      </div>

      {/* Writer Profiles Summary */}
      {writerProfiles.length > 0 && (
        <div className="bg-[#0a0a0c] border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Feather className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold text-sm">الكتّاب المختارون — Chosen Writers</span>
            <span className="text-[#555] text-xs">({writerProfiles.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {writerProfiles.map(w => (
              <a
                key={w.id}
                href={`/writers/${w.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 bg-[#111] border border-[#222] hover:border-emerald-500/40 rounded-xl p-3 transition-colors group"
              >
                <img src={w.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100"} alt={w.name} className="w-9 h-9 rounded-full object-cover border border-emerald-500/30" />
                <div className="flex-1 min-w-0">
                  <p className="text-[#e0e0e0] text-sm font-medium truncate">{w.arabic_name || w.name}</p>
                  <p className="text-[#555] text-xs font-mono">/writers/{w.slug}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#444] group-hover:text-emerald-400 transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 bg-[#0a0a0c] border border-[#222] rounded-lg p-4">
        {[
          { role: "writer", desc: "كاتب مختار — له صفحته الخاصة وجمهوره" },
          { role: "editor", desc: "Can create & edit content as Drafts" },
          { role: "publisher", desc: "Can approve & publish content" },
          { role: "administrator", desc: "Full CMS access + user management" },
          { role: "super_admin", desc: "Unrestricted access to all features" },
        ].map(({ role, desc }) => (
          <div key={role} className="flex items-center gap-2 text-sm">
            <RoleIcon role={role} />
            <span className="text-[#d4af37] font-mono capitalize">{role.replace("_", " ")}</span>
            <span className="text-[#666]">— {desc}</span>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0a0c] border border-[#222] rounded-lg overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#555]">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-[#555]">No users found.</div>
        ) : (
          <div className="divide-y divide-[#222]">
            <AnimatePresence>
              {users.map((user) => {
                const writerProfile = getWriterProfile(user.id);
                const isWriter = user.role === "writer" || user.roles.includes("writer");
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 hover:bg-[#111] transition-colors"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center font-serif text-[#d4af37] font-bold flex-shrink-0">
                        {(user.display_name || user.username || "?")?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[#e0e0e0] font-medium">{user.display_name || user.username || "Unknown"}</p>
                        <p className="text-[#666] text-xs font-mono">{user.id.slice(0, 8)}…</p>
                      </div>
                    </div>

                    {/* Current Roles */}
                    <div className="flex flex-wrap gap-2 flex-1">
                      {user.roles.length === 0 ? (
                        <span className="text-[#555] text-sm italic">No roles</span>
                      ) : (
                        user.roles.map((role) => (
                          <span key={role} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 bg-[#1a1a1a] border border-[#333] rounded-full text-xs">
                            <RoleIcon role={role} />
                            <span className="text-[#e0e0e0] capitalize">{role.replace("_", " ")}</span>
                            <button
                              onClick={() => revokeRole(user.id, role)}
                              disabled={assigning === user.id + role}
                              className="ml-1 text-[#555] hover:text-red-400 transition-colors disabled:opacity-40"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))
                      )}
                      {/* Writer profile link */}
                      {writerProfile && (
                        <a
                          href={`/writers/${writerProfile.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          صفحة الكاتب
                        </a>
                      )}
                    </div>

                    {/* Primary Role Selector */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-[#666] font-mono uppercase">Primary Role</span>
                      <select
                        value={user.role || "reader"}
                        onChange={(e) => updatePrimaryRole(user.id, e.target.value)}
                        className="bg-[#141416] border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold rounded px-3 py-1.5 focus:outline-none focus:border-[#d4af37] transition-colors cursor-pointer"
                      >
                        <option value="reader">reader (قارئ)</option>
                        <option value="writer">writer (كاتب)</option>
                        <option value="editor">editor (محرر)</option>
                        <option value="publisher">publisher (ناشر)</option>
                        <option value="administrator">administrator (مدير)</option>
                        <option value="super_admin">super_admin (مدير عام)</option>
                      </select>
                    </div>

                    {/* Add Extra Role */}
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          const val = e.target.value as Role;
                          if (val && !user.roles.includes(val)) assignRole(user.id, val);
                          e.target.value = "";
                        }}
                        defaultValue=""
                        className="bg-[#1a1a1a] border border-[#333] text-[#a0a0a0] text-xs rounded px-3 py-2 pr-8 appearance-none focus:outline-none focus:border-[#d4af37] transition-colors cursor-pointer"
                      >
                        <option value="" disabled>+ Add Role</option>
                        {ROLES.filter((r) => !user.roles.includes(r)).map((r) => (
                          <option key={r} value={r}>{r.replace("_", " ")}</option>
                        ))}
                      </select>
                      <Plus className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555] pointer-events-none" />
                    </div>

                    {/* Promote / Demote Writer Actions */}
                    {!isWriter ? (
                      <button
                        onClick={() => updatePrimaryRole(user.id, "writer")}
                        disabled={assigning === user.id + "writer"}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-full hover:bg-emerald-500/20 transition-all whitespace-nowrap disabled:opacity-50"
                      >
                        <Feather className="w-3.5 h-3.5" />
                        جعله كاتبًا مختارًا
                      </button>
                    ) : (
                      <button
                        onClick={() => demoteWriter(user.id)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-red-500/20 text-red-500/60 text-xs font-bold rounded-full hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 transition-all whitespace-nowrap"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        إزالة الكاتب
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
