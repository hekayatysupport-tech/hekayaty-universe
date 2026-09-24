import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Crown,
  Feather,
  BookOpen,
  Users,
  Eye,
  MessageCircle,
  ArrowLeft,
  Sparkles,
  Search,
  CheckCircle,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchWriters } from '@/lib/supabase-data';

export function WritersPage() {
  const [writers, setWriters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [followedState, setFollowedState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchWriters()
      .then((data) => setWriters(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleFollow = (writerId: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    fetch(`/api/writers/${writerId}/follow`, { method: 'POST' }).catch(() => {});

    setFollowedState((prev) => {
      const isFollowing = !prev[writerId];
      if (isFollowing) {
        toast.success(`بدأت متابعة الكاتب ${name} 👑`);
      } else {
        toast.info(`إلغاء متابعة ${name}`);
      }
      return { ...prev, [writerId]: isFollowing };
    });
  };

  const genres = ['All', 'فانتازيا', 'رعب', 'أكشن ومغامرات', 'غموض وخوارق', 'كوميكس'];

  const filteredWriters = writers.filter((w) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (w.name || '').toLowerCase().includes(term) ||
      (w.arabicName || '').toLowerCase().includes(term) ||
      (w.arabicBio || '').toLowerCase().includes(term);

    const matchesGenre =
      selectedGenre === 'All' ||
      (w.arabicRole || '').includes(selectedGenre) ||
      (w.role || '').includes(selectedGenre);

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5E9D0] py-16 md:py-24 selection:bg-[#D4AF37]/30" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#D4AF37]/50 bg-black/60 text-[#FFC928] text-xs font-serif font-bold uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(212,175,55,0.25)]"
          >
            <Crown className="w-4 h-4 text-[#FFC928] fill-[#FFC928]" />
            <span>كتّاب حكاياتي المختارون — Our Chosen Writers</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-black text-white tracking-tight leading-tight"
          >
            صنّاع العوالم والأساطير
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#F5E9D0]/80 font-light max-w-2xl mx-auto leading-relaxed"
          >
            استكشف عقول نخبة كتاب حكاياتي المختارين — تصفح منشوراتهم اليومية، وكواليس تأليف الروايات، وتواصل معهم مباشرة في مجتمعهم الخاص.
          </motion.p>
        </div>

        {/* Search & Genre Filters */}
        <div className="mb-12 space-y-4">
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input
              type="text"
              placeholder="ابحث عن كاتب أو مجال التخصص..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-11 pl-4 py-3 bg-[#0f0f14] border border-[#26262e] focus:border-[#D4AF37] rounded-2xl text-sm text-[#F5E9D0] placeholder:text-[#666666] focus:outline-none shadow-lg transition-colors"
            />
          </div>

          {/* Genre Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-serif font-bold transition-all whitespace-nowrap shrink-0 flex items-center ${
                  selectedGenre === g
                    ? 'bg-gradient-to-r from-[#F5B800] via-[#FFC928] to-[#D89B18] text-black shadow-[0_0_12px_rgba(245,184,0,0.4)] scale-105'
                    : 'bg-[#0a0a0f] text-[#888888] border border-[#22222a] hover:text-white hover:border-[#D4AF37]/50'
                }`}
              >
                {g === 'All' ? 'جميع التخصصات' : g}
              </button>
            ))}
          </div>
        </div>

        {/* Writers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#0a0a0d] border border-[#1f1f24] rounded-3xl h-96 animate-pulse" />
            ))}
          </div>
        ) : filteredWriters.length === 0 ? (
          <div className="text-center py-20 bg-[#0a0a0d] border border-dashed border-[#22222e] rounded-3xl space-y-3">
            <Feather className="w-12 h-12 text-[#D4AF37]/30 mx-auto" />
            <h3 className="text-xl font-serif text-white font-bold">لم نجد كاتباً يطابق بحثك</h3>
            <p className="text-xs text-[#888888]">جرب تغيير كلمات البحث أو اختر تخصصاً آخر.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWriters.map((writer, i) => {
              const isFollowing = Boolean(followedState[writer.id]);

              return (
                <motion.div
                  key={writer.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative bg-[#0a0a0d] border border-[#1f1f24] hover:border-[#D4AF37]/60 rounded-3xl overflow-hidden shadow-xl hover:shadow-[0_15px_45px_rgba(212,175,55,0.2)] transition-all duration-500 flex flex-col justify-between"
                >
                  {/* Banner Cover */}
                  <div className="h-32 bg-[#121218] relative overflow-hidden">
                    <img
                      src={writer.bannerUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200'}
                      alt={writer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0d] via-black/40 to-transparent" />

                    {/* Chosen Writer Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md border border-[#D4AF37]/60 rounded-full flex items-center gap-1.5 shadow-lg">
                      <Crown className="w-3.5 h-3.5 text-[#FFC928] fill-[#FFC928]" />
                      <span className="text-[10px] font-serif font-bold text-[#FFC928]">كاتب مختار</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="px-6 pb-6 pt-0 flex-1 flex flex-col justify-between -mt-12 relative z-10">
                    <div>
                      {/* Avatar Header */}
                      <div className="flex items-end justify-between mb-4">
                        <div className="relative">
                          <img
                            src={writer.avatarUrl}
                            alt={writer.name}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] bg-black"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#D4AF37] border-2 border-black flex items-center justify-center text-black">
                            <CheckCircle className="w-3.5 h-3.5 fill-black text-[#D4AF37]" />
                          </div>
                        </div>

                        {/* Follow Button */}
                        <button
                          onClick={(e) => toggleFollow(writer.id, writer.arabicName || writer.name, e)}
                          className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 shadow ${
                            isFollowing
                              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                              : 'bg-[#D4AF37] hover:bg-[#FFC928] text-black shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>متابع</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>متابعة</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Name & Role */}
                      <div className="mb-3">
                        <h3 className="text-xl font-serif font-bold text-white group-hover:text-[#FFC928] transition-colors flex items-center gap-1.5">
                          {writer.arabicName || writer.name}
                        </h3>
                        <span className="text-[11px] font-mono text-[#D4AF37] uppercase font-bold tracking-wider">
                          {writer.arabicRole || writer.role || 'معماري لور وروايات'}
                        </span>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-[#999999] line-clamp-3 leading-relaxed mb-4 font-light">
                        {writer.arabicBio || writer.bio}
                      </p>
                    </div>

                    {/* Stats & Link */}
                    <div className="pt-4 border-t border-[#1a1a22] flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-[#888888] font-mono">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {writer.worksCount || 3} أعمال
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                          {(writer.followersCount || 1240).toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/writers/${writer.slug}`}
                        className="px-3.5 py-1.5 rounded-xl bg-[#14141c] hover:bg-[#20202d] border border-[#2a2a36] hover:border-[#D4AF37]/60 text-xs font-serif font-bold text-[#D4AF37] transition-all flex items-center gap-1"
                      >
                        <span>زيارة Profile</span>
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
