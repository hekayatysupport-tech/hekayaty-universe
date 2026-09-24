import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { session, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Still loading session/roles — show spinner, don't redirect yet
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#0a0a0c]">
        <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  // Not logged in at all → go to admin login
  if (!session) {
    setLocation("/admin/login");
    return null;
  }

  // Logged in but not admin → show blocked message
  if (!isAdmin) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#0a0a0c] text-center px-4">
        <ShieldAlert className="w-16 h-16 text-[#d4af37] mb-4" />
        <h1 className="text-2xl font-serif font-bold text-[#d4af37] mb-2">Access Denied</h1>
        <p className="text-[#888] mb-6">Your account does not have admin privileges.</p>
        <button onClick={() => setLocation("/")} className="px-6 py-2.5 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-wider rounded">
          Return Home
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
