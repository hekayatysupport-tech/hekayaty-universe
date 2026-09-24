import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Search, User, Globe, Moon, Sun, Menu, X, LogOut, Shield, Sparkles, ShoppingBag, Feather, Crown } from 'lucide-react';
import { useAppStore } from '@/store';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export function NavbarUniverse() {
  const [location, setLocation] = useLocation();
  const { toggleTheme, theme, toggleLanguage, language, setSearchOpen } = useAppStore();
  const { session, isAdmin, isSubscriber, roles } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isWriter = roles.some(r => ['writer', 'super_admin', 'administrator', 'publisher'].includes(r));

  const navLinks = [
    { href: '/universe', label: 'Atlas' },
    { href: '/writers', label: 'Writers' },
    { href: '/novels', label: 'Novels' },
    { href: '/comics', label: 'Comics' },
    { href: '/stories', label: 'Stories' },
    { href: '/characters', label: 'Characters' },
    { href: '/worlds', label: 'Worlds' },
    { href: '/timeline', label: 'Timeline' },
    { href: '/store', label: 'Store' },
    { href: '/community', label: 'Community' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-primary/20 shadow-2xl transition-colors duration-500 py-2 safe-pt">
        <div className="w-full px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between h-14 items-center gap-2 sm:gap-4">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <Link href="/" className="font-serif text-lg sm:text-2xl font-black tracking-wider cursor-pointer flex items-center gap-1.5 group touch-target">
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(212,175,55,0.6)] transition-all duration-300 group-hover:brightness-125">
                  HEKAYATY
                </span>
                <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(212,175,55,0.4)] font-black transition-all duration-300 group-hover:brightness-125">
                  UNIVERSE
                </span>
              </Link>
            </div>

            {/* Desktop Nav - Clean Non-Overflowing Row */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[11px] font-bold tracking-wider uppercase transition-all whitespace-nowrap hover:text-primary ${
                    location === link.href || (link.href !== '/' && location.startsWith(link.href))
                      ? 'text-primary border-b-2 border-primary pb-0.5'
                      : 'text-foreground/80'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {isSubscriber ? (
                <Link
                  href="/profile?tab=subscription"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-black rounded-full hover:brightness-110 shadow-lg shadow-amber-500/20 border border-amber-300/50 transition-all transform hover:scale-105"
                  title="Active VIP Subscriber"
                >
                  <Crown className="w-3.5 h-3.5 fill-black text-black" /> VIP SUBSCRIBER
                </Link>
              ) : (
                <Link
                  href="/membership"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-primary to-amber-300 text-black rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all transform hover:scale-105"
                >
                  <Sparkles className="w-3.5 h-3.5" /> VIP Access
                </Link>
              )}

              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-secondary/50 text-foreground/80 hover:text-primary transition-colors flex items-center justify-center"
                aria-label="Search Universe"
              >
                <Search className="w-5 h-5" />
              </button>

              <div className="hidden sm:flex items-center space-x-2 border-l border-border pl-3 ml-1">
                <button
                  onClick={toggleLanguage}
                  className="p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-secondary/50 text-foreground/80 hover:text-primary transition-colors flex items-center justify-center gap-1"
                >
                  <Globe className="w-4.5 h-4.5" />
                  <span className="text-xs uppercase font-bold">{language}</span>
                </button>
                
                <button
                  onClick={toggleTheme}
                  className="p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-secondary/50 text-foreground/80 hover:text-primary transition-colors flex items-center justify-center"
                >
                  {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                </button>
                
                {session ? (
                  <>
                    <Link href="/profile" className="p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-secondary/50 text-foreground/80 hover:text-primary transition-colors relative flex items-center justify-center" title="User Profile">
                      <User className="w-4.5 h-4.5" />
                      {isSubscriber && (
                        <span className="absolute top-1 right-1 bg-amber-400 text-black p-0.5 rounded-full border border-black shadow shadow-amber-400/50">
                          <Crown className="w-2.5 h-2.5 fill-black text-black" />
                        </span>
                      )}
                    </Link>
                    {isWriter && (
                      <Link href="/writer/studio" className="p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-secondary/50 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center" title="Writer Studio (ركن الكاتب)">
                        <Feather className="w-4.5 h-4.5" />
                      </Link>
                    )}
                    {isAdmin && (
                      <Link href="/admin" className="p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-secondary/50 text-primary hover:text-primary/80 transition-colors flex items-center justify-center" title="Admin Dashboard">
                        <Shield className="w-4.5 h-4.5" />
                      </Link>
                    )}
                    <button onClick={handleLogout} className="p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-secondary/50 text-destructive hover:text-destructive/80 transition-colors flex items-center justify-center">
                      <LogOut className="w-4.5 h-4.5" />
                    </button>
                  </>
                ) : (
                  <Link href="/auth" className="px-4 py-2 min-h-[44px] text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors flex items-center">
                    Sign In
                  </Link>
                )}
              </div>

              <button
                className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-secondary/50 text-foreground/80 flex items-center justify-center"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open Mobile Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-background/98 backdrop-blur-2xl flex flex-col p-6 overflow-y-auto safe-pt safe-pb"
          >
            <div className="flex justify-between items-center mb-6 pt-2">
              <div className="font-serif text-xl sm:text-2xl font-black tracking-wider flex items-center gap-2">
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(212,175,55,0.6)]">HEKAYATY</span>
                <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(212,175,55,0.4)]">UNIVERSE</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2.5 min-w-[44px] min-h-[44px] rounded-full hover:bg-secondary/50 text-foreground flex items-center justify-center">
                <X className="w-7 h-7" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3.5 min-h-[48px] rounded-xl border text-sm font-serif font-bold transition-all flex items-center justify-center text-center ${
                    location === link.href || (link.href !== '/' && location.startsWith(link.href))
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-card/70 border-border text-foreground hover:border-primary/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-6 border-t border-border flex flex-col space-y-4">
              {isSubscriber ? (
                <Link href="/profile?tab=subscription" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 min-h-[48px] bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-black font-black text-center uppercase tracking-wider text-sm rounded-xl shadow-lg flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4 fill-black text-black" /> VIP SUBSCRIBER PROFILE
                </Link>
              ) : (
                <Link href="/membership" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 min-h-[48px] bg-gradient-to-r from-amber-500 via-primary to-amber-300 text-black font-black text-center uppercase tracking-wider text-sm rounded-xl shadow-lg flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> VIP Membership Access
                </Link>
              )}

              {session ? (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="p-3 min-h-[44px] bg-secondary/50 rounded-xl text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  {isWriter && (
                    <Link href="/writer/studio" onClick={() => setMobileMenuOpen(false)} className="p-3 min-h-[44px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                      <Feather className="w-4 h-4" /> Studio
                    </Link>
                  )}
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="p-3 min-h-[44px] bg-primary/10 border border-primary/30 text-primary rounded-xl text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 col-span-2">
                      <Shield className="w-4 h-4" /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="p-3 min-h-[44px] bg-destructive/10 text-destructive rounded-xl text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 col-span-2">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 pt-2">
                  <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="w-full py-3.5 min-h-[48px] bg-primary text-black text-center font-bold uppercase tracking-wider text-xs rounded-xl">
                    Sign In / Register
                  </Link>
                </div>
              )}

              <div className="flex justify-around pt-4 border-t border-border/40">
                <button onClick={toggleLanguage} className="flex items-center gap-2 text-foreground/80 text-xs font-bold min-h-[44px] px-3">
                  <Globe className="w-4 h-4" /> {language === 'ar' ? 'English' : 'العربية'}
                </button>
                <button onClick={toggleTheme} className="flex items-center gap-2 text-foreground/80 text-xs font-bold min-h-[44px] px-3">
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} Theme
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
