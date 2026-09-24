import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";

/**
 * Middleware to verify a Supabase JWT token.
 * Validates the token and attaches the user payload to req.user.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.split(" ")[1];
    
    // Verify the JWT token using Supabase Admin client
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: "Unauthorized: Invalid token", details: error?.message });
      return;
    }

    // Attach user to request
    (req as any).user = user;
    
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ error: "Internal Server Error during authentication" });
  }
};

/**
 * Middleware factory to restrict access based on roles.
 * Must be used AFTER requireAuth.
 * Users must have at least one of the allowed roles.
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ error: "Unauthorized: User not authenticated" });
        return;
      }

      // Fetch user profile role & roles from user_roles table
      const [profileRes, rolesRes] = await Promise.all([
        supabase.from("user_profiles").select("role").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);

      const userRoles: string[] = [];
      if (profileRes.data?.role) {
        userRoles.push(profileRes.data.role);
      }
      if (rolesRes.data) {
        rolesRes.data.forEach((r: any) => {
          if (!userRoles.includes(r.role)) userRoles.push(r.role);
        });
      }

      // Default to reader if no role found
      if (userRoles.length === 0) {
        userRoles.push("reader");
      }
      
      // Super admins always have access
      if (userRoles.includes("super_admin") || userRoles.includes("administrator")) {
        (req as any).userRoles = userRoles;
        return next();
      }

      // Check if user has at least one of the allowed roles
      const hasPermission = allowedRoles.some((role) => userRoles.includes(role));
      
      if (!hasPermission) {
        res.status(403).json({ error: `Forbidden: Requires one of roles: ${allowedRoles.join(", ")}` });
        return;
      }

      // Attach roles for downstream use
      (req as any).userRoles = userRoles;
      
      next();
    } catch (error) {
      console.error("Role Middleware Error:", error);
      res.status(500).json({ error: "Internal Server Error during authorization" });
    }
  };
};
