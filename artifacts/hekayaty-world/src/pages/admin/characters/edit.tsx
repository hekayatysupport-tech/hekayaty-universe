import { API_BASE_URL } from '@/lib/api';
import React, { useEffect, useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  Clock,
  Swords,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Shield,
  Loader2,
  Eye,
  Sliders
} from "lucide-react";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaPickerModal, SelectedMedia } from "@/components/admin/MediaPickerModal";
import { calculatePowerRating } from "@/utils/powerRating";

export const AdminCharacterEdit = () => {
  const [location, setLocation] = useLocation();
  const [, params] = useRoute("/admin/characters/:id");
  const id = params?.id;
  const isNew = id === "new" || !id || location.endsWith("/new");

  const { session, isPublisher } = useAuth();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    arabic_name: "",
    alias: "",
    title: "",
    quote: "",
    alignment: "Hero",
    character_status: "Active",
    power_category: "",
    organization: "",
    short_bio: "",
    full_bio: "",
    about_text: "",
    portrait_media_id: null as string | null,
    portraitUrl: null as string | null,
    status: "draft",
  });

  // Stats State (0-100)
  const [stats, setStats] = useState({
    strength: 80,
    speed: 75,
    intelligence: 85,
    wisdom: 70,
    willpower: 90,
    magic: 60,
  });

  // Abilities State
  const [abilities, setAbilities] = useState<Array<{ name: string; arabic_name: string; description: string; power_level: number }>>([]);

  // Relationships State
  const [relationships, setRelationships] = useState<Array<{ target_character_id: string; relationship_type: string; description: string }>>([]);
  const [allCharacters, setAllCharacters] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // Fetch all characters for relationship selector
    const loadAllCharacters = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/characters`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        });
        if (res.ok) {
          const list = await res.json();
          setAllCharacters(list.filter((c: any) => c.id !== id));
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (session) {
      loadAllCharacters();
    }
  }, [session, id]);

  useEffect(() => {
    if (!isNew && id && session) {
      fetchCharacterDetails();
    }
  }, [id, isNew, session]);

  const fetchCharacterDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/characters/${id}`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to load character details");

      const data = await res.json();
      setFormData({
        name: data.name || "",
        arabic_name: data.arabic_name || "",
        alias: data.alias || "",
        title: data.title || "",
        quote: data.quote || "",
        alignment: data.alignment || "Hero",
        character_status: data.character_status || "Active",
        power_category: data.power_category || "",
        organization: data.organization || "",
        short_bio: data.short_bio || "",
        full_bio: data.full_bio || "",
        about_text: data.about_text || "",
        portrait_media_id: data.portrait_media_id || null,
        portraitUrl: data.portraitUrl || null,
        status: data.status || "draft",
      });

      if (data.stats) {
        setStats({
          strength: data.stats.strength ?? 80,
          speed: data.stats.speed ?? 75,
          intelligence: data.stats.intelligence ?? 85,
          wisdom: data.stats.wisdom ?? 70,
          willpower: data.stats.willpower ?? 90,
          magic: data.stats.magic ?? 60,
        });
      }

      if (data.abilities) {
        setAbilities(data.abilities);
      }

      if (data.relationships) {
        setRelationships(data.relationships);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not fetch character");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (targetStatus?: string) => {
    if (!formData.name.trim() || !formData.arabic_name.trim()) {
      toast.error("Please provide both English and Arabic names.");
      return;
    }

    setSaving(true);
    const payload = {
      ...formData,
      status: targetStatus || formData.status,
      stats,
      abilities,
      relationships,
    };

    try {
      const endpoint = isNew
        ? `${API_BASE_URL}/api/admin/characters`
        : `${API_BASE_URL}/api/admin/characters/${id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to persist character");
      }

      const saved = await res.json();
      toast.success(isNew ? "Character registered successfully!" : "Character updated!");

      if (isNew) {
        setLocation(`/admin/characters/${saved.id}`);
      } else {
        setFormData((prev) => ({ ...prev, status: targetStatus || prev.status }));
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const addAbility = () => {
    setAbilities([...abilities, { name: "", arabic_name: "", description: "", power_level: 5 }]);
  };

  const removeAbility = (index: number) => {
    setAbilities(abilities.filter((_, i) => i !== index));
  };

  const updateAbility = (index: number, field: string, val: any) => {
    const updated = [...abilities];
    updated[index] = { ...updated[index], [field]: val };
    setAbilities(updated);
  };

  const addRelationship = () => {
    if (allCharacters.length === 0) {
      toast.error("No other characters available to link.");
      return;
    }
    setRelationships([
      ...relationships,
      { target_character_id: allCharacters[0].id, relationship_type: "Ally", description: "" },
    ]);
  };

  const removeRelationship = (index: number) => {
    setRelationships(relationships.filter((_, i) => i !== index));
  };

  const updateRelationship = (index: number, field: string, val: any) => {
    const updated = [...relationships];
    updated[index] = { ...updated[index], [field]: val };
    setRelationships(updated);
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-[#888888]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
        <p className="font-mono text-xs">Loading entity parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6 sticky top-16 bg-[#050507]/95 backdrop-blur-md z-10 py-2">
        <div className="flex items-center gap-3">
          <Link href="/admin/characters">
            <a className="p-2 bg-[#121216] border border-[#222228] hover:border-[#d4af37] text-[#a0a0a0] hover:text-[#d4af37] rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </a>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              {isNew ? "Create Universe Entity" : `Edit: ${formData.name || "Character"}`}
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

          {isPublisher ? (
            <button
              type="button"
              onClick={() => handleSave("published")}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#d4af37] hover:bg-[#bfa030] text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {saving ? "Publishing..." : "Publish Live"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSave("in_review")}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Review
            </button>
          )}
        </div>
      </div>

      {/* Main Form Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Identity & Lore */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Basic Identity */}
          <div className="bg-[#0a0a0d] border border-[#1f1f24] p-6 rounded-xl space-y-5">
            <h2 className="text-base font-serif font-bold text-[#e0e0e0] flex items-center gap-2 border-b border-[#1f1f24] pb-3">
              <Swords className="w-4 h-4 text-[#d4af37]" />
              Basic Identity & Designation
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  English Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tarek"
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
                  placeholder="مثال: طارق"
                  value={formData.arabic_name}
                  onChange={(e) => setFormData({ ...formData, arabic_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Alias / Codename
                </label>
                <input
                  type="text"
                  placeholder="e.g. Al-Saqr"
                  value={formData.alias || ""}
                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Honorary Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Heir of Light"
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Alignment
                </label>
                <select
                  value={formData.alignment}
                  onChange={(e) => setFormData({ ...formData, alignment: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                >
                  <option value="Hero">Hero (بطل)</option>
                  <option value="Villain">Villain (شرير)</option>
                  <option value="Antihero">Antihero (بطل رمادي)</option>
                  <option value="Neutral">Neutral (محايد)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  In-Universe Lore Status
                </label>
                <select
                  value={formData.character_status}
                  onChange={(e) => setFormData({ ...formData, character_status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                >
                  <option value="Active">Active (حي / نشط)</option>
                  <option value="Deceased">Deceased (متوفى)</option>
                  <option value="Unknown">Unknown (مجهول)</option>
                  <option value="Imprisoned">Imprisoned (محبوس / مسجون)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Power Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enhanced Combat / Solar Magic"
                  value={formData.power_category || ""}
                  onChange={(e) => setFormData({ ...formData, power_category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                  Faction / Organization
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Sky Vanguard"
                  value={formData.organization || ""}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                Iconic Character Quote
              </label>
              <input
                type="text"
                placeholder="e.g. النور لا يُمنح... بل يُكتسب"
                value={formData.quote || ""}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none italic"
              />
            </div>
          </div>

          {/* Section 2: Biography & Lore Descriptions */}
          <div className="bg-[#0a0a0d] border border-[#1f1f24] p-6 rounded-xl space-y-6">
            <h2 className="text-base font-serif font-bold text-[#e0e0e0] flex items-center gap-2 border-b border-[#1f1f24] pb-3">
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              Biography & Narrative Details
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#a0a0a0] mb-1.5">
                Short Bio / Hook Summary
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary displayed on cards and search results..."
                value={formData.short_bio || ""}
                onChange={(e) => setFormData({ ...formData, short_bio: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#121216] border border-[#26262e] focus:border-[#d4af37] rounded-lg text-sm text-[#f0f0f0] focus:outline-none"
              />
            </div>

            <RichTextEditor
              label="Full Biography & Origins"
              value={formData.full_bio || ""}
              onChange={(val) => setFormData({ ...formData, full_bio: val })}
              placeholder="Detailed chronicle of origins, motivations, and major story milestones..."
              minHeight="260px"
            />
          </div>

          {/* Section 3: Special Abilities Manager */}
          <div className="bg-[#0a0a0d] border border-[#1f1f24] p-6 rounded-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1f1f24] pb-3">
              <h2 className="text-base font-serif font-bold text-[#e0e0e0] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#d4af37]" />
                Abilities & Superpowers ({abilities.length})
              </h2>
              <button
                type="button"
                onClick={addAbility}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181820] hover:bg-[#252530] border border-[#33333e] text-xs font-bold text-[#d4af37] rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Ability
              </button>
            </div>

            {abilities.length === 0 ? (
              <p className="text-xs text-[#666666] font-mono italic">No abilities added yet.</p>
            ) : (
              <div className="space-y-4">
                {abilities.map((ab, i) => (
                  <div key={i} className="p-4 bg-[#121216] border border-[#22222a] rounded-lg space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Ability Name"
                          value={ab.name}
                          onChange={(e) => updateAbility(i, "name", e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0c0c0e] border border-[#26262e] rounded text-xs text-[#e0e0e0] focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          dir="rtl"
                          placeholder="اسم القدرة"
                          value={ab.arabic_name}
                          onChange={(e) => updateAbility(i, "arabic_name", e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#0c0c0e] border border-[#26262e] rounded text-xs text-[#e0e0e0] focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-[#888888] shrink-0 font-mono">
                          Power: {ab.power_level}/10
                        </span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={ab.power_level}
                          onChange={(e) => updateAbility(i, "power_level", Number(e.target.value))}
                          className="w-full accent-[#d4af37]"
                        />
                        <button
                          type="button"
                          onClick={() => removeAbility(i)}
                          className="p-1 text-[#666666] hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Detailed mechanism or visual effect of this power..."
                      value={ab.description || ""}
                      onChange={(e) => updateAbility(i, "description", e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#0c0c0e] border border-[#26262e] rounded text-xs text-[#e0e0e0] focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Character Relationships */}
          <div className="bg-[#0a0a0d] border border-[#1f1f24] p-6 rounded-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1f1f24] pb-3">
              <h2 className="text-base font-serif font-bold text-[#e0e0e0] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#d4af37]" />
                Character Relationships ({relationships.length})
              </h2>
              <button
                type="button"
                onClick={addRelationship}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181820] hover:bg-[#252530] border border-[#33333e] text-xs font-bold text-[#d4af37] rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Relationship
              </button>
            </div>

            {relationships.length === 0 ? (
              <p className="text-xs text-[#666666] font-mono italic">No relationships linked.</p>
            ) : (
              <div className="space-y-3">
                {relationships.map((rel, i) => (
                  <div key={i} className="p-3 bg-[#121216] border border-[#22222a] rounded-lg flex flex-col sm:flex-row items-center gap-3">
                    <select
                      value={rel.target_character_id}
                      onChange={(e) => updateRelationship(i, "target_character_id", e.target.value)}
                      className="w-full sm:w-48 px-3 py-1.5 bg-[#0c0c0e] border border-[#26262e] rounded text-xs text-[#e0e0e0] focus:outline-none"
                    >
                      {allCharacters.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>

                    <select
                      value={rel.relationship_type}
                      onChange={(e) => updateRelationship(i, "relationship_type", e.target.value)}
                      className="w-full sm:w-36 px-3 py-1.5 bg-[#0c0c0e] border border-[#26262e] rounded text-xs text-[#e0e0e0] focus:outline-none"
                    >
                      <option value="Ally">Ally (حليف)</option>
                      <option value="Arch-Nemesis">Arch-Nemesis (عدو لدود)</option>
                      <option value="Mentor">Mentor (مرشد / معلّم)</option>
                      <option value="Family">Family (عائلة)</option>
                      <option value="Rival">Rival (منافس)</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Context notes..."
                      value={rel.description || ""}
                      onChange={(e) => updateRelationship(i, "description", e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-[#0c0c0e] border border-[#26262e] rounded text-xs text-[#e0e0e0] focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => removeRelationship(i)}
                      className="p-1 text-[#666666] hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Portrait Media & Stats Power Grid */}
        <div className="space-y-8">
          {/* Portrait Media Box */}
          <div className="bg-[#0a0a0d] border border-[#1f1f24] p-6 rounded-xl space-y-4">
            <h2 className="text-base font-serif font-bold text-[#e0e0e0] flex items-center gap-2 border-b border-[#1f1f24] pb-3">
              <ImageIcon className="w-4 h-4 text-[#d4af37]" />
              Portrait & Key Visual
            </h2>

            <div className="aspect-[3/4] bg-[#121216] border-2 border-dashed border-[#282832] rounded-xl overflow-hidden relative group flex items-center justify-center">
              {formData.portraitUrl ? (
                <>
                  <img
                    src={formData.portraitUrl}
                    alt={formData.name || "Portrait"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => setMediaPickerOpen(true)}
                      className="px-4 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-lg shadow"
                    >
                      Change Portrait
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, portrait_media_id: null, portraitUrl: null })}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <ImageIcon className="w-12 h-12 text-[#555555] mx-auto" />
                  <p className="text-xs text-[#888888]">No portrait attached.</p>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="px-4 py-2 bg-[#1c1c24] hover:bg-[#252532] border border-[#33333e] text-xs font-bold text-[#d4af37] rounded-lg transition-colors"
                  >
                    Select or Upload
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Stats Power Matrix with Live Smart Power Rating */}
          <div className="bg-[#0a0a0d] border border-[#1f1f24] p-6 rounded-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1f1f24] pb-3">
              <h2 className="text-base font-serif font-bold text-[#e0e0e0] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                Power Scaling Matrix (0-100)
              </h2>
            </div>

            {/* Real-time Smart Power Rating Calculation Badge */}
            {(() => {
              const liveRating = calculatePowerRating(stats, abilities);
              return (
                <div className="p-4 bg-gradient-to-br from-[#121218] to-[#0c0c10] border border-[#2a2a36] rounded-xl space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#888888] font-bold block">
                        Live Power Score
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black font-mono text-white">
                          {liveRating.score}
                        </span>
                        <span className="text-xs text-[#888888] font-mono">/100</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className="px-3 py-1 rounded-lg text-xs font-black font-mono uppercase inline-block border shadow"
                        style={{
                          color: liveRating.tier.color,
                          backgroundColor: `${liveRating.tier.color}15`,
                          borderColor: `${liveRating.tier.color}40`,
                        }}
                      >
                        Tier {liveRating.tier.rank} · {liveRating.tier.titleArabic}
                      </span>
                      <span className="block text-[10px] text-[#888888] mt-1">
                        {liveRating.archetype.icon} {liveRating.archetype.titleArabic}
                      </span>
                    </div>
                  </div>

                  {/* 4 Combat Vectors Preview */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                    <div className="flex justify-between text-white/70">
                      <span>الهجوم:</span>
                      <span className="font-mono font-bold text-red-400">{liveRating.metrics.offense}%</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>الدفاع:</span>
                      <span className="font-mono font-bold text-emerald-400">{liveRating.metrics.defense}%</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>السرعة:</span>
                      <span className="font-mono font-bold text-amber-400">{liveRating.metrics.agility}%</span>
                    </div>
                    <div className="flex justify-between text-white/70">
                      <span>التكتيك:</span>
                      <span className="font-mono font-bold text-blue-400">{liveRating.metrics.tactics}%</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {[
              { key: "strength", label: "Strength (القوة البدنية)" },
              { key: "speed", label: "Speed & Agility (السرعة)" },
              { key: "intelligence", label: "Intelligence (الذكاء التكتيكي)" },
              { key: "wisdom", label: "Wisdom & Mastery (الحكمة)" },
              { key: "willpower", label: "Willpower & Leadership (الإرادة)" },
              { key: "magic", label: "Magic / Artifact Control (السحر)" },
            ].map(({ key, label }) => {
              const val = (stats as any)[key] ?? 50;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#a0a0a0] font-medium">{label}</span>
                    <span className="font-mono font-bold text-[#d4af37]">{val}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={val}
                    onChange={(e) => setStats({ ...stats, [key]: Number(e.target.value) })}
                    className="w-full accent-[#d4af37]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        defaultCategory="character_portrait"
        onSelect={(media: SelectedMedia) => {
          setFormData((prev) => ({
            ...prev,
            portrait_media_id: media.id,
            portraitUrl: media.secureUrl,
          }));
        }}
      />
    </div>
  );
};
