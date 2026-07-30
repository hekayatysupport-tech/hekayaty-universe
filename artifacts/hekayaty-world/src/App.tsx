import React from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Home } from '@/pages/home';
import { Characters } from '@/pages/characters';
import { CharacterDetail } from '@/pages/character-detail';
import { Worlds } from '@/pages/worlds';
import { WorldDetail } from '@/pages/world-detail';
import { Comics } from '@/pages/comics';
import { ComicDetail } from '@/pages/comic-detail';
import { Timeline } from '@/pages/timeline';
import { News } from '@/pages/news';
import { NewsDetail } from '@/pages/news-detail';
import { Encyclopedia } from '@/pages/encyclopedia';
import { EncyclopediaEntry } from '@/pages/encyclopedia-entry';
import { Community } from '@/pages/community';
import { CardGame } from '@/pages/card-game';
import { Profile } from '@/pages/profile';

import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SearchOverlay } from '@/components/layout/search-overlay';
import { ThemeProvider } from '@/components/theme-provider';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      <SearchOverlay />
      <main className="flex-1 mt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-6xl font-serif font-bold text-primary mb-4 text-glow">404</h1>
      <h2 className="text-2xl font-serif mb-6 text-foreground">Lost in the Veil Between</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for has been consumed by the void, or perhaps it never existed in this timeline.
      </p>
      <a href="/" className="px-8 py-3 bg-primary text-primary-foreground font-bold uppercase tracking-wider text-sm rounded-none hover:bg-primary/90 transition-colors">
        Return to Safety
      </a>
    </div>
  );
}

function AppRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/characters" component={Characters} />
        <Route path="/characters/:id" component={CharacterDetail} />
        <Route path="/worlds" component={Worlds} />
        <Route path="/worlds/:id" component={WorldDetail} />
        <Route path="/comics" component={Comics} />
        <Route path="/comics/:id" component={ComicDetail} />
        <Route path="/timeline" component={Timeline} />
        <Route path="/encyclopedia" component={Encyclopedia} />
        <Route path="/encyclopedia/:id" component={EncyclopediaEntry} />
        <Route path="/news" component={News} />
        <Route path="/news/:id" component={NewsDetail} />
        <Route path="/community" component={Community} />
        <Route path="/card-game" component={CardGame} />
        <Route path="/collections" component={Profile} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}>
        <AppRouter />
      </WouterRouter>
    </ThemeProvider>
  );
}
