import React from 'react';
import { Link, useLocation } from 'wouter';
import { Search, User, Globe, Moon, Sun, Menu, X, Bell } from 'lucide-react';
import { useAppStore } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [location] = useLocation();
  const { toggleTheme, theme, toggleLanguage, language, setSearchOpen } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { href: '/characters', label: 'Characters' },
    { href: '/worlds', label: 'Worlds' },
    { href: '/comics', label: 'Comics' },
    { href: '/timeline', label: 'Timeline' },
    { href: '/encyclopedia', label: 'Encyclopedia' },
    { href: '/news', label: 'News' },
    { href: '/card-game', label: 'TCG' },
    { href: '/community', label: 'Community' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="font-serif text-2xl font-bold tracking-wider text-primary text-glow cursor-pointer">
                HEKAYATY
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-6 lg:space-x-8 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                    location.startsWith(link.href) ? 'text-primary' : 'text-foreground/80'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full hover:bg-secondary/50 text-foreground/80 hover:text-primary transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <div className="hidden md:flex items-center space-x-2 border-l border-border pl-4 ml-2">
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
                <Link href="/profile" className="p-2 rounded-full hover:bg-secondary/50 text-foreground/80 hover:text-primary transition-colors">
                  <User className="w-4 h-4" />
                </Link>
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
              
              <div className="pt-8 mt-8 border-t border-border flex space-x-6">
                 <button onClick={toggleLanguage} className="flex items-center gap-2 text-foreground/80">
                   <Globe className="w-5 h-5" /> {language === 'ar' ? 'English' : 'العربية'}
                 </button>
                 <button onClick={toggleTheme} className="flex items-center gap-2 text-foreground/80">
                   {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} Theme
                 </button>
                 <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 text-foreground/80">
                   <User className="w-5 h-5" /> Profile
                 </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
