import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/admin/media
 * Browse media with search, filter, and pagination
 */
router.get("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;

    let query = supabase
      .from("media")
      .select("id, public_id, secure_url, width, height, format, resource_type, category, alt_text, created_at")
      .order("created_at", { ascending: false });

    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    if (search) {
      query = query.ilike("alt_text", `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json((data ?? []).map((m: any) => ({
      id: m.id,
      publicId: m.public_id,
      secureUrl: m.secure_url,
      width: m.width,
      height: m.height,
      format: m.format,
      resourceType: m.resource_type,
      category: m.category,
      altText: m.alt_text,
      createdAt: m.created_at,
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/media/:id
 * Delete media asset from DB and optionally Cloudinary
 */
router.delete("/:id", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const { data: mediaRecord } = await supabase
      .from("media")
      .select("public_id")
      .eq("id", id)
      .single();

    // Try deleting from Cloudinary if configured
    if (mediaRecord?.public_id && process.env["CLOUDINARY_CLOUD_NAME"]) {
      try {
        const { v2: cloudinary } = await import("cloudinary" as any);
        cloudinary.config({
          cloud_name: process.env["CLOUDINARY_CLOUD_NAME"],
          api_key: process.env["CLOUDINARY_API_KEY"],
          api_secret: process.env["CLOUDINARY_API_SECRET"],
        });
        await cloudinary.uploader.destroy(mediaRecord.public_id);
      } catch (cErr) {
        console.warn("Cloudinary delete warning:", cErr);
      }
    }

    const { error } = await supabase.from("media").delete().eq("id", id);
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "DELETE",
      resource_type: "media",
      resource_id: id
    });

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
