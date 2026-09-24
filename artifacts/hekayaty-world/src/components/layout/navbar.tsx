import React from 'react';
import { Link, useLocation } from 'wouter';
import { Search, User, Globe, Moon, Sun, Menu, X, LogOut, Shield } from 'lucide-react';
import { useAppStore } from '@/store';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { toggleTheme, theme, toggleLanguage, language, setSearchOpen } = useAppStore();
  const { session, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { href: '/characters', label: 'Characters' },
    { href: '/worlds', label: 'Worlds' },
    { href: '/comics', label: 'Comics' },
    { href: '/stories', label: 'Stories' },
    { href: '/timeline', label: 'Timeline' },
    { href: '/encyclopedia', label: 'Encyclopedia' },
    { href: '/news', label: 'News' },
    { href: '/card-game', label: 'TCG' },
    { href: '/community', label: 'Community' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation('/');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 transition-colors duration-500 py-3">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-3">
              <Link href="/" className="font-serif text-xl sm:text-2xl font-black tracking-wider cursor-pointer flex items-center gap-2 group">
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(212,175,55,0.6)] transition-all duration-300 group-hover:brightness-125">
                  HEKAYATY
                </span>
                <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(212,175,55,0.4)] font-black transition-all duration-300 group-hover:brightness-125">
                  UNIVERSE
                </span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-5 lg:space-x-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold tracking-wider uppercase transition-all hover:text-primary ${
                    location.startsWith(link.href)
                      ? 'text-primary font-bold'
                      : 'text-foreground/80'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <Link
                href="/subscription"
                className="hidden sm:inline-flex items-center px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-primary text-black rounded-md hover:brightness-110 shadow-lg shadow-primary/20 transition-all transform hover:scale-105"
              >
                Join Premium
              </Link>

              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full hover:bg-secondary/50 text-foreground/80 hover:text-primary transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              
              <div className="hidden md:flex items-center space-x-2 border-l border-border pl-3 ml-1">
                <button
                  onClick={toggleLanguage}
                  className="p-2 rounded-full hover:bg-secondary/50 text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold">{language}</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-secondary/50 text-foreground/80 hover:text-primary transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                
                {session ? (
                  <>
                    <Link href="/library" className="p-2 rounded-full hover:bg-secondary/50 text-foreground/80 hover:text-primary transition-colors" title="My Library">
                      <User className="w-4 h-4" />
                    </Link>
                    {isAdmin && (
                       <Link href="/admin" className="p-2 rounded-full hover:bg-secondary/50 text-primary hover:text-primary/80 transition-colors" title="Admin Dashboard">
                         <Shield className="w-4 h-4" />
                       </Link>
                    )}
                    <button onClick={handleLogout} className="p-2 rounded-full hover:bg-secondary/50 text-destructive hover:text-destructive/80 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center ml-2 space-x-2">
                    <Link href="/auth" className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors">
                      Sign In
                    </Link>
                  </div>
                )}
              </div>

              <button
                className="md:hidden p-2 rounded-full hover:bg-secondary/50 text-foreground/80"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-12">
              <div className="font-serif text-2xl font-bold text-primary text-glow">HEKAYATY</div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-secondary/50 text-foreground/80"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-serif tracking-widest text-foreground hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-8 mt-8 border-t border-border flex flex-col space-y-4">
                 <button onClick={toggleLanguage} className="flex items-center gap-2 text-foreground/80 w-fit">
                   <Globe className="w-5 h-5" /> {language === 'ar' ? 'English' : 'العربية'}
                 </button>
                 <button onClick={toggleTheme} className="flex items-center gap-2 text-foreground/80 w-fit">
                   {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} Theme
                 </button>
                 
                 {session ? (
                   <>
                     <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-foreground/80 w-fit">
                       <User className="w-5 h-5" /> Profile
                     </Link>
                     {isAdmin && (
                       <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-primary w-fit">
                         <Shield className="w-5 h-5" /> Admin Dashboard
                       </Link>
                     )}
                     <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 text-destructive w-fit">
                       <LogOut className="w-5 h-5" /> Logout
                     </button>
                   </>
                 ) : (
                   <div className="flex flex-col space-y-3 pt-4 border-t border-border/50">
                     <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="text-lg font-serif tracking-widest text-foreground hover:text-primary">
                       SIGN IN
                     </Link>
                     <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="text-lg font-serif tracking-widest text-primary hover:text-primary/80">
                       CREATE ACCOUNT
                     </Link>
                   </div>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
