import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  CheckCircle,
  BookOpen,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Sparkles,
  Send,
  Plus,
  Trash2,
  Calendar,
  HelpCircle,
  Feather,
  Lock,
  ArrowLeft,
  X,
  UserPlus,
  UserCheck,
  Flame,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

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
  category?: 'update' | 'behind_the_scenes' | 'excerpt' | 'announcement';
  comments: Comment[];
}

interface WriterQuestion {
  id: string;
  question: string;
  askerName: string;
  answer?: string | null;
  answeredAt?: string | null;
  createdAt: string;
}

interface WriterWork {
  id: string;
  title: string;
  arabicTitle: string;
  slug: string;
  category: string;
  genre: string;
  description: string;
  coverUrl: string;
  chaptersCount: number;
  status: string;
}

interface WriterProfile {
  id: string;
  userId?: string;
  slug: string;
  name: string;
  arabicName: string;
  role: string;
  arabicRole: string;
  avatarUrl: string;
  bannerUrl?: string;
  bio: string;
  arabicBio: string;
  tagline?: string;
  worksCount: number;
  followersCount: number;
  totalReads: string;
  joinedAt: string;
  posts: WriterPost[];
  works: WriterWork[];
  questions: WriterQuestion[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  return `منذ ${d} يوم`;
}

export function WriterDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { user, session, roles } = useAuth();
  const [writer, setWriter] = useState<WriterProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<'home' | 'posts' | 'works' | 'bts' | 'community' | 'about'>('home');

  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Likes & Comments State
  const [posts, setPosts] = useState<WriterPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [commentingOn, setCommentingOn] = useState<string | null>(null);

  // Ask Question Modal State
  const [askModalOpen, setAskModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [askerName, setAskerName] = useState('');
  const [submittingQ, setSubmittingQ] = useState(false);

  // Writer Post Composer State
  const [showComposer, setShowComposer] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [postCategory, setPostCategory] = useState<'update' | 'behind_the_scenes' | 'excerpt' | 'announcement'>('update');
  const [submittingPost, setSubmittingPost] = useState(false);

  // Writer Answer Modal State
  const [answeringQId, setAnsweringQId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');

  const isAdmin = roles.some((r) => ['super_admin', 'administrator'].includes(r));
  const isThisWriter = writer?.userId && user?.id === writer.userId;
  const canPost = isThisWriter || isAdmin;

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token}`,
  };

  useEffect(() => {
    fetchWriter();
  }, [slug]);

  const fetchWriter = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/writers/${slug}`);
      if (!res.ok) throw new Error('Not found');
      const data: WriterProfile = await res.json();
      setWriter(data);
      setPosts(data.posts || []);
      setFollowersCount(data.followersCount || 1240);
    } catch {
      setWriter(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = () => {
    if (!writer) return;
    fetch(`/api/writers/${writer.id}/follow`, { method: 'POST' }).catch(() => {});
    setIsFollowing((prev) => {
      const next = !prev;
      setFollowersCount((c) => (next ? c + 1 : c - 1));
      if (next) {
        toast.success(`بدأت متابعة الكاتب ${writer.arabicName} 👑`);
      } else {
        toast.info(`تم إلغاء المتابعة`);
      }
      return next;
    });
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('هل تريد حذف هذا المنشور؟')) return;
    try {
      await fetch(`/api/writers/posts/${postId}`, { method: 'DELETE', headers: authHeaders });
      toast.success('تم حذف المنشور');
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      toast.error('فشل الحذف');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (likedPosts.has(postId)) return;
    setLikedPosts((prev) => new Set([...prev, postId]));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p))
    );
    try {
      await fetch(`/api/writers/posts/${postId}/like`, { method: 'POST' });
    } catch {}
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setCommentingOn(postId);
    try {
      const res = await fetch(`/api/writers/posts/${postId}/comments`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error('فشل إضافة التعليق');
      const newComment = await res.json();
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      toast.success('تمت إضافة تعليقك!');
    } catch (err: any) {
      toast.error(err.message || 'فشل نشر التعليق');
    } finally {
      setCommentingOn(null);
    }
  };

  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      toast.error('العنوان والمحتوى مطلوبان');
      return;
    }
    setSubmittingPost(true);
    try {
      const res = await fetch('/api/writers/posts', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          writerId: writer!.id,
          title: postTitle,
          arabicTitle: postTitle,
          content: postContent,
          arabicContent: postContent,
          imageUrl: postImageUrl || undefined,
          category: postCategory,
        }),
      });
      if (!res.ok) throw new Error('فشل النشر');
      toast.success('تم نشر التحديث في مجتمعك!');
      setPostTitle('');
      setPostContent('');
      setPostImageUrl('');
      setShowComposer(false);
      fetchWriter();
    } catch (err: any) {
      toast.error(err.message || 'خطأ في النشر');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setSubmittingQ(true);
    try {
      const res = await fetch(`/api/writers/${writer!.id}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          askerName: askerName || (user ? user.email?.split('@')[0] : 'قارئ حكاياتي'),
        }),
      });
      if (!res.ok) throw new Error('فشل إرسال السؤال');
      const newQ = await res.json();
      setWriter((prev) => (prev ? { ...prev, questions: [newQ, ...prev.questions] } : prev));
      toast.success('تم إرسال سؤالك للكاتب بنجاح! ✍️');
      setQuestionText('');
      setAskerName('');
      setAskModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'خطأ في إرسال السؤال');
    } finally {
      setSubmittingQ(false);
    }
  };

  const handleAnswerQuestion = async (qId: string) => {
    if (!answerText.trim()) return;
    try {
      const res = await fetch(`/api/writers/questions/${qId}/answer`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ answer: answerText, writerId: writer!.id }),
      });
      if (!res.ok) throw new Error('فشل إرسال الإجابة');
      toast.success('تم إرسال إجابة الكاتب للجمهور!');
      setWriter((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: prev.questions.map((q) =>
            q.id === qId ? { ...q, answer: answerText, answeredAt: new Date().toISOString() } : q
          ),
        };
      });
      setAnsweringQId(null);
      setAnswerText('');
    } catch (err: any) {
      toast.error(err.message || 'فشل النشر');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#FFC928]">
        <div className="flex flex-col items-center gap-3">
          <Feather className="w-10 h-10 animate-bounce" />
          <p className="font-serif text-sm">جاري فتح ركن الكاتب...</p>
        </div>
      </div>
    );
  }

  if (!writer) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#F5E9D0] flex flex-col items-center justify-center p-4 text-center" dir="rtl">
        <Feather className="w-16 h-16 text-[#D4AF37]/30 mb-4" />
        <h2 className="text-3xl font-serif font-bold text-white mb-2">الكاتب غير موجود</h2>
        <p className="text-sm text-[#888888] mb-6">قد يكون هذا الرابط غير صحيح أو تم تحديث اسم الكاتب.</p>
        <Link href="/writers" className="px-6 py-3 bg-[#D4AF37] text-black font-serif font-bold rounded-xl">
          العودة لقائمة الكتّاب
        </Link>
      </div>
    );
  }

  const btsPosts = posts.filter((p) => p.category === 'behind_the_scenes' || p.title.includes('كواليس') || p.content.includes('كواليس'));

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5E9D0] selection:bg-[#D4AF37]/30" dir="rtl">
      {/* ── 1. CINEMATIC HERO BANNER ── */}
      <div className="relative h-[340px] md:h-[420px] w-full overflow-hidden bg-[#0c0c10]">
        <img
          src={writer.bannerUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600'}
          alt={writer.name}
          className="w-full h-full object-cover brightness-90 contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-black/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#F5B800]/15 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ── 2. WRITER PROFILE HEADER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 pb-8 border-b border-[#1f1f24]">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 text-center md:text-right">
          {/* Left Avatar & Identity */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative shrink-0">
              <img
                src={writer.avatarUrl}
                alt={writer.name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-[#D4AF37] shadow-[0_0_35px_rgba(212,175,55,0.4)] bg-black"
              />
              <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-gradient-to-r from-[#F5B800] to-[#D89B18] text-black rounded-full flex items-center gap-1 shadow-lg border border-black">
                <Crown className="w-3.5 h-3.5 fill-black" />
                <span className="text-[10px] font-serif font-black uppercase tracking-wider">مختار</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
                  {writer.arabicName || writer.name}
                </h1>
                <CheckCircle className="w-6 h-6 text-[#D4AF37] fill-[#D4AF37]" />
              </div>

              <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <span className="px-3 py-1 bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#FFC928] text-xs font-serif font-bold rounded-full">
                  👑 {writer.arabicRole || writer.role}
                </span>
                <span className="text-xs text-[#888888] font-mono">عضو منذ {new Date(writer.joinedAt).getFullYear()}</span>
              </div>

              <p className="text-sm text-[#F5E9D0]/80 font-serif italic max-w-xl">
                "{writer.tagline || 'أكتب لأصنع عوالم لا تنتهي عند آخر صفحة.'}"
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Follow Button */}
            <button
              onClick={handleFollowToggle}
              className={`px-6 py-3 rounded-2xl font-serif font-bold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg ${
                isFollowing
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-gradient-to-r from-[#F5B800] via-[#FFC928] to-[#D89B18] text-black hover:scale-105 shadow-[0_0_20px_rgba(245,184,0,0.4)]'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>متابع ({followersCount})</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>متابعة الكاتب ({followersCount})</span>
                </>
              )}
            </button>

            {/* Ask Question Button */}
            <button
              onClick={() => setAskModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#14141c] hover:bg-[#20202d] border border-[#D4AF37]/50 text-[#FFC928] font-serif font-bold text-sm transition-all flex items-center gap-2 shadow-md hover:border-[#FFC928]"
            >
              <HelpCircle className="w-4 h-4" />
              <span>اسأل الكاتب ✍️</span>
            </button>

            {/* Post Creation button for Writer */}
            {canPost && (
              <button
                onClick={() => setShowComposer(!showComposer)}
                className="px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-serif font-bold text-sm transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>+ منشور جديد</span>
              </button>
            )}
          </div>
        </div>

        {/* Identity Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 p-4 bg-[#0a0a0d] border border-[#1f1f24] rounded-2xl text-center">
          <div className="space-y-1">
            <span className="text-xs text-[#888888] font-mono flex items-center justify-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" /> الأعمال المنشورة
            </span>
            <p className="text-xl font-serif font-bold text-white">{writer.worksCount || writer.works?.length || 3}</p>
          </div>
          <div className="space-y-1 border-r border-[#1a1a22]">
            <span className="text-xs text-[#888888] font-mono flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> المتابعون
            </span>
            <p className="text-xl font-serif font-bold text-white">{followersCount.toLocaleString()}</p>
          </div>
          <div className="space-y-1 border-r border-[#1a1a22]">
            <span className="text-xs text-[#888888] font-mono flex items-center justify-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#D4AF37]" /> إجمالي القراءات
            </span>
            <p className="text-xl font-serif font-bold text-white">{writer.totalReads || '48.5K'}</p>
          </div>
          <div className="space-y-1 border-r border-[#1a1a22]">
            <span className="text-xs text-[#888888] font-mono flex items-center justify-center gap-1">
              <Feather className="w-3.5 h-3.5 text-[#D4AF37]" /> التدوينات والتحديثات
            </span>
            <p className="text-xl font-serif font-bold text-white">{posts.length}</p>
          </div>
        </div>
      </div>

      {/* ── 3. STICKY PROFILE NAVIGATION TABS ── */}
      <div className="sticky top-[68px] sm:top-[76px] z-30 bg-[#050505]/95 backdrop-blur-md border-b border-[#1f1f24] my-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5">
          {[
            { id: 'home', label: 'الرئيسية 🏛️' },
            { id: 'posts', label: `المنشورات والتحديثات (${posts.length})` },
            { id: 'works', label: `الأعمال والروايات (${writer.works?.length || 3})` },
            { id: 'bts', label: `خلف الكواليس 🎬 (${btsPosts.length})` },
            { id: 'community', label: `المجتمع والأسئلة (${writer.questions?.length || 0})` },
            { id: 'about', label: 'عن الكاتب 📖' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-serif font-bold transition-all whitespace-nowrap shrink-0 flex items-center ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#F5B800] via-[#FFC928] to-[#D89B18] text-black shadow-[0_0_15px_rgba(245,184,0,0.35)]'
                  : 'bg-[#0f0f14] text-[#888888] hover:text-white hover:bg-[#181822]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. TAB CONTENTS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* POST COMPOSER MODAL (FOR WRITER / ADMIN) */}
        {showComposer && canPost && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-[#0a0a0d] border border-[#D4AF37]/50 rounded-3xl space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#1f1f24] pb-3">
              <h3 className="font-serif font-bold text-lg text-[#FFC928] flex items-center gap-2">
                <Feather className="w-5 h-5" /> كتابة منشور جديد في مجتمعك
              </h3>
              <button onClick={() => setShowComposer(false)} className="text-[#888] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="عنوان المنشور..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
              />
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#D4AF37] rounded-xl text-xs text-[#FFC928] font-bold focus:outline-none"
              >
                <option value="update">📢 تحديث جديد (Update)</option>
                <option value="behind_the_scenes">🎬 خلف الكواليس (Behind the Scenes)</option>
                <option value="excerpt">📜 اقتباس أو فكرة (Excerpt)</option>
                <option value="announcement">✨ إعلان هام (Announcement)</option>
              </select>
            </div>

            <textarea
              rows={4}
              placeholder="اكتب تفاصيل التحديث أو الفكرة هنا..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-4 bg-[#121216] border border-[#26262e] focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none leading-relaxed"
            />

            <input
              type="text"
              placeholder="رابط صورة غلاف المنشور (اختياري)..."
              value={postImageUrl}
              onChange={(e) => setPostImageUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowComposer(false)}
                className="px-4 py-2 text-xs font-bold text-[#888] hover:text-white bg-[#141418] rounded-xl"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreatePost}
                disabled={submittingPost}
                className="px-6 py-2 bg-gradient-to-r from-[#F5B800] to-[#D89B18] text-black font-serif font-bold text-xs rounded-xl hover:scale-105 transition-transform"
              >
                {submittingPost ? 'جاري النشر...' : 'نشر الآن ✨'}
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 1: HOME (OVERVIEW) */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            {/* Featured Work Highlight */}
            {writer.works && writer.works.length > 0 && (
              <div className="bg-[#0a0a0d] border border-[#D4AF37]/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
                <img
                  src={writer.works[0].coverUrl}
                  alt={writer.works[0].title}
                  className="w-48 h-64 object-cover rounded-2xl border border-[#D4AF37]/40 shadow-2xl shrink-0"
                />
                <div className="space-y-4 text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#FFC928] text-xs font-serif font-bold rounded-full">
                    <Star className="w-3.5 h-3.5 fill-[#FFC928]" /> العمل المميز للكاتب
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-white">{writer.works[0].arabicTitle}</h2>
                  <p className="text-xs text-[#999999] leading-relaxed line-clamp-3 max-w-2xl">
                    {writer.works[0].description}
                  </p>
                  <Link
                    href={`/novels/${writer.works[0].slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#FFC928] text-black font-serif font-bold text-xs rounded-xl transition-all shadow-lg"
                  >
                    <span>ابدأ القراءة الآن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Latest Community Posts & Q&A Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2 border-b border-[#1f1f24] pb-3">
                  <Feather className="w-5 h-5 text-[#D4AF37]" /> أحدث منشورات الكاتب
                </h3>
                {posts.slice(0, 3).map((post) => (
                  <div key={post.id} className="bg-[#0a0a0d] border border-[#1f1f24] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={writer.avatarUrl} alt={writer.name} className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]" />
                        <div>
                          <h4 className="font-serif font-bold text-sm text-white">{writer.arabicName}</h4>
                          <span className="text-[10px] text-[#888] font-mono">{timeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                      {post.category && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#D4AF37]/15 text-[#FFC928] border border-[#D4AF37]/30">
                          {post.category}
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-bold text-base text-white">{post.arabicTitle || post.title}</h4>
                    <p className="text-xs text-[#cccccc] leading-relaxed whitespace-pre-line">{post.arabicContent || post.content}</p>
                    {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full max-h-80 object-cover rounded-xl" />}
                  </div>
                ))}
              </div>

              {/* Sidebar Q&A Highlight */}
              <div className="space-y-6">
                <h3 className="font-serif font-bold text-xl text-white flex items-center gap-2 border-b border-[#1f1f24] pb-3">
                  <HelpCircle className="w-5 h-5 text-[#D4AF37]" /> أسئلة وإجابات الجمهور
                </h3>
                <div className="space-y-4">
                  {writer.questions.slice(0, 3).map((q) => (
                    <div key={q.id} className="bg-[#0a0a0d] border border-[#1f1f24] rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#888]">
                        <span className="font-bold text-[#D4AF37]">سؤال من: {q.askerName}</span>
                        <span>{timeAgo(q.createdAt)}</span>
                      </div>
                      <p className="text-xs font-serif font-bold text-white">"{q.question}"</p>
                      {q.answer ? (
                        <div className="p-3 bg-[#121218] border border-[#D4AF37]/30 rounded-xl space-y-1">
                          <span className="text-[10px] text-[#FFC928] font-bold block">إجابة الكاتب ✍️</span>
                          <p className="text-xs text-[#ddd]">{q.answer}</p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#777] italic block">في انتظار إجابة الكاتب...</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: POSTS & FEED */}
        {activeTab === 'posts' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-[#0a0a0d] border border-[#1f1f24] rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={writer.avatarUrl} alt={writer.name} className="w-11 h-11 rounded-full object-cover border border-[#D4AF37]" />
                    <div>
                      <h4 className="font-serif font-bold text-base text-white">{writer.arabicName}</h4>
                      <span className="text-xs text-[#888] font-mono">{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>

                  {canPost && (
                    <button onClick={() => handleDeletePost(post.id)} className="p-2 text-[#666] hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="font-serif font-bold text-xl text-white">{post.arabicTitle || post.title}</h3>
                <p className="text-sm text-[#ddd] leading-relaxed whitespace-pre-line">{post.arabicContent || post.content}</p>
                {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full max-h-96 object-cover rounded-2xl" />}

                {/* Like & Comment Bar */}
                <div className="pt-4 border-t border-[#1a1a22] flex items-center justify-between text-xs text-[#888]">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1.5 transition-colors ${
                      likedPosts.has(post.id) ? 'text-red-500 font-bold' : 'hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{post.likesCount} إعجاب</span>
                  </button>

                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                    {post.comments.length} تعليق
                  </span>
                </div>

                {/* Comments Section */}
                <div className="pt-4 border-t border-[#1a1a22] space-y-3">
                  {post.comments.map((c) => (
                    <div key={c.id} className="p-3 bg-[#121218] rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-[#888]">
                        <span className="font-bold text-[#FFC928]">{c.displayName}</span>
                        <span>{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-[#ccc]">{c.content}</p>
                    </div>
                  ))}

                  {/* Add Comment Input */}
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="اكتب تعليقاً على منشور الكاتب..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      className="flex-1 px-4 py-2 bg-[#121216] border border-[#26262e] focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={commentingOn === post.id}
                      className="px-4 py-2 bg-[#D4AF37] text-black font-serif font-bold text-xs rounded-xl hover:bg-[#FFC928]"
                    >
                      إرسال
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: WORKS & NOVELS */}
        {activeTab === 'works' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {writer.works?.map((work) => (
              <div key={work.id} className="bg-[#0a0a0d] border border-[#1f1f24] hover:border-[#D4AF37] rounded-3xl overflow-hidden shadow-xl transition-all group flex flex-col justify-between">
                <div className="h-64 relative overflow-hidden bg-[#121218]">
                  <img src={work.coverUrl} alt={work.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md border border-[#D4AF37]/50 rounded-full text-[10px] font-serif font-bold text-[#FFC928]">
                    {work.category === 'novel' ? '📖 رواية' : '📚 كوميكس'}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <h3 className="font-serif font-bold text-xl text-white group-hover:text-[#FFC928] transition-colors">{work.arabicTitle || work.title}</h3>
                  <p className="text-xs text-[#999] line-clamp-2 leading-relaxed">{work.description}</p>
                  <div className="pt-3 border-t border-[#1a1a22] flex items-center justify-between">
                    <span className="text-xs font-mono text-[#888]">{work.chaptersCount} فصلاً</span>
                    <Link href={`/novels/${work.slug}`} className="px-4 py-2 bg-[#D4AF37] text-black font-serif font-bold text-xs rounded-xl hover:bg-[#FFC928]">
                      اقرأ الآن
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: BEHIND THE SCENES */}
        {activeTab === 'bts' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {btsPosts.length === 0 ? (
              <div className="text-center py-20 bg-[#0a0a0d] border border-dashed border-[#22222e] rounded-3xl space-y-3">
                <Sparkles className="w-12 h-12 text-[#D4AF37]/30 mx-auto" />
                <h3 className="text-xl font-serif text-white font-bold">كواليس التأليف قادمة قريباً...</h3>
                <p className="text-xs text-[#888]">سيقوم الكاتب بنشر مسودات الشخصيات والمشاهد المحذوفة قريباً.</p>
              </div>
            ) : (
              btsPosts.map((post) => (
                <div key={post.id} className="bg-[#0a0a0d] border border-[#D4AF37]/40 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFC928] text-xs font-serif font-bold rounded-full">
                    🎬 خلف الكواليس
                  </div>
                  <h3 className="font-serif font-bold text-xl text-white">{post.arabicTitle || post.title}</h3>
                  <p className="text-sm text-[#ddd] leading-relaxed whitespace-pre-line">{post.arabicContent || post.content}</p>
                  {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="w-full max-h-96 object-cover rounded-2xl" />}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: COMMUNITY & Q&A */}
        {activeTab === 'community' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between border-b border-[#1f1f24] pb-4">
              <div>
                <h3 className="font-serif font-bold text-2xl text-white">أسئلة الجمهور وإجابات الكاتب</h3>
                <p className="text-xs text-[#888] mt-1">طرح قراء حكاياتي أسئلتهم حول الشخصيات والأحداث القادمة</p>
              </div>
              <button
                onClick={() => setAskModalOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-[#F5B800] to-[#D89B18] text-black font-serif font-bold text-xs rounded-xl shadow-lg"
              >
                + اطرح سؤالك الآن
              </button>
            </div>

            <div className="space-y-6">
              {writer.questions?.map((q) => (
                <div key={q.id} className="bg-[#0a0a0d] border border-[#1f1f24] rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between text-xs text-[#888]">
                    <span className="font-serif font-bold text-[#FFC928]">السائل: {q.askerName}</span>
                    <span className="font-mono">{timeAgo(q.createdAt)}</span>
                  </div>
                  <h4 className="font-serif font-bold text-lg text-white">"{q.question}"</h4>

                  {q.answer ? (
                    <div className="p-5 bg-[#12121a] border border-[#D4AF37]/40 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-[#FFC928] text-xs font-serif font-bold">
                        <Feather className="w-4 h-4" />
                        <span>إجابة الكاتب الرسمية ✍️</span>
                      </div>
                      <p className="text-sm text-[#eee] leading-relaxed">{q.answer}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-[#777] italic">في انتظار إجابة الكاتب...</span>
                      {canPost && (
                        <button
                          onClick={() => setAnsweringQId(q.id)}
                          className="px-4 py-1.5 bg-[#D4AF37] text-black text-xs font-serif font-bold rounded-lg"
                        >
                          إجابة السؤال
                        </button>
                      )}
                    </div>
                  )}

                  {/* Answering Form if Writer */}
                  {answeringQId === q.id && (
                    <div className="pt-3 space-y-3">
                      <textarea
                        rows={3}
                        placeholder="اكتب إجابتك للجمهور هنا..."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        className="w-full p-3 bg-[#14141c] border border-[#D4AF37] rounded-xl text-xs text-white"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setAnsweringQId(null)} className="px-3 py-1.5 text-xs text-[#888]">إلغاء</button>
                        <button onClick={() => handleAnswerQuestion(q.id)} className="px-4 py-1.5 bg-[#D4AF37] text-black font-bold text-xs rounded-lg">إرسال الإجابة</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: ABOUT AUTHOR */}
        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto bg-[#0a0a0d] border border-[#1f1f24] rounded-3xl p-8 md:p-12 space-y-6">
            <h3 className="font-serif font-bold text-2xl text-white border-b border-[#1f1f24] pb-4">عن الكاتب ونسيج العوالم</h3>
            <div className="space-y-4 text-sm text-[#ccc] leading-relaxed font-light">
              <p className="whitespace-pre-line">{writer.arabicBio || writer.bio}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── 5. ASK QUESTION MODAL ── */}
      <AnimatePresence>
        {askModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0c0c10] border border-[#D4AF37] rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl relative"
            >
              <button onClick={() => setAskModalOpen(false)} className="absolute top-5 left-5 text-[#888] hover:text-white">
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#D4AF37]/20 text-[#FFC928] text-xs font-serif font-bold rounded-full">
                  <HelpCircle className="w-3.5 h-3.5" /> اسأل الكاتب مباشرة
                </div>
                <h3 className="text-2xl font-serif font-bold text-white">تواصل مع الكاتب {writer.arabicName}</h3>
                <p className="text-xs text-[#888]">سيقوم الكاتب بالإجابة على سؤالك ونشره في صفحته الرسمية.</p>
              </div>

              <form onSubmit={handleAskQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#aaa] mb-1.5">اسمك أو لقبك</label>
                  <input
                    type="text"
                    placeholder="مثال: أحمد الفارس..."
                    value={askerName}
                    onChange={(e) => setAskerName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#14141c] border border-[#26262e] focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#aaa] mb-1.5">سؤالك للكاتب *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="اكتب سؤالك حول الشخصيات، الأحداث، أو الأعمال القادمة..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full p-4 bg-[#14141c] border border-[#26262e] focus:border-[#D4AF37] rounded-xl text-xs text-white focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAskModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-[#888] hover:text-white bg-[#141418] rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQ}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#F5B800] to-[#D89B18] text-black font-serif font-bold text-xs rounded-xl shadow-lg hover:scale-105 transition-transform"
                  >
                    {submittingQ ? 'جاري الإرسال...' : 'إرسال السؤال ✍️'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
