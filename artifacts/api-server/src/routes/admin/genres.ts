import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/admin/genres
 */
router.get("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (_req, res): Promise<void> => {
  try {
    const { data, error } = await supabase.from("genres").select("*").order("name");
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/genres
 */
router.post("/", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const body = req.body;
    const { data, error } = await supabase
      .from("genres")
      .insert({
        name: body.name,
        arabic_name: body.arabic_name || body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: body.description || null,
        is_active: body.is_active ?? true,
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
