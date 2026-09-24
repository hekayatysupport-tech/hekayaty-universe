import React, { useEffect, useState } from 'react';
import { 
  User, Library, Settings, LogOut, Mail, BookOpen, Heart, Loader2, Shield, Camera,
  Crown, Sparkles, CheckCircle2, Clock, AlertCircle, ArrowRight, Zap, Trophy,
  Bookmark, Edit3, Flame, Layers, ChevronRight, Check, Trash2, X, Lock, Compass
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type Tab = 'overview' | 'library' | 'favorites' | 'subscription' | 'settings';

interface UserProfile {
  username: string | null;
  display_name: string | null;
}

interface Stats {
  novelsRead: number;
  comicsRead: number;
  favoriteCharacters: number;
  cardsCollected: number;
}

export function Profile() {
  const { user, session, isLoading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<Stats>({ novelsRead: 0, comicsRead: 0, favoriteCharacters: 0, cardsCollected: 0 });
  const [profileLoading, setProfileLoading] = useState(true);
  
  // Subscription state
  const [subData, setSubData] = useState<any>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

  // Library & Reading progress state
  const [userLibrary, setUserLibrary] = useState<any[]>([]);
  const [readingProgress, setReadingProgress] = useState<any[]>([]);
  
  // Favorite characters & cards state
  const [favCharacters, setFavCharacters] = useState<any[]>([]);
  const [userCards, setUserCards] = useState<any[]>([]);

  // Profile Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [, setSaveSuccess] = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !session) {
      setLocation('/auth');
    }
  }, [isLoading, session, setLocation]);

  // Fetch PURE REAL DATA from Supabase and API endpoints
  useEffect(() => {
    if (!user || !session) return;

    const loadAllProfileData = async () => {
      setProfileLoading(true);

      // 1. Fetch Subscription Data
      try {
        const subRes = await fetch('/api/account/subscription', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (subRes.ok) {
          const subJson = await subRes.json();
          setSubData(subJson);
        }
      } catch (err) {
        console.warn('Subscription fetch error:', err);
      }

      // 2. Fetch User Profile
      try {
        const { data: prof } = await supabase
          .from('user_profiles')
          .select('username, display_name')
          .eq('id', user.id)
          .maybeSingle();

        if (prof) {
          setProfile(prof);
          setEditDisplayName(prof.display_name || '');
          setEditUsername(prof.username || '');
        } else {
          const defaultName = user.email?.split('@')[0] || 'Explorer';
          setProfile({ username: defaultName, display_name: defaultName });
          setEditDisplayName(defaultName);
          setEditUsername(defaultName);
        }
      } catch (err) {
        console.warn('Profile fetch error:', err);
      }

      // 3. Fetch Library & Reading Progress (Real user items)
      let realProgress: any[] = [];
      let realLibrary: any[] = [];
      try {
        const libRes = await fetch('/api/library', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (libRes.ok) {
          const libJson = await libRes.json();
          realLibrary = libJson.library || [];
          realProgress = libJson.readingProgress || [];
          setUserLibrary(realLibrary);
          setReadingProgress(realProgress);
        }
      } catch (err) {
        console.warn('Library fetch error:', err);
      }

      // 4. Fetch Favorite Characters (Pure Real Data from database)
      let realFavs: any[] = [];
      try {
        const { data: favs } = await supabase
          .from('user_favorite_characters')
          .select('id, character_id, character:character_id ( id, name, arabic_name, alias, alignment, short_bio, portrait_media_id, media:portrait_media_id ( secure_url ) )')
          .eq('user_id', user.id);

        if (favs && favs.length > 0) {
          realFavs = favs.map((f: any) => f.character).filter(Boolean);
          setFavCharacters(realFavs);
        } else {
          setFavCharacters([]);
        }
      } catch (err) {
        setFavCharacters([]);
      }

      // 5. Fetch User Collected Cards (Pure Real Data from database)
      let realCards: any[] = [];
      try {
        const { data: uCards } = await supabase
          .from('user_cards')
          .select('id, card_id, acquired_at')
          .eq('user_id', user.id);

        if (uCards && uCards.length > 0) {
          const cardsRes = await fetch('/api/cards');
          if (cardsRes.ok) {
            const allApiCards = await cardsRes.json();
            realCards = uCards.map((uc: any) => {
              const match = allApiCards.find((c: any) => c.id === uc.card_id);
              return match ? { ...match, acquiredAt: uc.acquired_at } : null;
            }).filter(Boolean);
            setUserCards(realCards);
          }
        } else {
          setUserCards([]);
        }
      } catch (err) {
        setUserCards([]);
      }

      // 6. Real Aggregate Stats Counters
      setStats({
        novelsRead: realLibrary.length,
        comicsRead: realProgress.length,
        favoriteCharacters: realFavs.length,
        cardsCollected: realCards.length,
      });

      setProfileLoading(false);
    };

    loadAllProfileData();
  }, [user, session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setLocation('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          display_name: editDisplayName.trim(),
          username: editUsername.trim().toLowerCase().replace(/\s+/g, '_'),
          updated_at: new Date().toISOString(),
        });

      if (!error) {
        setProfile({
          display_name: editDisplayName.trim(),
          username: editUsername.trim(),
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        setIsEditingProfile(false);
      }
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const displayName = profile?.display_name || profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Explorer';
  const usernameTag = profile?.username ? `@${profile.username}` : `@${user?.email?.split('@')[0]}`;
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'September 2026';
  
  const hasActiveSub = subData?.hasSubscription;
  const sub = subData?.subscription;
  const isVipActive = Boolean(hasActiveSub && sub && sub.status === 'active' && new Date(sub.expires_at) > new Date());
  const pendingPayment = subData?.pendingPayment;
  const paymentHistory = subData?.paymentHistory || [];

  const handleRemoveFromLibrary = async (itemId: string) => {
    if (!itemId || !session?.access_token) return;
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        // Send itemId so backend toggles/removes using TEXT column
        body: JSON.stringify({ itemId }),
      });
      if (res.ok) {
        setUserLibrary(prev => prev.filter(item => (item.itemId || item.original?.id) !== itemId));
        toast.info('تمت إزالة العنصر من مكتبتك الخاصة');
      }
    } catch (err) {
      toast.error('تعذر إزالة العنصر من المكتبة');
    }
  };

  if (isLoading || !session || profileLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 pt-16 sm:pt-20">

      {/* Hero Profile Banner Header */}
      <div className="relative border-b border-border/60 bg-gradient-to-b from-amber-500/10 via-card/80 to-background overflow-hidden">
        {/* Subtle Cosmic Background Glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10 sm:pt-14 sm:pb-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 sm:gap-8">

            {/* User Info & Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
              {/* Avatar Container with VIP Glow Frame */}
              <div className="relative group shrink-0">
                <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 bg-gradient-to-br from-card to-secondary flex items-center justify-center shadow-2xl relative ${
                  hasActiveSub ? 'border-primary ring-4 ring-primary/20 shadow-primary/30' : 'border-border'
                }`}>
                  <User className="w-16 h-16 text-muted-foreground group-hover:scale-105 transition-transform" />
                  
                  {/* VIP Crown Overlay */}
                  {hasActiveSub && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black p-1.5 rounded-lg shadow-lg">
                      <Crown className="w-4 h-4" />
                    </div>
                  )}

                  {/* Change Avatar Overlay */}
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-primary" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Edit</span>
                  </button>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">{displayName}</h1>
                  
                  {/* VIP Badge / Status Pill */}
                  {hasActiveSub ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-primary/20 border border-primary/50 text-amber-300 shadow-sm shadow-primary/20">
                      <Crown className="w-3.5 h-3.5 text-amber-400" /> VIP Access
                    </span>
                  ) : pendingPayment ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/40 text-amber-400">
                      <Clock className="w-3.5 h-3.5 animate-spin" /> Pending Approval
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-secondary/80 border border-border text-muted-foreground">
                      <Compass className="w-3.5 h-3.5" /> Explorer Tier
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs sm:text-sm text-muted-foreground pt-0.5">
                  <span className="font-mono text-amber-400 font-semibold">{usernameTag}</span>
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-foreground/90 font-medium">{user?.email}</span>
                </div>

                <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Member of Hekayaty Universe since {memberSince}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2.5 bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold uppercase tracking-wider rounded-xl border border-border transition-all flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4 text-primary" /> Edit Profile
              </button>

              {!hasActiveSub && (
                <Link
                  href="/subscription"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-primary text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:brightness-110 shadow-lg shadow-primary/25 transition-all flex items-center gap-1.5"
                >
                  <Crown className="w-4 h-4" /> Upgrade to VIP
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">

        {/* Highlight Stats Counter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-card/70 border border-border/80 rounded-2xl p-5 hover:border-primary/50 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-white">{stats.comicsRead}</div>
              <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Chapters Read</div>
            </div>
          </div>

          <div className="bg-card/70 border border-border/80 rounded-2xl p-5 hover:border-amber-500/50 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-300 capitalize">
                {hasActiveSub ? (sub?.planType || 'VIP Pass') : 'Free Reader'}
              </div>
              <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                {hasActiveSub ? `${sub?.daysRemaining || 0} Days Left` : 'No Active Sub'}
              </div>
            </div>
          </div>

          <div className="bg-card/70 border border-border/80 rounded-2xl p-5 hover:border-rose-500/50 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-white">{stats.favoriteCharacters}</div>
              <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Favorite Lore</div>
            </div>
          </div>

          <div className="bg-card/70 border border-border/80 rounded-2xl p-5 hover:border-purple-500/50 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-white">{stats.cardsCollected}</div>
              <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Cards Collected</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="border-b border-border flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setTab('overview')}
            className={`px-5 py-3 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              tab === 'overview'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/60'
            }`}
          >
            <Zap className="w-4 h-4" /> Overview & Reading
          </button>
          
          <button
            onClick={() => setTab('library')}
            className={`px-5 py-3 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              tab === 'library'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/60'
            }`}
          >
            <Library className="w-4 h-4" /> Library & Novels ({userLibrary.length})
          </button>

          <button
            onClick={() => setTab('favorites')}
            className={`px-5 py-3 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              tab === 'favorites'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/60'
            }`}
          >
            <Trophy className="w-4 h-4" /> Favorites & Cards ({favCharacters.length})
          </button>

          <button
            onClick={() => setTab('subscription')}
            className={`px-5 py-3 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              tab === 'subscription'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/60'
            }`}
          >
            <Crown className="w-4 h-4" /> VIP Subscription
          </button>

          <button
            onClick={() => setTab('settings')}
            className={`px-5 py-3 font-bold uppercase tracking-wider text-xs rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              tab === 'settings'
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border/60'
            }`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>

          {isAdmin && (
            <button
              onClick={() => setLocation('/admin')}
              className="ml-auto px-4 py-3 font-bold uppercase tracking-wider text-xs text-primary border border-primary/40 bg-primary/10 rounded-xl hover:bg-primary/20 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Shield className="w-4 h-4" /> Admin Console
            </button>
          )}
        </div>

        {/* TAB CONTENT PANELS */}

        {/* 1. OVERVIEW TAB */}
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* VIP Access Status Banner Card */}
            <div className="bg-gradient-to-r from-card via-amber-950/20 to-card border border-amber-500/30 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] pointer-events-none rounded-full" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Crown className="w-6 h-6 text-amber-400" />
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">Hekayaty Originals VIP Membership</h2>
                  </div>

                  {hasActiveSub ? (
                    <div className="space-y-3">
                      <p className="text-sm text-emerald-300 flex items-center gap-2 font-medium">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" /> Active Membership: <span className="font-bold text-white capitalize">{sub.planType}</span> ({sub.amountEgp} EGP)
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/80 border border-border text-muted-foreground">
                          Started: <strong className="text-white font-mono">{new Date(sub.startsAt).toLocaleDateString()}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/80 border border-border text-muted-foreground">
                          Expires: <strong className="text-white font-mono">{new Date(sub.expiresAt).toLocaleDateString()}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> {sub.daysRemaining} Days Remaining
                        </span>
                      </div>
                    </div>
                  ) : pendingPayment ? (
                    <p className="text-sm text-amber-300 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 animate-spin" /> Pending InstaPay Transaction <span className="font-mono font-bold text-white">({pendingPayment.transactionRef})</span> under admin verification.
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Unlock unlimited access to all exclusive Hekayaty Originals novels, comics, early chapter releases, and subscriber-only artwork.
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <Link
                    href="/subscription"
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-primary text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
                  >
                    {hasActiveSub ? 'Manage / Renew VIP' : 'Subscribe Now (InstaPay)'} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Reading Progress / Continue Reading */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" /> Continue Reading
                </h3>
                <Link href="/novels" className="text-xs font-bold uppercase text-primary hover:underline flex items-center gap-1">
                  Explore Novels <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {readingProgress.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {readingProgress.map((item) => (
                    <div key={item.id} className="bg-card border border-border/80 rounded-2xl overflow-hidden hover:border-primary/60 transition-all group flex flex-col justify-between">
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary/10 border border-primary/30 text-primary rounded-md">
                              Novel Chapter {item.chapter?.chapterNumber || 1}
                            </span>
                            <h4 className="font-serif font-bold text-lg text-white group-hover:text-primary transition-colors mt-2">
                              {item.original?.title || 'Hekayaty Novel'}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {item.chapter?.title || 'Chapter Reading Session'}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono text-muted-foreground">
                            <span>Progress</span>
                            <span className="text-primary font-bold">{item.progressPercentage || 0}%</span>
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-primary rounded-full transition-all duration-500" style={{ width: `${item.progressPercentage || 0}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-secondary/30 border-t border-border flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Recently read'}
                        </span>
                        <Link
                          href={`/novel/${item.original?.slug || 'shadow-over-al-qahira'}/chapter/${item.chapter?.id || 'ch-1'}`}
                          className="px-4 py-1.5 bg-primary text-black font-bold uppercase tracking-wider text-xs rounded-lg hover:brightness-110 transition-all flex items-center gap-1"
                        >
                          Resume <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Clean Pure Empty State */
                <div className="bg-card border border-border/80 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="font-serif font-bold text-lg text-white">No Reading Progress Yet</h4>
                    <p className="text-xs text-muted-foreground">
                      Start reading Hekayaty Originals novel chapters or comic issues to automatically track your reading session progress right here!
                    </p>
                  </div>
                  <Link
                    href="/novels"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                  >
                    Explore Hekayaty Novels <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            {/* Favorite Characters Spotlight */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" /> Favorite Characters
                </h3>
                <Link href="/characters" className="text-xs font-bold uppercase text-primary hover:underline flex items-center gap-1">
                  View All Characters <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {favCharacters.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {favCharacters.map((char) => (
                    <Link key={char.id} href={`/characters/${char.id}`}>
                      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden group hover:border-primary transition-all cursor-pointer">
                        <div className="aspect-[3/4] relative overflow-hidden bg-secondary">
                          {char.media?.secure_url ? (
                            <img 
                              src={char.media.secure_url} 
                              alt={char.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground font-serif">
                              {char.name}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          
                          <div className="absolute bottom-3 left-3 right-3 text-left">
                            <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 bg-black/60 backdrop-blur rounded border border-white/20 text-amber-300">
                              {char.alignment || 'Character'}
                            </span>
                            <h4 className="font-serif font-bold text-base text-white mt-1 group-hover:text-primary transition-colors">
                              {char.name}
                            </h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{char.alias || char.arabic_name}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border/80 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                    <Heart className="w-7 h-7" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="font-serif font-bold text-lg text-white">No Favorite Characters Added</h4>
                    <p className="text-xs text-muted-foreground">
                      Explore Hekayaty Universe character lore and click ❤️ to add your favorite heroes and villains to your profile!
                    </p>
                  </div>
                  <Link
                    href="/characters"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-secondary text-foreground hover:bg-secondary/80 font-bold uppercase tracking-wider text-xs rounded-xl border border-border transition-all"
                  >
                    Browse Character Universe <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* 2. LIBRARY & NOVELS TAB */}
        {tab === 'library' && (
          <motion.div key="library" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" /> مكتبتي الشخصية
                </h3>
                <p className="text-xs text-muted-foreground mt-1">الروايات والقصص المصورة التي حفظتها للقراءة</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/novels"
                  className="px-4 py-2 bg-primary/10 text-primary border border-primary/30 font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-primary hover:text-black transition-all flex items-center gap-1.5"
                >
                  روايات
                </Link>
                <Link
                  href="/comics"
                  className="px-4 py-2 bg-primary/10 text-primary border border-primary/30 font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-primary hover:text-black transition-all flex items-center gap-1.5"
                >
                  كوميكس
                </Link>
              </div>
            </div>

            {userLibrary.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" dir="rtl">
                {userLibrary.map((item) => {
                  // Support both new (itemId/itemType) and legacy (original) shape
                  const resolvedType = item.itemType || (item.original?.contentType) || 'novel';
                  const resolvedId   = item.itemId || item.original?.id;
                  const resolvedSlug = item.original?.slug || resolvedId;
                  const isNovel = resolvedType === 'novel';
                  const isSubscriberOnly = item.original?.accessLevel === 'subscriber';
                  const coverUrl = item.original?.coverUrl || null;
                  const titleText = item.original?.arabicTitle || item.original?.title || (isNovel ? 'رواية' : 'قصة مصورة');
                  const itemUrl = isNovel
                    ? `/novels/${resolvedSlug}`
                    : `/comics/${resolvedId}`;

                  return (
                    <div
                      key={item.id}
                      className="group relative flex flex-col rounded-2xl overflow-hidden border border-[#2a2a34] hover:border-primary/60 transition-all duration-300 shadow-lg hover:shadow-primary/20 hover:shadow-xl hover:-translate-y-1"
                    >
                      {/* Cover Poster */}
                      <div className="relative aspect-[2/3] bg-[#0e0e14] overflow-hidden">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={titleText}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#1a1a2a] to-[#0d0d18]">
                            <BookOpen className="w-10 h-10 text-primary/40" />
                            <span className="text-xs text-[#555] font-mono px-3 text-center line-clamp-2">{titleText}</span>
                          </div>
                        )}

                        {/* Gradient overlay at bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        {/* Badges */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary text-black shadow">
                            {isNovel ? 'رواية' : 'كوميكس'}
                          </span>
                          {isSubscriberOnly && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-black shadow flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> VIP
                            </span>
                          )}
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={(e) => { e.preventDefault(); handleRemoveFromLibrary(resolvedId); }}
                          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/40 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                          title="إزالة من المكتبة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Title overlay at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h4 className="font-serif font-bold text-sm text-white leading-snug line-clamp-2 text-right">
                            {titleText}
                          </h4>
                          {isSubscriberOnly && (
                            <div className={`mt-1 text-[10px] font-bold ${ isVipActive ? 'text-emerald-400' : 'text-amber-400' }`}>
                              {isVipActive ? '✓ مفعّل' : '⚠ اشتراك منتهي'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action button below cover */}
                      <div className="bg-[#0d0d14] border-t border-[#1e1e28] p-2.5">
                        {isSubscriberOnly && !isVipActive ? (
                          <button
                            onClick={() => setShowExpiredModal(true)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition-all"
                          >
                            <Lock className="w-3.5 h-3.5" /> جدّد اشتراكك
                          </button>
                        ) : (
                          <Link
                            href={itemUrl}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-black text-xs font-black hover:brightness-110 transition-all shadow shadow-primary/30 active:scale-95"
                          >
                            <BookOpen className="w-3.5 h-3.5" /> اقرأ الآن
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 space-y-5 bg-[#0a0a10] border border-[#1e1e28] rounded-2xl">
                <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Bookmark className="w-10 h-10 text-primary/50" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-xl text-white">مكتبتك فارغة</h4>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    ابدأ باستكشاف روايات وقصص حكايتي، واحفظ ما يعجبك لتقرأه لاحقاً
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Link
                    href="/novels"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20"
                  >
                    <BookOpen className="w-4 h-4" /> استعرض الروايات
                  </Link>
                  <Link
                    href="/comics"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-white/10 transition-all"
                  >
                    استعرض الكوميكس
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 3. FAVORITES & TCG CARDS TAB */}
        {tab === 'favorites' && (
          <motion.div key="favorites" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            
            {/* TCG Trading Cards Showcase */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" /> My TCG Trading Card Collection
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Collect mythical character cards, lore artifacts, and cosmic spells across the Hekayaty Universe.</p>
                </div>
                <Link
                  href="/tcg"
                  className="px-4 py-2 bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-purple-500/30 transition-all flex items-center gap-1.5"
                >
                  TCG Deck Arena <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {userCards.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {userCards.map((card) => {
                    const rarity = card.rarity || 'Common';
                    const power = (card.attack || 0) + (card.magic || 0);

                    return (
                      <motion.div
                        key={card.id}
                        whileHover={{ scale: 1.05, y: -6 }}
                        className={`relative aspect-[2.5/3.5] border-2 rounded-xl overflow-hidden cursor-pointer shadow-xl transition-all ${
                          rarity === 'Mythic' ? 'border-amber-400 shadow-amber-500/30 ring-2 ring-amber-400/50' :
                          rarity === 'Legendary' ? 'border-yellow-500 shadow-yellow-500/20' :
                          rarity === 'Epic' ? 'border-purple-500 shadow-purple-500/20' :
                          'border-blue-500 shadow-blue-500/20'
                        }`}
                      >
                        {card.imageUrl ? (
                          <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center font-serif text-xs text-muted-foreground">
                            {card.name}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                        {/* Card Power Badge */}
                        <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/80 border-2 border-primary flex items-center justify-center font-serif font-bold text-xs text-white z-10">
                          {power}
                        </div>

                        <div className="absolute bottom-0 left-0 w-full p-3 text-center z-10 space-y-1">
                          <h4 className="font-serif font-bold text-xs text-white leading-tight">{card.name}</h4>
                          <div className="text-[9px] text-amber-300 font-bold uppercase tracking-widest bg-black/70 backdrop-blur rounded py-0.5 border border-amber-500/40">
                            {rarity} • {card.cardCode || 'HEK-001'}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto text-purple-400">
                    <Layers className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h4 className="font-serif font-bold text-lg text-white">No Trading Cards Collected Yet</h4>
                    <p className="text-xs text-muted-foreground">
                      Battle in the Hekayaty TCG Arena or unlock lore achievements to collect rare trading cards for your personal deck!
                    </p>
                  </div>
                  <Link
                    href="/tcg"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-purple-500/30 transition-all shadow-lg shadow-purple-500/10"
                  >
                    Open TCG Arena <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* 4. SUBSCRIPTION TAB */}
        {tab === 'subscription' && (
          <motion.div key="subscription" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-border pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                    <Crown className="w-6 h-6 text-amber-400" /> Hekayaty VIP Membership & InstaPay Billing
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Review your active subscription plan, expiration dates, and payment transaction receipts.</p>
                </div>

                <Link
                  href="/checkout"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-primary text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg shadow-primary/20"
                >
                  <Crown className="w-4 h-4" /> {hasActiveSub ? 'Renew Subscription' : 'Subscribe via InstaPay'}
                </Link>
              </div>

              {/* Status Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-secondary/40 border border-border rounded-xl p-5 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold">Membership Tier</span>
                  <div className="text-lg font-serif font-bold text-primary capitalize">
                    {hasActiveSub ? (sub?.planType || 'VIP Monthly Pass') : 'Free Reader Tier'}
                  </div>
                </div>

                <div className="bg-secondary/40 border border-border rounded-xl p-5 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold">Status</span>
                  <div className="text-lg font-serif font-bold text-emerald-400 flex items-center gap-1.5">
                    {hasActiveSub ? (
                      <><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Active</>
                    ) : pendingPayment ? (
                      <><Clock className="w-5 h-5 text-amber-400 animate-spin" /> Pending Approval</>
                    ) : (
                      <><AlertCircle className="w-5 h-5 text-muted-foreground" /> Inactive</>
                    )}
                  </div>
                </div>

                <div className="bg-secondary/40 border border-border rounded-xl p-5 space-y-1">
                  <span className="text-xs text-muted-foreground uppercase font-bold">Expiration Date</span>
                  <div className="text-lg font-serif font-bold text-white">
                    {hasActiveSub && sub?.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* InstaPay Payment Ledger */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h4 className="text-base font-serif font-bold text-white">InstaPay Transaction Receipts</h4>
                
                {paymentHistory.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-6 text-center bg-secondary/20 rounded-xl border border-border/50">
                    No payment receipts found. When you subscribe via InstaPay, your verified receipts will appear here.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-secondary/60 text-muted-foreground uppercase font-bold border-b border-border">
                        <tr>
                          <th className="p-3">Reference ID</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {paymentHistory.map((h: any) => (
                          <tr key={h.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="p-3 font-mono font-bold text-foreground">{h.transactionRef}</td>
                            <td className="p-3 font-bold">{h.amountEgp} EGP</td>
                            <td className="p-3 uppercase">{h.paymentMethod}</td>
                            <td className="p-3 font-bold">
                              <span className={`px-2.5 py-1 rounded text-[10px] uppercase tracking-wider ${
                                h.status === 'verified' || h.status === 'successful'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : h.status === 'pending_verification'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-destructive/20 text-destructive border border-destructive/40'
                              }`}>
                                {h.status}
                              </span>
                            </td>
                            <td className="p-3 text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* 5. SETTINGS TAB */}
        {tab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
              <h3 className="text-xl font-serif font-bold text-white border-b border-border pb-4">Account Security & Settings</h3>

              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-1">Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 bg-secondary/40 border border-border rounded-xl text-muted-foreground font-mono text-xs cursor-not-allowed"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Your registered email address cannot be changed directly.</p>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-2">Password Reset</label>
                  <button
                    onClick={async () => {
                      if (!user?.email) return;
                      const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/auth` });
                      if (!error) alert('Password reset link sent to your registered email!');
                    }}
                    className="px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-border"
                  >
                    Send Password Reset Link
                  </button>
                </div>

                <div className="pt-6 border-t border-border">
                  <label className="text-xs text-destructive font-bold uppercase tracking-wider block mb-2">Sign Out Session</label>
                  <button
                    onClick={handleSignOut}
                    className="px-5 py-2.5 bg-destructive/10 text-destructive border border-destructive/30 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-destructive/20 transition-all flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out of Hekayaty Universe
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-primary" /> Edit Profile Details
                </h3>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="text-muted-foreground hover:text-white transition-colors text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none"
                    placeholder="Enter display name"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-foreground text-sm focus:border-primary focus:outline-none font-mono"
                    placeholder="e.g. explorer_hero"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 bg-secondary text-foreground text-xs font-bold uppercase rounded-xl hover:bg-secondary/80"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-5 py-2 bg-primary text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:brightness-110 flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Expired Subscription Warning Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#0e0e14] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 text-center shadow-2xl relative ornate-border-corners"
          >
            <button
              onClick={() => setShowExpiredModal(false)}
              className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-serif font-black text-white">انتهت فترة اشتراكك المميز VIP</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                المحتوى المميز في مكتبتك أصبح مغلقاً لأن اشتراكك انتهى. يرجى تجديد الاشتراك لمتابعة قراءة الفصول والكوميكس الحصرية دون انقطاع.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <Link
                href="/subscription"
                onClick={() => setShowExpiredModal(false)}
                className="block w-full py-3.5 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 text-black font-serif font-bold text-xs uppercase rounded-xl hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all text-center"
              >
                تجديد / تفعيل اشتراك VIP 💳
              </Link>
              <button
                onClick={() => setShowExpiredModal(false)}
                className="w-full py-2.5 bg-secondary text-muted-foreground hover:text-white text-xs font-bold rounded-xl transition-colors"
              >
                إغلاق النافذة
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
