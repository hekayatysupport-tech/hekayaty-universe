import { Router, type Request, type Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * GET /api/me
 * Returns current authenticated user profile and all roles (bypassing RLS via backend)
 */
router.get("/me", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing token" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Query user_profiles using backend client (bypasses RLS restriction)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const rolesList: string[] = [];
    if (profile?.role) {
      rolesList.push(profile.role);
    }
    if (rolesData) {
      rolesData.forEach((r: any) => {
        if (!rolesList.includes(r.role)) rolesList.push(r.role);
      });
    }

    if (rolesList.length === 0) {
      rolesList.push("reader");
    }

    // Check active subscription in subscriptions table
    const { data: activeSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const isStaff = rolesList.some((r) =>
      ["super_admin", "administrator", "editor", "publisher", "admin", "writer"].includes(r)
    );
    const isSubscriber = Boolean(activeSub) || isStaff;

    res.json({
      id: user.id,
      email: user.email,
      role: profile?.role || "reader",
      roles: rolesList,
      isSubscriber,
      subscription: activeSub ? {
        id: activeSub.id,
        planType: activeSub.plan_type,
        amountEgp: activeSub.amount_egp,
        status: activeSub.status,
        startsAt: activeSub.starts_at,
        expiresAt: activeSub.expires_at,
      } : null,
      displayName: profile?.display_name || user.email?.split("@")[0] || "Explorer",
      username: profile?.username || user.email?.split("@")[0] || "user",
    });
  } catch (error: any) {
    console.error("GET /api/me error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

export default router;
