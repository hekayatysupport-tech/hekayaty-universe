import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { NavbarUniverse } from "@/components/layout/NavbarUniverse";
import { SearchOverlay } from "@/components/layout/search-overlay";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Image as ImageIcon,
  Library,
  Swords,
  Globe,
  Newspaper,
  Calendar,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Search,
  Bell,
  ExternalLink,
  Shield,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  const { user, roles, isPublisher } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Hekayaty Originals 👑", href: "/admin/comics?filter=original", icon: Shield },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: Users },
    { name: "Release Calendar", href: "/admin/calendar", icon: Calendar },
    { name: "Characters", href: "/admin/characters", icon: Swords },
    { name: "Comics & Novels", href: "/admin/comics", icon: BookOpen },
    { name: "Worlds & Atlas", href: "/admin/worlds", icon: Globe },
    { name: "Encyclopedia", href: "/admin/encyclopedia", icon: Library },
    { name: "Timeline & Eras", href: "/admin/timeline", icon: History },
    { name: "News Dispatches", href: "/admin/news", icon: Newspaper },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon },
  ];

  // Super admin & administrator only tools
  if (roles.some((r) => ["super_admin", "administrator"].includes(r))) {
    navigation.push(
      { name: "User Roles", href: "/admin/users", icon: Users },
      { name: "Audit Logs", href: "/admin/audit", icon: History }
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Compute breadcrumb path
  const pathParts = location.split("/").filter(Boolean);
  const currentSection = pathParts[1] ? pathParts[1].toUpperCase() : "DASHBOARD";

  return (
    <div className="min-h-screen bg-[#050507] text-[#e0e0e0] flex flex-col font-sans selection:bg-[#d4af37]/30">
      {/* Top Main Public Site Navbar */}
      <NavbarUniverse />
      <SearchOverlay />

      <div className="flex-1 flex pt-[76px] min-h-screen">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ width: 260 }}
          animate={{ width: isSidebarOpen ? 260 : 76 }}
          className="hidden md:flex flex-col bg-[#0a0a0d] border-r border-[#1f1f24] shadow-[4px_0_24px_rgba(0,0,0,0.6)] shrink-0 z-30 sticky top-[76px] h-[calc(100vh-76px)]"
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-[#1f1f24]">
            <AnimatePresence mode="popLayout">
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] font-serif font-bold text-base shadow-[0_0_12px_rgba(212,175,55,0.2)]">
                    ح
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-[#d4af37] tracking-wider text-sm leading-none">HEKAYATY</span>
                    <span className="text-[10px] font-mono tracking-widest text-[#777777] uppercase mt-0.5">UNIVERSE CMS</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-[#16161c] transition-colors text-[#888888] hover:text-[#d4af37]"
            >
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Navigation list */}
          <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1.5 px-3 custom-scrollbar">
            {navigation.map((item) => {
              const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/admin");
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? "bg-[#181820] text-[#d4af37] border border-[#d4af37]/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                      : "text-[#8a8a92] hover:bg-[#131318] hover:text-[#e0e0e0] border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? "text-[#d4af37]" : "group-hover:text-[#e0e0e0]"}`} />
                  {isSidebarOpen && (
                    <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Card */}
          <div className="p-3 border-t border-[#1f1f24] bg-[#0c0c10]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#14141a]">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-xs font-bold text-[#d4af37] shrink-0">
                  {user?.email?.charAt(0).toUpperCase() || "A"}
                </div>
                {isSidebarOpen && (
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[#f0f0f0] truncate">{user?.email}</p>
                    <p className="text-[10px] font-mono text-[#d4af37] uppercase capitalize">
                      {roles[0] || "Admin"}
                    </p>
                  </div>
                )}
              </div>

              {isSidebarOpen && (
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-[#888888] hover:text-red-400 hover:bg-[#202028] rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Admin Sub-Header Bar */}
          <header className="h-16 border-b border-[#1f1f24] bg-[#0a0a0d]/90 backdrop-blur-md sticky top-[76px] z-20 px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-[#181820] text-[#888888]"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <Link href="/admin" className="text-[#888888] hover:text-[#d4af37] transition-colors">
                  ADMIN
                </Link>
                <span className="text-[#444444]">/</span>
                <span className="text-[#d4af37] font-bold">{currentSection}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Public Site Link */}
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#121216] border border-[#26262e] hover:border-[#d4af37]/40 text-xs font-semibold text-[#a0a0a0] hover:text-[#f0f0f0] rounded-lg transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Public Site
              </a>

              {/* Notifications Trigger */}
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-[#181820] text-[#888888] hover:text-[#f0f0f0] transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" />
              </button>
            </div>
          </header>

          {/* Notifications Drawer */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-6 top-34 z-40 w-80 bg-[#0e0e12] border border-[#2a2a30] rounded-xl shadow-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#1f1f24]">
                  <span className="text-xs font-serif font-bold text-[#e0e0e0]">System Notifications</span>
                  <button onClick={() => setNotificationsOpen(false)} className="text-[#666666] hover:text-[#e0e0e0]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#141418] rounded-lg border border-[#222228]">
                    <p className="font-semibold text-[#d4af37]">Cloudinary Connected</p>
                    <p className="text-[#888888] mt-0.5">Media assets uploading directly to Cloudinary CDN.</p>
                  </div>
                  <div className="p-2.5 bg-[#141418] rounded-lg border border-[#222228]">
                    <p className="font-semibold text-green-400">Database Sync Active</p>
                    <p className="text-[#888888] mt-0.5">All tables synchronized with Supabase PostgreSQL.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page Content Viewport */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto overflow-x-auto safe-pb">
            {children}
          </main>
        </div>

        {/* Mobile Drawer Navigation */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                className="relative w-72 bg-[#0a0a0d] border-r border-[#222228] p-4 flex flex-col h-full z-10 safe-pt safe-pb"
              >
                <div className="flex items-center justify-between pb-4 border-b border-[#222228] mb-4 pt-2">
                  <span className="font-serif font-bold text-[#d4af37]">HEKAYATY UNIVERSE CMS</span>
                  <button onClick={() => setMobileSidebarOpen(false)} className="p-2.5 min-w-[44px] min-h-[44px] text-[#888888] flex items-center justify-center">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-3 min-h-[48px] rounded-xl text-sm font-semibold transition-all ${
                          isActive ? "bg-[#181820] text-[#d4af37] border border-[#d4af37]/30" : "text-[#888888] hover:text-[#e0e0e0]"
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5 shrink-0" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
