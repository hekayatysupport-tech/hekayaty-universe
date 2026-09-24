import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getImageUrl } from '@/assets';
import { Link } from 'wouter';
import {
  Moon, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, BookOpen, Map, Scroll, Users,
  Zap, Sparkles, Shield, Flame, Brain, Star, Lock, Layers
} from 'lucide-react';
import { useGetComics, useGetCharacters, useGetWorlds } from '@workspace/api-client-react';
import { calculatePowerRating } from '@/utils/powerRating';
import { DiscoveryEngine } from '@/components/universe/DiscoveryEngine';
import { UniverseGraph } from '@/components/universe/UniverseGraph';
import { HekayatyOriginalsSection } from '@/components/universe/HekayatyOriginalsSection';

import { useAuth } from '@/contexts/AuthContext';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as any } }
};

function BrownSectionDivider() {
  return (
    <div className="relative w-full py-5 bg-gradient-to-r from-[#170e08] via-[#382012] to-[#170e08] border-y-2 border-[#6e4223] shadow-[0_0_25px_rgba(92,58,33,0.4)] z-30 flex items-center justify-center overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8B5A2B]/20 to-transparent blur-md pointer-events-none" />
      
      <div className="max-w-7xl w-full mx-auto px-4 flex items-center justify-center gap-3 md:gap-5 relative z-10">
        <div className="h-[2px] flex-1 max-w-md bg-gradient-to-r from-transparent via-[#8B5A2B] to-[#D4AF37]"></div>
        
        {/* Center Ornate Brown-Gold Emblem */}
        <div className="flex items-center gap-2.5 px-5 py-1.5 bg-[#24140a] border-2 border-[#8B5A2B] rounded-full shadow-xl shadow-black/80">
          <div className="w-2.5 h-2.5 rotate-45 bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></div>
          <Moon className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-serif font-black uppercase tracking-[0.2em] text-[#f5d7b5]">
            حكاياتي • HEKAYATY UNIVERSE
          </span>
          <Moon className="w-4 h-4 text-[#D4AF37]" />
          <div className="w-2.5 h-2.5 rotate-45 bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></div>
        </div>

        <div className="h-[2px] flex-1 max-w-md bg-gradient-to-l from-transparent via-[#8B5A2B] to-[#D4AF37]"></div>
      </div>
    </div>
  );
}

export function Home() {
  const { isSubscriber } = useAuth();
  const { data: comicsData } = useGetComics();
  const { data: charactersData } = useGetCharacters();
  const { data: worldsData } = useGetWorlds();

  const [novels, setNovels] = useState<any[]>([]);
  const [novelsLoading, setNovelsLoading] = useState(true);

  const novelsScrollRef = useRef<HTMLDivElement>(null);
  const comicsScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetch('/api/novels')
      .then((res) => res.json())
      .then((data) => {
        setNovels(Array.isArray(data) ? data : []);
        setNovelsLoading(false);
      })
      .catch(() => setNovelsLoading(false));
  }, []);

  const comics = Array.isArray(comicsData) ? comicsData : [];
  const characters = Array.isArray(charactersData) ? charactersData : [];
  const worlds = Array.isArray(worldsData) ? worldsData : [];

  return (
    <div className="w-full min-h-[100dvh] flex flex-col justify-between overflow-x-hidden relative">
      {/* Hero Section Container with Full Background Photo */}
      <section className="relative w-full min-h-[92vh] md:min-h-[100vh] lg:min-h-[105vh] flex flex-col items-center justify-center pt-28 pb-20 px-4 overflow-hidden z-10">
        {/* Background Image - Ultra Clear & Vibrant */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src={getImageUrl('background photo.png')} 
            alt="Fantasy Background" 
            className="w-full h-full object-cover object-top sm:object-center brightness-115 contrast-110 saturate-110 opacity-100 filter"
          />
          {/* Crystal Clear Overlay: Minimal top shadow for navbar, 100% clear middle, seamless fade at very bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent 75% to-[#050508]" />
        </div>

        <motion.div 
          className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center my-auto px-2"
          initial="hidden"
          animate="show"
          variants={staggerContainer}
        >
          {/* Subtitle Top */}
          <motion.div variants={fadeUp} className="mb-2 sm:mb-4">
            <span className="text-white text-lg sm:text-xl md:text-2xl font-serif drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
              ادخل إلى عالم الحكايات
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.div variants={fadeUp} className="mb-4 flex flex-col items-center mt-1 sm:mt-2">
            <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[7.5rem] font-serif font-bold text-gradient-gold drop-shadow-[0_6px_35px_rgba(0,0,0,0.95)] mb-2 sm:mb-4" style={{ lineHeight: '1.1' }}>
              عوالم حكاياتي
            </h1>
          </motion.div>

          {/* Description */}
          <motion.p variants={fadeUp} className="text-base sm:text-lg md:text-xl text-white max-w-2xl mx-auto mb-6 sm:mb-10 font-sans font-light drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
            قصص ملحمية. أبطال خالدون. عوالم لا تنتهي.
          </motion.p>

          {/* Ornate Button */}
          <motion.div variants={fadeUp}>
            <Link href="/comics" className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 min-h-[48px] bg-black/70 border border-[#D4AF37]/60 hover:bg-[#D4AF37]/20 transition-all duration-300 shadow-[0_0_25px_rgba(0,0,0,0.8)] backdrop-blur-md">
              {/* Corner Ornaments */}
              <div className="absolute top-[-3px] left-[-3px] w-2 h-2 border border-[#D4AF37] bg-black"></div>
              <div className="absolute top-[-3px] right-[-3px] w-2 h-2 border border-[#D4AF37] bg-black"></div>
              <div className="absolute bottom-[-3px] left-[-3px] w-2 h-2 border border-[#D4AF37] bg-black"></div>
              <div className="absolute bottom-[-3px] right-[-3px] w-2 h-2 border border-[#D4AF37] bg-black"></div>
              
              <span className="font-serif text-lg sm:text-xl text-white group-hover:text-[#FFF7D6] transition-colors">
                اكتشف القصص
              </span>
              <Moon className="w-5 h-5 text-[#D4AF37]" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Floating Info Box (Left) */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2 max-w-xs hidden lg:block z-10"
        >
          <div className="relative p-6 bg-black/60 border border-[#D4AF37]/40 backdrop-blur-md ornate-border-corners text-right shadow-2xl">
            <div className="flex justify-end mb-4">
              <Moon className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-[#D4AF37] font-serif text-xl mb-2">حكايات من كل أرجاء الشرق</h3>
            <p className="text-white/80 text-sm leading-relaxed font-light">
              ... من بغداد إلى الأندلس، ومن الشام إلى الهند...<br />
              كل حكاية لها بطل، وكل بطل له قدر.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Brown Section Divider Between Hero and Hekayaty Originals */}
      <BrownSectionDivider />

      {/* ═══════════════════════════════════════════════════ */}
      {/* HEKAYATY ORIGINALS STUDIO SHOWCASE                 */}
      {/* ═══════════════════════════════════════════════════ */}
      <HekayatyOriginalsSection />

      {/* Brown Section Divider Between Hekayaty Originals and Novels */}
      <BrownSectionDivider />

      {/* ═══════════════════════════════════════════════════ */}
      {/* SECTION 1: NOVELS (BEFORE HEROES)                */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="relative z-20 pt-12 pb-16 px-4 overflow-hidden">
        {/* Novels Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={getImageUrl('novels-bg.png')}
            alt="Novels Section Background"
            className="w-full h-full object-cover object-center opacity-100 brightness-110 contrast-105 filter"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/80" />
        </div>
        {/* Section Divider & Title */}
        <div className="relative z-10 flex items-center justify-center gap-6 mb-10 max-w-7xl mx-auto">
          <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-[#D4AF37]/80"></div>
          <div className="flex items-center gap-3 px-6 py-2.5 border border-[#D4AF37]/40 bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-xl md:text-2xl font-serif font-black text-[#FFF7D6] whitespace-nowrap tracking-widest text-glow">
              الروايات الأسطورية
            </h2>
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37]/80 text-xs font-serif tracking-[0.25em] uppercase font-bold">
              Serial Novels
            </span>
          </div>
          <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-l from-transparent via-[#D4AF37]/40 to-[#D4AF37]/80"></div>
        </div>

        {/* Carousel / Grid Container */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-12 relative flex items-center">
          {/* Nav Arrow Left */}
          <button 
            onClick={() => scrollContainer(novelsScrollRef, 'left')}
            className="absolute left-2 md:left-4 z-30 w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-black/90 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all shadow-lg"
            title="السابق"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div 
            ref={novelsScrollRef}
            className="flex gap-6 w-full overflow-x-auto hide-scrollbar snap-x py-4 px-2 scroll-smooth"
          >
            {novels.map((novel, i) => (
              <motion.div 
                key={novel.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="snap-center shrink-0 w-[290px] md:w-[320px] group cursor-pointer"
              >
                <Link href={`/novels/${novel.slug}`}>
                  <div className="relative p-2.5 bg-[#0e0d0b] border border-[#D4AF37]/40 ornate-border-corners shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-[#D4AF37]/80 flex flex-col h-full rounded-xl">
                    
                    {/* Cover Image Frame */}
                    <div className="relative aspect-[3/4] overflow-hidden border border-[#D4AF37]/30 rounded-lg bg-black">
                      <img 
                        src={novel.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'} 
                        alt={novel.arabicTitle || novel.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                      
                      {/* Badges on Cover */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                        {novel.isPremium && !isSubscriber && (
                          <span className="px-2.5 py-1 bg-amber-500 text-black font-black text-[10px] uppercase rounded-md shadow flex items-center gap-1">
                            <Lock className="w-3 h-3" /> VIP
                          </span>
                        )}
                        <span className="px-2.5 py-1 bg-black/80 text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-mono font-bold rounded-md shadow">
                          📖 {novel.totalChapters || 0} فصلاً
                        </span>
                      </div>

                      {/* Rating Badge */}
                      <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/85 border border-amber-400/50 text-amber-300 text-[10px] font-bold rounded-md shadow flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{novel.rating || '4.9'}</span>
                      </div>

                      {/* Arabic Title on Cover */}
                      <div className="absolute bottom-3 left-0 right-0 text-center px-3 z-10">
                        <h3 className="font-serif text-xl font-bold text-[#FFF7D6] drop-shadow-lg leading-snug">
                          {novel.arabicTitle || novel.title}
                        </h3>
                        {novel.arabicAuthorName && (
                          <p className="text-[11px] text-[#D4AF37]/80 font-serif mt-1">
                            بقلم: {novel.arabicAuthorName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Summary / Tagline */}
                    <div className="p-3 pt-4 flex flex-col justify-between flex-1 text-right" dir="rtl">
                      <p className="text-xs text-[#cccccc] line-clamp-2 leading-relaxed mb-3 font-sans">
                        {novel.arabicSummary || novel.arabicTagline || novel.summary || novel.tagline || 'رواية نثرية ملحمية من أبعاد عوالم حكاياتي...'}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-[#D4AF37]/15">
                        <span className="text-[11px] text-[#D4AF37] font-serif font-bold group-hover:underline flex items-center gap-1">
                          <span>اقرأ الفصل الأول</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-[9px] font-mono text-[#777777] uppercase tracking-wider">
                          SERIAL NOVEL
                        </span>
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}

            {/* Placeholder message if no novels available */}
            {novels.length === 0 && !novelsLoading && (
              <div className="w-full text-center py-8 text-[#888888] font-serif text-sm">
                لا توجد روايات متاحة حالياً.
              </div>
            )}
          </div>

          {/* Nav Arrow Right */}
          <button 
            onClick={() => scrollContainer(novelsScrollRef, 'right')}
            className="absolute right-2 md:right-4 z-30 w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-black/90 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all shadow-lg"
            title="التالي"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Button to view all novels */}
        <div className="relative z-10 text-center mt-10">
          <Link
            href="/novels"
            className="group relative inline-flex items-center gap-3 px-8 py-3 bg-black/70 border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 rounded-xl transition-all duration-300"
          >
            <span className="font-serif text-base font-bold text-[#FFF7D6] group-hover:text-[#D4AF37]">
              استعرض جميع الروايات السردية
            </span>
            <ChevronLeft className="w-4 h-4 text-[#D4AF37] group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Brown Section Divider Between Novels and Comics */}
      <BrownSectionDivider />

      {/* ═══════════════════════════════════════════════════ */}
      {/* SECTION 2: COMICS & GRAPHIC STORIES                 */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="relative z-20 pt-16 pb-20 px-4 overflow-hidden">
        {/* Comics Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={getImageUrl('comics-bg.png')}
            alt="Comics Section Background"
            className="w-full h-full object-cover object-center opacity-100 brightness-110 contrast-105 filter"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/80" />
        </div>
        {/* Section Divider & Title */}
        <div className="relative z-10 flex items-center justify-center gap-6 mb-12 max-w-7xl mx-auto">
          <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-[#D4AF37]/80"></div>
          <div className="flex items-center gap-3 px-6 py-2.5 border border-[#D4AF37]/40 bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Layers className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-xl md:text-2xl font-serif font-black text-[#FFF7D6] whitespace-nowrap tracking-widest text-glow">
              أحدث القصص والكوميكس
            </h2>
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37]/80 text-xs font-serif tracking-[0.25em] uppercase font-bold">
              Comics & Graphic Stories
            </span>
          </div>
          <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-l from-transparent via-[#D4AF37]/40 to-[#D4AF37]/80"></div>
        </div>

        {/* Carousel Container */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-12 relative flex items-center">
          {/* Nav Arrow Left */}
          <button 
            onClick={() => scrollContainer(comicsScrollRef, 'left')}
            className="absolute left-2 md:left-4 z-30 w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-black/90 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all shadow-lg"
            title="السابق"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div 
            ref={comicsScrollRef}
            className="flex gap-6 w-full overflow-x-auto hide-scrollbar snap-x py-4 px-2 scroll-smooth"
          >
            {comics.map((comic, i) => (
              <motion.div 
                key={comic.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="snap-center shrink-0 w-[260px] md:w-[280px] group cursor-pointer"
              >
                <Link href={`/comics/${comic.id}`}>
                  {/* Ornate Frame */}
                  <div className="relative p-2 bg-black/70 border border-[#D4AF37]/40 ornate-border-corners shadow-2xl transition-transform duration-500 group-hover:-translate-y-2 group-hover:border-[#D4AF37]/80 rounded-xl">
                    <div className="relative aspect-[2/3] overflow-hidden border border-[#D4AF37]/20 rounded-lg">
                      <img 
                        src={comic.coverUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'} 
                        alt={comic.arabicTitle || comic.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      
                      {/* Comic Title */}
                      <div className="absolute bottom-4 left-0 right-0 text-center px-4">
                        <h3 className="font-serif text-2xl font-bold text-[#D4AF37] drop-shadow-md">
                          {comic.arabicTitle || comic.title}
                        </h3>
                        {comic.description && (
                          <p className="text-[11px] text-white/70 line-clamp-1 mt-1 font-sans">
                            {comic.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}

            {comics.length === 0 && (
              <div className="w-full text-center py-8 text-[#888888] font-serif text-sm">
                لا توجد قصص مصورة متاحة حالياً.
              </div>
            )}
          </div>

          {/* Nav Arrow Right */}
          <button 
            onClick={() => scrollContainer(comicsScrollRef, 'right')}
            className="absolute right-2 md:right-4 z-30 w-10 h-10 rounded-full border border-[#D4AF37]/50 bg-black/90 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all shadow-lg"
            title="التالي"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Button to view all comics */}
        <div className="relative z-10 text-center mt-10">
          <Link
            href="/comics"
            className="group relative inline-flex items-center gap-3 px-8 py-3 bg-black/70 border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 rounded-xl transition-all duration-300"
          >
            <span className="font-serif text-base font-bold text-[#FFF7D6] group-hover:text-[#D4AF37]">
              تصفح مكتبة الكوميكس الكاملة
            </span>
            <ChevronLeft className="w-4 h-4 text-[#D4AF37] group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Brown Section Divider Between Comics and Champions */}
      <BrownSectionDivider />

      {/* ═══════════════════════════════════════════════════ */}
      {/* SECTION 3: FEATURED CHARACTERS (MAJESTIC HEROES)    */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="relative z-20 bg-gradient-to-b from-black via-[#080705] to-black pt-20 pb-24 px-4 overflow-hidden border-t border-[#D4AF37]/15">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[150px] pointer-events-none" />

        {/* Ornate Section Header */}
        <div className="flex items-center justify-center gap-6 mb-16 relative z-10">
          <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-[#D4AF37]/80"></div>
          <div className="flex items-center gap-3 px-6 py-2.5 border border-[#D4AF37]/40 bg-black/80 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.15)]">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-xl md:text-2xl font-serif font-black text-[#FFF7D6] whitespace-nowrap tracking-widest text-glow">
              أبطال الأساطير
            </h2>
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37]/80 text-xs font-serif tracking-[0.25em] uppercase font-bold">
              Mythic Champions
            </span>
          </div>
          <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-l from-transparent via-[#D4AF37]/40 to-[#D4AF37]/80"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* ── ALWAYS-ON 4-COLUMN MAJESTIC ROSTER GRID ── */}
          {(() => {
            // Build display list: real characters + ghost placeholders to fill up to 4 slots
            const SHOW = 4;
            const realChars = characters.slice(0, SHOW);
            const ghostCount = Math.max(0, SHOW - realChars.length);

            return (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-7">
                {/* Real character cards */}
                {realChars.map((char, i) => {
                  const rating = calculatePowerRating((char as any).stats);
                  return (
                    <motion.div
                      key={char.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: 'spring', stiffness: 120, damping: 20 }}
                      whileHover={{ y: -14, scale: 1.03, rotateY: 4 }}
                      className="cursor-pointer"
                      style={{ perspective: '800px' }}
                    >
                      <Link href={`/characters/${char.id}`}>
                        <div
                          className="relative rounded-[20px] overflow-hidden flex flex-col h-[540px] border-2 shadow-2xl transition-all duration-500 group"
                          style={{
                            background: 'linear-gradient(160deg, #1f1b14 0%, #0d0c0a 55%, #221d10 100%)',
                            borderColor: rating.tier.color,
                            boxShadow: `0 12px 40px rgba(0,0,0,0.85), 0 0 30px ${rating.tier.glowColor}`,
                          }}
                        >
                          {/* Double golden border insets */}
                          <div className="absolute inset-[3px] rounded-[16px] border border-[#D4AF37]/55 pointer-events-none z-20" />
                          <div className="absolute inset-[6px] rounded-[14px] border border-white/10 pointer-events-none z-20" />

                          {/* Holographic shimmer overlay on hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10 rounded-[20px]"
                            style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 40%, rgba(255,255,255,0.05) 60%, transparent 100%)' }} />

                          {/* ─── CARD HEADER: Rating + Badges ─── */}
                          <div className="relative z-30 flex justify-between items-start px-4 pt-4 pb-1">
                            {/* Overall Rating Badge (FIFA-style) */}
                            <div className="flex flex-col items-center bg-black/90 px-3 py-1.5 rounded-xl border border-[#D4AF37]/70 shadow-xl min-w-[52px]">
                              <span
                                className="text-3xl font-black font-mono leading-none"
                                style={{ color: rating.tier.color, textShadow: `0 0 12px ${rating.tier.glowColor}` }}
                              >
                                {rating.score}
                              </span>
                              <span
                                className="text-[10px] font-black font-mono uppercase tracking-widest px-1.5 py-0.5 rounded mt-0.5"
                                style={{ backgroundColor: `${rating.tier.color}25`, color: rating.tier.color }}
                              >
                                {rating.tier.rank}
                              </span>
                            </div>

                            {/* Alignment + Category Badges */}
                            <div className="flex flex-col items-end gap-1">
                              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                                char.alignment === 'Hero' ? 'bg-blue-950/90 text-blue-300 border-blue-600/50' :
                                char.alignment === 'Villain' ? 'bg-red-950/90 text-red-300 border-red-600/50' :
                                'bg-[#181224] text-purple-300 border-purple-600/50'
                              }`}>
                                {char.alignment}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono text-[#D4AF37]/90 bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                                {char.powerCategory || 'Unknown'}
                              </span>
                            </div>
                          </div>

                          {/* ─── PORTRAIT (fills most of card) ─── */}
                          <div className="relative z-20 mx-3 rounded-xl overflow-hidden flex-1 border-2 border-[#D4AF37]/60 shadow-2xl bg-black">
                            {char.portraitUrl ? (
                              <img
                                src={char.portraitUrl}
                                alt={char.arabicName || char.name}
                                className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700"
                                style={{ objectPosition: 'center 15%' }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1a1509] to-[#0d0b07]">
                                <Sparkles className="w-14 h-14 text-[#D4AF37]/30" />
                              </div>
                            )}
                            {/* Portrait bottom vignette */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            {/* Archetype badge on portrait */}
                            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-black/85 rounded border border-[#D4AF37]/40 text-[#D4AF37]">
                                {rating.archetype.icon} {rating.archetype.titleArabic}
                              </span>
                              <span className="text-[9px] text-white/50 font-mono bg-black/60 px-1.5 py-0.5 rounded">
                                {rating.tier.titleEnglish}
                              </span>
                            </div>
                          </div>

                          {/* ─── NAMEPLATE ─── */}
                          <div className="relative z-30 mx-3 mt-2 bg-gradient-to-r from-[#2a2212] via-[#3d3118] to-[#2a2212] border border-[#D4AF37]/80 py-2 px-3 rounded-xl text-center shadow-md">
                            <h4 className="text-lg font-serif font-black text-[#FFF7D6] leading-tight">
                              {char.arabicName || char.name}
                            </h4>
                            <p className="text-[10px] text-[#D4AF37]/80 tracking-[0.18em] uppercase font-light">
                              {char.name}
                            </p>
                          </div>

                          {/* ─── 6-STAT FIFA HUD ─── */}
                          <div className="relative z-30 mx-3 mt-1.5 mb-3 grid grid-cols-6 gap-1 bg-black/85 border border-white/10 rounded-xl p-2 text-center shadow-inner">
                            {[
                              { key: 'STR', val: (char as any).stats?.strength ?? 85, color: '#ef4444' },
                              { key: 'SPD', val: (char as any).stats?.speed ?? 85, color: '#f59e0b' },
                              { key: 'INT', val: (char as any).stats?.intelligence ?? 85, color: '#3b82f6' },
                              { key: 'WIS', val: (char as any).stats?.wisdom ?? 70, color: '#8b5cf6' },
                              { key: 'WIL', val: (char as any).stats?.willpower ?? 85, color: '#10b981' },
                              { key: 'MAG', val: (char as any).stats?.magic ?? 80, color: '#D4AF37' },
                            ].map((st) => (
                              <div key={st.key} className="flex flex-col items-center gap-0.5">
                                <span className="text-sm font-black font-mono leading-none" style={{ color: st.color }}>
                                  {st.val}
                                </span>
                                <span className="text-[9px] font-bold text-white/70 uppercase font-mono">
                                  {st.key}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Card Footer Stamp */}
                          <div className="relative z-30 flex justify-between items-center px-4 pb-2.5 text-[8px] text-white/30 font-mono border-t border-white/5 pt-1.5">
                            <span>HEKAYATY TCG · 1ST ED</span>
                            <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 shadow-[0_0_6px_rgba(212,175,55,0.7)]" />
                            <span>PWR {rating.score}/100</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Ghost placeholder cards for empty slots */}
                {Array.from({ length: ghostCount }).map((_, gi) => (
                  <motion.div
                    key={`ghost-${gi}`}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (realChars.length + gi) * 0.1 }}
                    className="cursor-default"
                  >
                    <div
                      className="relative rounded-[20px] overflow-hidden flex flex-col h-[540px] border-2 border-dashed border-[#D4AF37]/20 bg-black/30 backdrop-blur-sm"
                    >
                      <div className="absolute inset-[3px] rounded-[16px] border border-white/5 pointer-events-none" />
                      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#D4AF37]/25 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-[#D4AF37]/25" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-[#D4AF37]/40 font-serif text-sm font-bold tracking-widest">
                            قريباً
                          </p>
                          <p className="text-white/20 text-xs font-mono uppercase tracking-[0.2em]">
                            COMING SOON
                          </p>
                        </div>
                        {/* Locked stat bars */}
                        <div className="w-full grid grid-cols-3 gap-2 mt-4">
                          {['???', '???', '???', '???', '???', '???'].map((v, si) => (
                            <div key={si} className="bg-white/5 border border-white/10 rounded py-1.5 text-center">
                              <span className="text-[10px] font-mono text-white/20">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pb-4 text-center text-[9px] font-mono text-white/15 tracking-widest border-t border-white/5 pt-3 mx-4">
                        HEKAYATY TCG · LOCKED
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          })()}

          {/* Bottom Button */}
          <div className="text-center mt-14">
            <Link
              href="/characters"
              className="group relative inline-flex items-center gap-3 px-10 py-4 bg-black/80 border-2 border-[#D4AF37]/60 hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            >
              <span className="font-serif text-xl font-bold text-[#FFF7D6] group-hover:text-[#D4AF37] tracking-wider">
                استعرض سجل الأبطال بالكامل
              </span>
              <ChevronLeft className="w-5 h-5 text-[#D4AF37] group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brown Section Divider Between Champions and Atlas */}
      <BrownSectionDivider />

      {/* ═══════════════════════════════════════════════════ */}
      {/* SECTION: ATLAS OF REALMS                          */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="relative z-20 bg-black/95 pt-16 pb-20 px-4 border-t border-[#D4AF37]/10">
        {/* Ornate Section Header */}
        <div className="flex items-center justify-center gap-6 mb-14">
          <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-r from-transparent to-[#D4AF37]/60"></div>
          <div className="flex items-center gap-3 px-5 py-2 border border-[#D4AF37]/30 bg-black/60">
            <Map className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="text-xl md:text-2xl font-serif text-[#D4AF37] whitespace-nowrap tracking-widest">أطلس العوالم</h2>
            <div className="w-1 h-1 rounded-full bg-[#D4AF37]/50"></div>
            <span className="text-[#D4AF37]/60 text-sm font-serif tracking-widest uppercase">Atlas of Realms</span>
          </div>
          <div className="h-[1px] flex-1 max-w-xs bg-gradient-to-l from-transparent to-[#D4AF37]/60"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worlds.slice(0, 3).map((world, i) => (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group cursor-pointer"
              >
                <Link href={`/worlds/${world.id}`}>
                  <div className="relative border border-[#D4AF37]/30 group-hover:border-[#D4AF37]/70 transition-all duration-500 overflow-hidden ornate-border-corners shadow-2xl">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={world.coverUrl || ''}
                        alt={world.arabicName || world.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
                      {/* Type Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 border border-[#D4AF37]/30 text-[#D4AF37]/70 text-xs font-serif tracking-wider">
                        عالم
                      </div>
                    </div>
                    <div className="p-5 bg-black/80">
                      <h3 className="font-serif text-2xl font-bold text-[#D4AF37] mb-1">{world.arabicName || world.name}</h3>
                      <p className="text-white/50 text-sm mb-4 font-serif">{world.name}</p>
                      <p className="text-white/60 text-sm leading-relaxed line-clamp-2">{world.description}</p>
                      <div className="flex gap-4 mt-4 pt-4 border-t border-[#D4AF37]/10">
                        <div className="text-center">
                          <div className="text-[#D4AF37]/50 text-xs uppercase tracking-wider mb-1">السكان</div>
                          <div className="text-white/70 text-sm font-bold">غير معروف</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#D4AF37]/50 text-xs uppercase tracking-wider mb-1">السحر</div>
                          <div className="text-white/70 text-sm font-bold">غير معروف</div>
                        </div>
                        <div className="text-center">
                          <div className="text-[#D4AF37]/50 text-xs uppercase tracking-wider mb-1">التقنية</div>
                          <div className="text-white/70 text-sm font-bold">غير معروف</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* List of remaining worlds */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
            {worlds.slice(3, 7).map((world, i) => (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/worlds/${world.id}`}>
                  <div className="group flex items-center gap-4 p-4 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 bg-black/60 hover:bg-[#D4AF37]/5 transition-all duration-300">
                    <div className="w-12 h-12 border border-[#D4AF37]/30 overflow-hidden shrink-0">
                      <img src={world.coverUrl || ''} alt={world.arabicName || world.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity" />
                    </div>
                    <div className="flex-1 text-right">
                      <h4 className="font-serif text-lg text-[#D4AF37]/90 group-hover:text-[#D4AF37]">{world.arabicName || world.name}</h4>
                      <p className="text-white/40 text-xs">World</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[#D4AF37]/30 group-hover:text-[#D4AF37] shrink-0" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/worlds" className="group relative inline-flex items-center gap-3 px-8 py-3 bg-transparent border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all duration-300">
              <div className="absolute top-[-3px] left-[-3px] w-2 h-2 border border-[#D4AF37] bg-black"></div>
              <div className="absolute top-[-3px] right-[-3px] w-2 h-2 border border-[#D4AF37] bg-black"></div>
              <div className="absolute bottom-[-3px] left-[-3px] w-2 h-2 border border-[#D4AF37] bg-black"></div>
              <div className="absolute bottom-[-3px] right-[-3px] w-2 h-2 border border-[#D4AF37] bg-black"></div>
              <span className="font-serif text-lg text-[#D4AF37]/80 group-hover:text-[#D4AF37]">استكشف كل العوالم</span>
              <ChevronLeft className="w-4 h-4 text-[#D4AF37]/60 group-hover:text-[#D4AF37]" />
            </Link>
          </div>
        </div>
      </section>

      <BrownSectionDivider />

      <div className="max-w-7xl mx-auto px-4 py-12 w-full">
        <UniverseGraph />
        <DiscoveryEngine />
      </div>
    </div>
  );
}
