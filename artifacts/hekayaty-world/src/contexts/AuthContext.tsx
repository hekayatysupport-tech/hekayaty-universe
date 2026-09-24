import React, { useEffect, useState, createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  roles: string[];
  isLoading: boolean;
  isAdmin: boolean;
  isPublisher: boolean;
  isSubscriber: boolean;
  subscription: any | null;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  roles: [],
  isLoading: true,
  isAdmin: false,
  isPublisher: false,
  isSubscriber: false,
  subscription: null,
});

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => useContext(AuthContext);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoles(session.user.id);
      } else {
        setIsSubscriber(false);
        setSubscriptionDetails(null);
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRoles(session.user.id);
      } else {
        setRoles([]);
        setIsSubscriber(false);
        setSubscriptionDetails(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRoles = async (userId: string) => {
    try {
      const currentSession = (await supabase.auth.getSession()).data.session;
      if (currentSession?.access_token) {
        try {
          const res = await fetch("/api/me", {
            headers: { Authorization: `Bearer ${currentSession.access_token}` },
          });
          if (res.ok) {
            const me = await res.json();
            console.log("[AuthContext] loaded /api/me profile:", me);
            if (me.roles && Array.isArray(me.roles) && me.roles.length > 0) {
              setRoles(me.roles);
              setIsSubscriber(Boolean(me.isSubscriber));
              setSubscriptionDetails(me.subscription || null);
              return;
            }
          }
        } catch (apiErr) {
          console.warn("[AuthContext] /api/me fetch error:", apiErr);
        }
      }

      // Fallback query to Supabase client
      const [profileRes, rolesRes, subRes] = await Promise.all([
        supabase.from("user_profiles").select("role").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("subscriptions").select("*").eq("user_id", userId).eq("status", "active").gte("expires_at", new Date().toISOString()).maybeSingle(),
      ]);

      const roleList: string[] = [];
      if (profileRes.data?.role) {
        roleList.push(profileRes.data.role);
      }
      if (rolesRes.data) {
        rolesRes.data.forEach((r: { role: string }) => {
          if (!roleList.includes(r.role)) roleList.push(r.role);
        });
      }

      if (roleList.length === 0) {
        roleList.push("reader");
      }

      const isStaffRole = roleList.some((r) =>
        ["super_admin", "administrator", "editor", "publisher", "admin", "writer"].includes(r)
      );

      console.log("[AuthContext] roles loaded via client:", roleList);
      setRoles(roleList);
      setIsSubscriber(Boolean(subRes.data) || isStaffRole);
      setSubscriptionDetails(subRes.data || null);
    } catch (e) {
      console.error("[AuthContext] fetchRoles error:", e);
      setRoles(["reader"]);
      setIsSubscriber(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = roles.some((role) =>
    ["super_admin", "administrator", "editor", "publisher", "admin", "writer"].includes(role)
  );

  const isPublisher = roles.some((role) =>
    ["super_admin", "administrator", "publisher"].includes(role)
  );

  return (
    <AuthContext.Provider value={{ session, user, roles, isLoading, isAdmin, isPublisher, isSubscriber, subscription: subscriptionDetails }}>
      {children}
    </AuthContext.Provider>
  );
};
