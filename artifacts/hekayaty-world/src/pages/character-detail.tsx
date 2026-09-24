import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useGetCharactersId } from '@workspace/api-client-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Shield, Zap, Brain, Eye, Flame, Sparkles,
  Users, BookOpen, Image, Globe, ChevronDown, X
} from 'lucide-react';
import { SmartPowerCard } from '@/components/characters/SmartPowerCard';

/* ─── Stat configuration ─────────────────────────────────────── */
const STATS = [
  { key: 'strength',     label: 'القوة',    icon: <Flame className="w-4 h-4" />,    color: '#ef4444' },
  { key: 'speed',        label: 'السرعة',   icon: <Zap className="w-4 h-4" />,      color: '#f59e0b' },
  { key: 'intelligence', label: 'الذكاء',   icon: <Brain className="w-4 h-4" />,    color: '#3b82f6' },
  { key: 'wisdom',       label: 'الحكمة',   icon: <Eye className="w-4 h-4" />,      color: '#8b5cf6' },
  { key: 'willpower',    label: 'الإرادة',  icon: <Shield className="w-4 h-4" />,   color: '#10b981' },
  { key: 'magic',        label: 'السحر',    icon: <Sparkles className="w-4 h-4" />, color: '#D4AF37' },
];

const ALIGNMENT_LABELS: Record<string, string> = {
  Hero: 'بطل', Villain: 'شرير', Neutral: 'محايد', Anti_Hero: 'بطل مضاد',
};

/* ─── Fade-in section wrapper ────────────────────────────────── */
function Section({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Gold divider ───────────────────────────────────────────── */
function GoldDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 my-10">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
      <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] font-bold whitespace-nowrap px-2">
        {title}
      </span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
    </div>
  );
}

/* ─── Stat bar ───────────────────────────────────────────────── */
function StatBar({ label, icon, value, color }: { label: string; icon: React.ReactNode; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3 group">
      <div className="w-8 flex justify-center" style={{ color }}>{icon}</div>
      <span className="w-16 text-sm text-white/70 text-right">{label}</span>
      <div className="flex-1 h-[4px] bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(to left, ${color}, ${color}99)`, boxShadow: `0 0 10px ${color}88` }}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
      <span className="w-8 text-sm font-bold text-right" style={{ color }}>{value}</span>
    </div>
  );
}

/* ─── Image lightbox ─────────────────────────────────────────── */
function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-6 cursor-zoom-out"
      onClick={onClose}
    >
      <button className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
      <motion.img
        src={src} alt={alt}
        initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export function CharacterDetail({ params }: { params: { id: string } }) {
  const { data: character, isLoading, error } = useGetCharactersId(params.id);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [params.id]);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[#D4AF37]/70 text-sm tracking-widest uppercase">جاري التحميل</p>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center text-center px-6">
        <div>
          <p className="text-6xl mb-4">⚔️</p>
          <h2 className="text-2xl text-white mb-2">الشخصية غير موجودة</h2>
          <Link href="/characters" className="text-[#D4AF37] underline text-sm">العودة للقائمة</Link>
        </div>
      </div>
    );
  }

  const heroImage = character.portraitUrl || (character.gallery?.[0]?.secureUrl ?? '');
  const hasStats = character.stats && Object.values(character.stats).some(v => (v as number) > 0);
  const hasAbilities = character.abilities && character.abilities.length > 0;
  const hasRelationships = character.relationships && character.relationships.length > 0;
  const hasGallery = character.gallery && character.gallery.length > 0;
  const hasWorlds = character.worlds && character.worlds.length > 0;

  return (
    <div className="w-full min-h-screen text-[#e0e0e0] selection:bg-[#D4AF37]/30 relative bg-[#050505]" dir="rtl">

      {/* ══════════════════════════════════════════
          HERO PHOTO FIXED FULL-PAGE BACKGROUND
      ══════════════════════════════════════════ */}
      {heroImage && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={heroImage}
            alt={character.name || 'Hero'}
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 12%' }}
          />
          {/* Subtle cinematic gradient: preserves face clarity while fading nicely into content */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-transparent to-black/65" />
        </div>
      )}

      {/* ══════════════════════════════════════════
          PAGE CONTENT (Relative on top of background)
      ══════════════════════════════════════════ */}
      <div className="relative z-10 w-full">

        {/* ── 1. HERO BANNER SECTION (Full Viewport) ── */}
        <div className="relative w-full min-h-[92vh] flex flex-col justify-between p-6 md:p-12">

          {/* Top Row: Back button & Status Tag */}
          <div className="flex justify-between items-center w-full z-20">
            <Link
              href="/characters"
              className="flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors text-xs uppercase tracking-widest font-bold bg-black/60 px-4 py-2 rounded-sm border border-[#D4AF37]/40 backdrop-blur-md"
            >
              <ArrowRight className="w-4 h-4" /> العودة للشخصيات
            </Link>

            {/* Badges */}
            <div className="flex items-center gap-2">
              {character.alignment && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-[#D4AF37] text-[#D4AF37] bg-black/60 backdrop-blur-md rounded-sm">
                  {ALIGNMENT_LABELS[character.alignment] || character.alignment}
                </span>
              )}
              {character.powerCategory && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider border border-white/20 text-white/90 bg-black/60 backdrop-blur-md rounded-sm">
                  {character.powerCategory}
                </span>
              )}
            </div>
          </div>

          {/* Middle/Bottom Main Hero Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end w-full max-w-[1600px] mx-auto pt-16 pb-8">
            
            {/* Right/Main Column (RTL): Names, Title, Quote */}
            <div className="lg:col-span-7 space-y-5 text-right">
              
              {/* Arabic Name */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-6xl md:text-8xl lg:text-9xl font-serif font-black text-[#FFF7D6] leading-none"
                style={{ textShadow: '0 0 50px rgba(212,175,55,0.4)' }}
              >
                {character.arabicName}
              </motion.h1>

              {/* English Name & Title */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="space-y-1"
              >
                <h2 className="text-2xl md:text-3xl lg:text-4xl text-[#D4AF37] tracking-[0.25em] font-light uppercase">
                  {character.name}
                </h2>
                {character.title && (
                  <p className="text-xl md:text-2xl text-white/80 font-serif">
                    {character.title}
                  </p>
                )}
                {character.alias && (
                  <p className="text-[#D4AF37]/90 font-mono text-sm tracking-wider pt-1">
                    [ الاسم المستعار: {character.alias} ]
                  </p>
                )}
              </motion.div>

              {/* Quote */}
              {character.quote && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="bg-black/50 backdrop-blur-md border-r-4 border-[#D4AF37] p-5 rounded-l-lg max-w-2xl mt-4"
                >
                  <p className="text-xl md:text-2xl font-serif text-white/95 leading-relaxed font-bold">
                    {character.quote}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Left Column: Quick Stats Preview */}
            {hasStats && (
              <div className="lg:col-span-5 bg-black/60 backdrop-blur-md border border-[#D4AF37]/30 rounded-lg p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-[#D4AF37] font-serif text-lg font-bold">مصفوفة القوة</h3>
                  <span className="text-xs text-white/50">التقييم العام</span>
                </div>
                <div className="space-y-3 pt-1">
                  {STATS.map(stat => {
                    const val = (character.stats as any)?.[stat.key] ?? 0;
                    return (
                      <StatBar key={stat.key} label={stat.label} icon={stat.icon} value={val} color={stat.color} />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Scroll Down Cue */}
          <div className="w-full flex justify-center pb-2 z-20">
            <div className="flex flex-col items-center gap-1 text-white/50 text-xs hover:text-[#D4AF37] transition-colors cursor-pointer">
              <span className="tracking-widest uppercase text-[10px]">استكشف السيرة والتفاصيل الكاملة</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </div>
          </div>
        </div>

        {/* ── 2. FULL DETAILS CONTENT BODY ── */}
        <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-16 space-y-20">

          {/* ── IDENTITY & BIOGRAPHY ── */}
          <Section>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Identity Card */}
              <div className="lg:col-span-4 bg-black/75 backdrop-blur-md border border-[#D4AF37]/30 rounded-lg p-6 space-y-5 shadow-2xl">
                {/* Full Uncropped Portrait Preview */}
                {heroImage && (
                  <div 
                    className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-[#D4AF37]/40 group cursor-zoom-in mb-4 shadow-xl"
                    onClick={() => setLightbox({ src: heroImage, alt: character.name || '' })}
                  >
                    <img 
                      src={heroImage} 
                      alt={character.name || 'Portrait'} 
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-[#D4AF37] tracking-wider">اللوحة الفنية الكاملة</span>
                      <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded text-white/80 border border-white/20">تكبير</span>
                    </div>
                  </div>
                )}

                <h3 className="text-[#D4AF37] font-serif text-xl mb-4 pb-3 border-b border-[#D4AF37]/20 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> الهوية والتصنيف
                </h3>
                {[
                  { label: 'الاسم بالكامل', value: character.arabicName },
                  { label: 'الاسم اللاتيني', value: character.name },
                  { label: 'اللقب الشرفي', value: character.title },
                  { label: 'الاسم المستعار', value: character.alias },
                  { label: 'التوجه الفكري', value: ALIGNMENT_LABELS[character.alignment || ''] || character.alignment },
                  { label: 'فئة القوة', value: character.powerCategory },
                  { label: 'الفصيل / التنظيم', value: character.organization },
                ].filter(row => row.value).map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-4 border-b border-white/5 pb-2">
                    <span className="text-white/40 text-xs uppercase tracking-wider shrink-0">{label}</span>
                    <span className="text-white/95 text-sm text-right font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {/* Biography Details */}
              <div className="lg:col-span-8 space-y-6">
                {character.shortBio && (
                  <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-8 shadow-2xl">
                    <h3 className="text-[#D4AF37] font-serif text-xl mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> نبذة مختصرة
                    </h3>
                    <p className="text-white/85 leading-relaxed text-base font-light">{character.shortBio}</p>
                  </div>
                )}

                {character.fullBio && (
                  <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-8 shadow-2xl">
                    <h3 className="text-[#D4AF37] font-serif text-xl mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5" /> السيرة الكاملة والأصول
                    </h3>
                    <div className={`relative overflow-hidden transition-all duration-500 ${bioExpanded ? '' : 'max-h-56'}`}>
                      <div
                        className="text-white/80 leading-relaxed text-base font-light space-y-4"
                        dangerouslySetInnerHTML={{ __html: character.fullBio.replace(/\n/g, '<br/>') }}
                      />
                      {!bioExpanded && (
                        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black via-black/80 to-transparent" />
                      )}
                    </div>
                    <button
                      onClick={() => setBioExpanded(prev => !prev)}
                      className="mt-4 flex items-center gap-2 text-[#D4AF37] text-sm hover:text-white font-bold transition-colors"
                    >
                      {bioExpanded ? 'عرض أقل' : 'قراءة السيرة الكاملة'}
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${bioExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                )}

                {!character.shortBio && !character.fullBio && character.aboutText && (
                  <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-8 shadow-2xl">
                    <h3 className="text-[#D4AF37] font-serif text-xl mb-3">عن الشخصية</h3>
                    <p className="text-white/85 leading-relaxed text-base font-light">{character.aboutText}</p>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* ── SMART POWER & COMBAT RATING CARD (YU-GI-OH / FIFA FUT STYLE) ── */}
          <Section>
            <SmartPowerCard
              stats={character.stats}
              abilities={character.abilities}
              characterName={character.name || 'Hero'}
              characterArabicName={character.arabicName}
              characterTitle={character.title || undefined}
              characterAlias={character.alias || undefined}
              characterPortraitUrl={heroImage}
              alignment={character.alignment}
              powerCategory={character.powerCategory || undefined}
              organization={character.organization || undefined}
            />
          </Section>

          {/* ── ABILITIES ── */}
          {hasAbilities && (
            <>
              <GoldDivider title="القدرات والمهارات الخاصة" />
              <Section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {character.abilities!.map((ability, i) => (
                    <motion.div
                      key={ability.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="group relative bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-[#D4AF37]/50 transition-all duration-300 shadow-2xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0 group-hover:bg-[#D4AF37]/20 transition-colors">
                          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg mb-2 group-hover:text-[#D4AF37] transition-colors">
                            {ability.name}
                          </h4>
                          {ability.description && (
                            <p className="text-white/70 text-sm leading-relaxed">{ability.description}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* ── RELATIONSHIPS ── */}
          {hasRelationships && (
            <>
              <GoldDivider title="شبكة العلاقات والتحالفات" />
              <Section>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                  {character.relationships!.map((rel, i) => (
                    <motion.div
                      key={rel.id || i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-black/70 backdrop-blur-md border border-white/10 rounded-lg p-5 flex flex-col items-center text-center gap-3 group cursor-pointer hover:border-[#D4AF37]/50 transition-all duration-300 shadow-2xl"
                      onClick={() => rel.relatedId && window.location.assign(`/characters/${rel.relatedId}`)}
                    >
                      <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-[#D4AF37] transition-all duration-300 shadow-lg">
                        {rel.relatedPortraitUrl ? (
                          <img
                            src={rel.relatedPortraitUrl}
                            alt={rel.relatedName || ''}
                            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                            <Users className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold group-hover:text-[#D4AF37] transition-colors">
                          {rel.relatedArabicName || rel.relatedName || '—'}
                        </p>
                        <p className="text-[#D4AF37] text-xs font-semibold mt-0.5">{rel.relationType}</p>
                        {rel.description && (
                          <p className="text-white/40 text-[11px] mt-1 leading-snug">{rel.description}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* ── GALLERY ── */}
          {hasGallery && (
            <>
              <GoldDivider title="معرض الصور والأعمال الفنية" />
              <Section>
                <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                  {character.gallery!.map((img, i) => (
                    img.secureUrl && (
                      <motion.div
                        key={img.id || i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className="relative overflow-hidden rounded-lg border border-white/10 group cursor-zoom-in break-inside-avoid shadow-2xl hover:border-[#D4AF37]/60 transition-all duration-300"
                        onClick={() => setLightbox({ src: img.secureUrl!, alt: img.altText || character.name || '' })}
                      >
                        <img
                          src={img.secureUrl}
                          alt={img.altText || `Gallery ${i + 1}`}
                          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Image className="w-8 h-8 text-[#D4AF37]" />
                        </div>
                      </motion.div>
                    )
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* ── WORLDS ── */}
          {hasWorlds && (
            <>
              <GoldDivider title="العوالم والمناطق المرتبطة" />
              <Section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {character.worlds!.map((world, i) => (
                    <motion.div
                      key={world.worldId || i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group relative overflow-hidden rounded-lg border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-300 cursor-pointer h-48 shadow-2xl"
                      onClick={() => world.worldId && window.location.assign(`/worlds/${world.worldId}`)}
                    >
                      {world.coverUrl ? (
                        <img src={world.coverUrl} alt={world.worldName || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1005] to-[#0a0a0a] flex items-center justify-center">
                          <Globe className="w-10 h-10 text-white/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-5">
                        <p className="text-white font-bold text-lg group-hover:text-[#D4AF37] transition-colors">
                          {world.worldArabicName || world.worldName}
                        </p>
                        {world.relationship && (
                          <p className="text-[#D4AF37] text-xs mt-1 uppercase tracking-widest font-semibold">{world.relationship}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* Bottom spacer */}
          <div className="h-16" />
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && <Lightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  );
}
