import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * GET /api/characters
 * Returns all characters with portrait URL and stats.
 */
router.get("/characters", async (_req, res) => {
  try {
    let { data, error } = await supabase
      .from("characters")
      .select(`
        id, name, arabic_name, alias, title, quote, alignment, status,
        power_category, organization, short_bio,
        media:portrait_media_id ( secure_url, alt_text )
      `)
      .order("name");

    if (error) {
      console.warn("Character fetch with media relation failed, using direct select fallback:", error.message);
      const fallback = await supabase.from("characters").select("*").order("name");
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error("Error fetching characters:", error.message);
      return res.status(500).json({ error: error.message });
    }

    const { data: statsData } = await supabase.from("character_stats").select("*");

    const statsMap: Record<string, any> = {};
    (statsData || []).forEach((s: any) => {
      statsMap[s.character_id] = s;
    });

    const result = (data ?? []).map((c: any) => {
      const s = statsMap[c.id];
      return {
        id: c.id,
        name: c.name,
        arabicName: c.arabic_name,
        alias: c.alias,
        title: c.title,
        quote: c.quote,
        alignment: c.alignment,
        status: c.status,
        powerCategory: c.power_category,
        organization: c.organization,
        shortBio: c.short_bio,
        portraitUrl: c.media?.secure_url ?? c.portrait_url ?? null,
        portraitAlt: c.media?.alt_text ?? c.name ?? null,
        stats: s ? {
          strength: s.strength,
          speed: s.speed,
          intelligence: s.intelligence,
          wisdom: s.wisdom,
          willpower: s.willpower,
          magic: s.magic,
        } : null,
      };
    });

    res.json(result);
  } catch (err: any) {
    console.error("GET /api/characters crash:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

/**
 * GET /api/characters/:id
 * Returns a single character with full details.
 */
router.get("/characters/:id", async (req, res) => {
  const { id } = req.params;

  const [charRes, statsRes, abilitiesRes, relationshipsRes, galleryRes, worldsRes] =
    await Promise.all([
      supabase
        .from("characters")
        .select(`id, name, arabic_name, alias, title, quote, alignment, status, power_category, organization, short_bio, full_bio, about_text, media:portrait_media_id ( secure_url, alt_text )`)
        .eq("id", id)
        .single(),
      supabase
        .from("character_stats")
        .select("strength, speed, intelligence, wisdom, willpower, magic")
        .eq("character_id", id)
        .maybeSingle(),
      supabase
        .from("character_abilities")
        .select("id, name, description")
        .eq("character_id", id),
      supabase
        .from("character_relationships")
        .select(`id, relation_type, description, character_b:character_b_id ( id, name, arabic_name, media:portrait_media_id ( secure_url ) )`)
        .eq("character_a_id", id),
      supabase
        .from("character_gallery")
        .select(`sort_order, media:media_id ( id, secure_url, alt_text )`)
        .eq("character_id", id)
        .order("sort_order"),
      supabase
        .from("character_worlds")
        .select(`relationship, world:world_id ( id, name, arabic_name, media:cover_media_id ( secure_url ) )`)
        .eq("character_id", id),
    ]);

  if (charRes.error || !charRes.data) {
    if (charRes.error?.code === "PGRST116") {
      return res.status(404).json({ error: "Character not found" });
    }
    console.error("Error fetching character:", charRes.error?.message);
    return res.status(500).json({ error: "Internal server error" });
  }

  const c = charRes.data as any;
  const character = {
    id: c.id,
    name: c.name,
    arabicName: c.arabic_name,
    alias: c.alias,
    title: c.title,
    quote: c.quote,
    alignment: c.alignment,
    status: c.status,
    powerCategory: c.power_category,
    organization: c.organization,
    shortBio: c.short_bio,
    fullBio: c.full_bio,
    aboutText: c.about_text,
    portraitUrl: c.media?.secure_url ?? null,
    portraitAlt: c.media?.alt_text ?? null,
    stats: statsRes.data ?? null,
    abilities: (abilitiesRes.data ?? []),
    relationships: (relationshipsRes.data ?? []).map((r: any) => ({
      id: r.id,
      relationType: r.relation_type,
      description: r.description,
      relatedCharacter: r.character_b
        ? {
            id: r.character_b.id,
            name: r.character_b.name,
            arabicName: r.character_b.arabic_name,
            portraitUrl: r.character_b.media?.secure_url ?? null,
          }
        : null,
    })),
    gallery: (galleryRes.data ?? []).map((g: any) => ({
      id: g.media?.id,
      secureUrl: g.media?.secure_url ?? null,
      altText: g.media?.alt_text ?? null,
    })),
    worlds: (worldsRes.data ?? []).map((w: any) => ({
      worldId: w.world?.id,
      worldName: w.world?.name ?? null,
      worldArabicName: w.world?.arabic_name ?? null,
      relationship: w.relationship,
      coverUrl: w.world?.media?.secure_url ?? null,
    })),
  };

  res.json(character);
});

export default router;
