import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/powercell-logo.png";
import { Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Senha alterada com sucesso! Faça login novamente.");
      await supabase.auth.signOut();
      navigate("/auth");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#fff",
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
  };

  const btnStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 0",
    borderRadius: 99,
    border: "none",
    background: "#FF6B00",
    color: "#fff",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 800,
    fontSize: 15,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    boxShadow: "0 0 24px rgba(255,107,0,0.3)",
    transition: "all 0.2s",
  };

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <img src={logo} alt="Power Cell" style={{ maxWidth: 280, width: "100%", objectFit: "contain", marginBottom: 32 }} />
      <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.03)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)", padding: "28px 24px" }}>
        <h2 style={{ color: "#fff", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 20, textAlign: "center" }}>Nova Senha</h2>
        <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nova senha"
                style={inputStyle}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme a nova senha"
            style={inputStyle}
          />
          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Nova Senha"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
