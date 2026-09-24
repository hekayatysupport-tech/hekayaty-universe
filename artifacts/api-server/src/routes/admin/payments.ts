import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";
import { OFFICIAL_PLANS } from "../subscription";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/admin/payments
 */
router.get("/", requireRole(["administrator", "super_admin"]), async (_req, res): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/payments/:id/approve
 * Admin approves InstaPay payment -> Activates Subscription
 */
router.post("/:id/approve", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const admin = (req as any).user;

    // 1. Fetch Payment Record
    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .select("*, subscription:subscription_id ( id, user_id, plan_type )")
      .eq("id", id)
      .single();

    if (payErr || !payment) {
      res.status(404).json({ error: "Payment record not found" });
      return;
    }

    if (payment.status === "verified") {
      res.status(400).json({ error: "This payment has already been verified." });
      return;
    }

    // 2. Duplicate Prevention Check
    const { data: duplicateVerified } = await supabase
      .from("payments")
      .select("id")
      .eq("transaction_ref", payment.transaction_ref)
      .eq("status", "verified")
      .neq("id", id)
      .maybeSingle();

    if (duplicateVerified) {
      res.status(400).json({ error: `DUPLICATE BLOCKED: InstaPay reference "${payment.transaction_ref}" has ALREADY been verified for another transaction.` });
      return;
    }

    // 3. Calculate Subscription Start and Expiry Dates
    const plan = OFFICIAL_PLANS.find((p) => p.type === payment.subscription?.plan_type) || OFFICIAL_PLANS[0];
    const monthsToAdd = plan.intervalMonths || 1;

    const { data: existingActiveSub } = await supabase
      .from("subscriptions")
      .select("expires_at")
      .eq("user_id", payment.user_id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    let startsAt = new Date();
    if (existingActiveSub && existingActiveSub.expires_at) {
      startsAt = new Date(existingActiveSub.expires_at);
    }

    const expiresAt = new Date(startsAt);
    expiresAt.setMonth(expiresAt.getMonth() + monthsToAdd);

    // 4. Update Payment to 'verified' with graceful fallback for metadata
    const paymentUpdates: Record<string, any> = {
      status: "verified",
      metadata: {
        ...(payment.metadata || {}),
        verified_by: admin.id,
        verified_at: new Date().toISOString(),
      },
    };

    const { error: updatePayErr } = await supabase
      .from("payments")
      .update(paymentUpdates)
      .eq("id", id);

    if (updatePayErr) {
      console.warn("Could not update payment metadata, attempting status update:", updatePayErr.message);
      await supabase.from("payments").update({ status: "verified" }).eq("id", id);
    }

    // 5. Update Subscription to 'active'
    if (payment.subscription_id) {
      const { error: updateSubErr } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        })
        .eq("id", payment.subscription_id);

      if (updateSubErr) {
        console.warn("Subscription update warning:", updateSubErr.message);
        await supabase.from("subscriptions").update({ status: "active" }).eq("id", payment.subscription_id);
      }
    }

    // 6. Audit Trail Entry
    try {
      await supabase.from("audit_logs").insert({
        user_id: admin.id,
        action: "APPROVE_PAYMENT",
        resource_type: "subscription",
        resource_id: payment.subscription_id || id,
        details: {
          payment_id: id,
          transaction_ref: payment.transaction_ref,
          plan_type: plan.type,
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
        },
      });
    } catch {
      // audit log failure should not block user response
    }

    res.json({
      success: true,
      message: "InstaPay payment approved successfully! Subscription is now active.",
      startsAt: startsAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error("Error approving payment:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/payments/:id/reject
 * Admin rejects InstaPay payment
 */
router.post("/:id/reject", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const admin = (req as any).user;

    if (!reason || String(reason).trim().length === 0) {
      res.status(400).json({ error: "Rejection reason is required." });
      return;
    }

    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .select("*")
      .eq("id", id)
      .single();

    if (payErr || !payment) {
      res.status(404).json({ error: "Payment record not found" });
      return;
    }

    // Update payment to 'rejected'
    const paymentUpdates: Record<string, any> = {
      status: "rejected",
      metadata: {
        ...(payment.metadata || {}),
        rejection_reason: reason,
        verified_by: admin.id,
        verified_at: new Date().toISOString(),
      },
    };

    const { error: rejPayErr } = await supabase
      .from("payments")
      .update(paymentUpdates)
      .eq("id", id);

    if (rejPayErr) {
      await supabase.from("payments").update({ status: "rejected" }).eq("id", id);
    }

    // Update subscription to 'rejected'
    if (payment.subscription_id) {
      await supabase
        .from("subscriptions")
        .update({ status: "rejected" })
        .eq("id", payment.subscription_id);
    }

    // Audit Trail Entry
    try {
      await supabase.from("audit_logs").insert({
        user_id: admin.id,
        action: "REJECT_PAYMENT",
        resource_type: "subscription",
        resource_id: payment.subscription_id || id,
        details: {
          payment_id: id,
          transaction_ref: payment.transaction_ref,
          reason,
        },
      });
    } catch {
      // audit log optional
    }

    res.json({
      success: true,
      message: "Payment rejected.",
    });
  } catch (error: any) {
    console.error("Error rejecting payment:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
