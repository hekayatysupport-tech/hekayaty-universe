import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Crown, Sparkles, ShieldCheck, CheckCircle2, ArrowLeft, Star, Zap } from 'lucide-react';
import { DiscoveryEngine } from '@/components/universe/DiscoveryEngine';
import { getImageUrl } from '@/assets';

export function MembershipPage() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-[#F5E9D0] overflow-hidden selection:bg-[#D4AF37]/30" dir="rtl">
      {/* Background Layer Architecture */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Fantasy Realm Backdrop - Very Clear & High Visibility */}
        <img
          src={getImageUrl('originals-bg.png') || getImageUrl('background photo.png')}
          alt="Hekayaty Universe Realm"
          className="w-full h-full object-cover object-center opacity-100 brightness-110 contrast-105 filter"
        />
        {/* Subtle Dark Vignette Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-[#050505]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F5B800]/25 via-transparent to-transparent" />
        
        {/* Subtle Floating Dust Particles */}
        <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 border border-[#D4AF37]/50 bg-black/70 backdrop-blur-md rounded-full text-[#D4AF37] text-xs font-serif font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.3)] mb-6"
          >
            <Crown className="w-4 h-4 text-[#FFC928] animate-pulse" />
            <span>عضوية حراس حكاياتي VIP</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold text-white tracking-tight leading-tight mb-4 drop-shadow-[0_4px_35px_rgba(245,184,0,0.4)]"
          >
            انضم إلى حكاياتي
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-[#F5E9D0]/85 max-w-2xl mx-auto leading-relaxed font-light"
          >
            اكتشف عوالم لا تنتهي من القصص الأصلية، واحصل على تجربة قراءة استثنائية مع اشتراكك في حكاياتي أوريجينالز
          </motion.p>

          {/* Manuscript Decorative Divider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex items-center justify-center gap-4 my-8 max-w-md mx-auto opacity-90"
          >
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            <div className="w-2 h-2 rotate-45 border border-[#FFC928] bg-black shadow-[0_0_8px_#FFC928]" />
            <Crown className="w-4.5 h-4.5 text-[#FFC928]" />
            <div className="w-2 h-2 rotate-45 border border-[#FFC928] bg-black shadow-[0_0_8px_#FFC928]" />
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
          </motion.div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {/* Card 1: 3-Month Plan (FEATURED - CENTER ON DESKTOP, FIRST ON MOBILE) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2 relative rounded-3xl p-8 md:p-10 flex flex-col justify-between transition-all duration-500 bg-black/85 backdrop-blur-xl border-2 border-[#FFC928] shadow-[0_0_50px_rgba(245,184,0,0.35)] lg:-translate-y-4 lg:scale-105 z-20 group overflow-hidden"
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FFC928]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FFC928]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FFC928]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FFC928]" />

            {/* Background Art Overlay */}
            <img
              src={getImageUrl('novels-bg.png')}
              alt="3 Months Plan"
              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none" />

            {/* Featured Crown Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-[#F5B800] via-[#FFC928] to-[#D89B18] text-black font-serif font-black text-xs uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(245,184,0,0.6)] flex items-center gap-1.5 z-30">
              <Crown className="w-4 h-4 fill-black text-black" />
              <span>الأكثر طلباً — توفير 20%</span>
            </div>

            <div className="relative z-10">
              <div className="border-b border-[#D4AF37]/30 pb-6 mb-6">
                <h3 className="font-serif font-bold text-2xl md:text-3xl text-white mb-2 group-hover:text-[#FFC928] transition-colors">
                  الاشتراك 3 أشهر
                </h3>
                <p className="text-xs text-[#F5E9D0]/70 leading-relaxed">
                  المغامرة تستحق وقتاً أطول — وفر 20% واستمتع بجميع المزايا الكونية
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-5xl font-serif font-black text-[#FFC928] drop-shadow-[0_2px_15px_rgba(245,184,0,0.4)]">
                  139 ج.م
                </span>
                <span className="text-xs font-mono text-[#F5E9D0]/60">/ كل 3 أشهر</span>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8 text-sm">
                {[
                  'الوصول الكامل لجميع القصص الأصلية',
                  'قراءة بدون إعلانات',
                  'تنزيل الفصول للقراءة لاحقاً',
                  'وصول مبكر للمحتوى الجديد',
                  'توفير 20% مقارنة بالاشتراك الشهري',
                  'بطاقة تداول أسطورية حصرية عند الاشتراك',
                  'خصم 15% على جميع مشتريات المتجر الرسمي',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/90">
                    <CheckCircle2 className="w-4 h-4 text-[#FFC928] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-light">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="relative z-10 pt-4">
              <Link
                href="/checkout?plan=quarterly"
                className="w-full py-4 px-6 bg-gradient-to-r from-[#F5B800] via-[#FFC928] to-[#D89B18] hover:from-[#FFC928] hover:to-[#F5B800] text-black font-serif font-bold text-sm sm:text-base rounded-2xl shadow-[0_0_30px_rgba(245,184,0,0.5)] transition-all duration-300 flex items-center justify-center gap-2 group-hover:scale-[1.02]"
              >
                <span>اشترك الآن</span>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Monthly Plan (LEFT ON DESKTOP, SECOND ON MOBILE) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-2 lg:order-1 relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 bg-black/80 backdrop-blur-md border border-[#D4AF37]/35 hover:border-[#D4AF37] shadow-[0_10px_40px_rgba(0,0,0,0.8)] hover:shadow-[0_15px_45px_rgba(212,175,55,0.2)] group overflow-hidden"
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#D4AF37]/60" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#D4AF37]/60" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#D4AF37]/60" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#D4AF37]/60" />

            {/* Background Art Overlay */}
            <img
              src={getImageUrl('comics-bg.png')}
              alt="Monthly Plan"
              className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="border-b border-white/10 pb-6 mb-6">
                <h3 className="font-serif font-bold text-2xl text-white mb-2 group-hover:text-[#FFC928] transition-colors">
                  الاشتراك الشهري
                </h3>
                <p className="text-xs text-[#F5E9D0]/70 leading-relaxed">
                  رحلة شهرية في عوالم لا تنتهي من أساطير حكاياتي
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-4xl font-serif font-bold text-[#FFC928]">
                  59 ج.م
                </span>
                <span className="text-xs font-mono text-[#F5E9D0]/60">/ شهرياً</span>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8 text-sm">
                {[
                  'الوصول الكامل لجميع القصص الأصلية',
                  'قراءة بدون إعلانات',
                  'تنزيل الفصول للقراءة لاحقاً',
                  'وصول مبكر للمحتوى الجديد',
                  'شارة العضوية VIP في مجتمع الأبطال',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-light">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="relative z-10 pt-4">
              <Link
                href="/checkout?plan=monthly"
                className="w-full py-3.5 px-6 bg-transparent border border-[#D4AF37]/50 hover:border-[#FFC928] hover:bg-[#D4AF37]/15 text-[#FFC928] font-serif font-bold text-sm rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
              >
                <span>اشترك الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Card 3: Yearly Plan (RIGHT ON DESKTOP, THIRD ON MOBILE) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="order-3 relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-500 bg-gradient-to-b from-[#090810]/90 via-black/90 to-[#0c0a14]/90 backdrop-blur-md border border-[#D4AF37]/45 hover:border-[#FFC928] shadow-[0_10px_40px_rgba(0,0,0,0.9)] hover:shadow-[0_15px_45px_rgba(212,175,55,0.25)] group overflow-hidden"
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#D4AF37]/70" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#D4AF37]/70" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#D4AF37]/70" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#D4AF37]/70" />

            {/* Background Art Overlay */}
            <img
              src={getImageUrl('originals-bg.png')}
              alt="Yearly Plan"
              className="absolute inset-0 w-full h-full object-cover opacity-15 group-hover:opacity-25 transition-opacity duration-700 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="border-b border-white/10 pb-6 mb-6">
                <h3 className="font-serif font-bold text-2xl text-white mb-2 group-hover:text-[#FFC928] transition-colors">
                  الاشتراك السنوي
                </h3>
                <p className="text-xs text-[#F5E9D0]/70 leading-relaxed">
                  سنة كاملة من القصص والاكتشاف — أفضل قيمة مقابل السعر
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 flex items-baseline gap-2">
                <span className="text-4xl font-serif font-bold text-[#FFC928]">
                  499 ج.م
                </span>
                <span className="text-xs font-mono text-[#F5E9D0]/60">/ سنوياً</span>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8 text-sm">
                {[
                  'الوصول الكامل لجميع القصص الأصلية',
                  'قراءة بدون إعلانات',
                  'تنزيل الفصول للقراءة لاحقاً',
                  'وصول مبكر للمحتوى الجديد',
                  'أفضل قيمة مقابل السعر (توفير 35%)',
                  'نسخة مجلدة فاخرة مجانية تصلك لمنزلك',
                  'أولوية حضور الفعاليات والمعارض الحية',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/85">
                    <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-light">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="relative z-10 pt-4">
              <Link
                href="/checkout?plan=yearly"
                className="w-full py-3.5 px-6 bg-gradient-to-r from-[#7A4A18] via-[#D89B18] to-[#7A4A18] hover:from-[#D89B18] hover:to-[#FFC928] text-black font-serif font-bold text-sm rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                <span>اشترك الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Trust / Value Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-8 border-t border-[#D4AF37]/20 grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-black/60 border border-[#D4AF37]/25 backdrop-blur-md">
            <Crown className="w-5 h-5 text-[#FFC928] shrink-0" />
            <span className="text-xs sm:text-sm font-serif font-bold text-[#F5E9D0]">
              تجربة قراءة استثنائية وبدون إعلانات
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-black/60 border border-[#D4AF37]/25 backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-[#FFC928] shrink-0" />
            <span className="text-xs sm:text-sm font-serif font-bold text-[#F5E9D0]">
              محتوى حصري وأصلي 100% من حكاياتي
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-black/60 border border-[#D4AF37]/25 backdrop-blur-md">
            <ShieldCheck className="w-5 h-5 text-[#FFC928] shrink-0" />
            <span className="text-xs sm:text-sm font-serif font-bold text-[#F5E9D0]">
              دفع آمن واستلام فوري عبر InstaPay
            </span>
          </div>
        </motion.div>
      </div>

      <DiscoveryEngine />
    </div>
  );
}
