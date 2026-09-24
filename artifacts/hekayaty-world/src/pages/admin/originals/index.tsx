import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  Crown,
  Plus,
  Lock,
  Sparkles,
  Trash2,
  Edit,
  Star,
  Copy,
  Search,
  Eye,
  Layers,
  Flame,
  CheckCircle,
  X,
  FileText,
  Image,
  Video,
  Settings,
  Tv,
  Compass,
  Bookmark
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function AdminOriginals() {
  const { session } = useAuth();
  const [originals, setOriginals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    arabic_title: '',
    slug: '',
    tagline: '',
    description: '',
    arabic_description: '',
    content_type: 'story',
    access_level: 'subscriber',
    status: 'published',
    is_featured: false,
    is_trending: false,
    is_new: true,
    is_coming_soon: false,
    creator_name: 'Hekayaty Studios',
  });

  const fetchOriginals = () => {
    if (!session) return;
    setLoading(true);
    fetch('/api/admin/originals', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setOriginals(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOriginals();
  }, [session]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      arabic_title: '',
      slug: '',
      tagline: '',
      description: '',
      arabic_description: '',
      content_type: 'story',
      access_level: 'subscriber',
      status: 'published',
      is_featured: false,
      is_trending: false,
      is_new: true,
      is_coming_soon: false,
      creator_name: 'Hekayaty Studios',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      arabic_title: item.arabic_title || item.arabicTitle || '',
      slug: item.slug || '',
      tagline: item.tagline || '',
      description: item.description || '',
      arabic_description: item.arabic_description || item.arabicDescription || '',
      content_type: item.content_type || item.contentType || 'story',
      access_level: item.access_level || item.accessLevel || 'subscriber',
      status: item.status || 'published',
      is_featured: Boolean(item.is_featured ?? item.isFeatured),
      is_trending: Boolean(item.is_trending ?? item.isTrending),
      is_new: Boolean(item.is_new ?? item.isNew),
      is_coming_soon: Boolean(item.is_coming_soon ?? item.isComingSoon),
      creator_name: item.creator_name || item.creatorName || 'Hekayaty Studios',
    });
    setIsModalOpen(true);
  };

  const handleSaveOriginal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;
    if (!formData.title.trim()) {
      toast.error('من فضلك أدخل عنوان العمل الاصلي');
      return;
    }

    setSubmitting(true);
    try {
      const url = editingItem ? `/api/admin/originals/${editingItem.id}` : '/api/admin/originals';
      const method = editingItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'فشلت عملية حفظ المشروع الأصلي');
      }

      toast.success(editingItem ? 'تم تحديث المشروع الأصلي بنجاح ⭐' : 'تم إنشاء مشروع أوريجينالز جديد بنجاح ⭐');
      setIsModalOpen(false);
      fetchOriginals();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeature = async (id: string, currentFeatured: boolean) => {
    if (!session?.access_token) return;
    try {
      const res = await fetch(`/api/admin/originals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_featured: !currentFeatured }),
      });

      if (res.ok) {
        toast.success(!currentFeatured ? 'تم تعيين العمل كعَرْض مميز في الواجهة ⭐' : 'تمت إلغاء التميز');
        fetchOriginals();
      }
    } catch (err) {
      toast.error('فشلت العملية');
    }
  };

  const handleDuplicate = async (id: string) => {
    if (!session?.access_token) return;
    try {
      const res = await fetch(`/api/admin/originals/${id}/duplicate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        toast.success('تمت نسخ المشروع الأصلي بنجاح 📋');
        fetchOriginals();
      }
    } catch (err) {
      toast.error('فشل الاستنساخ');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت تأكد من حذف مشروع أوريجينالز (${title})؟`)) return;
    if (!session?.access_token) return;

    try {
      const res = await fetch(`/api/admin/originals/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        toast.success('تم حذف المشروع الأصلي بنجاح');
        fetchOriginals();
      }
    } catch (err) {
      toast.error('فشل الحذف');
    }
  };

  const filteredOriginals = originals.filter((o) => {
    const matchesSearch = !searchQuery || (o.title && o.title.toLowerCase().includes(searchQuery.toLowerCase())) || (o.arabic_title && o.arabic_title.includes(searchQuery));
    const matchesType = typeFilter === 'ALL' || (o.content_type && o.content_type.toLowerCase() === typeFilter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || (o.status && o.status.toLowerCase() === statusFilter.toLowerCase());
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-8" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/30 text-xs font-bold mb-2">
            <Crown className="w-3.5 h-3.5" /> استوديو حكاياتي أوريجينالز • HEKAYATY ORIGINALS STUDIO
          </div>
          <h1 className="text-3xl font-serif font-black text-white flex items-center gap-2">
            إدارة إنتاجات حكاياتي أوريجينالز
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            إدارة المشاريع الأصلية المتميزة، السلاسل الفانتازية، ونظام العرض المميز والاشتراكات.
          </p>
        </div>

        <Link
          href="/admin/originals/new"
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 text-black font-serif font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>إضافة مشروع أوريجينالز جديد</span>
        </Link>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border/80 space-y-1 shadow-sm">
          <div className="text-xs text-muted-foreground font-serif">إجمالي مشاريع أوريجينالز</div>
          <div className="text-3xl font-serif font-black text-amber-400">{originals.length}</div>
          <div className="text-[10px] text-muted-foreground">إنتاج حصري مخصص للرصيد الكوني</div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border/80 space-y-1 shadow-sm">
          <div className="text-xs text-muted-foreground font-serif">العرض المميز (Featured Showcase)</div>
          <div className="text-3xl font-serif font-black text-emerald-400">
            {originals.filter((o) => o.is_featured).length}
          </div>
          <div className="text-[10px] text-muted-foreground">تظهر في بانر الواجهة الرئيسي</div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border/80 space-y-1 shadow-sm">
          <div className="text-xs text-muted-foreground font-serif">خاص بالمشتركين VIP</div>
          <div className="text-3xl font-serif font-black text-[#D4AF37]">
            {originals.filter((o) => o.access_level === 'subscriber').length}
          </div>
          <div className="text-[10px] text-muted-foreground">مستويات وصول الأعضاء المميزين</div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border/80 space-y-1 shadow-sm">
          <div className="text-xs text-muted-foreground font-serif">المشاريع النشطة والمنشورة</div>
          <div className="text-3xl font-serif font-black text-blue-400">
            {originals.filter((o) => o.status === 'published').length}
          </div>
          <div className="text-[10px] text-muted-foreground">منشورة ومتاحة حالياً للجمهور</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-card p-4 rounded-2xl border border-border/80 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث في مشاريع أوريجينالز..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2 bg-secondary/40 border border-border/80 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-secondary/40 border border-border/80 rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">جميع الأنواع</option>
            <option value="story">روايات (Story/Novel)</option>
            <option value="comic">كوميكس (Comic)</option>
            <option value="episode">حلقات (Episodes)</option>
            <option value="universe">عالم كوني (Universe)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-secondary/40 border border-border/80 rounded-xl text-xs text-foreground focus:outline-none focus:border-amber-400"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="published">منشور (Published)</option>
            <option value="draft">مسودة (Draft)</option>
            <option value="archived">مؤرشف (Archived)</option>
          </select>
        </div>
      </div>

      {/* Originals Table */}
      <div className="bg-card rounded-2xl border border-border/80 overflow-hidden shadow-xl">
        <table className="w-full text-right text-xs">
          <thead className="bg-secondary/60 text-muted-foreground uppercase font-bold border-b border-border">
            <tr>
              <th className="p-4">المشروع الأصلي</th>
              <th className="p-4">النوع</th>
              <th className="p-4">مستوى الوصول</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">العرض المميز</th>
              <th className="p-4 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  جاري تحميل مشاريع أوريجينالز...
                </td>
              </tr>
            ) : filteredOriginals.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  لا توجد مشاريع مطابقة للبحث.
                </td>
              </tr>
            ) : (
              filteredOriginals.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-black rounded-lg overflow-hidden shrink-0 border border-border">
                        {o.coverUrl ? (
                          <img src={o.coverUrl} alt={o.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-mono font-bold text-amber-400">
                            HO
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-foreground text-sm">{o.arabic_title || o.arabicTitle || o.title}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{o.title} • ({o.slug})</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-400/20 text-[10px] font-bold uppercase rounded-md">
                      {o.content_type || o.contentType || 'Story'}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border ${
                      o.access_level === 'subscriber'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-400/30'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {o.access_level === 'subscriber' ? 'VIP المشتركين' : 'عام مجاني'}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                      o.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {o.status === 'published' ? 'منشور' : o.status || 'مسودة'}
                    </span>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleToggleFeature(o.id, Boolean(o.is_featured))}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 ${
                        o.is_featured
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-sm'
                          : 'bg-secondary/40 text-muted-foreground border-border/80 hover:text-white'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${o.is_featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                      <span>{o.is_featured ? 'مميز ⭐' : 'عادي'}</span>
                    </button>
                  </td>

                  <td className="p-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/originals/${o.id}`}
                        className="p-2 bg-secondary/60 hover:bg-amber-500 hover:text-black text-foreground rounded-lg transition-all"
                        title="تعديل المشروع"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleDuplicate(o.id)}
                        className="p-2 bg-secondary/60 hover:bg-blue-500 hover:text-white text-foreground rounded-lg transition-all"
                        title="استنساخ النسخة"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(o.id, o.arabic_title || o.title)}
                        className="p-2 bg-secondary/60 hover:bg-destructive hover:text-white text-foreground rounded-lg transition-all"
                        title="حذف المشروع"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0e0e14] border border-amber-400/40 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-right">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute left-6 top-6 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-400" />
                {editingItem ? 'تعديل مشروع أوريجينالز' : 'إضافة مشروع أوريجينالز جديد'}
              </h3>
              <p className="text-xs text-muted-foreground">أدخل معلومات العمل الأصلي المخصص لاستوديو حكاياتي.</p>
            </div>

            <form onSubmit={handleSaveOriginal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground font-bold mb-1">العنوان بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={formData.arabic_title}
                    onChange={(e) => setFormData({ ...formData, arabic_title: e.target.value })}
                    placeholder="مثل: ليث أجهر"
                    className="w-full p-3 bg-secondary/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-bold mb-1">العنوان بالإنجليزية *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Layth Aqhar"
                    className="w-full p-3 bg-secondary/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground font-bold mb-1">الرابط الفريد (Slug)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="layth-aqhar"
                    className="w-full p-3 bg-secondary/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-bold mb-1">العبارة الترويجية (Tagline)</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="سلسلة الفانتازيا الملحمية الأولى"
                    className="w-full p-3 bg-secondary/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-bold mb-1">الوصف المختصر بالعربية</label>
                <textarea
                  rows={3}
                  value={formData.arabic_description}
                  onChange={(e) => setFormData({ ...formData, arabic_description: e.target.value })}
                  placeholder="الوصف التفصيلي لمشروع أوريجينالز..."
                  className="w-full p-3 bg-secondary/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-muted-foreground font-bold mb-1">نوع المحتوى</label>
                  <select
                    value={formData.content_type}
                    onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                    className="w-full p-3 bg-secondary/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-amber-400"
                  >
                    <option value="story">رواية (Story)</option>
                    <option value="comic">كوميكس (Comic)</option>
                    <option value="episode">حلقات (Episode)</option>
                    <option value="universe">عالم (Universe)</option>
                    <option value="animation">أنيميشن (Animation)</option>
                    <option value="movie">فيلم (Movie)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-bold mb-1">مستوى الوصول</label>
                  <select
                    value={formData.access_level}
                    onChange={(e) => setFormData({ ...formData, access_level: e.target.value })}
                    className="w-full p-3 bg-secondary/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-amber-400"
                  >
                    <option value="subscriber">مشتركي VIP فقط</option>
                    <option value="public">عام ومجاني للجميع</option>
                    <option value="early_access">وصول مبكر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-bold mb-1">حالة المشروع</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-3 bg-secondary/40 border border-border rounded-xl text-foreground focus:outline-none focus:border-amber-400"
                  >
                    <option value="published">منشور ومتاح</option>
                    <option value="draft">مسودة</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                </div>
              </div>

              {/* Checkbox Flags */}
              <div className="pt-2 flex flex-wrap gap-6 text-xs text-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="accent-amber-400 w-4 h-4"
                  />
                  <span>⭐ عَرْض مميز بالواجهة (Featured Showcase)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_trending}
                    onChange={(e) => setFormData({ ...formData, is_trending: e.target.checked })}
                    className="accent-amber-400 w-4 h-4"
                  />
                  <span>🔥 الأكثر تداولاً (Trending)</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-secondary/60 hover:bg-secondary text-foreground rounded-xl font-serif"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-[#D4AF37] to-amber-600 text-black font-serif font-bold rounded-xl hover:brightness-110 shadow-lg shadow-amber-500/20"
                >
                  {submitting ? 'جاري الحفظ...' : editingItem ? 'تحديث المشروع' : 'إنشاء المشروع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
