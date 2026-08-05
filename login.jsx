// Login.jsx
//
// Pantalla de inicio de sesion de PSICOEVAL.
//
// Uso:
//   import Login from "./Login";
//   <Login onLoginSuccess={(user) => console.log(user)} onGoToRegister={() => setView("register")} />
//
// Requiere: npm install lucide-react
// Depende de: ./authService.js y ./theme.js (inclúyelos en la misma carpeta)

import React, { useState } from "react";
import { User, Lock, Loader2, Brain } from "lucide-react";
import { loginUser } from "./authService";
import { C, FONT_DISPLAY, FONT_BODY } from "./theme";

export default function Login({ onLoginSuccess, onGoToRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Completa usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(username, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || "Ocurrió un error, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px 12px 40px",
    borderRadius: 10,
    border: `1.5px solid ${C.line}`,
    fontFamily: FONT_BODY,
    fontSize: 14.5,
    outline: "none",
    background: C.white,
  };

  const iconInInputStyle = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" };

  return (
    <div
      style={{
        minHeight: "100%",
        width: "100%",
        background: C.paper,
        fontFamily: FONT_BODY,
        color: C.ink,
        display: "flex",
        justifyContent: "center",
        padding: "10vh 16px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .pv-btn { transition: opacity .12s ease, transform .12s ease; cursor: pointer; }
        .pv-btn:hover { opacity: 0.9; }
        .pv-btn:active { transform: scale(0.98); }
        .pv-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pv-spin { animation: pv-rotate 0.8s linear infinite; }
        @keyframes pv-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .pv-input:focus { border-color: ${C.blue} !important; }
        .pv-link-btn { background: none; border: none; padding: 0; cursor: pointer; font: inherit; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 30 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.blueDeep}, ${C.blue})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              boxShadow: "0 8px 20px rgba(30,79,140,0.28)",
            }}
          >
            <Brain size={28} color={C.white} />
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, margin: 0 }}>
            PSICO<span style={{ color: C.orange }}>EVAL</span>
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 13.5, color: C.slate, textAlign: "center" }}>
            Inicia sesión para continuar
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: C.white,
            border: `1px solid ${C.line}`,
            borderRadius: 18,
            padding: "26px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ position: "relative" }}>
            <User size={16} color={C.slate} style={iconInInputStyle} />
            <input
              className="pv-input"
              style={inputStyle}
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
            />
          </div>
          <div style={{ position: "relative" }}>
            <Lock size={16} color={C.slate} style={iconInInputStyle} />
            <input
              className="pv-input"
              style={inputStyle}
              placeholder="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ background: C.dangerTint, color: C.danger, fontSize: 12.5, borderRadius: 8, padding: "9px 12px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="pv-btn"
            style={{
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: C.orange,
              color: C.white,
              border: "none",
              borderRadius: 10,
              padding: "13px 0",
              fontFamily: FONT_BODY,
              fontWeight: 600,
              fontSize: 14.5,
            }}
          >
            {loading && <Loader2 size={16} className="pv-spin" />}
            Entrar
          </button>
        </form>

        <p style={{ marginTop: 18, fontSize: 13, color: C.slate, textAlign: "center" }}>
          ¿No tienes cuenta?{" "}
          <button className="pv-link-btn" onClick={onGoToRegister} style={{ color: C.blue, fontWeight: 600 }}>
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}