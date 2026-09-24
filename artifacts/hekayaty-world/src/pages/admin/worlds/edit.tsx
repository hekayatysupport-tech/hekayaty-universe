import { API_BASE_URL } from '@/lib/api';
import React, { useEffect, useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Globe,
  Plus,
  Trash2,
  MapPin,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaPickerModal, SelectedMedia } from "@/components/admin/MediaPickerModal";

export const AdminWorldEdit = () => {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/admin/worlds/:id");
  const id = params?.id;
  const isNew = id === "new" || !id || location.endsWith("/new");

  const { session, isPublisher } = useAuth();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [worldCoverPickerOpen, setWorldCoverPickerOpen] = useState(false);

  // World Form
  const [formData, setFormData] = useState({
    name: "",
    arabic_name: "",
    description: "",
    type: "Mortal Realm",
    status: "draft",
    cover_media_id: null as string | null,
    coverUrl: null as string | null,
  });

  // Regions & Locations
  const [regions, setRegions] = useState<any[]>([]);
  const [newRegionName, setNewRegionName] = useState("");
  const [newRegionArabic, setNewRegionArabic] = useState("");
  const [newLocationName, setNewLocationName] = useState<{ [regionId: string]: string }>({});

  useEffect(() => {
    if (!isNew && id && session) {
      fetchWorld();
    }
  }, [id, isNew, session]);

  const fetchWorld = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/worlds/${id}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to load world");

      const data = await res.json();
      setFormData({
        name: data.name || "",
        arabic_name: data.arabic_name || "",
        description: data.description || "",
        type: data.type || "Mortal Realm",
        status: data.status || "draft",
        cover_media_id: data.cover_media_id || null,
        coverUrl: data.coverUrl || null,
      });
      setRegions(data.regions || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch world details");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (targetStatus?: string) => {
    if (!formData.name.trim() || !formData.arabic_name.trim()) {
      toast.error("World English and Arabic names are required.");
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      status: targetStatus || formData.status,
    };

    try {
      const endpoint = isNew
        ? `${API_BASE_URL}/api/admin/worlds`
        : `${API_BASE_URL}/api/admin/worlds/${id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save world");

      const saved = await res.json();
      toast.success(isNew ? "World realm created!" : "World realm updated!");

      if (isNew) {
        setLocation(`/admin/worlds/${saved.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Error saving world");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegionName.trim() || isNew) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/worlds/${id}/regions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: newRegionName,
          arabic_name: newRegionArabic || newRegionName,
        }),
      });

      if (!res.ok) throw new Error("Failed to add region");

      toast.success("Region added!");
      setNewRegionName("");
      setNewRegionArabic("");
      await fetchWorld();
    } catch (err: any) {
      toast.error(err.message || "Error adding region");
    }
  };

  const handleDeleteRegion = async (regionId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/worlds/regions/${regionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to delete region");
      toast.success("Region removed");
      await fetchWorld();
    } catch (err: any) {
      toast.error(err.message || "Error removing region");
    }
  };

  const handleAddLocation = async (regionId: string) => {
    const locName = newLocationName[regionId];
    if (!locName?.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/worlds/regions/${regionId}/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: locName,
          arabic_name: locName,
          type: "City",
        }),
      });
      if (!res.ok) throw new Error("Failed to add location");

      toast.success("Location created!");
      setNewLocationName((prev) => ({ ...prev, [regionId]: "" }));
      await fetchWorld();
    } catch (err: any) {
      toast.error(err.message || "Error adding location");
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/worlds/locations/${locationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to delete location");
      toast.success("Location removed");
      await fetchWorld();
    } catch (err: any) {
      toast.error(err.message || "Error removing location");
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-[#888888]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
        <p className="font-mono text-xs">Loading realm parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6 sticky top-16 bg-[#050507]/95 backdrop-blur-md z-10 py-2">
        <div className="flex items-center gap-3">
          <Link href="/admin/worlds">
            <a className="p-2 bg-[#121216] border border-[#222228] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </a>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              {isNew ? "Create World Realm" : `Edit World: ${formData.name}`}
            </h1>
            <p className="text-xs text-[#888888] font-mono">
              Status: <span className="text-[#d4af37] uppercase font-bold">{formData.status}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#141418] border border-[#2e2e36] hover:border-[#d4af37] text-xs font-bold text-[#e0e0e0] rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>

          {isPublisher && (
            <button
              type="button"
              onClick={() => handleSave("published")}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {saving ? "Publishing..." : "Publish Live"}
            </button>
          )}
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#0a0a0d] border border-[#1f1f24] p-6 rounded-xl space-y-5">
            <h2 className="text-base font-serif font-bold text-[#e0e0e0] flex items-center gap-2 border-b border-[#1f1f24] pb-3">
              <Globe className="w-4 h-4 text-[#d4af37]" />
              World Realm Designation
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  World Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Earth Realm / Athir"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Arabic Name (الاسم بالعربية) *
                </label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  placeholder="مثال: عالم الأرض / أطير"
                  value={formData.arabic_name}
                  onChange={(e) => setFormData({ ...formData, arabic_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Cosmic Dimension Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                >
                  <option value="Mortal Realm">Mortal Realm (عالم الفانين)</option>
                  <option value="Celestial Dimension">Celestial Dimension (البعد السماوي)</option>
                  <option value="Shadow Void">Shadow Void (فراغ الظلال)</option>
                  <option value="Underworld">Underworld (العالم السفلي)</option>
                  <option value="Elemental Plane">Elemental Plane (المستوى العنصري)</option>
                </select>
              </div>
            </div>

            <RichTextEditor
              label="World Description & Lore Atlas"
              value={formData.description || ""}
              onChange={(val) => setFormData({ ...formData, description: val })}
              placeholder="Chronicle geography, planetary rules, atmospheric conditions, and magic leylines..."
              minHeight="220px"
            />
          </div>

          {/* Nested Regions & Locations Manager */}
          {!isNew && (
            <div className="bg-[#0a0a0d] border border-[#1f1f24] p-6 rounded-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#1f1f24] pb-3">
                <h2 className="text-base font-serif font-bold text-[#e0e0e0] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#d4af37]" />
                  Regions & Mythic Locations ({regions.length})
                </h2>
              </div>

              {/* Add Region Form */}
              <form onSubmit={handleAddRegion} className="p-4 bg-[#121216] border border-[#22222a] rounded-lg flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Region Name (English)"
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#0c0c0e] border border-[#26262e] rounded-lg text-xs text-[#e0e0e0] focus:outline-none"
                />
                <input
                  type="text"
                  dir="rtl"
                  placeholder="اسم المنطقة بالعربية"
                  value={newRegionArabic}
                  onChange={(e) => setNewRegionArabic(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#0c0c0e] border border-[#26262e] rounded-lg text-xs text-[#e0e0e0] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-lg shrink-0"
                >
                  Add Region
                </button>
              </form>

              {/* Regions List */}
              <div className="space-y-4">
                {regions.map((reg) => (
                  <div key={reg.id} className="p-4 bg-[#101014] border border-[#222228] rounded-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#1a1a20]">
                      <div>
                        <h3 className="font-bold text-sm text-[#f0f0f0]">{reg.name} ({reg.arabic_name})</h3>
                        <p className="text-[11px] text-[#777777] font-mono">{reg.locations?.length || 0} Key Locations</p>
                      </div>
                      <button
                        onClick={() => handleDeleteRegion(reg.id)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Delete Region
                      </button>
                    </div>

                    {/* Locations under Region */}
                    <div className="space-y-2 pl-3 border-l-2 border-[#d4af37]/30">
                      {(reg.locations || []).map((loc: any) => (
                        <div key={loc.id} className="flex items-center justify-between text-xs py-1">
                          <span className="text-[#e0e0e0] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#d4af37] rounded-full inline-block" />
                            {loc.name} <span className="text-[#777777]">({loc.type || "City"})</span>
                          </span>
                          <button
                            onClick={() => handleDeleteLocation(loc.id)}
                            className="text-[#666666] hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add Location Input */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Add location (e.g. Athir Citadel)..."
                          value={newLocationName[reg.id] || ""}
                          onChange={(e) => setNewLocationName({ ...newLocationName, [reg.id]: e.target.value })}
                          className="flex-1 px-3 py-1.5 bg-[#0a0a0c] border border-[#222228] rounded text-xs text-[#e0e0e0] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddLocation(reg.id)}
                          className="px-3 py-1.5 bg-[#181820] hover:bg-[#252530] text-[#d4af37] text-xs font-bold rounded"
                        >
                          + Add Location
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cover Media */}
        <div className="space-y-6">
          <div className="bg-[#0a0a0d] border border-[#1f1f24] p-6 rounded-xl space-y-4">
            <h2 className="text-base font-serif font-bold text-[#e0e0e0] flex items-center gap-2 border-b border-[#1f1f24] pb-3">
              <ImageIcon className="w-4 h-4 text-[#d4af37]" />
              World Banner / Artwork
            </h2>

            <div className="aspect-[16/9] bg-[#121216] border-2 border-dashed border-[#282832] rounded-xl overflow-hidden relative group flex items-center justify-center">
              {formData.coverUrl ? (
                <>
                  <img
                    src={formData.coverUrl}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => setWorldCoverPickerOpen(true)}
                      className="px-4 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow"
                    >
                      Change Cover
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <Globe className="w-12 h-12 text-[#555555] mx-auto" />
                  <p className="text-xs text-[#888888]">No world artwork attached.</p>
                  <button
                    type="button"
                    onClick={() => setWorldCoverPickerOpen(true)}
                    className="px-4 py-2 bg-[#1c1c24] hover:bg-[#252532] border border-[#33333e] text-xs font-bold text-[#d4af37] rounded-lg transition-colors"
                  >
                    Select from Cloudinary
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        isOpen={worldCoverPickerOpen}
        onClose={() => setWorldCoverPickerOpen(false)}
        defaultCategory="world_cover"
        onSelect={(media: SelectedMedia) => {
          setFormData((prev) => ({
            ...prev,
            cover_media_id: media.id,
            coverUrl: media.secureUrl,
          }));
        }}
      />
    </div>
  );
};
