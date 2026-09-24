import React from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import { AuthPage } from '@/pages/auth';
import { Profile } from '@/pages/profile';
import { Originals } from '@/pages/originals';
import { OriginalDetail } from '@/pages/original-detail';
import { Stories } from '@/pages/stories';
import { StoryReader } from '@/pages/story-reader';
import { Subscription } from '@/pages/subscription';
import { Checkout } from '@/pages/checkout';
import { Library } from '@/pages/library';
import { AccountSubscription } from '@/pages/account/subscription';

import { NavbarUniverse } from '@/components/layout/NavbarUniverse';
import { Footer } from '@/components/layout/footer';
import { SearchOverlay } from '@/components/layout/search-overlay';
import { ThemeProvider } from '@/components/theme-provider';

import { UniversePage } from '@/pages/universe';
import { NovelsPage } from '@/pages/novels';
import { NovelDetailPage } from '@/pages/novels/detail';
import { HekayatyReader } from '@/pages/reader/HekayatyReader';
import { WritersPage } from '@/pages/writers';
import { WriterDetailPage } from '@/pages/writer-detail';
import { WriterStudioPage } from '@/pages/writer-studio';
import { StorePage } from '@/pages/store';
import { MembershipPage } from '@/pages/membership';

// Admin imports
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminLogin } from '@/pages/admin/login';
import { AdminDashboard } from '@/pages/admin/dashboard';
import { AdminCharacters } from '@/pages/admin/characters/index';
import { AdminCharacterEdit } from '@/pages/admin/characters/edit';
import { AdminComics } from '@/pages/admin/comics/index';
import { AdminComicEdit } from '@/pages/admin/comics/edit';
import { AdminComicIssues } from '@/pages/admin/comics/issues';
import { AdminWorlds } from '@/pages/admin/worlds/index';
import { AdminWorldEdit } from '@/pages/admin/worlds/edit';
import { AdminEncyclopedia } from '@/pages/admin/encyclopedia/index';
import { AdminEncyclopediaEdit } from '@/pages/admin/encyclopedia/edit';
import { AdminTimeline } from '@/pages/admin/timeline/index';
import { AdminNews } from '@/pages/admin/news/index';
import { AdminNewsEdit } from '@/pages/admin/news/edit';
import { AdminMedia } from '@/pages/admin/media/index';
import { AdminUsers } from '@/pages/admin/users';
import { AdminAudit } from '@/pages/admin/audit/index';
import { AdminOriginals } from '@/pages/admin/originals/index';
import { AdminOriginalsEdit } from '@/pages/admin/originals/edit';
import { AdminSubscriptions } from '@/pages/admin/subscriptions/index';
import { AdminReleaseCalendar } from '@/pages/admin/calendar';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/30">
      <NavbarUniverse />
      <SearchOverlay />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AdminPageWrapper({ component: Component }: { component: React.ComponentType<any> }) {
  return (
    <AdminGuard>
      <AdminLayout>
        <Component />
      </AdminLayout>
    </AdminGuard>
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
    <AuthProvider>
      <Switch>
        {/* Admin Login */}
        <Route path="/admin/login" component={AdminLogin} />
        
        {/* Admin Exact Base */}
        <Route path="/admin">
          <AdminPageWrapper component={AdminDashboard} />
        </Route>

        {/* Admin Characters */}
        <Route path="/admin/characters">
          <AdminPageWrapper component={AdminCharacters} />
        </Route>
        <Route path="/admin/characters/new">
          <AdminPageWrapper component={AdminCharacterEdit} />
        </Route>
        <Route path="/admin/characters/:id">
          <AdminPageWrapper component={AdminCharacterEdit} />
        </Route>

        {/* Admin Comics */}
        <Route path="/admin/comics">
          <AdminPageWrapper component={AdminComics} />
        </Route>
        <Route path="/admin/comics/new">
          <AdminPageWrapper component={AdminComicEdit} />
        </Route>
        <Route path="/admin/comics/:id/issues">
          <AdminPageWrapper component={AdminComicIssues} />
        </Route>
        <Route path="/admin/comics/:id">
          <AdminPageWrapper component={AdminComicEdit} />
        </Route>

        {/* Admin Worlds */}
        <Route path="/admin/worlds">
          <AdminPageWrapper component={AdminWorlds} />
        </Route>
        <Route path="/admin/worlds/new">
          <AdminPageWrapper component={AdminWorldEdit} />
        </Route>
        <Route path="/admin/worlds/:id">
          <AdminPageWrapper component={AdminWorldEdit} />
        </Route>

        {/* Admin Encyclopedia */}
        <Route path="/admin/encyclopedia">
          <AdminPageWrapper component={AdminEncyclopedia} />
        </Route>
        <Route path="/admin/encyclopedia/new">
          <AdminPageWrapper component={AdminEncyclopediaEdit} />
        </Route>
        <Route path="/admin/encyclopedia/:id">
          <AdminPageWrapper component={AdminEncyclopediaEdit} />
        </Route>

        {/* Admin Timeline */}
        <Route path="/admin/timeline">
          <AdminPageWrapper component={AdminTimeline} />
        </Route>

        {/* Admin News */}
        <Route path="/admin/news">
          <AdminPageWrapper component={AdminNews} />
        </Route>
        <Route path="/admin/news/new">
          <AdminPageWrapper component={AdminNewsEdit} />
        </Route>
        <Route path="/admin/news/:id">
          <AdminPageWrapper component={AdminNewsEdit} />
        </Route>

        {/* Admin Media */}
        <Route path="/admin/media">
          <AdminPageWrapper component={AdminMedia} />
        </Route>

        {/* Admin Users */}
        <Route path="/admin/users">
          <AdminPageWrapper component={AdminUsers} />
        </Route>

        {/* Admin Audit */}
        <Route path="/admin/audit">
          <AdminPageWrapper component={AdminAudit} />
        </Route>

        {/* Admin Originals */}
        <Route path="/admin/originals">
          <AdminPageWrapper component={AdminOriginals} />
        </Route>
        <Route path="/admin/originals/new">
          <AdminPageWrapper component={AdminOriginalsEdit} />
        </Route>
        <Route path="/admin/originals/:id">
          <AdminPageWrapper component={AdminOriginalsEdit} />
        </Route>

        {/* Admin Subscriptions */}
        <Route path="/admin/subscriptions">
          <AdminPageWrapper component={AdminSubscriptions} />
        </Route>

        {/* Admin Calendar */}
        <Route path="/admin/calendar">
          <AdminPageWrapper component={AdminReleaseCalendar} />
        </Route>

        {/* Public Routes */}
        <Route path="/">
          <Layout><Home /></Layout>
        </Route>
        <Route path="/originals">
          <Layout><Originals /></Layout>
        </Route>
        <Route path="/originals/:slug">
          {(params) => <Layout><OriginalDetail params={params} /></Layout>}
        </Route>
        <Route path="/universe">
          <Layout><UniversePage /></Layout>
        </Route>
        <Route path="/novels">
          <Layout><NovelsPage /></Layout>
        </Route>
        <Route path="/novels/:slug">
          {(params) => <Layout><NovelDetailPage params={params} /></Layout>}
        </Route>
        <Route path="/read/:novelSlug/:chapterId">
          {(params) => <HekayatyReader params={params} />}
        </Route>
        <Route path="/reader/novels/:novelSlug/:chapterId">
          {(params) => <HekayatyReader params={params} />}
        </Route>
        <Route path="/writers">
          <Layout><WritersPage /></Layout>
        </Route>
        <Route path="/writers/:slug">
          {(params) => <Layout><WriterDetailPage params={params as any} /></Layout>}
        </Route>
        <Route path="/writer/studio">
          <Layout><WriterStudioPage /></Layout>
        </Route>
        <Route path="/store">
          <Layout><StorePage /></Layout>
        </Route>
        <Route path="/membership">
          <Layout><MembershipPage /></Layout>
        </Route>
        <Route path="/stories">
          <Layout><Stories /></Layout>
        </Route>
        <Route path="/stories/chapters/:id">
          {(params) => <HekayatyReader params={params} />}
        </Route>
        <Route path="/subscription">
          <Layout><Subscription /></Layout>
        </Route>
        <Route path="/plans">
          <Layout><Subscription /></Layout>
        </Route>
        <Route path="/checkout">
          <Layout><Checkout /></Layout>
        </Route>
        <Route path="/library">
          <Layout><Library /></Layout>
        </Route>
        <Route path="/account/subscription">
          <Layout><AccountSubscription /></Layout>
        </Route>
        <Route path="/characters">
          <Layout><Characters /></Layout>
        </Route>
        <Route path="/characters/:id">
          {(params) => <Layout><CharacterDetail params={params} /></Layout>}
        </Route>
        <Route path="/worlds">
          <Layout><Worlds /></Layout>
        </Route>
        <Route path="/worlds/:id">
          {(params) => <Layout><WorldDetail params={params} /></Layout>}
        </Route>
        <Route path="/comics">
          <Layout><Comics /></Layout>
        </Route>
        <Route path="/comics/:id">
          {(params) => <Layout><ComicDetail params={params} /></Layout>}
        </Route>
        <Route path="/timeline">
          <Layout><Timeline /></Layout>
        </Route>
        <Route path="/encyclopedia">
          <Layout><Encyclopedia /></Layout>
        </Route>
        <Route path="/encyclopedia/:id">
          {(params) => <Layout><EncyclopediaEntry params={params} /></Layout>}
        </Route>
        <Route path="/news">
          <Layout><News /></Layout>
        </Route>
        <Route path="/news/:id">
          {(params) => <Layout><NewsDetail params={params} /></Layout>}
        </Route>
        <Route path="/community">
          <Layout><Community /></Layout>
        </Route>
        <Route path="/card-game">
          <Layout><CardGame /></Layout>
        </Route>
        <Route path="/auth">
          <Layout><AuthPage /></Layout>
        </Route>
        <Route path="/collections">
          <Layout><Profile /></Layout>
        </Route>
        <Route path="/profile">
          <Layout><Profile /></Layout>
        </Route>

        {/* 404 Fallback */}
        <Route>
          <Layout><NotFound /></Layout>
        </Route>
      </Switch>
    </AuthProvider>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}>
          <AppRouter />
        </WouterRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
