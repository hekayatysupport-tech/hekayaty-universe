import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/admin/audit
 * Query audit logs with pagination and filters
 */
router.get("/", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const action = req.query.action as string | undefined;
    const resourceType = req.query.resourceType as string | undefined;
    const limit = parseInt((req.query.limit as string) || "50", 10);

    let query = supabase
      .from("audit_logs")
      .select(`
        id,
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        timestamp,
        ip_address,
        user_profiles:user_id ( username, display_name )
      `)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (action && action !== "all") {
      query = query.eq("action", action);
    }
    if (resourceType && resourceType !== "all") {
      query = query.eq("resource_type", resourceType);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json((data ?? []).map((l: any) => ({
      id: l.id,
      userId: l.user_id,
      action: l.action,
      resourceType: l.resource_type,
      resourceId: l.resource_id,
      details: l.details,
      timestamp: l.timestamp,
      ipAddress: l.ip_address,
      user: l.user_profiles?.display_name || l.user_profiles?.username || "Admin",
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
