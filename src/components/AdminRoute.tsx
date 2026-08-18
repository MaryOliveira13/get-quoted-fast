import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [state, setState] = useState<"loading" | "admin" | "denied">("loading");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState("denied");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      setState(profile?.role === "admin" ? "admin" : "denied");
    };
    check();
  }, []);

  if (state === "loading") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#0d0d0d" }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}>Verificando acesso...</div>
      </div>
    );
  }

  if (state === "denied") {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
