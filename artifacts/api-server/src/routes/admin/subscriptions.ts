import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";
import { OFFICIAL_PLANS } from "../subscription";

const router = Router();
router.use(requireAuth);

/**
 * GET /api/admin/subscriptions
 * Verification Queue & Subscriptions Ledger
 */
router.get("/", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
  try {
    const { status } = req.query;

    let query = supabase.from("payments").select(`
      *,
      subscription:subscription_id ( id, plan_type, starts_at, expires_at, status )
    `).order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", String(status));
    }

    const { data: paymentsData, error: payErr } = await query;
    if (payErr) throw payErr;

    const { data: subsData } = await supabase.from("subscriptions").select("*");

    // Fetch user profiles & auth users for subscriber names & emails
    const userIds = Array.from(new Set((paymentsData || []).map((p: any) => p.user_id).filter(Boolean)));
    const userMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const [{ data: profiles }, authRes] = await Promise.all([
        supabase.from("user_profiles").select("id, display_name, username, role, created_at").in("id", userIds),
        supabase.auth.admin.listUsers().catch(() => ({ data: { users: [] } })),
      ]);

      const authUserMap: Record<string, any> = {};
      if (authRes?.data?.users) {
        authRes.data.users.forEach((u: any) => {
          authUserMap[u.id] = u;
        });
      }

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((prof: any) => {
        profileMap[prof.id] = prof;
      });

      for (const uid of userIds) {
        const prof = profileMap[uid] || {};
        const authUser = authUserMap[uid] || {};

        const email = authUser.email || prof.email || "No email";
        const displayName = prof.display_name || prof.username || authUser.user_metadata?.display_name || authUser.user_metadata?.username || email.split("@")[0] || "Subscriber";
        const username = prof.username || authUser.user_metadata?.username || email.split("@")[0] || "user";

        userMap[uid] = {
          id: uid,
          displayName,
          username,
          email,
          role: prof.role || "reader",
          createdAt: authUser.created_at || prof.created_at || null,
        };
      }
    }

    const enrichedPayments = (paymentsData || []).map((p: any) => {
      const userProfile = userMap[p.user_id] || {
        id: p.user_id,
        displayName: "Subscriber",
        username: "user",
        email: "No email",
        role: "reader",
      };
      const senderAccount = p.sender_account || p.metadata?.sender_account || p.metadata?.senderAccount || null;
      return {
        ...p,
        sender_account: senderAccount,
        user: userProfile,
      };
    });

    const totalActive = (subsData || []).filter((s: any) => s.status === "active" && new Date(s.expires_at) > new Date()).length;
    const pendingCount = (paymentsData || []).filter((p: any) => p.status === "pending_verification").length;
    const totalRevenueEgp = (paymentsData || []).filter((p: any) => p.status === "verified" || p.status === "successful").reduce((acc: number, p: any) => acc + (p.amount_egp || 0), 0);

    res.json({
      summary: {
        totalSubscriptions: subsData?.length || 0,
        activeSubscribers: totalActive,
        pendingVerificationCount: pendingCount,
        totalRevenueEgp: totalRevenueEgp,
      },
      payments: enrichedPayments,
    });
  } catch (error: any) {
    console.error("Error in admin subscriptions ledger:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/payments/:id/approve
 * Admin approves InstaPay payment -> Activates Subscription
 */
router.post("/payments/:id/approve", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
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

    // 3. Calculate Subscription Start and Expiry Dates (Handles Renewal Extension)
    const plan = OFFICIAL_PLANS.find((p) => p.type === payment.subscription?.plan_type) || OFFICIAL_PLANS[0];
    const monthsToAdd = plan.intervalMonths || 1;

    // Check if user currently has an active subscription
    const { data: existingActiveSub } = await supabase
      .from("subscriptions")
      .select("expires_at")
      .eq("user_id", payment.user_id)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    let startsAt = new Date();
    if (existingActiveSub && existingActiveSub.expires_at) {
      // Extend seamlessly from existing expiration date!
      startsAt = new Date(existingActiveSub.expires_at);
    }

    const expiresAt = new Date(startsAt);
    expiresAt.setMonth(expiresAt.getMonth() + monthsToAdd);

    // 4. Update Payment to 'verified'
    const { error: updatePayErr } = await supabase
      .from("payments")
      .update({
        status: "verified",
        verified_by: admin.id,
        verified_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updatePayErr) throw updatePayErr;

    // 5. Update Subscription to 'active'
    if (payment.subscription_id) {
      const { error: updateSubErr } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          starts_at: startsAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.subscription_id);

      if (updateSubErr) throw updateSubErr;
    }

    // 6. Audit Trail Entry
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
router.post("/payments/:id/reject", requireRole(["administrator", "super_admin"]), async (req, res): Promise<void> => {
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
    await supabase
      .from("payments")
      .update({
        status: "rejected",
        rejection_reason: reason,
        verified_by: admin.id,
        verified_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Update subscription to 'rejected'
    if (payment.subscription_id) {
      await supabase
        .from("subscriptions")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.subscription_id);
    }

    // Audit Trail Entry
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
