import React, { useEffect, useState } from "react";
import { C } from "../../theme";
import { fetchPsychologists, createPsychologist, getPsychologists, getUsers, getUserTestHistory, savePsychologists } from "../../authService";
export default function PsychologistSection({ currentUser }) {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ name: "", email: "", clinic: "" });

  useEffect(() => {
    loadList();
  }, []);

  async function loadList() {
    const p = await fetchPsychologists();
    setList(p || []);
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await createPsychologist({ name: form.name, email: form.email, clinic: form.clinic });
      setForm({ name: "", email: "", clinic: "" });
      await loadList();
    } catch {
      addPsychologist(form);
      setForm({ name: "", email: "", clinic: "" });
      loadList();
    }
  }

  function updatePatientProgress(psychId, patientUsername, progress) {
    const all = getPsychologists();
    const idx = all.findIndex((p) => p.id === psychId);
    if (idx === -1) return;
    if (!all[idx].patients) all[idx].patients = [];
    all[idx].patients = all[idx].patients.map((it) => {
      const uname = typeof it === "string" ? it : it.username;
      if (uname === patientUsername) return { username: patientUsername, progress: Number(progress) };
      return it;
    });
    savePsychologists(all);
    loadList();
  }

  const users = getUsers();

  const filtered = list.filter((p) => {
    const t = filter.trim().toLowerCase();
    if (!t) return true;
    return (p.name || "").toLowerCase().includes(t) || (p.clinic || "").toLowerCase().includes(t) || (p.email || "").toLowerCase().includes(t);
  });
  // If currentUser is a psychologist, show their dashboard only
  if (currentUser && Number(currentUser.role) === 2) {
    const mine = list.find((p) => p.ownerUsername === currentUser.username || p.id === currentUser.psychId);
    if (!mine) {
      return (
        <div style={{ marginTop: 20 }}>
          <div className="pv-container-main pv-card">No se encontró tu perfil de psicólogo. Si te registraste recientemente, intenta actualizar la página.</div>
        </div>
      );
    }

    return (
      <div style={{ marginTop: 20 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="pv-card">
            <h2 style={{ marginTop: 0 }}>{mine.name} — Panel</h2>
            <div style={{ color: C.slate, marginBottom: 12 }}>{mine.clinic || mine.email}</div>
            <div>
              <strong>Pacientes ({(mine.patients || []).length}):</strong>
              <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                {(mine.patients || []).map((it) => {
                  const uname = typeof it === "string" ? it : it.username;
                  const progress = typeof it === "string" ? 0 : it.progress || 0;
                  const history = getUserTestHistory(uname);
                  return (
                    <div key={uname} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, background: "#FBFCFF" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{(users[uname] && users[uname].name) || uname}</div>
                          <div style={{ fontSize: 12, color: C.slate }}>Usuario: {uname}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, color: C.slate }}>Progreso clínico</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: C.blue }}>{progress}%</div>
                        </div>
                      </div>
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 12, color: C.slate, marginBottom: 8 }}>Actualiza el avance o revisa los resultados recientes:</div>
                        <input type="range" min={0} max={100} value={progress} onChange={(e) => updatePatientProgress(mine.id, uname, e.target.value)} style={{ width: "100%" }} />
                      </div>
                      <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 10, padding: 10 }}>
                        <strong>Resultados recientes</strong>
                        {history.length === 0 ? (
                          <p style={{ margin: "8px 0 0", color: C.slate, fontSize: 13 }}>Aún no tiene tests registrados.</p>
                        ) : (
                          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                            {history.slice(0, 3).map((entry) => (
                              <div key={entry.id} style={{ padding: 8, borderRadius: 10, background: "#F6F8FC" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13 }}>
                                  <span>{entry.categoryLabel}</span>
                                  <span style={{ color: C.blueDeep }}>{entry.normalized}%</span>
                                </div>
                                <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>{entry.date}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 360px", gap: 18 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 18, border: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0 }}>Psicólogos registrados</h2>
            <input placeholder="Filtrar por nombre o clínica" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: 8, borderRadius: 8, border: `1px solid ${C.line}`, width: 240 }} />
          </div>

          {filtered.length === 0 ? (
            <div style={{ color: C.slate, padding: 12 }}>No hay psicólogos registrados.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {filtered.map((p) => (
                <div key={p.id} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: C.slate }}>{p.clinic || p.email}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: C.slate }}>{(p.patients || []).length} pacientes</div>
                    </div>
                  </div>

                  {(p.patients || []).length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <strong>Pacientes:</strong>
                      <ul style={{ margin: "8px 0 0 18px" }}>
                        {p.patients.map((it) => {
                          const uname = typeof it === "string" ? it : it.username;
                          return <li key={uname}>{(users[uname] && users[uname].name) || uname}</li>;
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <aside style={{ background: "#fff", borderRadius: 12, padding: 18, border: `1px solid ${C.line}` }}>
          <h3 style={{ marginTop: 0 }}>Registrar psicólogo</h3>
          <form onSubmit={handleAdd} style={{ display: "grid", gap: 8 }}>
            <input name="name" placeholder="Nombre completo" value={form.name} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: `1px solid ${C.line}` }} />
            <input name="email" placeholder="Correo" value={form.email} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: `1px solid ${C.line}` }} />
            <input name="clinic" placeholder="Clínica / Centro" value={form.clinic} onChange={handleChange} style={{ padding: 10, borderRadius: 8, border: `1px solid ${C.line}` }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{ background: C.blue, color: C.white, border: "none", padding: "10px 14px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
                Agregar
              </button>
              <button type="button" onClick={() => setForm({ name: "", email: "", clinic: "" })} style={{ background: C.orangeTint, border: `1px solid ${C.orange}`, color: C.orangeDeep, padding: "10px 14px", borderRadius: 8, cursor: "pointer" }}>
                Limpiar
              </button>
            </div>
          </form>

          <div style={{ marginTop: 18 }}>
            <small style={{ color: C.slate }}>Los pacientes que se registren podrán seleccionar a su psicólogo desde el formulario de registro.</small>
          </div>
        </aside>
      </div>
    </div>
  );
}
