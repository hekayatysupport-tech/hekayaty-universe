import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/admin/timeline
 * Get all eras and events
 */
router.get("/", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (_req, res): Promise<void> => {
  try {
    const [erasRes, eventsRes] = await Promise.all([
      supabase.from("timeline_eras").select("*").order("order_index", { ascending: true }),
      supabase.from("timeline_events").select("*").order("order_index", { ascending: true }),
    ]);

    if (erasRes.error) throw erasRes.error;
    if (eventsRes.error) throw eventsRes.error;

    res.json({
      eras: erasRes.data ?? [],
      events: eventsRes.data ?? [],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/timeline/eras
 */
router.post("/eras", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { name, arabic_name, description, order_index } = req.body;
    const { data, error } = await supabase
      .from("timeline_eras")
      .insert({ name, arabic_name, description, order_index: order_index || 0 })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/timeline/eras/:id
 */
router.patch("/eras/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("timeline_eras")
      .update(req.body)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/timeline/eras/:id
 */
router.delete("/eras/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("timeline_eras").delete().eq("id", id);
    if (error) throw error;
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/timeline/events
 */
router.post("/events", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const user = (req as any).user;
    const {
      era_id,
      year_label,
      title,
      arabic_title,
      subtitle,
      description,
      order_index,
      character_ids,
      world_ids,
      comic_ids
    } = req.body;

    const { data: event, error } = await supabase
      .from("timeline_events")
      .insert({
        era_id: era_id || null,
        year_label,
        title,
        arabic_title,
        subtitle,
        description,
        order_index: order_index || 0,
        status: "draft",
        created_by: user.id,
        updated_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Attach relationships if provided
    if (character_ids && character_ids.length > 0) {
      await supabase.from("timeline_event_characters").insert(
        character_ids.map((cId: string) => ({ event_id: event.id, character_id: cId }))
      );
    }
    if (world_ids && world_ids.length > 0) {
      await supabase.from("timeline_event_worlds").insert(
        world_ids.map((wId: string) => ({ event_id: event.id, world_id: wId }))
      );
    }
    if (comic_ids && comic_ids.length > 0) {
      await supabase.from("timeline_event_comics").insert(
        comic_ids.map((iId: string) => ({ event_id: event.id, issue_id: iId }))
      );
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "CREATE",
      resource_type: "timeline_event",
      resource_id: event.id,
      details: { title: event.title }
    });

    res.status(201).json(event);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PATCH /api/admin/timeline/events/:id
 */
router.patch("/events/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const { character_ids, world_ids, comic_ids, ...updateFields } = req.body;

    const { data: event, error } = await supabase
      .from("timeline_events")
      .update({ ...updateFields, updated_by: user.id, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Update relationships if provided
    if (character_ids !== undefined) {
      await supabase.from("timeline_event_characters").delete().eq("event_id", id);
      if (character_ids.length > 0) {
        await supabase.from("timeline_event_characters").insert(
          character_ids.map((cId: string) => ({ event_id: id, character_id: cId }))
        );
      }
    }
    if (world_ids !== undefined) {
      await supabase.from("timeline_event_worlds").delete().eq("event_id", id);
      if (world_ids.length > 0) {
        await supabase.from("timeline_event_worlds").insert(
          world_ids.map((wId: string) => ({ event_id: id, world_id: wId }))
        );
      }
    }
    if (comic_ids !== undefined) {
      await supabase.from("timeline_event_comics").delete().eq("event_id", id);
      if (comic_ids.length > 0) {
        await supabase.from("timeline_event_comics").insert(
          comic_ids.map((iId: string) => ({ event_id: id, issue_id: iId }))
        );
      }
    }

    res.json(event);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/admin/timeline/events/:id
 */
router.delete("/events/:id", requireRole(["editor", "publisher", "administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const { error } = await supabase.from("timeline_events").delete().eq("id", id);
    if (error) throw error;

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "DELETE",
      resource_type: "timeline_event",
      resource_id: id
    });

    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
