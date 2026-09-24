import { Router } from "express";
import { supabase } from "../../lib/supabase";
import { requireAuth, requireRole } from "../../middleware/auth";

const router = Router();

// Only Super Admins and Administrators can manage users
router.use(requireAuth);
router.use(requireRole(["super_admin", "administrator"]));

/**
 * GET /api/admin/writers
 * List all writer profiles (with linked user_id)
 */
router.get("/writers-list", async (_req, res): Promise<void> => {
  try {
    const [profilesRes, rolesRes, writersRes] = await Promise.all([
      supabase.from("user_profiles").select("id, username, display_name, role").eq("role", "writer"),
      supabase.from("user_roles").select("user_id").eq("role", "writer"),
      supabase.from("writers").select("id, slug, name, arabic_name, role, avatar_url, user_id, joined_at").order("joined_at", { ascending: false }),
    ]);

    const writerUserIds = new Set<string>();
    (profilesRes.data || []).forEach((p: any) => writerUserIds.add(p.id));
    (rolesRes.data || []).forEach((r: any) => writerUserIds.add(r.user_id));

    const existingWriters = writersRes.data || [];
    const existingUserIds = new Set(existingWriters.map((w: any) => w.user_id).filter(Boolean));

    for (const userId of Array.from(writerUserIds)) {
      if (!existingUserIds.has(userId)) {
        const { data: userProfile } = await supabase
          .from("user_profiles")
          .select("username, display_name")
          .eq("id", userId)
          .maybeSingle();

        const displayName = userProfile?.display_name || userProfile?.username || `Writer-${userId.slice(0, 5)}`;
        const slug = (userProfile?.username || displayName)
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") || `writer-${Date.now().toString(36)}`;

        const writerId = `writer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const { data: newWriter } = await supabase
          .from("writers")
          .insert({
            id: writerId,
            user_id: userId,
            slug,
            name: displayName,
            arabic_name: displayName,
            role: "Writer",
            arabic_role: "كاتب",
            bio: "كاتب ورسام في عالم حكاياتي.",
            arabic_bio: "كاتب ورسام في عالم حكاياتي.",
            avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
            banner_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200",
            works_count: 0,
            joined_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          })
          .select("id, slug, name, arabic_name, role, avatar_url, user_id, joined_at")
          .single();

        if (newWriter) {
          existingWriters.push(newWriter);
        }
      }
    }

    res.json(existingWriters);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/users/:id/promote-writer
 * Promote a user to "writer" role and create their writer profile.
 * Body: { name, arabicName, role, arabicRole, bio, arabicBio, avatarUrl, bannerUrl, slug }
 */
router.post("/:id/promote-writer", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const granter = (req as any).user;
    const {
      name,
      arabicName,
      role: writerRole,
      arabicRole,
      bio,
      arabicBio,
      avatarUrl,
      bannerUrl,
      slug,
    } = req.body;

    if (!name || !slug) {
      res.status(400).json({ error: "name and slug are required" });
      return;
    }

    // 1. Update user_profiles.role → writer
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({ role: "writer", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (profileError) throw profileError;

    // 2. Check if a writer profile already exists for this user
    const { data: existing } = await supabase
      .from("writers")
      .select("id, name, slug")
      .eq("user_id", id)
      .maybeSingle();

    if (existing) {
      // Already has a writer profile — just update it
      const { error: updateErr } = await supabase
        .from("writers")
        .update({
          name: name || existing.name,
          arabic_name: arabicName || name,
          role: writerRole || "Writer",
          arabic_role: arabicRole || writerRole || "كاتب",
          bio: bio || "",
          arabic_bio: arabicBio || bio || "",
          avatar_url: avatarUrl || null,
          banner_url: bannerUrl || null,
          slug: slug || existing.slug,
        })
        .eq("id", existing.id);

      if (updateErr) throw updateErr;

      res.json({ message: "Writer profile updated", writerId: existing.id, slug: slug || existing.slug });
      return;
    }

    // 3. Create new writer profile
    const writerId = `writer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const { error: writerError } = await supabase.from("writers").insert({
      id: writerId,
      user_id: id,
      slug,
      name,
      arabic_name: arabicName || name,
      role: writerRole || "Writer",
      arabic_role: arabicRole || writerRole || "كاتب",
      bio: bio || "",
      arabic_bio: arabicBio || bio || "",
      avatar_url: avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
      banner_url: bannerUrl || null,
      works_count: 0,
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    if (writerError) throw writerError;

    // 4. Audit log
    try {
      await supabase.from("audit_logs").insert({
        user_id: granter?.id || id,
        action: "PROMOTE_TO_WRITER",
        resource_type: "user",
        resource_id: id,
        details: { writerId, slug },
      });
    } catch {}

    res.status(201).json({ message: "User promoted to writer", writerId, slug });
  } catch (error: any) {
    console.error("Promote writer error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/users/:id/demote-writer
 * Remove writer role and optionally delete writer profile
 */
router.delete("/:id/demote-writer", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const granter = (req as any).user;

    // Reset role to reader
    await supabase
      .from("user_profiles")
      .update({ role: "reader", updated_at: new Date().toISOString() })
      .eq("id", id);

    // Remove writer profile
    await supabase.from("writers").delete().eq("user_id", id);

    try {
      await supabase.from("audit_logs").insert({
        user_id: granter?.id || id,
        action: "DEMOTE_FROM_WRITER",
        resource_type: "user",
        resource_id: id,
        details: {},
      });
    } catch {}

    res.json({ message: "Writer profile removed" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/users
 * List all users and their roles
 */
router.get("/", async (_req, res): Promise<void> => {
  try {
    const [{ data: users, error: usersError }, { data: roles }, authRes] = await Promise.all([
      supabase.from("user_profiles").select("id, username, display_name, role, created_at"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.auth.admin.listUsers().catch(() => ({ data: { users: [] } })),
    ]);

    if (usersError) throw usersError;

    const authUserMap: Record<string, any> = {};
    if (authRes?.data?.users) {
      authRes.data.users.forEach((u: any) => {
        authUserMap[u.id] = u;
      });
    }

    const combined = (users || []).map((u: any) => {
      const authUser = authUserMap[u.id] || {};
      const extraRoles = (roles || []).filter((r: any) => r.user_id === u.id).map((r: any) => r.role);
      const allRoles = Array.from(new Set([u.role || "reader", ...extraRoles]));
      const email = authUser.email || u.email || "No email";
      const displayName = u.display_name || u.username || authUser.user_metadata?.display_name || authUser.user_metadata?.username || email.split("@")[0] || "User";

      return {
        ...u,
        display_name: displayName,
        email,
        created_at: authUser.created_at || u.created_at || null,
        role: u.role || "reader",
        roles: allRoles,
      };
    });

    res.json(combined);
  } catch (error: any) {
    console.error("Fetch users error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Manually change a user's role (e.g., super_admin, writer, reader)
 */
router.put("/:id/role", async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const granter = (req as any).user;

    if (!role) {
      res.status(400).json({ error: "Role is required" });
      return;
    }

    // Update user_profiles.role column
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (profileError) throw profileError;

    // If promoted to writer, ensure a writer profile exists
    if (role === "writer") {
      const { data: existingWriter } = await supabase
        .from("writers")
        .select("id")
        .eq("user_id", id)
        .maybeSingle();

      if (!existingWriter) {
        // Fetch user info for defaults
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("username, display_name")
          .eq("id", id)
          .maybeSingle();

        const displayName = profile?.display_name || profile?.username || `Writer-${id.slice(0, 5)}`;
        const slug = (profile?.username || displayName)
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "") || `writer-${Date.now().toString(36)}`;

        const writerId = `writer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await supabase.from("writers").insert({
          id: writerId,
          user_id: id,
          slug,
          name: displayName,
          arabic_name: displayName,
          role: "Writer",
          arabic_role: "كاتب",
          bio: "كاتب ورسام في عالم حكاياتي.",
          arabic_bio: "كاتب ورسام في عالم حكاياتي.",
          avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
          banner_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200",
          works_count: 0,
          joined_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      }
    }

    // Log the audit action
    await supabase.from("audit_logs").insert({
      user_id: granter?.id || id,
      action: "UPDATE_USER_ROLE",
      resource_type: "user",
      resource_id: id,
      details: { role }
    });

    res.json({ message: "User role updated successfully", role });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/users/:id/roles/:role
 * Remove a role from a user
 */
router.delete("/:id/roles/:role", async (req, res): Promise<void> => {
  try {
    const { id, role } = req.params;
    const granter = (req as any).user;

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .match({ user_id: id, role });

    if (error) throw error;

    // Log the action
    await supabase.from("audit_logs").insert({
      user_id: granter.id,
      action: "REVOKE_ROLE",
      resource_type: "user",
      resource_id: id,
      details: { role }
    });

    res.json({ message: "Role removed successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
