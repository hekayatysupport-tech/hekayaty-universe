import React from 'react';
import { Link } from 'wouter';
import { Crown, Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export function SubscriptionSection() {
  const plans = [
    {
      type: 'monthly',
      name: 'Monthly',
      arabicName: 'شهري',
      price: 59,
      period: '/ month',
      arabicPeriod: 'شهرياً',
      description: 'Full access to all Hekayaty Originals stories and exclusive comic issues.',
      arabicDescription: 'وصول كامل لكافة قصص وأصدارات حكاياتي أوريجينالز الحصرية.',
      features: [
        'Full access to all story chapters',
        'Exclusive comic series & issues',
        'Reading progress & library sync',
      ],
      isPopular: false,
    },
    {
      type: 'quarterly',
      name: '3 Months',
      arabicName: '3 أشهر',
      price: 139,
      period: '/ 3 months',
      arabicPeriod: 'كل 3 أشهر',
      description: 'Great value for 3 full months of unlimited universe access.',
      arabicDescription: 'توفير ممتاز لمدة 3 أشهر كاملة لقراءة غير محدودة.',
      features: [
        '3 months full access to stories & comics',
        'Early access content releases',
        'Exclusive member badges & library',
      ],
      isPopular: false,
    },
    {
      type: 'yearly',
      name: 'Yearly',
      arabicName: 'سنوي',
      price: 499,
      period: '/ year (~41 EGP/mo)',
      arabicPeriod: 'سنوياً (~41 ج.م/شهر)',
      description: 'Best Value — Save over 30% compared to monthly billing.',
      arabicDescription: 'أفضل قيمة — ووّفر أكثر من 30% مقارنة بالاشتراك الشهري.',
      features: [
        'Unlimited access for 1 full year',
        'Save over 30% off monthly price',
        'All exclusive comics, stories & lore',
        'Priority access & early releases',
      ],
      isPopular: true,
      badge: 'Best Value · أفضل قيمة',
    },
  ];

  return (
    <div className="border-b border-border/60 pb-16 pt-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/40 text-xs font-bold uppercase tracking-wider">
          <Crown className="w-4 h-4" /> Hekayaty Membership Plans · خطط الاشتراك
        </div>
        <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-foreground tracking-tight text-glow">
          Join Hekayaty Originals
        </h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Choose the membership plan that fits you best and unlock unlimited access to exclusive stories, webtoons, and universe lore.
        </p>
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.type}
            className={`relative bg-card/90 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border transition-all flex flex-col justify-between shadow-2xl hover:border-primary/50 ${
              plan.isPopular
                ? 'border-primary ring-2 ring-primary/50 shadow-primary/20 bg-gradient-to-b from-card via-card to-primary/10'
                : 'border-border/80'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 via-primary to-amber-300 text-black font-black text-[11px] uppercase tracking-wider rounded-full shadow-lg whitespace-nowrap">
                ★ {plan.badge} ★
              </div>
            )}

            <div className="space-y-5">
              <div className="border-b border-border/60 pb-4">
                <h3 className="text-2xl font-serif font-bold text-foreground flex items-center justify-between">
                  <span>{plan.arabicName}</span>
                  <span className="text-xs font-sans font-semibold text-muted-foreground uppercase">{plan.name}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{plan.arabicDescription}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-foreground tracking-tight">{plan.price}</span>
                  <span className="text-lg font-bold text-primary">EGP</span>
                  <span className="text-xs text-muted-foreground">{plan.arabicPeriod}</span>
                </div>
              </div>

              <ul className="space-y-2.5 pt-2 text-xs text-foreground/90 font-medium">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 mt-4 border-t border-border/40">
              <Link
                href={`/checkout?plan=${plan.type}`}
                className={`w-full py-3 px-5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 shadow-md ${
                  plan.isPopular
                    ? 'bg-gradient-to-r from-amber-500 via-primary to-amber-300 text-black hover:brightness-110 shadow-primary/30 transform hover:scale-[1.02]'
                    : 'bg-primary text-black hover:bg-primary/90'
                }`}
              >
                <span>Subscribe ({plan.price} EGP)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Instant account activation via InstaPay & Online Payment.
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-12 sm:mt-20 safe-pb">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <SubscriptionSection />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mt-12">
          <div className="col-span-1 sm:col-span-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-primary mb-3 text-glow">HEKAYATY UNIVERSE</h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-sm leading-relaxed">
              The official digital hub for the largest Arabic superhero and fantasy franchise. Explore the lore, read the comics, and join the community.
            </p>
            <div className="mt-5 flex space-x-3">
               <div className="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:text-primary hover:border-primary cursor-pointer transition-colors text-xs font-bold">X</div>
               <div className="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:text-primary hover:border-primary cursor-pointer transition-colors text-xs font-bold">IG</div>
               <div className="w-11 h-11 rounded-full border border-border flex items-center justify-center hover:text-primary hover:border-primary cursor-pointer transition-colors text-xs font-bold">YT</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold uppercase tracking-widest text-xs sm:text-sm mb-4 text-foreground">Explore</h3>
            <ul className="space-y-2.5">
              <li><Link href="/comics" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-1 inline-block min-h-[44px] flex items-center">Comics Library</Link></li>
              <li><Link href="/characters" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-1 inline-block min-h-[44px] flex items-center">Characters</Link></li>
              <li><Link href="/worlds" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-1 inline-block min-h-[44px] flex items-center">Universe Atlas</Link></li>
              <li><Link href="/card-game" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-1 inline-block min-h-[44px] flex items-center">Card Game</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold uppercase tracking-widest text-xs sm:text-sm mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2.5">
              <li><a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-1 inline-block min-h-[44px] flex items-center">Terms of Service</a></li>
              <li><a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-1 inline-block min-h-[44px] flex items-center">Privacy Policy</a></li>
              <li><a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors py-1 inline-block min-h-[44px] flex items-center">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-muted-foreground">© 2026 Hekayaty Universe. All rights reserved.</p>
          <div className="text-xs sm:text-sm text-muted-foreground flex gap-4">
            <span>Made with magic in Egypt</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
