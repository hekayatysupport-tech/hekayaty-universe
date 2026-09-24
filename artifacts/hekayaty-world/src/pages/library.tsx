import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { BookOpen, Clock, Heart, Play, Sparkles, FolderPlus, Globe, Lock, Plus, ListFilter, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReadingList {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  coverImage?: string;
  itemCount?: number;
  createdAt: string;
}

export function Library() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'progress' | 'saved' | 'collections'>('progress');
  const [data, setData] = useState<{ library: any[]; readingProgress: any[] }>({ library: [], readingProgress: [] });
  const [collections, setCollections] = useState<ReadingList[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal for new collection
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch('/api/library', { headers: { Authorization: `Bearer ${session.access_token}` } }).then((r) => r.json()),
      fetch('/api/collections/user', { headers: { Authorization: `Bearer ${session.access_token}` } }).then((r) => r.json()),
    ])
      .then(([libData, collectionsData]) => {
        setData(libData || { library: [], readingProgress: [] });
        setCollections(Array.isArray(collectionsData) ? collectionsData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  const handleRemoveFromLibrary = async (itemId: string) => {
    if (!itemId || !session?.access_token) return;
    try {
      const res = await fetch('/api/library', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ itemId }),
      });
      if (res.ok) {
        setData((prev) => ({
          ...prev,
          library: prev.library.filter((i) => (i.itemId || i.original?.id) !== itemId),
        }));
        toast.info('تمت إزالة العنصر من مكتبتك الخاصة');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء الإزالة');
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          isPublic: newIsPublic,
        }),
      });
      if (!res.ok) throw new Error('Failed to create list');
      const created = await res.json();
      setCollections([created, ...collections]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      toast.success('Custom collection created!');
    } catch (err: any) {
      toast.error(err.message || 'Error creating collection');
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32 px-4 text-center space-y-4">
        <h1 className="text-3xl font-serif font-bold text-primary">Sign in to View Your Library</h1>
        <p className="text-sm text-muted-foreground">Sync your saved stories, custom reading lists, and reading progress across devices.</p>
        <Link href="/auth" className="inline-block px-6 py-2.5 bg-primary text-black font-bold uppercase tracking-wider text-xs rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.3)]">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" /> My Personal Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Your saved originals, custom reading collections, and progress tracking.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1.5 bg-[#0e0e12] border border-[#22222a] rounded-xl self-start md:self-auto">
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'progress' ? 'bg-primary text-black shadow-md' : 'text-[#888] hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Continue
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'saved' ? 'bg-primary text-black shadow-md' : 'text-[#888] hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Saved ({data.library.length})
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'collections' ? 'bg-primary text-black shadow-md' : 'text-[#888] hover:text-white'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" /> Collections ({collections.length})
          </button>
        </div>
      </div>

      {/* READING PROGRESS TAB */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> In Progress & Bookmarks
          </h2>

          {data.readingProgress.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground space-y-3">
              <Clock className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p>No reading history recorded yet.</p>
              <Link href="/stories" className="inline-block px-4 py-2 bg-primary/20 text-primary border border-primary/40 font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-primary hover:text-black transition-colors">
                Explore Hekayaty Stories
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.readingProgress.map((p) => (
                <div key={p.id} className="bg-card rounded-xl border border-border p-4 flex gap-4 items-center hover:border-primary/50 transition-colors group">
                  <img src={p.original?.coverUrl || 'https://res.cloudinary.com/demo/image/upload/v1/hekayaty/comics/travelers_cover.jpg'} alt="" className="w-20 h-28 object-cover rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="text-xs text-primary font-bold tracking-wider uppercase truncate">{p.original?.arabicTitle}</div>
                    <div className="text-base font-serif font-bold text-white truncate">{p.chapter?.arabicTitle || 'Current Chapter'}</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-[#888]">
                        <span>Progress</span>
                        <span>{p.progressPercentage || 50}%</span>
                      </div>
                      <div className="w-full bg-[#181820] h-2 rounded-full overflow-hidden border border-[#2a2a34]">
                        <div className="bg-gradient-to-r from-amber-500 to-primary h-full rounded-full" style={{ width: `${p.progressPercentage || 50}%` }} />
                      </div>
                    </div>
                    <Link href={`/reader/${p.original?.slug || 'travelers-of-time'}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1">
                      <Play className="w-3.5 h-3.5 fill-current" /> Resume Chapter
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SAVED ITEMS TAB */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" /> Saved Stories ({data.library.length})
          </h2>

          {data.library.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground space-y-3">
              <Heart className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p>Your library is empty. Save your favorite stories to access them quickly here.</p>
              <Link href="/novels" className="inline-block px-4 py-2 bg-primary/20 text-primary border border-primary/40 font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-primary hover:text-black transition-colors">
                Browse Publications
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" dir="rtl">
              {data.library.map((item) => {
                const type = item.itemType || item.original?.contentType || 'novel';
                const id   = item.itemId   || item.original?.id;
                const slug = item.original?.slug || id;
                const itemUrl = type === 'comic' ? `/comics/${id}` : `/novels/${slug}`;
                const coverUrl = item.original?.coverUrl || null;
                const title    = item.original?.arabicTitle || item.original?.title || (type === 'comic' ? 'قصة مصورة' : 'رواية');
                const isSubscriberOnly = item.original?.accessLevel === 'subscriber';

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col rounded-2xl overflow-hidden border border-[#2a2a34] hover:border-primary/60 transition-all duration-300 shadow-lg hover:shadow-primary/20 hover:shadow-xl hover:-translate-y-1 bg-[#0a0a10]"
                  >
                    {/* Cover Poster */}
                    <div className="relative aspect-[2/3] bg-[#0e0e14] overflow-hidden">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#1a1a2a] to-[#0d0d18]">
                          <BookOpen className="w-10 h-10 text-primary/40" />
                          <span className="text-xs text-[#555] font-mono px-3 text-center line-clamp-2">{title}</span>
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                      {/* Badges */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-primary text-black shadow">
                          {type === 'comic' ? 'كوميكس' : 'رواية'}
                        </span>
                        {isSubscriberOnly && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-black shadow flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" /> VIP
                          </span>
                        )}
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={(e) => { e.preventDefault(); handleRemoveFromLibrary(id); }}
                        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/20 hover:border-red-500/40 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                        title="إزالة من المكتبة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Title overlay at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h4 className="font-serif font-bold text-sm text-white leading-snug line-clamp-2 text-right">
                          {title}
                        </h4>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="bg-[#0d0d14] border-t border-[#1e1e28] p-2.5">
                      <Link
                        href={itemUrl}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary text-black text-xs font-black hover:brightness-110 transition-all shadow shadow-primary/30 active:scale-95"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> اقرأ الآن
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CUSTOM COLLECTIONS TAB */}
      {activeTab === 'collections' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-primary" /> Custom Reading Lists & Collections
              </h2>
              <p className="text-xs text-[#888] mt-0.5">Organize your reading list into themed collections (e.g., "Best Fantasy Stories", "Ancient Egypt Saga").</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-[#c4a030] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.25)]"
            >
              <Plus className="w-4 h-4" /> Create Collection
            </button>
          </div>

          {collections.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center text-sm text-muted-foreground space-y-3">
              <FolderPlus className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p>You haven't created any custom reading collections yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-primary/20 text-primary border border-primary/40 font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-primary hover:text-black transition-colors"
              >
                Create Your First Collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((col) => (
                <div key={col.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                        col.isPublic ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}>
                        {col.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {col.isPublic ? 'Public List' : 'Private List'}
                      </span>
                      <span className="text-xs font-mono text-[#777]">{col.itemCount || 0} Stories</span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-white leading-snug">{col.title}</h3>
                    {col.description && <p className="text-xs text-[#999] line-clamp-2">{col.description}</p>}
                  </div>

                  <div className="pt-3 border-t border-[#22222a] flex items-center justify-between text-xs">
                    <span className="text-[#666] font-mono">Created recently</span>
                    <button className="text-primary font-bold hover:underline">
                      View Collection →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE COLLECTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e0e12] border border-[#2a2a34] rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-primary" /> Create Reading Collection
            </h3>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-[#888] mb-1">Collection Title</label>
                <input
                  type="text"
                  placeholder="e.g. Best Sci-Fi & Time Travel Saga"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#14141a] border border-[#262630] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#888] mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Describe what kind of stories belong in this collection..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#14141a] border border-[#262630] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary min-h-[80px]"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-[#14141a] border border-[#262630] rounded-lg">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {newIsPublic ? <Globe className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-zinc-400" />}
                    {newIsPublic ? 'Public Collection' : 'Private Collection'}
                  </div>
                  <p className="text-[11px] text-[#777]">
                    {newIsPublic ? 'Visible on your public profile and discoverable by readers.' : 'Only visible to you in your library.'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={newIsPublic}
                  onChange={(e) => setNewIsPublic(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#888] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary text-black font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-[#c4a030] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

