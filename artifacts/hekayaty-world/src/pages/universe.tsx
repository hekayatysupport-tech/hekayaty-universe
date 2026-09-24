import React from 'react';
import { UniverseGraph } from '@/components/universe/UniverseGraph';
import { DiscoveryEngine } from '@/components/universe/DiscoveryEngine';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Network } from 'lucide-react';

export function UniversePage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-12 text-right" dir="rtl">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/40 text-primary text-xs font-bold uppercase tracking-widest bg-primary/5 rounded-full mb-3">
          <Compass className="w-3.5 h-3.5" /> مركز الكون والمخطط الكوني
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-foreground mb-4">
          عالم حكاياتي التفاعلي (HEKAYATY UNIVERSE)
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          أهلاً بك في العقل المركزي للكون. هنا تتقاطع ملامح الأبطال، خرائط العوالم، بطاقات التداول، والكتب الملحمية في خريطة معرفية واحدة غير منتهية.
        </p>
      </div>

      <UniverseGraph />

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
        <div className="p-6 bg-card border border-border rounded-2xl">
          <Network className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-serif font-bold text-xl mb-2 text-foreground">روابط بلا نهايات مسدودة</h3>
          <p className="text-sm text-muted-foreground">كل شخصية ترتبط بعالمها الأصلي، وروايتها الملحمية، وبطاقتها في لعبة التداول.</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-2xl">
          <Sparkles className="w-8 h-8 text-amber-400 mb-4" />
          <h3 className="font-serif font-bold text-xl mb-2 text-foreground">تحديثات حية ومستمرة</h3>
          <p className="text-sm text-muted-foreground">يتم تحديث الخريطة فور إضافة أعداد مصورة جديدة أو روايات أو شخصيات قادمة.</p>
        </div>
        <div className="p-6 bg-card border border-border rounded-2xl">
          <Compass className="w-8 h-8 text-primary mb-4" />
          <h3 className="font-serif font-bold text-xl mb-2 text-foreground">استكشاف حر غير خطي</h3>
          <p className="text-sm text-muted-foreground">التنقل غير مقيد بقوائم تقليدية؛ يمكنك الانتقال بين العوالم والقصص بنقرة واحدة.</p>
        </div>
      </div>

      <DiscoveryEngine />
    </div>
  );
}
