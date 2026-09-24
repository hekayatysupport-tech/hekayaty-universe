import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/admin/originals
 * Retrieve all Hekayaty Originals with full relations and stats for admin dashboard
 */
router.get("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (_req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("originals")
      .select("*, cover_media:cover_media_id ( secure_url ), banner_media:banner_media_id ( secure_url )")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json((data || []).map((o: any) => ({
      ...o,
      arabicTitle: o.arabic_title || o.title,
      arabicDescription: o.arabic_description || o.description,
      contentType: o.content_type || "story",
      accessLevel: o.access_level || "subscriber",
      isFeatured: o.is_featured || false,
      isTrending: o.is_trending || false,
      isNew: o.is_new || false,
      isComingSoon: o.is_coming_soon || false,
      coverUrl: o.cover_media?.secure_url || o.cover_url || null,
      bannerUrl: o.banner_media?.secure_url || o.banner_url || null,
    })));
  } catch (error: any) {
    console.error("GET /api/admin/originals error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/originals/:id
 * Retrieve single Hekayaty Original details for editing
 */
router.get("/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("originals")
      .select("*, cover_media:cover_media_id ( secure_url ), banner_media:banner_media_id ( secure_url )")
      .eq("id", id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Original item not found" });
      return;
    }

    res.json({
      ...data,
      arabicTitle: data.arabic_title || data.title,
      arabicDescription: data.arabic_description || data.description,
      contentType: data.content_type || "story",
      accessLevel: data.access_level || "subscriber",
      isFeatured: data.is_featured || false,
      isTrending: data.is_trending || false,
      isNew: data.is_new || false,
      isComingSoon: data.is_coming_soon || false,
      coverUrl: data.cover_media?.secure_url || data.cover_url || null,
      bannerUrl: data.banner_media?.secure_url || data.banner_url || null,
    });
  } catch (error: any) {
    console.error("GET /api/admin/originals/:id error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/originals
 * Create new Hekayaty Original project
 */
router.post("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const user = (req as any).user;
    const body = req.body;

    const slug = body.slug || (body.title ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `original-${Date.now()}`);

    const { data, error } = await supabase
      .from("originals")
      .insert({
        title: body.title,
        arabic_title: body.arabic_title || body.title,
        slug,
        tagline: body.tagline || null,
        description: body.description || null,
        arabic_description: body.arabic_description || null,
        content_type: body.content_type || "story",
        access_level: body.access_level || "subscriber",
        status: body.status || "published",
        is_featured: body.is_featured ?? false,
        is_trending: body.is_trending ?? false,
        is_new: body.is_new ?? true,
        is_coming_soon: body.is_coming_soon ?? false,
        creator_name: body.creator_name || "Hekayaty Studios",
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "CREATE",
      resource_type: "original",
      resource_id: data.id,
      details: { title: data.title },
    });

    res.status(201).json(data);
  } catch (error: any) {
    console.error("POST /api/admin/originals error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/originals/:id
 * Update Hekayaty Original attributes, status, and feature flags
 */
router.patch("/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const body = req.body;

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) payload.title = body.title;
    if (body.arabic_title !== undefined) payload.arabic_title = body.arabic_title;
    if (body.slug !== undefined) payload.slug = body.slug;
    if (body.tagline !== undefined) payload.tagline = body.tagline;
    if (body.description !== undefined) payload.description = body.description;
    if (body.arabic_description !== undefined) payload.arabic_description = body.arabic_description;
    if (body.content_type !== undefined) payload.content_type = body.content_type;
    if (body.access_level !== undefined) payload.access_level = body.access_level;
    if (body.status !== undefined) payload.status = body.status;
    if (body.is_featured !== undefined) payload.is_featured = body.is_featured;
    if (body.is_trending !== undefined) payload.is_trending = body.is_trending;
    if (body.is_new !== undefined) payload.is_new = body.is_new;
    if (body.is_coming_soon !== undefined) payload.is_coming_soon = body.is_coming_soon;
    if (body.creator_name !== undefined) payload.creator_name = body.creator_name;

    const { data, error } = await supabase
      .from("originals")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "UPDATE",
      resource_type: "original",
      resource_id: id,
      details: { title: data.title },
    });

    res.json(data);
  } catch (error: any) {
    console.error("PATCH /api/admin/originals/:id error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/originals/:id/duplicate
 * Duplicate an existing Hekayaty Original
 */
router.post("/:id/duplicate", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const { data: original, error: fetchErr } = await supabase
      .from("originals")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !original) {
      res.status(404).json({ error: "Original project not found" });
      return;
    }

    const newSlug = `${original.slug}-copy-${Date.now().toString().slice(-4)}`;
    const newTitle = `${original.title} (Copy)`;
    const newArabicTitle = `${original.arabic_title} (نسخة)`;

    const { data: copyData, error: copyErr } = await supabase
      .from("originals")
      .insert({
        ...original,
        id: undefined,
        title: newTitle,
        arabic_title: newArabicTitle,
        slug: newSlug,
        is_featured: false,
        status: "draft",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (copyErr) throw copyErr;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "DUPLICATE",
      resource_type: "original",
      resource_id: copyData.id,
      details: { duplicatedFrom: id, title: newTitle },
    });

    res.status(201).json(copyData);
  } catch (error: any) {
    console.error("POST /api/admin/originals/:id/duplicate error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/originals/:id
 * Delete original project
 */
router.delete("/:id", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const { error } = await supabase.from("originals").delete().eq("id", id);
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "DELETE",
      resource_type: "original",
      resource_id: id,
    });

    res.status(204).send();
  } catch (error: any) {
    console.error("DELETE /api/admin/originals/:id error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
