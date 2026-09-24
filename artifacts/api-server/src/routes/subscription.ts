import { Router } from "express";
import { supabase } from "../lib/supabase";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Official Subscription Plans (Fixed Business Logic)
export const OFFICIAL_PLANS = [
  {
    type: "monthly",
    name: "Monthly",
    arabicName: "شهري",
    priceEgp: 59,
    intervalMonths: 1,
    description: "Full access to all Hekayaty Originals content, exclusive comics, and stories.",
    arabicDescription: "وصول كامل لكافة إصدارات حكاياتي أوريجينالز والقصص الحصرية.",
    isPopular: false,
  },
  {
    type: "quarterly",
    name: "3 Months",
    arabicName: "3 أشهر",
    priceEgp: 139,
    intervalMonths: 3,
    description: "Great value for 3 full months of unlimited universe access.",
    arabicDescription: "توفير ممتاز لمدة 3 أشهر كاملة لقراءة غير محدودة.",
    isPopular: false,
  },
  {
    type: "yearly",
    name: "Yearly",
    arabicName: "سنوي",
    priceEgp: 499,
    intervalMonths: 12,
    description: "Best Value — Save over 30% compared to monthly billing.",
    arabicDescription: "أفضل قيمة — ووّفر أكثر من 30% مقارنة بالاشتراك الشهري.",
    isPopular: true,
    badge: "Best Value",
    arabicBadge: "أفضل قيمة",
  },
];

// Official InstaPay Account Info for manual transfers
export const INSTAPAY_INFO = {
  handle: "hekayaty@instapay",
  accountName: "Hekayaty Originals / حكاياتي",
  phoneNumber: "01000000000",
  instructions: "Send the exact plan amount via InstaPay app to the handle or number above, then submit your transaction reference ID below.",
  arabicInstructions: "قم بتحويل قيمة الاشتراك المحددة عبر تطبيق إنستاباي (InstaPay) إلى العنوان أو الرقم أعلاه، ثم أدخل رقم المرجع/العملية للتحقق من قِبل الإدارة.",
};

/**
 * GET /api/subscription/plans
 */
router.get("/subscription/plans", (_req, res) => {
  res.json({
    currency: "EGP",
    instapay: INSTAPAY_INFO,
    plans: OFFICIAL_PLANS,
  });
});

/**
 * GET /api/account/subscription
 * Retrieve authenticated user's current subscription status and pending payments
 */
router.get("/account/subscription", requireAuth, async (req, res): Promise<void> => {
  try {
    const user = (req as any).user;

    const [subRes, pendingPayRes, historyRes] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "pending_verification")
        .order("created_at", { ascending: false })
        .maybeSingle(),
      supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const sub = subRes.data;
    const pendingPayment = pendingPayRes.data;
    const history = historyRes.data || [];

    const isActive = sub?.status === "active" && sub?.expires_at && new Date(sub.expires_at) > new Date();

    res.json({
      hasSubscription: isActive,
      status: isActive ? "active" : (pendingPayment ? "pending_verification" : (sub?.status || "none")),
      subscription: sub ? {
        id: sub.id,
        planType: sub.plan_type,
        amountEgp: sub.amount_egp,
        status: isActive ? "active" : sub.status,
        startsAt: sub.starts_at,
        expiresAt: sub.expires_at,
        daysRemaining: sub.expires_at ? Math.max(0, Math.ceil((new Date(sub.expires_at).getTime() - Date.now()) / (86400 * 1000))) : 0,
      } : null,
      pendingPayment: pendingPayment ? {
        id: pendingPayment.id,
        transactionRef: pendingPayment.transaction_ref,
        amountEgp: pendingPayment.amount_egp,
        submittedAt: pendingPayment.created_at,
      } : null,
      paymentHistory: history.map((p: any) => ({
        id: p.id,
        amountEgp: p.amount_egp,
        paymentMethod: p.payment_method,
        transactionRef: p.transaction_ref,
        status: p.status,
        rejectionReason: p.rejection_reason || null,
        createdAt: p.created_at,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching account subscription:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/subscription/checkout
 * Submit manual InstaPay payment reference for admin verification
 */
router.post("/subscription/checkout", requireAuth, async (req, res): Promise<void> => {
  try {
    const user = (req as any).user;
    const { planType, transactionRef, senderAccount } = req.body;

    if (!transactionRef || String(transactionRef).trim().length < 4) {
      res.status(400).json({ error: "Please enter a valid InstaPay reference / transaction ID." });
      return;
    }

    const cleanRef = String(transactionRef).trim();

    // Check if reference ID was already submitted or verified (Prevents duplicates)
    const { data: existingRef } = await supabase
      .from("payments")
      .select("id, status")
      .eq("transaction_ref", cleanRef)
      .maybeSingle();

    if (existingRef) {
      if (existingRef.status === "verified") {
        res.status(400).json({ error: "This InstaPay transaction reference has already been verified." });
        return;
      } else if (existingRef.status === "pending_verification") {
        res.status(400).json({ error: "This InstaPay transaction reference has already been submitted and is currently pending admin review." });
        return;
      }
    }

    const plan = OFFICIAL_PLANS.find((p) => p.type === planType);
    if (!plan) {
      res.status(400).json({ error: "Invalid subscription plan selected." });
      return;
    }

    const now = new Date();
    const monthsToAdd = plan.intervalMonths || 1;
    const estimatedExpiresAt = new Date(now);
    estimatedExpiresAt.setMonth(estimatedExpiresAt.getMonth() + monthsToAdd);

    // 1. Create Subscription row in 'pending' status
    const { data: sub, error: subErr } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_type: plan.type,
        amount_egp: plan.priceEgp,
        status: "pending",
        starts_at: now.toISOString(),
        expires_at: estimatedExpiresAt.toISOString(),
        payment_reference: cleanRef,
        payment_provider: "instapay",
        auto_renew: false,
      })
      .select()
      .single();

    if (subErr) throw subErr;

    // 2. Create Payment row in 'pending_verification' status
    const paymentPayload: Record<string, any> = {
      subscription_id: sub.id,
      user_id: user.id,
      amount_egp: plan.priceEgp,
      currency: "EGP",
      status: "pending_verification",
      payment_method: "instapay",
      transaction_ref: cleanRef,
    };

    if (senderAccount) {
      paymentPayload.metadata = { sender_account: senderAccount };
    }

    const { data: pay, error: payErr } = await supabase
      .from("payments")
      .insert(paymentPayload)
      .select()
      .single();

    if (payErr) throw payErr;

    res.status(201).json({
      success: true,
      message: "InstaPay payment reference submitted successfully. Your subscription will be activated upon admin verification.",
      status: "pending_verification",
      paymentId: pay.id,
      transactionRef: cleanRef,
      plan: plan.name,
      amountEgp: plan.priceEgp,
    });
  } catch (error: any) {
    console.error("Error submitting checkout:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
