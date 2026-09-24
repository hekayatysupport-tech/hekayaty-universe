import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/admin/characters
 * Get all characters
 */
router.get("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (_req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("characters")
      .select(`
        id,
        name,
        arabic_name,
        alias,
        alignment,
        status,
        published_at,
        created_at,
        updated_at,
        media:portrait_media_id ( secure_url )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json((data ?? []).map((c: any) => ({
      ...c,
      portraitUrl: c.media?.secure_url || null,
      character_status: "Active",
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/characters/:id
 * Get single character with stats, abilities, and relationships
 */
router.get("/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const [charRes, statsRes, abilitiesRes, relsRes, galleryRes] = await Promise.all([
      supabase.from("characters").select("*, media:portrait_media_id ( secure_url )").eq("id", id).single(),
      supabase.from("character_stats").select("*").eq("character_id", id).maybeSingle(),
      supabase.from("character_abilities").select("*").eq("character_id", id),
      supabase.from("character_relationships").select("*").or(`character_a_id.eq.${id},character_b_id.eq.${id}`),
      supabase.from("character_gallery").select("*, media:media_id ( secure_url )").eq("character_id", id),
    ]);

    if (charRes.error) throw charRes.error;

    res.json({
      ...charRes.data,
      portraitUrl: (charRes.data.media as any)?.secure_url || null,
      stats: statsRes.data || { strength: 80, speed: 75, intelligence: 85, wisdom: 70, willpower: 90, magic: 60 },
      abilities: abilitiesRes.data || [],
      relationships: (relsRes.data || []).map((r: any) => ({
        target_character_id: r.character_a_id === id ? r.character_b_id : r.character_a_id,
        relationship_type: r.relation_type,
        description: r.description || "",
      })),
      gallery: (galleryRes.data || []).map((g: any) => ({
        id: g.id,
        mediaId: g.media_id,
        imageUrl: g.media?.secure_url || null,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/characters
 */
router.post("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const user = (req as any).user;
    const { stats, abilities, relationships, portraitUrl, character_status, ...characterFields } = req.body;

    const { data: character, error: charErr } = await supabase
      .from("characters")
      .insert({
        name: characterFields.name,
        arabic_name: characterFields.arabic_name,
        alias: characterFields.alias || null,
        title: characterFields.title || null,
        quote: characterFields.quote || null,
        alignment: characterFields.alignment || "Hero",
        power_category: characterFields.power_category || null,
        organization: characterFields.organization || null,
        short_bio: characterFields.short_bio || null,
        full_bio: characterFields.full_bio || null,
        about_text: characterFields.about_text || null,
        portrait_media_id: characterFields.portrait_media_id || null,
        status: characterFields.status || "draft",
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (charErr) throw charErr;

    // Insert stats if provided
    if (stats) {
      await supabase.from("character_stats").insert({
        character_id: character.id,
        strength: stats.strength ?? 50,
        speed: stats.speed ?? 50,
        intelligence: stats.intelligence ?? 50,
        wisdom: stats.wisdom ?? 50,
        willpower: stats.willpower ?? 50,
        magic: stats.magic ?? 50,
      });
    }

    // Insert abilities if provided
    if (abilities && abilities.length > 0) {
      await supabase.from("character_abilities").insert(
        abilities.map((a: any) => ({
          character_id: character.id,
          name: a.name,
          description: a.description || a.arabic_name || null,
        }))
      );
    }

    // Insert relationships if provided
    if (relationships && relationships.length > 0) {
      await supabase.from("character_relationships").insert(
        relationships.map((r: any) => ({
          character_a_id: character.id,
          character_b_id: r.target_character_id,
          relation_type: r.relationship_type || "Ally",
          description: r.description || null,
        }))
      );
    }

    // Audit Log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "CREATE",
      resource_type: "character",
      resource_id: character.id,
      details: { name: character.name },
    });

    res.status(201).json(character);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/admin/characters/:id
 */
router.patch("/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const { stats, abilities, relationships, portraitUrl, character_status, ...updateFields } = req.body;

    const { data: character, error: charErr } = await supabase
      .from("characters")
      .update({
        name: updateFields.name,
        arabic_name: updateFields.arabic_name,
        alias: updateFields.alias || null,
        title: updateFields.title || null,
        quote: updateFields.quote || null,
        alignment: updateFields.alignment || "Hero",
        power_category: updateFields.power_category || null,
        organization: updateFields.organization || null,
        short_bio: updateFields.short_bio || null,
        full_bio: updateFields.full_bio || null,
        about_text: updateFields.about_text || null,
        portrait_media_id: updateFields.portrait_media_id || null,
        status: updateFields.status,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (charErr) throw charErr;

    // Upsert stats
    if (stats) {
      await supabase.from("character_stats").upsert({
        character_id: id,
        strength: stats.strength ?? 50,
        speed: stats.speed ?? 50,
        intelligence: stats.intelligence ?? 50,
        wisdom: stats.wisdom ?? 50,
        willpower: stats.willpower ?? 50,
        magic: stats.magic ?? 50,
      });
    }

    // Replace abilities
    if (abilities !== undefined) {
      await supabase.from("character_abilities").delete().eq("character_id", id);
      if (abilities.length > 0) {
        await supabase.from("character_abilities").insert(
          abilities.map((a: any) => ({
            character_id: id,
            name: a.name,
            description: a.description || a.arabic_name || null,
          }))
        );
      }
    }

    // Replace relationships
    if (relationships !== undefined) {
      await supabase.from("character_relationships").delete().or(`character_a_id.eq.${id},character_b_id.eq.${id}`);
      if (relationships.length > 0) {
        await supabase.from("character_relationships").insert(
          relationships.map((r: any) => ({
            character_a_id: id,
            character_b_id: r.target_character_id,
            relation_type: r.relationship_type || "Ally",
            description: r.description || null,
          }))
        );
      }
    }

    // Audit Log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "UPDATE",
      resource_type: "character",
      resource_id: id,
      details: { name: character.name },
    });

    res.json(character);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/characters/:id/workflow
 */
router.post("/:id/workflow", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;
    const roles = (req as any).userRoles;
    const canPublish = roles.some((r: string) => ["publisher", "administrator", "super_admin"].includes(r));

    if (["published", "approved"].includes(status) && !canPublish) {
      res.status(403).json({ error: "Only publishers and administrators can publish characters." });
      return;
    }

    const updatePayload: any = {
      status,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    };

    if (status === "published") {
      updatePayload.published_at = new Date().toISOString();
    }

    const { data: character, error } = await supabase
      .from("characters")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "WORKFLOW_CHANGE",
      resource_type: "character",
      resource_id: id,
      details: { new_status: status },
    });

    res.json(character);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/characters/:id
 */
router.delete("/:id", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    await supabase.from("character_stats").delete().eq("character_id", id);
    await supabase.from("character_abilities").delete().eq("character_id", id);
    await supabase.from("character_relationships").delete().or(`character_a_id.eq.${id},character_b_id.eq.${id}`);
    await supabase.from("character_gallery").delete().eq("character_id", id);

    const { error } = await supabase.from("characters").delete().eq("id", id);
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "DELETE",
      resource_type: "character",
      resource_id: id,
    });

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
