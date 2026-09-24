import React, { useState, useEffect } from 'react';
import { DiscoveryEngine } from '@/components/universe/DiscoveryEngine';
import { ShoppingBag, Star, ShieldCheck, Truck } from 'lucide-react';

export function StorePage() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/store/products')
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="mb-12 text-right" dir="rtl">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/40 text-primary text-xs font-bold uppercase tracking-widest bg-primary/5 rounded-full mb-3">
          <ShoppingBag className="w-3.5 h-3.5" /> متجر المقتنيات الرسمية
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-foreground mb-4">
          متجر حكاياتي الرسمي (STORE & MERCH)
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          اقتنِ النسخ المجلدة الفاخرة، حزم بطاقات التداول الفيزيائية، والمجسمات الرسمية الحصرية للأبطال.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((prod) => (
          <div key={prod.id} className="bg-card border border-border hover:border-primary/60 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between" dir="rtl">
            <div className="h-64 overflow-hidden relative bg-black/40">
              <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
              {prod.isExclusive && (
                <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-black font-black text-[10px] uppercase rounded-full">
                  إصدار حصري محدود
                </div>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center text-xs text-primary font-bold mb-2">
                  <span className="uppercase">{prod.category}</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-current text-amber-400" /> {prod.rating}</span>
                </div>
                <h3 className="font-serif font-bold text-xl text-foreground mb-2">{prod.arabicName}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{prod.arabicDescription}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="text-right">
                  <div className="text-2xl font-black font-serif text-primary">{prod.priceEgp} ج.م</div>
                  {prod.originalPriceEgp && (
                    <div className="text-xs text-muted-foreground line-through">{prod.originalPriceEgp} ج.م</div>
                  )}
                </div>
                <button className="px-5 py-2.5 bg-primary text-black font-bold text-xs uppercase rounded-xl hover:bg-primary/90 transition-all">
                  اطلب الآن
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DiscoveryEngine />
    </div>
  );
}
