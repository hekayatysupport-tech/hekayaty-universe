import { Router } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * GET /api/timeline
 */
router.get("/timeline", async (_req, res) => {
  const { data: eras, error: erasErr } = await supabase
    .from("timeline_eras")
    .select("id, name, arabic_name, description, order_index")
    .order("order_index");

  if (erasErr) {
    return res.status(500).json({ error: "Internal server error" });
  }

  const { data: events } = await supabase
    .from("timeline_events")
    .select("id, era_id, year_label, title, arabic_title, subtitle, description, order_index")
    .order("order_index");

  const result = (eras ?? []).map((era: any) => ({
    id: era.id,
    name: era.name,
    arabicName: era.arabic_name,
    description: era.description,
    orderIndex: era.order_index,
    events: (events ?? [])
      .filter((e: any) => e.era_id === era.id)
      .map((e: any) => ({
        id: e.id,
        yearLabel: e.year_label,
        title: e.title,
        arabicTitle: e.arabic_title,
        subtitle: e.subtitle,
        description: e.description,
        orderIndex: e.order_index,
      })),
  }));

  res.json(result);
});

/**
 * GET /api/timeline/:id
 */
router.get("/timeline/:id", async (req, res) => {
  const { id } = req.params;

  const { data: event, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const { data: chars } = await supabase
    .from("timeline_event_characters")
    .select(`characters ( id, name, arabic_name, media:portrait_media_id ( secure_url ) )`)
    .eq("event_id", id);

  const { data: eventWorlds } = await supabase
    .from("timeline_event_worlds")
    .select(`worlds ( id, name, arabic_name )`)
    .eq("event_id", id);

  const e = event as any;
  res.json({
    id: e.id,
    yearLabel: e.year_label,
    title: e.title,
    arabicTitle: e.arabic_title,
    subtitle: e.subtitle,
    description: e.description,
    characters: (chars ?? []).map((c: any) => c.characters).filter(Boolean),
    worlds: (eventWorlds ?? []).map((w: any) => w.worlds).filter(Boolean),
  });
});

export default router;
