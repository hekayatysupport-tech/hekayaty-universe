import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * GET /api/worlds
 */
router.get("/worlds", async (_req, res) => {
  try {
    let { data, error } = await supabase
      .from("worlds")
      .select(`id, name, arabic_name, description, media:cover_media_id ( secure_url, alt_text )`)
      .order("name");

    if (error) {
      console.warn("Worlds fetch with media relation failed, using direct select fallback:", error.message);
      const fallback = await supabase.from("worlds").select("*").order("name");
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error("Error fetching worlds:", error.message);
      return res.status(500).json({ error: error.message });
    }

    const result = (data ?? []).map((w: any) => ({
      id: w.id,
      worldName: w.name,
      worldArabicName: w.arabic_name,
      description: w.description,
      coverUrl: w.media?.secure_url ?? w.cover_url ?? null,
      coverAlt: w.media?.alt_text ?? w.name ?? null,
    }));

    res.json(result);
  } catch (err: any) {
    console.error("GET /api/worlds crash:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

/**
 * GET /api/worlds/:id
 */
router.get("/worlds/:id", async (req, res) => {
  const { id } = req.params;

  const { data: world, error: worldErr } = await supabase
    .from("worlds")
    .select(`id, name, arabic_name, description, media:cover_media_id ( secure_url )`)
    .eq("id", id)
    .single();

  if (worldErr || !world) {
    return res.status(404).json({ error: "World not found" });
  }

  const { data: regions } = await supabase
    .from("regions")
    .select(`id, name, arabic_name, description, media:cover_media_id ( secure_url )`)
    .eq("world_id", id)
    .order("name");

  const w = world as any;
  res.json({
    id: w.id,
    worldName: w.name,
    worldArabicName: w.arabic_name,
    description: w.description,
    coverUrl: w.media?.secure_url ?? null,
    regions: (regions ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
      arabicName: r.arabic_name,
      description: r.description,
      coverUrl: r.media?.secure_url ?? null,
    })),
  });
});

export default router;
