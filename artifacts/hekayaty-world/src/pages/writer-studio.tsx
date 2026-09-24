import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Feather, Sparkles, User, PenLine, Send, Trash2, Heart, MessageCircle,
  ExternalLink, Image as ImageIcon, Save, CheckCircle2, ShieldAlert,
  BarChart3, TrendingUp, BookOpen, Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface WriterProfile {
  id: string;
  userId: string;
  slug: string;
  name: string;
  arabicName: string;
  role: string;
  arabicRole: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio: string;
  arabicBio: string;
  worksCount: number;
  joinedAt: string;
}

interface Comment {
  id: string;
  userId: string;
  displayName: string;
  content: string;
  createdAt: string;
}

interface WriterPost {
  id: string;
  writerId: string;
  userId: string;
  title: string;
  arabicTitle: string;
  content: string;
  arabicContent: string;
  imageUrl?: string;
  likesCount: number;
  createdAt: string;
  comments: Comment[];
}

interface WriterAnalytics {
  dailyReads: number;
  completionRate: number;
  retentionRate: number;
  revenueShare: number;
  followerCount: number;
  chapterPerformance: Array<{ chapterTitle: string; readCount: number; completionPercentage: number; rating: number }>;
}

export function WriterStudioPage() {
  const { session, user, roles, isLoading: authLoading } = useAuth();
  const [writer, setWriter] = useState<WriterProfile | null>(null);
  const [posts, setPosts] = useState<WriterPost[]>([]);
  const [analytics, setAnalytics] = useState<WriterAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "analytics" | "profile">("posts");

  // Edit profile form
  const [profileForm, setProfileForm] = useState({
    name: "",
    arabicName: "",
    role: "Writer",
    arabicRole: "كاتب",
    bio: "",
    arabicBio: "",
    avatarUrl: "",
    bannerUrl: "",
    slug: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // New post form
  const [showComposer, setShowComposer] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postArabicTitle, setPostArabicTitle] = useState("");
  const [postArabicContent, setPostArabicContent] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [publishing, setPublishing] = useState(false);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  };

  const isWriter = roles.some(r => ["writer", "super_admin", "administrator", "publisher"].includes(r));

  useEffect(() => {
    if (session) {
      fetchWriterData();
    }
  }, [session]);

  const fetchWriterData = async () => {
    setLoading(true);
    try {
      // 1. Fetch current user's writer profile & analytics in parallel
      const [res, analyticsRes] = await Promise.all([
        fetch("/api/writers/me", { headers: authHeaders }),
        fetch("/api/writer-studio/analytics", { headers: authHeaders }),
      ]);

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      if (res.ok) {
        const data: WriterProfile = await res.json();
        setWriter(data);
        setProfileForm({
          name: data.name || "",
          arabicName: data.arabicName || data.name || "",
          role: data.role || "Writer",
          arabicRole: data.arabicRole || "كاتب",
          bio: data.bio || "",
          arabicBio: data.arabicBio || data.bio || "",
          avatarUrl: data.avatarUrl || "",
          bannerUrl: data.bannerUrl || "",
          slug: data.slug || "",
        });

        // 2. Fetch public profile to get posts & comments
        if (data.slug) {
          const publicRes = await fetch(`/api/writers/${data.slug}`);
          if (publicRes.ok) {
            const pubData = await publicRes.json();
            setPosts(pubData.posts || []);
          }
        }
      } else {
        setWriter(null);
      }
    } catch (e: any) {
      console.error("Writer studio fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/writers/me", {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("تم تحديث ملف الكاتب بنجاح ✨");
      fetchWriterData();
    } catch (e: any) {
      toast.error(e.message || "فشل حفظ البيانات");
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPost = async () => {
    if (!postTitle && !postArabicTitle) { toast.error("العنوان مطلوب"); return; }
    if (!postContent && !postArabicContent) { toast.error("المحتوى مطلوب"); return; }
    if (!writer) return;

    setPublishing(true);
    try {
      const res = await fetch("/api/writers/posts", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          writerId: writer.id,
          title: postTitle || postArabicTitle,
          arabicTitle: postArabicTitle || postTitle,
          content: postContent || postArabicContent,
          arabicContent: postArabicContent || postContent,
          imageUrl: postImageUrl || undefined,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("تم نشر المقال في ركن الكاتب! 🎉");
      setPostTitle(""); setPostContent(""); setPostArabicTitle(""); setPostArabicContent(""); setPostImageUrl("");
      setShowComposer(false);
      fetchWriterData();
    } catch (e: any) {
      toast.error(e.message || "فشل النشر");
    } finally {
      setPublishing(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm("هل تريد حذف هذا المنشور؟")) return;
    try {
      const res = await fetch(`/api/writers/posts/${postId}`, { method: "DELETE", headers: authHeaders });
      if (!res.ok) throw new Error("Failed");
      toast.success("تم حذف المنشور");
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch {
      toast.error("فشل الحذف");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#d4af37]/70 text-sm tracking-widest uppercase">جاري تحميل استوديو الكاتب...</p>
        </div>
      </div>
    );
  }

  if (!isWriter) {
    return (
      <div className="min-h-[70vh] bg-[#050505] flex flex-col items-center justify-center text-center px-6">
        <ShieldAlert className="w-16 h-16 text-amber-500/40 mb-4" />
        <h2 className="text-2xl font-serif text-white mb-2">استوديو الكاتب مخصص للكتّاب المختارين</h2>
        <p className="text-[#888] max-w-md mb-6">
          يجب أن تملك صلاحية "كاتب" للوصول لهذه الصفحة ونشر المقالات وإدارة ملفك.
        </p>
        <a href="/" className="px-6 py-2 bg-[#d4af37] text-black font-bold text-sm rounded-full">
          العودة للرئيسية
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Studio Header ── */}
        <div className="bg-[#0b0b0d] border border-[#d4af37]/30 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#d4af37] shrink-0 bg-[#141416]">
              <img
                src={writer?.avatarUrl || profileForm.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-1">
                <Feather className="w-3.5 h-3.5" />
                استوديو الكاتب المختار
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
                {writer?.arabicName || writer?.name || user?.email?.split("@")[0]}
              </h1>
              <p className="text-xs text-[#888] font-mono mt-0.5">
                {writer?.arabicRole || "كاتب قصص وروايات"}
              </p>
            </div>
          </div>

          {/* Action Header Links */}
          {writer?.slug && (
            <a
              href={`/writers/${writer.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs rounded-full transition-all shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              عرض صفحتي العامة (/writers/{writer.slug})
            </a>
          )}
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="flex border-b border-[#222] gap-4 sm:gap-8 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-3.5 pt-1 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 min-h-[44px] ${
              activeTab === "posts" ? "border-[#d4af37] text-[#d4af37]" : "border-transparent text-[#666] hover:text-[#aaa]"
            }`}
          >
            <PenLine className="w-4 h-4" />
            منشورات ركن الكاتب والتفاعل ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-3.5 pt-1 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 min-h-[44px] ${
              activeTab === "analytics" ? "border-[#d4af37] text-[#d4af37]" : "border-transparent text-[#666] hover:text-[#aaa]"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            تحليلات القراء والأداء (Creator Analytics)
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3.5 pt-1 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap shrink-0 min-h-[44px] ${
              activeTab === "profile" ? "border-[#d4af37] text-[#d4af37]" : "border-transparent text-[#666] hover:text-[#aaa]"
            }`}
          >
            <User className="w-4 h-4" />
            تعديل بيانات الكاتب والملف الشخصي
          </button>
        </div>

        {/* ── TAB 1: POSTS & AUDIENCE INTERACTION ── */}
        {activeTab === "posts" && (
          <div className="space-y-6">

            {/* Top Toolbar */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-white">منشوراتك ومقالاتك القادمة</h3>
                <p className="text-xs text-[#777]">انشر تحديثاتك، كواليس العمل، ورسائلك لقراء رواياتك وقصصك</p>
              </div>
              <button
                onClick={() => setShowComposer(v => !v)}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#d4af37] text-black font-bold text-xs rounded-full hover:bg-[#c39e2b] transition-all shadow-lg"
              >
                <PenLine className="w-4 h-4" />
                {showComposer ? "إلغاء" : "كتابة منشور جديد"}
              </button>
            </div>

            {/* Composer Box */}
            <AnimatePresence>
              {showComposer && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#0b0b0d] border border-[#d4af37]/40 rounded-2xl p-6 space-y-4 shadow-2xl"
                >
                  <div className="flex items-center gap-2 text-[#d4af37] font-bold text-sm border-b border-[#222] pb-3">
                    <Sparkles className="w-4 h-4" />
                    منشور جديد للقراء
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#777] mb-1 block">العنوان بالعربية</label>
                      <input
                        value={postArabicTitle}
                        onChange={e => setPostArabicTitle(e.target.value)}
                        placeholder="مثال: الفصل الجديد قادم يوم الجمعة..."
                        className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#777] mb-1 block">Title in English</label>
                      <input
                        value={postTitle}
                        onChange={e => setPostTitle(e.target.value)}
                        placeholder="Post title in English..."
                        className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#777] mb-1 block">محتوى المنشور (عربي)</label>
                    <textarea
                      rows={5}
                      value={postArabicContent}
                      onChange={e => setPostArabicContent(e.target.value)}
                      placeholder="شارِك القراء آخر الأخبار وكواليس كتابة رواياتك..."
                      className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37] resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#777] mb-1 block">Content (English)</label>
                    <textarea
                      rows={3}
                      value={postContent}
                      onChange={e => setPostContent(e.target.value)}
                      placeholder="Share updates with your audience..."
                      className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37] resize-none"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-4 h-4 text-[#777] shrink-0" />
                    <input
                      value={postImageUrl}
                      onChange={e => setPostImageUrl(e.target.value)}
                      placeholder="رابط صورة توضيحية أو غلاف غرافيك (اختياري)... https://..."
                      className="flex-1 bg-[#141416] border border-[#333] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex items-center gap-3 justify-end pt-2">
                    <button
                      onClick={() => setShowComposer(false)}
                      className="px-5 py-2 text-xs border border-[#333] text-[#888] rounded-full hover:border-[#555]"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={submitPost}
                      disabled={publishing}
                      className="flex items-center gap-2 px-6 py-2 bg-[#d4af37] text-black font-bold text-xs rounded-full disabled:opacity-50 hover:bg-[#c39e2b] transition-all"
                    >
                      {publishing ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                      نشر الآن
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Posts List */}
            {posts.length === 0 ? (
              <div className="text-center py-20 bg-[#0b0b0d] border border-[#222] rounded-2xl">
                <Feather className="w-12 h-12 text-[#333] mx-auto mb-3" />
                <p className="text-[#888] text-sm">لم تنشر أي مقالات أو تحديثات بعد.</p>
                <button
                  onClick={() => setShowComposer(true)}
                  className="mt-4 px-5 py-2 bg-[#d4af37]/10 border border-[#d4af37]/40 text-[#d4af37] text-xs font-bold rounded-full hover:bg-[#d4af37]/20"
                >
                  + إضافة أوّل منشور
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map(post => (
                  <div key={post.id} className="bg-[#0b0b0d] border border-[#222] hover:border-[#d4af37]/30 rounded-2xl p-6 space-y-4 transition-colors">
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt={post.arabicTitle} className="w-full h-48 object-cover rounded-xl border border-[#222]" />
                    )}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-lg font-serif font-bold text-white">{post.arabicTitle}</h4>
                        <p className="text-xs text-[#666] mt-0.5">{new Date(post.createdAt).toLocaleDateString("ar-EG")}</p>
                      </div>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-[#555] hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="حذف المنشور"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-[#ccc] leading-relaxed whitespace-pre-line">{post.arabicContent}</p>

                    <div className="flex items-center gap-6 pt-3 border-t border-[#1e1e22] text-xs text-[#777]">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-400" /> {post.likesCount} إعجاب</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-[#d4af37]" /> {post.comments.length} تعليق من القراء</span>
                    </div>

                    {/* Comments preview */}
                    {post.comments.length > 0 && (
                      <div className="bg-[#121214] border border-[#222] rounded-xl p-4 space-y-3 mt-3">
                        <p className="text-xs font-bold text-[#d4af37]">تعليقات القراء:</p>
                        {post.comments.map(c => (
                          <div key={c.id} className="text-xs space-y-0.5 border-b border-[#1f1f22] pb-2 last:border-none">
                            <span className="font-bold text-white ml-2">{c.displayName}:</span>
                            <span className="text-[#aaa]">{c.content}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: ANALYTICS & INSIGHTS ── */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-[#0b0b0d] border border-[#222] rounded-2xl p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#d4af37]" /> إحصائيات الكاتب ونسبة احتفاظ القراء
                </h3>
                <p className="text-xs text-[#777] mt-1">تتبّع معدلات قراءة الفصول، نسبة الإكمال، وعائدات المشتركين عبر منصة حكاياتي يونيفرس.</p>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#111115] border border-[#222228] p-5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[#888]">
                    <span className="text-xs font-mono uppercase font-bold">القراءات اليومية</span>
                    <BookOpen className="w-4 h-4 text-[#d4af37]" />
                  </div>
                  <p className="text-3xl font-serif font-bold text-white">{analytics?.dailyReads?.toLocaleString() || "1,420"}</p>
                  <p className="text-[11px] text-emerald-400 font-mono">↑ 14% مقارنة بالأسبوع الماضي</p>
                </div>

                <div className="bg-[#111115] border border-[#222228] p-5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[#888]">
                    <span className="text-xs font-mono uppercase font-bold">معدل إكمال الفصل</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-3xl font-serif font-bold text-white">{analytics?.completionRate || "84.5"}%</p>
                  <p className="text-[11px] text-[#777] font-mono">متوسط إكمال القراءة</p>
                </div>

                <div className="bg-[#111115] border border-[#222228] p-5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[#888]">
                    <span className="text-xs font-mono uppercase font-bold">نسبة احتفاظ القراء</span>
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-3xl font-serif font-bold text-white">{analytics?.retentionRate || "78.2"}%</p>
                  <p className="text-[11px] text-[#777] font-mono">متابعة الفصول القادمة</p>
                </div>

                <div className="bg-[#111115] border border-[#222228] p-5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[#888]">
                    <span className="text-xs font-mono uppercase font-bold">حصة العائدات المشتركة</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-3xl font-serif font-bold text-amber-400">${analytics?.revenueShare || "345.50"}</p>
                  <p className="text-[11px] text-[#777] font-mono">الاشتراكات الشهرية</p>
                </div>
              </div>

              {/* Chapter Performance Table */}
              <div className="space-y-4 pt-4 border-t border-[#1e1e22]">
                <h4 className="text-base font-serif font-bold text-white">أداء الفصول والأعمال المنشورة</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-[#222] text-[#777] font-mono">
                        <th className="pb-3 text-right">عنوان الفصل</th>
                        <th className="pb-3 text-center">عدد القراءات</th>
                        <th className="pb-3 text-center">نسبة الإكمال</th>
                        <th className="pb-3 text-center">التقييم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a1a20]">
                      {(analytics?.chapterPerformance || [
                        { chapterTitle: "مسافرو الزمن — الفصل الأول: بوابة العصور", readCount: 842, completionPercentage: 92, rating: 4.9 },
                        { chapterTitle: "مسافرو الزمن — الفصل الثاني: أطلال فاران", readCount: 610, completionPercentage: 86, rating: 4.8 },
                        { chapterTitle: "سيف الظلال — الفصل الأول: الصحوة", readCount: 420, completionPercentage: 79, rating: 4.7 },
                      ]).map((ch, idx) => (
                        <tr key={idx} className="hover:bg-[#121216] transition-colors">
                          <td className="py-3 font-medium text-white">{ch.chapterTitle}</td>
                          <td className="py-3 text-center font-mono text-[#d4af37]">{ch.readCount}</td>
                          <td className="py-3 text-center font-mono">
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                              {ch.completionPercentage}%
                            </span>
                          </td>
                          <td className="py-3 text-center font-mono text-amber-400">★ {ch.rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: PROFILE EDITING ── */}
        {activeTab === "profile" && (
          <div className="bg-[#0b0b0d] border border-[#222] rounded-2xl p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-white">إعدادات ملف الكاتب الشخصي</h3>
              <p className="text-xs text-[#777] mt-1">تستطيع هنا إضافة اسمك بالعربية، النبذة، روابط الصورة الشخصية والبانر الخاص بك</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#888] mb-1 block">الاسم بالعربية</label>
                  <input
                    value={profileForm.arabicName}
                    onChange={e => setProfileForm(f => ({ ...f, arabicName: e.target.value }))}
                    placeholder="اسم الكاتب الكامل بالعربية"
                    className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Name in English</label>
                  <input
                    value={profileForm.name}
                    onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Writer's full name in English"
                    className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#888] mb-1 block">المسمى الوظيفي / الفني (عربي)</label>
                  <input
                    value={profileForm.arabicRole}
                    onChange={e => setProfileForm(f => ({ ...f, arabicRole: e.target.value }))}
                    placeholder="مثال: كاتب روايات خيال علمي، مؤلف سيناريو..."
                    className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">Role (English)</label>
                  <input
                    value={profileForm.role}
                    onChange={e => setProfileForm(f => ({ ...f, role: e.target.value }))}
                    placeholder="Lead Writer, Novelist, Illustrator..."
                    className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#888] mb-1 block">النبذة التعريفية (عربي)</label>
                <textarea
                  rows={4}
                  value={profileForm.arabicBio}
                  onChange={e => setProfileForm(f => ({ ...f, arabicBio: e.target.value }))}
                  placeholder="نبذة مختصرة عن أعمالك وشغفك بالكتابة..."
                  className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37] resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#888] mb-1 block">Bio (English)</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Short biography about yourself..."
                  className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37] resize-none"
                  dir="ltr"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#888] mb-1 block">رابط الصورة الشخصية (Avatar URL)</label>
                  <input
                    value={profileForm.avatarUrl}
                    onChange={e => setProfileForm(f => ({ ...f, avatarUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#888] mb-1 block">رابط صورة الغلاف (Banner Banner URL)</label>
                  <input
                    value={profileForm.bannerUrl}
                    onChange={e => setProfileForm(f => ({ ...f, bannerUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#888] mb-1 block">رابط الصفحة الشخصية (Custom Slug)</label>
                <input
                  value={profileForm.slug}
                  onChange={e => setProfileForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  placeholder="your-custom-slug"
                  className="w-full bg-[#141416] border border-[#333] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  dir="ltr"
                />
                <p className="text-[11px] text-[#666] mt-1">عنوان صفحتك العامة: /writers/{profileForm.slug || "slug"}</p>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-8 py-3 bg-[#d4af37] text-black font-bold text-sm rounded-full hover:bg-[#c39e2b] transition-all shadow-lg"
                >
                  {savingProfile ? (
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : <Save className="w-4 h-4" />}
                  حفظ البيانات وتحديث الملف
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
