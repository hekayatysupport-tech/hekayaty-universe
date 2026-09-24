import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/admin/episodes
 */
router.get("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (_req, res): Promise<void> => {
  try {
    const { data, error } = await supabase.from("episodes").select("*").order("season_number").order("episode_number");
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/episodes
 */
router.post("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const body = req.body;
    const { data, error } = await supabase
      .from("episodes")
      .insert({
        original_id: body.original_id,
        season_number: body.season_number || 1,
        episode_number: body.episode_number || 1,
        title: body.title,
        arabic_title: body.arabic_title || body.title,
        description: body.description || null,
        media_url: body.media_url || null,
        duration_minutes: body.duration_minutes || null,
        access_level: body.access_level || "subscriber",
        status: body.status || "published",
        thumbnail_media_id: body.thumbnail_media_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
