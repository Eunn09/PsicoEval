import { useState } from "react";
import Login from "./login";
import Register from "./register";
import TestSelector from "./src/components/TestSelector";
import Navbar from "./src/components/Navbar";
import PsychologistSection from "./src/components/PsychologistSection";
import { loadPsicoevalFonts } from "./theme";

function AuthGate({ onAuthed }) {
  const [view, setView] = useState("login");
  return view === "login" ? (
    <Login onLoginSuccess={onAuthed} onGoToRegister={() => setView("register")} />
  ) : (
    <Register onRegisterSuccess={onAuthed} onGoToLogin={() => setView("login")} />
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [showTests, setShowTests] = useState(false);

  loadPsicoevalFonts();

  function handleLogout() {
    setUser(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F6F8FC", fontFamily: "Segoe UI, sans-serif" }}>
      <Navbar onLogout={handleLogout} user={user} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        {user && Number(user.role) === 2 ? (
          <PsychologistSection currentUser={user} />
        ) : user ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h1 style={{ margin: 0 }}>Bienvenido, {user.name}</h1>
                <div style={{ color: "#555", fontSize: 14 }}>Selecciona un test para comenzar.</div>
              </div>
              <button onClick={() => setShowTests((prev) => !prev)} style={{ border: "none", background: "#1E4F8C", color: "#fff", borderRadius: 999, padding: "10px 16px", cursor: "pointer", fontWeight: 700 }}>
                {showTests ? "Ocultar tests" : "Ir a tests"}
              </button>
            </div>
            {showTests ? <TestSelector currentUser={user} /> : <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #DCE4EF" }}>Selecciona una categoría para comenzar.</div>}
          </>
        ) : (
          <AuthGate onAuthed={setUser} />
        )}
      </div>
    </div>
  );
}