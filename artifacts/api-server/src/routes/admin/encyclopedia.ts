import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/admin/encyclopedia
 */
router.get("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (_req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("encyclopedia_entries")
      .select(`
        id,
        title,
        arabic_title,
        slug,
        category,
        summary,
        status,
        published_at,
        created_at,
        updated_at,
        media:cover_media_id ( secure_url )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json((data ?? []).map((e: any) => ({
      ...e,
      coverUrl: e.media?.secure_url || null,
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/encyclopedia/:id
 */
router.get("/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("encyclopedia_entries")
      .select(`
        *,
        media:cover_media_id ( secure_url )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    res.json({
      ...data,
      coverUrl: (data.media as any)?.secure_url || null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/encyclopedia
 */
router.post("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const user = (req as any).user;
    const { data, error } = await supabase
      .from("encyclopedia_entries")
      .insert({
        ...req.body,
        status: "draft",
        created_by: user.id,
        updated_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "CREATE",
      resource_type: "encyclopedia_entry",
      resource_id: data.id,
      details: { title: data.title }
    });

    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/encyclopedia/:id
 */
router.patch("/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const { data, error } = await supabase
      .from("encyclopedia_entries")
      .update({
        ...req.body,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "UPDATE",
      resource_type: "encyclopedia_entry",
      resource_id: id
    });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/encyclopedia/:id/workflow
 */
router.post("/:id/workflow", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;
    const roles = (req as any).userRoles;
    const canPublish = roles.some((r: string) => ["publisher", "administrator", "super_admin"].includes(r));

    if (["published", "approved"].includes(status) && !canPublish) {
      res.status(403).json({ error: "Only publishers and administrators can publish content." });
      return;
    }

    const updatePayload: any = { status, updated_by: user.id };
    if (status === "published") updatePayload.published_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("encyclopedia_entries")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "WORKFLOW_CHANGE",
      resource_type: "encyclopedia_entry",
      resource_id: id,
      details: { new_status: status }
    });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/encyclopedia/:id
 */
router.delete("/:id", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const { error } = await supabase.from("encyclopedia_entries").delete().eq("id", id);
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "DELETE",
      resource_type: "encyclopedia_entry",
      resource_id: id
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
