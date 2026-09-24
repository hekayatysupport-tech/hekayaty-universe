import { API_BASE_URL } from '@/lib/api';
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import {
  Users,
  Swords,
  BookOpen,
  Clock,
  Globe,
  Library,
  Newspaper,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Eye,
  ShieldCheck,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface DashboardStats {
  totalCharacters: number;
  publishedCharacters: number;
  totalComics: number;
  publishedComics: number;
  totalWorlds: number;
  totalEncyclopedia: number;
  totalNews: number;
  totalUsers: number;
  pendingReviewsCount: number;
}

interface PendingItem {
  id: string;
  title: string;
  type: "character" | "comic" | "world" | "news" | "encyclopedia";
  status: string;
  updatedAt: string;
}

interface AuditActivity {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  timestamp: string;
  user: string;
}

interface ChartPoint {
  month: string;
  published: number;
  drafts: number;
  users: number;
}

export const AdminDashboard = () => {
  const { session, isPublisher, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalCharacters: 0,
    publishedCharacters: 0,
    totalComics: 0,
    publishedComics: 0,
    totalWorlds: 0,
    totalEncyclopedia: 0,
    totalNews: 0,
    totalUsers: 0,
    pendingReviewsCount: 0,
  });
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditActivity[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch dashboard data");

      const data = await res.json();
      setStats(data.stats);
      setChartData(data.chartData);
      setPendingItems(data.pendingItems || []);
      setRecentActivity(data.recentActivity || []);
      if (isManual) toast.success("Dashboard metrics updated!");
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      toast.error("Could not load dashboard metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const handleQuickPublish = async (item: PendingItem, newStatus: string) => {
    if (!isPublisher) {
      toast.error("Only Publishers and Administrators can change publishing status.");
      return;
    }

    setActionInProgress(item.id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard/quick-publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          resourceType: item.type,
          resourceId: item.id,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update status");
      }

      toast.success(`${item.title} status changed to ${newStatus.toUpperCase()}!`);
      // Refresh dashboard state
      await fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish item");
    } finally {
      setActionInProgress(null);
    }
  };

  const statCards = [
    {
      name: "Characters Roster",
      value: stats.totalCharacters,
      sub: `${stats.publishedCharacters} published, ${stats.totalCharacters - stats.publishedCharacters} drafts`,
      icon: Swords,
      href: "/admin/characters",
      color: "from-amber-500/20 to-transparent",
      accent: "#d4af37",
    },
    {
      name: "Comics & Series",
      value: stats.totalComics,
      sub: `${stats.publishedComics} published series`,
      icon: BookOpen,
      href: "/admin/comics",
      color: "from-blue-500/20 to-transparent",
      accent: "#60a5fa",
    },
    {
      name: "Worlds & Atlas",
      value: stats.totalWorlds,
      sub: `${stats.totalEncyclopedia} lore entries`,
      icon: Globe,
      href: "/admin/worlds",
      color: "from-emerald-500/20 to-transparent",
      accent: "#34d399",
    },
    {
      name: "Registered Explorers",
      value: stats.totalUsers,
      sub: `${stats.totalNews} news dispatches`,
      icon: Users,
      href: "/admin/users",
      color: "from-purple-500/20 to-transparent",
      accent: "#a855f7",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#222222] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif font-bold text-[#f0f0f0] tracking-wide">
              Universe Command Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              LIVE SYSTEM
            </span>
          </div>
          <p className="text-[#a0a0a0] mt-1 text-sm font-sans">
            Logged in as <span className="text-[#d4af37] font-semibold">{user?.email}</span>. Manage publications, reviews, and universe data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#141416] border border-[#333333] hover:border-[#d4af37] text-sm text-[#e0e0e0] rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#d4af37]" : ""}`} />
            Refresh
          </button>

          <Link href="/admin/characters/new">
            <a className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-[#050505] text-sm font-bold uppercase tracking-wider rounded-lg transition-colors shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <PlusCircle className="w-4 h-4" />
              New Entity
            </a>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              key={card.name}
            >
              <Link href={card.href}>
                <a className="block h-full bg-[#0a0a0c] border border-[#222222] hover:border-[#d4af37]/60 p-6 rounded-xl relative overflow-hidden transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-30 group-hover:opacity-60 transition-opacity`} />
                  
                  <div className="flex items-center justify-between relative z-10 mb-4">
                    <div className="p-3 bg-[#16161a] border border-[#2a2a2e] rounded-lg group-hover:border-[#d4af37]/40 transition-colors">
                      <Icon className="w-6 h-6" style={{ color: card.accent }} />
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#666666] group-hover:text-[#d4af37] group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-[#888888]">
                      {card.name}
                    </h3>
                    <p className="text-4xl font-serif font-bold text-[#f0f0f0] mt-1">
                      {loading ? "..." : card.value}
                    </p>
                    <p className="text-xs text-[#a0a0a0] mt-2 font-mono">
                      {card.sub}
                    </p>
                  </div>
                </a>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Action Center: Quick Publish & Content Workflow Queue */}
      <div className="bg-[#0a0a0c] border border-[#26262a] rounded-xl p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#d4af37]/10 rounded-lg text-[#d4af37]">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#f0f0f0]">
                Publishing & Approval Queue
              </h2>
              <p className="text-xs text-[#888888]">
                Directly approve or publish items to the live website without navigating away.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#1a1a1e] border border-[#333333] text-xs font-mono rounded-full text-[#d4af37]">
            {pendingItems.length} Drafts & In-Review
          </span>
        </div>

        {pendingItems.length === 0 ? (
          <div className="text-center py-10 text-[#666666] font-mono text-sm">
            <CheckCircle2 className="w-8 h-8 text-green-500/60 mx-auto mb-2" />
            All content is up to date and published! No pending items in the queue.
          </div>
        ) : (
          <div className="divide-y divide-[#1e1e22] overflow-x-auto">
            {pendingItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-wider ${
                    item.type === "character" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    item.type === "comic" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                    item.type === "world" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    item.type === "news" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                    "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                  }`}>
                    {item.type}
                  </span>
                  <div className="truncate">
                    <p className="text-sm font-medium text-[#e0e0e0] truncate">{item.title}</p>
                    <p className="text-xs text-[#777777] font-mono">
                      Status: <span className="text-[#d4af37]">{item.status}</span> • Updated {item.updatedAt ? formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true }) : "recently"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== "published" && (
                    <button
                      onClick={() => handleQuickPublish(item, "published")}
                      disabled={actionInProgress === item.id || !isPublisher}
                      className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/40 text-green-400 text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-40"
                    >
                      {actionInProgress === item.id ? "Publishing..." : "Publish Live"}
                    </button>
                  )}

                  {item.status === "draft" && (
                    <button
                      onClick={() => handleQuickPublish(item, "in_review")}
                      disabled={actionInProgress === item.id}
                      className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider rounded transition-colors disabled:opacity-40"
                    >
                      Submit Review
                    </button>
                  )}

                  <Link href={`/admin/${item.type === "character" ? "characters" : item.type === "comic" ? "comics" : item.type === "world" ? "worlds" : item.type === "news" ? "news" : "encyclopedia"}/${item.id}`}>
                    <a className="p-1.5 bg-[#1a1a1e] hover:bg-[#25252b] text-[#a0a0a0] hover:text-[#d4af37] rounded transition-colors">
                      <Eye className="w-4 h-4" />
                    </a>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Middle Section: Chart & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth & Publishing Metrics Chart */}
        <div className="lg:col-span-2 bg-[#0a0a0c] border border-[#222222] p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#e0e0e0]">
                Publishing & Audience Growth
              </h2>
              <p className="text-xs text-[#888888] font-mono mt-0.5">
                Monthly distribution of published universe content and explorer registrations.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#d4af37]">
                <span className="w-2.5 h-2.5 bg-[#d4af37] rounded-full inline-block" /> Published
              </span>
              <span className="flex items-center gap-1.5 text-[#60a5fa]">
                <span className="w-2.5 h-2.5 bg-[#60a5fa] rounded-full inline-block" /> Explorers
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-[#666666] font-mono text-sm">
                Loading telemetry...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPublished" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                  <XAxis dataKey="month" stroke="#666666" fontSize={12} tickLine={false} />
                  <YAxis stroke="#666666" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0e0e11",
                      borderColor: "#2e2e34",
                      borderRadius: "8px",
                      color: "#f0f0f0",
                      fontSize: "12px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="published"
                    stroke="#d4af37"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPublished)"
                    name="Published Items"
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                    name="Active Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Real Audit Activity Feed */}
        <div className="bg-[#0a0a0c] border border-[#222222] p-6 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#222222]">
            <h2 className="text-xl font-serif font-bold text-[#e0e0e0]">
              Audit Log Activity
            </h2>
            <span className="text-xs font-mono text-[#888888]">Live Stream</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-80 space-y-4 pr-1 custom-scrollbar">
            {recentActivity.length === 0 ? (
              <div className="text-center py-12 text-[#666666] font-mono text-sm">
                No recent actions recorded.
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-3 bg-[#111114] border border-[#202024] rounded-lg hover:border-[#333338] transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#d4af37] truncate">{activity.user}</span>
                    <span className="text-[#666666] font-mono shrink-0">
                      {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : "just now"}
                    </span>
                  </div>
                  <div className="text-xs text-[#c0c0c0] flex items-center gap-1.5">
                    <span className="font-mono uppercase font-bold text-[10px] px-1.5 py-0.5 bg-[#1a1a20] rounded text-[#888888]">
                      {activity.action}
                    </span>
                    <span className="capitalize text-[#e0e0e0]">
                      {activity.resourceType}
                    </span>
                    {activity.details?.name && (
                      <span className="text-[#d4af37] truncate">"{activity.details.name}"</span>
                    )}
                    {activity.details?.new_status && (
                      <span className="text-green-400 font-mono">→ {activity.details.new_status}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
        {[
          { name: "Characters", count: stats.totalCharacters, href: "/admin/characters", icon: Swords, color: "hover:border-amber-500/50" },
          { name: "Comics", count: stats.totalComics, href: "/admin/comics", icon: BookOpen, color: "hover:border-blue-500/50" },
          { name: "Worlds", count: stats.totalWorlds, href: "/admin/worlds", icon: Globe, color: "hover:border-emerald-500/50" },
          { name: "Encyclopedia", count: stats.totalEncyclopedia, href: "/admin/encyclopedia", icon: Library, color: "hover:border-purple-500/50" },
          { name: "Calendar", count: "Scheduler", href: "/admin/calendar", icon: Clock, color: "hover:border-amber-500/50" },
          { name: "News", count: stats.totalNews, href: "/admin/news", icon: Newspaper, color: "hover:border-rose-500/50" },
          { name: "User Roles", count: stats.totalUsers, href: "/admin/users", icon: Users, color: "hover:border-[#d4af37]/50" },
        ].map((sec) => {
          const Icon = sec.icon;
          return (
            <Link key={sec.name} href={sec.href}>
              <a className={`p-4 bg-[#0a0a0c] border border-[#222222] rounded-xl text-center flex flex-col items-center justify-center gap-2 group transition-all duration-300 ${sec.color} hover:-translate-y-0.5`}>
                <Icon className="w-5 h-5 text-[#888888] group-hover:text-[#d4af37] transition-colors" />
                <span className="text-xs font-serif font-bold text-[#e0e0e0]">{sec.name}</span>
                <span className="text-[10px] font-mono text-[#666666]">{sec.count}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
