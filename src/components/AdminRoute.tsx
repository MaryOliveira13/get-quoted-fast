import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [state, setState] = useState<"loading" | "admin" | "denied" | "unauthenticated">("loading");
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setState("unauthenticated");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error || profile?.role !== "admin") {
          setState("denied");
          return;
        }

        setState("admin");
      } catch (err) {
        console.error("AdminRoute check error:", err);
        setState("denied");
      }
    };
    check();
  }, []);

  if (state === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0d0d0d" }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}>Verificando acesso administrativo...</div>
      </div>
    );
  }

  if (state === "unauthenticated") {
    // Redirect to login, but save the current location to redirect back after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (state === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-4xl font-bold text-destructive">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta área administrativa.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
