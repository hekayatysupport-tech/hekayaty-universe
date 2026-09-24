import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { calculatePowerRating, CharacterStatsInput, AbilityInput } from '@/utils/powerRating';
import {
  Sparkles, Shield, Zap, Flame, Brain, Eye, RotateCw, Download, Share2, Award, Star
} from 'lucide-react';

interface SmartPowerCardProps {
  stats?: CharacterStatsInput | null;
  abilities?: AbilityInput[] | null;
  characterName?: string;
  characterArabicName?: string;
  characterTitle?: string;
  characterAlias?: string;
  characterPortraitUrl?: string | null;
  alignment?: string | null;
  powerCategory?: string | null;
  organization?: string | null;
  className?: string;
}

export function SmartPowerCard({
  stats,
  abilities,
  characterName = 'Hero',
  characterArabicName,
  characterTitle,
  characterAlias,
  characterPortraitUrl,
  alignment = 'Hero',
  powerCategory = 'The Light',
  organization,
  className = '',
}: SmartPowerCardProps) {
  const rating = calculatePowerRating(stats, abilities);
  const { score, tier, archetype, metrics } = rating;

  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse 3D Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  const str = stats?.strength ?? 50;
  const spd = stats?.speed ?? 50;
  const int = stats?.intelligence ?? 50;
  const wis = stats?.wisdom ?? 50;
  const wil = stats?.willpower ?? 50;
  const mag = stats?.magic ?? 50;

  return (
    <div className={`w-full max-w-[1300px] mx-auto py-8 ${className}`} dir="rtl">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-[#D4AF37]/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            <h2 className="text-2xl md:text-3xl font-serif font-black text-[#FFF7D6] text-glow">
              بطاقة القوة الأسطورية (TCG & FUT Card)
            </h2>
          </div>
          <p className="text-sm text-white/60 font-sans mt-1">
            البطاقة القتالية الرسمية للشخصية بنظام تقييم فيفا ويوغي يو الشامل
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] hover:text-white rounded-lg text-xs font-bold transition-colors backdrop-blur-md shadow-lg"
          >
            <RotateCw className="w-4 h-4" />
            {isFlipped ? 'عرض وجه البطاقة' : 'قلب البطاقة (خلفية الكارت)'}
          </button>
        </div>
      </div>

      {/* Main Container: 2-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* ── COLUMN 1: THE 3D INTERACTIVE TCG / FUT CARD (5 Cols) ── */}
        <div className="lg:col-span-5 flex justify-center perspective-[1200px]">
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
              rotateX: isFlipped ? 0 : rotateX,
              rotateY: isFlipped ? 180 : rotateY,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative w-full max-w-[380px] aspect-[1/1.58] rounded-[24px] cursor-pointer select-none transition-shadow duration-300"
          >
            {/* ════════ FRONT OF CARD (FUT / YU-GI-OH STYLE) ════════ */}
            <div
              className={`absolute inset-0 rounded-[24px] overflow-hidden p-3 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-2 transition-all ${
                isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
              style={{
                background: 'linear-gradient(135deg, #181510 0%, #0d0c0a 50%, #201a10 100%)',
                borderColor: tier.color,
                boxShadow: `0 0 35px ${tier.glowColor}, inset 0 0 20px rgba(0,0,0,0.8)`,
                backfaceVisibility: 'hidden',
              }}
            >
              {/* Outer Golden Border & Engraved Inset */}
              <div className="absolute inset-[3px] rounded-[20px] border border-[#D4AF37]/50 pointer-events-none" />
              <div className="absolute inset-[6px] rounded-[18px] border border-white/10 pointer-events-none" />

              {/* Holographic Glare Overlay */}
              <div
                className="absolute inset-0 pointer-events-none rounded-[24px] transition-opacity duration-200 mix-blend-color-dodge z-30"
                style={{
                  opacity: glarePosition.opacity,
                  background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.8) 0%, rgba(212,175,55,0.3) 40%, transparent 80%)`,
                }}
              />

              {/* Holographic Rainbow Foil Layer */}
              <div
                className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay z-20"
                style={{
                  background: 'linear-gradient(115deg, transparent 20%, #ff0077 40%, #00e1ff 60%, #ffe600 80%, transparent 100%)',
                }}
              />

              {/* ── CARD HEADER: RATING BADGE & CATEGORY ── */}
              <div className="relative z-10 flex justify-between items-start pt-2 px-3">
                
                {/* Left: Overall FUT Rating Badge & Tier */}
                <div className="flex flex-col items-center bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#D4AF37]/60 shadow-lg">
                  <span
                    className="text-4xl font-black font-mono leading-none tracking-tighter"
                    style={{ color: tier.color, textShadow: `0 0 15px ${tier.glowColor}` }}
                  >
                    {score}
                  </span>
                  <span
                    className="text-xs font-black font-mono uppercase tracking-widest px-2 py-0.5 rounded mt-0.5"
                    style={{ backgroundColor: `${tier.color}30`, color: tier.color }}
                  >
                    {tier.rank}
                  </span>
                </div>

                {/* Right: Alignment & Element Badge */}
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 border border-[#D4AF37]/40 text-[#D4AF37] shadow">
                    {alignment}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono text-white/80 bg-white/10 border border-white/10">
                    {powerCategory}
                  </span>
                </div>
              </div>

              {/* ── CARD ARTWORK FRAME (Yu-Gi-Oh & FUT style) ── */}
              <div className="relative z-10 w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-2xl my-1 bg-black">
                {characterPortraitUrl ? (
                  <img
                    src={characterPortraitUrl}
                    alt={characterName}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#20180a] to-black flex items-center justify-center text-[#D4AF37]">
                    <Shield className="w-12 h-12 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Archetype Ribbon over Art */}
                <div className="absolute bottom-1 right-2 left-2 flex justify-between items-center text-[10px] font-bold text-white/90">
                  <span className="px-2 py-0.5 bg-black/80 rounded border border-[#D4AF37]/40 text-[#D4AF37]">
                    {archetype.icon} {archetype.titleArabic}
                  </span>
                  <span className="text-[9px] text-white/60 font-mono">
                    {tier.titleEnglish}
                  </span>
                </div>
              </div>

              {/* ── CARD NAMEPLATE (Gold Foil Banner) ── */}
              <div className="relative z-10 bg-gradient-to-r from-[#2a2212] via-[#3a2f18] to-[#2a2212] border border-[#D4AF37]/70 py-1.5 px-3 rounded-lg text-center shadow-md my-0.5">
                <h3 className="text-lg md:text-xl font-serif font-black text-[#FFF7D6] leading-tight truncate">
                  {characterArabicName || characterName}
                </h3>
                <p className="text-[10px] text-[#D4AF37] tracking-[0.2em] font-light uppercase truncate">
                  {characterName} {characterTitle ? `· ${characterTitle}` : ''}
                </p>
              </div>

              {/* ── 6 CORE ATTRIBUTES (FIFA FUT 6-STAT GRID) ── */}
              <div className="relative z-10 grid grid-cols-6 gap-1 bg-black/75 backdrop-blur-md border border-white/10 rounded-lg p-2 text-center my-0.5 shadow-inner">
                {[
                  { key: 'STR', val: str, label: 'قوة', color: '#ef4444' },
                  { key: 'SPD', val: spd, label: 'سرعة', color: '#f59e0b' },
                  { key: 'INT', val: int, label: 'ذكاء', color: '#3b82f6' },
                  { key: 'WIS', val: wis, label: 'حكمة', color: '#8b5cf6' },
                  { key: 'WIL', val: wil, label: 'إرادة', color: '#10b981' },
                  { key: 'MAG', val: mag, label: 'سحر', color: '#D4AF37' },
                ].map((st) => (
                  <div key={st.key} className="flex flex-col items-center">
                    <span className="text-xs font-black font-mono leading-none" style={{ color: st.color }}>
                      {st.val}
                    </span>
                    <span className="text-[9px] font-bold text-white/80 uppercase font-mono mt-0.5">
                      {st.key}
                    </span>
                    <span className="text-[8px] text-white/40 leading-none scale-90">
                      {st.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── ABILITIES & EFFECT BOX (Yu-Gi-Oh Monster Lore Box) ── */}
              <div className="relative z-10 bg-black/65 border border-white/10 rounded-lg p-2 flex-1 flex flex-col justify-center min-h-[52px]">
                {abilities && abilities.length > 0 ? (
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-[#D4AF37]">
                      <Star className="w-3 h-3 fill-[#D4AF37]" />
                      <span>{abilities[0].arabic_name || abilities[0].name}</span>
                      <span className="text-[9px] text-white/50 font-mono mr-auto">
                        (مستوى {abilities[0].power_level ?? 5}/10)
                      </span>
                    </div>
                    {abilities[0].description && (
                      <p className="text-[9px] text-white/70 leading-snug line-clamp-2">
                        {abilities[0].description}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-white/60 leading-snug line-clamp-2 text-center italic">
                    "{archetype.descriptionArabic}"
                  </p>
                )}
              </div>

              {/* ── CARD FOOTER / HOLOGRAM SEAL ── */}
              <div className="relative z-10 flex justify-between items-center px-2 pt-1 text-[8px] text-white/40 font-mono border-t border-white/5">
                <span>HEKAYATY TCG · 1ST ED</span>
                <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 border border-yellow-200 shadow-[0_0_6px_rgba(212,175,55,0.8)]" />
                <span>RAT #{score}/100</span>
              </div>
            </div>

            {/* ════════ BACK OF CARD (OFFICIAL DECK BACK) ════════ */}
            <div
              className={`absolute inset-0 rounded-[24px] overflow-hidden p-6 flex flex-col items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-2 border-[#D4AF37]/60 transition-all ${
                isFlipped ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              style={{
                background: 'radial-gradient(circle at center, #261f12 0%, #0d0c0a 70%, #050505 100%)',
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* Card Back Borders */}
              <div className="absolute inset-[6px] rounded-[18px] border-2 border-[#D4AF37]/40 pointer-events-none" />
              <div className="absolute inset-[10px] rounded-[14px] border border-white/10 pointer-events-none" />

              {/* Header */}
              <div className="text-center pt-4 z-10">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold">
                  HEKAYATY UNIVERSE
                </span>
                <h4 className="text-xl font-serif font-black text-white mt-1">
                  عالم حكاياتي
                </h4>
              </div>

              {/* Central Golden Emblem */}
              <div className="relative z-10 flex flex-col items-center my-auto">
                <div className="w-28 h-28 rounded-full border-2 border-[#D4AF37] p-2 flex items-center justify-center bg-black/60 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                  <div className="w-full h-full rounded-full border border-dashed border-[#D4AF37]/60 flex items-center justify-center">
                    <Shield className="w-12 h-12 text-[#D4AF37]" />
                  </div>
                </div>
                <span className="text-xs font-serif text-[#D4AF37] mt-3 font-bold">
                  بطاقة الأبطال المعتمدة
                </span>
              </div>

              {/* Back Footer */}
              <div className="text-center pb-2 z-10">
                <p className="text-[10px] text-white/50 font-mono">
                  OFFICIAL TRADING CARD · EDITION 2026
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── COLUMN 2: TACTICAL PROFILE & ALL SPECIAL POWERS (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Rating Summary Box */}
          <div className="bg-black/70 backdrop-blur-xl border border-[#D4AF37]/35 rounded-2xl p-6 shadow-2xl space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider block mb-1">
                  التقييم الشامل والقدرة التنافسية
                </span>
                <h3 className="text-2xl font-serif font-black text-white flex items-center gap-3">
                  <span>{characterArabicName || characterName}</span>
                  <span
                    className="px-3 py-1 rounded-lg text-sm font-black font-mono"
                    style={{
                      color: tier.color,
                      backgroundColor: `${tier.color}20`,
                      borderColor: `${tier.color}50`,
                      borderWidth: 1,
                    }}
                  >
                    Tier {tier.rank} · {tier.titleArabic}
                  </span>
                </h3>
              </div>

              <div className="text-left font-mono">
                <span className="text-4xl font-black text-white" style={{ textShadow: `0 0 20px ${tier.glowColor}` }}>
                  {score}
                </span>
                <span className="text-lg text-white/40">/100</span>
              </div>
            </div>

            {/* Combat Archetype Description */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
              <span className="text-3xl">{archetype.icon}</span>
              <div>
                <h4 className="text-base font-bold text-white">
                  {archetype.titleArabic}
                  <span className="text-xs font-normal text-white/50 mr-2 font-mono">
                    ({archetype.titleEnglish})
                  </span>
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1">
                  {archetype.descriptionArabic}
                </p>
              </div>
            </div>

            {/* 4 Combat Vector Bars */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: 'الهجوم والفتك', value: metrics.offense, icon: <Flame className="w-3.5 h-3.5 text-red-400" />, color: '#ef4444' },
                { label: 'الدفاع والصمود', value: metrics.defense, icon: <Shield className="w-3.5 h-3.5 text-emerald-400" />, color: '#10b981' },
                { label: 'السرعة والمناورة', value: metrics.agility, icon: <Zap className="w-3.5 h-3.5 text-amber-400" />, color: '#f59e0b' },
                { label: 'التكتيك والسيطرة', value: metrics.tactics, icon: <Brain className="w-3.5 h-3.5 text-blue-400" />, color: '#3b82f6' },
              ].map((m) => (
                <div key={m.label} className="bg-black/50 border border-white/5 p-3 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-white/80 font-medium">
                      {m.icon}
                      {m.label}
                    </span>
                    <span className="font-mono font-bold" style={{ color: m.color }}>
                      {m.value}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Abilities List */}
          {abilities && abilities.length > 0 && (
            <div className="bg-black/70 backdrop-blur-xl border border-[#D4AF37]/35 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-base font-bold text-[#D4AF37] flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  قائمة القدرات والمهارات المفعّلة ({abilities.length})
                </h4>
                <span className="text-xs text-white/50 font-mono">
                  مستوى تأثير القدرات: +{Math.min(8, Math.round(abilities.length * 1.5))} نقاط
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {abilities.map((ab, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white/[0.02] border border-white/10 hover:border-[#D4AF37]/40 rounded-xl space-y-1 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">
                        {ab.arabic_name || ab.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                        مستوى {ab.power_level ?? 5}/10
                      </span>
                    </div>
                    {ab.description && (
                      <p className="text-xs text-white/60 leading-relaxed">
                        {ab.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
