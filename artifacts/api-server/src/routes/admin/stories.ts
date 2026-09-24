import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/admin/stories
 */
router.get("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (_req, res): Promise<void> => {
  try {
    const { data, error } = await supabase.from("stories").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/stories
 */
router.post("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const body = req.body;
    const { data, error } = await supabase
      .from("stories")
      .insert({
        original_id: body.original_id || null,
        title: body.title,
        arabic_title: body.arabic_title || body.title,
        synopsis: body.synopsis || null,
        author_name: body.author_name || "Hekayaty Team",
        cover_media_id: body.cover_media_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/stories/:id/chapters
 */
router.post("/:id/chapters", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const body = req.body;

    const { data, error } = await supabase
      .from("story_chapters")
      .insert({
        story_id: id,
        chapter_number: body.chapter_number || 1,
        title: body.title,
        arabic_title: body.arabic_title || body.title,
        content: body.content,
        arabic_content: body.arabic_content || null,
        read_time_minutes: body.read_time_minutes || 5,
        access_level: body.access_level || "subscriber",
        status: body.status || "published",
        sort_order: body.sort_order || 1,
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
