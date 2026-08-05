import React from "react";
import { C, FONT_DISPLAY } from "../../theme";

export default function Navbar({ onLogout, user }) {
  return (
    <header className="pv-navbar">
      <div className="pv-container">
        <div className="pv-brand">
          <div className="pv-logo-box" aria-hidden>
            <img src="/logo.png" alt="PsicoEval logo" className="pv-logo-img" />
          </div>
          <div>
            <div className="pv-title">PSICO<span className="pv-eval">EVAL</span></div>
            <div className="pv-sub">Plataforma de valoración psicológica</div>
          </div>
        </div>

        <nav className="pv-nav">
          {user ? (
            <>
              <span style={{ color: "rgba(255,255,255,0.9)", marginRight: 8 }}>Hola, {user.name}</span>
              <button onClick={onLogout} className="pv-btn pv-btn-primary">
                Cerrar sesión
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
