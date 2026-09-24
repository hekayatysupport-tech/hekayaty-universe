import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

/**
 * Server-authoritative middleware verifying active Hekayaty Originals subscription.
 * Must be executed AFTER requireAuth.
 */
export const requireSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ error: "Unauthorized: User authentication required" });
      return;
    }

    // Admins always have full access
    const userRoles = (req as any).userRoles || [];
    if (userRoles.some((r: string) => ["super_admin", "administrator", "publisher", "editor"].includes(r))) {
      return next();
    }

    // Check active subscription in database
    const { data: subData, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error("Subscription verification error:", error.message);
      res.status(500).json({ error: "Failed to verify subscription status" });
      return;
    }

    if (!subData) {
      res.status(403).json({
        error: "Subscription Required",
        message: "This chapter or premium episode is part of Hekayaty Originals. A membership is required to access.",
        accessLocked: true,
      });
      return;
    }

    (req as any).subscription = subData;
    next();
  } catch (error: any) {
    console.error("Subscription Middleware Error:", error);
    res.status(500).json({ error: "Internal server error during authorization" });
  }
};
