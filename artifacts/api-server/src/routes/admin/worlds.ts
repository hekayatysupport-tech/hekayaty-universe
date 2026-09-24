import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/admin/worlds
 */
router.get("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (_req, res): Promise<void> => {
  try {
    const { data: worlds, error } = await supabase
      .from("worlds")
      .select(`
        id,
        name,
        arabic_name,
        description,
        status,
        cover_media_id,
        published_at,
        created_at,
        updated_at,
        media:cover_media_id ( secure_url )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Fetch regions count for each world
    const { data: regions } = await supabase.from("regions").select("id, world_id");
    const countMap: Record<string, number> = {};
    (regions || []).forEach(r => {
      countMap[r.world_id] = (countMap[r.world_id] || 0) + 1;
    });

    res.json((worlds || []).map(w => ({
      ...w,
      type: "Mortal Realm",
      coverUrl: (w.media as any)?.secure_url || null,
      regionsCount: countMap[w.id] || 0,
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/worlds/:id
 * Get single world with regions & locations
 */
router.get("/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { data: world, error: wErr } = await supabase
      .from("worlds")
      .select(`
        *,
        media:cover_media_id ( secure_url )
      `)
      .eq("id", id)
      .single();

    if (wErr) throw wErr;

    const { data: regions, error: rErr } = await supabase
      .from("regions")
      .select(`
        *,
        locations ( id, name, arabic_name, description, location_type, cover_media_id )
      `)
      .eq("world_id", id);

    if (rErr) throw rErr;

    res.json({
      ...world,
      type: "Mortal Realm",
      coverUrl: (world.media as any)?.secure_url || null,
      regions: (regions || []).map((r: any) => ({
        ...r,
        locations: (r.locations || []).map((loc: any) => ({
          ...loc,
          type: loc.location_type || "City",
        })),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/worlds
 */
router.post("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const user = (req as any).user;
    const { type, coverUrl, ...worldFields } = req.body;

    const { data: world, error } = await supabase
      .from("worlds")
      .insert({
        name: worldFields.name,
        arabic_name: worldFields.arabic_name,
        description: worldFields.description || null,
        cover_media_id: worldFields.cover_media_id || null,
        status: worldFields.status || "draft",
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "CREATE",
      resource_type: "world",
      resource_id: world.id,
      details: { name: world.name },
    });

    res.status(201).json(world);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/worlds/:id
 */
router.patch("/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const { type, coverUrl, ...updateFields } = req.body;

    const { data: world, error } = await supabase
      .from("worlds")
      .update({
        name: updateFields.name,
        arabic_name: updateFields.arabic_name,
        description: updateFields.description || null,
        cover_media_id: updateFields.cover_media_id || null,
        status: updateFields.status,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "UPDATE",
      resource_type: "world",
      resource_id: id,
      details: { name: world.name },
    });

    res.json(world);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/worlds/:id/regions
 */
router.post("/:id/regions", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, arabic_name, description, cover_media_id } = req.body;

    const { data: region, error } = await supabase
      .from("regions")
      .insert({
        world_id: id,
        name,
        arabic_name: arabic_name || name,
        description: description || null,
        cover_media_id: cover_media_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(region);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/worlds/regions/:regionId
 */
router.delete("/regions/:regionId", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { regionId } = req.params;
    await supabase.from("locations").delete().eq("region_id", regionId);
    const { error } = await supabase.from("regions").delete().eq("id", regionId);
    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/worlds/regions/:regionId/locations
 */
router.post("/regions/:regionId/locations", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { regionId } = req.params;
    const { name, arabic_name, description, type, cover_media_id } = req.body;

    const { data: location, error } = await supabase
      .from("locations")
      .insert({
        region_id: regionId,
        name,
        arabic_name: arabic_name || name,
        description: description || null,
        location_type: type || "City",
        cover_media_id: cover_media_id || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(location);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/worlds/locations/:locationId
 */
router.delete("/locations/:locationId", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { locationId } = req.params;
    const { error } = await supabase.from("locations").delete().eq("id", locationId);
    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/worlds/:id
 */
router.delete("/:id", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const { data: regions } = await supabase.from("regions").select("id").eq("world_id", id);
    if (regions && regions.length > 0) {
      const regIds = regions.map((r) => r.id);
      await supabase.from("locations").delete().in("region_id", regIds);
      await supabase.from("regions").delete().eq("world_id", id);
    }

    const { error } = await supabase.from("worlds").delete().eq("id", id);
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "DELETE",
      resource_type: "world",
      resource_id: id,
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
