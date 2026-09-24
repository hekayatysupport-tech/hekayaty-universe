import React from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export const AdminLogin = () => {
  const { session, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    if (session && isAdmin) {
      setLocation("/admin");
    } else if (session && !isAdmin) {
      // Log out non-admins trying to access admin panel
      supabase.auth.signOut().then(() => {
        setLocation("/");
      });
    }
  }, [session, isAdmin, setLocation]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Cinematic Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#050505]" />
        <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-20" />
        <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-20" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <h2 className="mt-6 text-center text-3xl font-serif font-bold tracking-wider text-[#d4af37] uppercase" style={{ textShadow: "0 0 20px rgba(212, 175, 55, 0.3)" }}>
          Command Center
        </h2>
        <p className="mt-2 text-center text-sm text-[#a3a3a3] uppercase tracking-[0.2em]">
          Authorized Personnel Only
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0a0a0c]/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-[#2a2a2a]">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#d4af37',
                    brandAccent: '#f3e5ab',
                    inputText: 'white',
                    inputBackground: '#111111',
                    inputBorder: '#333333',
                    inputBorderFocus: '#d4af37',
                    inputBorderHover: '#555555',
                    messageText: '#d4af37',
                  },
                  space: {
                    buttonPadding: '12px 16px',
                    inputPadding: '12px 16px',
                  },
                  radii: {
                    borderRadiusButton: '2px',
                    buttonBorderRadius: '2px',
                    inputBorderRadius: '2px',
                  }
                },
              },
              className: {
                button: 'font-serif uppercase tracking-wider text-sm transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]',
                input: 'font-mono text-sm transition-colors duration-300',
                label: 'font-serif text-xs uppercase tracking-wider text-[#888888]',
              }
            }}
            theme="dark"
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};
