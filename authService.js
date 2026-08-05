// authService.js
//
// Lógica de registro / inicio de sesión para PSICOEVAL.
//
// IMPORTANTE: esta versión guarda las cuentas en localStorage, solo para que
// Login.jsx y Register.jsx funcionen de manera aislada mientras conectan su
// propia API REST + MySQL. localStorage vive únicamente en el navegador de
// cada usuario (no es una base de datos real ni es segura para producción:
// las contraseñas se guardan en texto plano).
//
// Cuando tengan el backend (IO-Link master / REST API + MySQL) listo,
// reemplacen el cuerpo de registerUser() y loginUser() por llamadas fetch()
// a sus endpoints, por ejemplo:
//
//   export async function loginUser(username, password) {
//     const res = await fetch("/api/auth/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password }),
//     });
//     if (!res.ok) throw new Error((await res.json()).message);
//     return res.json(); // { name, username, token, ... }
//   }
//
// El resto de la app (Login.jsx, Register.jsx) no necesita cambiar: solo
// llaman a estas funciones y reaccionan al resultado o al error.

const STORAGE_KEY = "psicoeval_users";
const PSYCH_KEY = "psicoeval_psicologos";

function normUser(username) {
  return username.trim().toLowerCase().replace(/\s+/g, "");
}

function readUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/**
 * Crea una cuenta nueva.
 * @param {string} name - Nombre completo
 * @param {string} username - Usuario (se normaliza a minúsculas, sin espacios)
 * @param {string} password
 * @returns {Promise<{name: string, username: string}>}
 */
export async function registerUser(name, username, password, psychId = null, role = 1) {
  const key = normUser(username);
  if (!key) throw new Error("El usuario no puede estar vacío.");
  if (!name.trim()) throw new Error("Ingresa tu nombre completo.");
  if (password.length < 4) throw new Error("La contraseña debe tener al menos 4 caracteres.");

  const users = readUsers();
  if (users[key]) throw new Error("Ese usuario ya está registrado.");
  users[key] = { name: name.trim(), username: key, password, role: role };
  if (psychId) {
    users[key].psychId = psychId;
  }
  writeUsers(users);

  if (psychId && Number(role) === 1) {
    assignPatientToPsychologist(psychId, key);
  }
  return { name: users[key].name, username: key, role: users[key].role, psychId: users[key].psychId || null };
}

export function getPsychologists() {
  try {
    const raw = localStorage.getItem(PSYCH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePsychologists(list) {
  localStorage.setItem(PSYCH_KEY, JSON.stringify(list));
}

export function addPsychologist({ name, email, clinic, ownerUsername = null }) {
  const list = getPsychologists();
  const id = `p_${Date.now()}`;
  const item = { id, name: name.trim(), email: email || "", clinic: clinic || "", patients: [], ownerUsername: ownerUsername || null };
  list.push(item);
  savePsychologists(list);
  return item;
}

export function assignPatientToPsychologist(psychId, username) {
  const list = getPsychologists();
  const idx = list.findIndex((p) => p.id === psychId);
  if (idx === -1) return false;
  const users = readUsers();
  const key = normUser(username);
  if (!users[key]) return false;
  if (!list[idx].patients) list[idx].patients = [];
  // store objects { username, progress }
  const exists = list[idx].patients.find((it) => (typeof it === "string" ? it === key : it.username === key));
  if (!exists) list[idx].patients.push({ username: key, progress: 0 });
  savePsychologists(list);
  return true;
}

export function setUserPsychId(username, psychId) {
  const users = readUsers();
  const key = normUser(username);
  if (!users[key]) return false;
  users[key].psychId = psychId;
  writeUsers(users);
  return true;
}

/**
 * Valida usuario y contraseña.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{name: string, username: string}>}
 */
export async function loginUser(username, password) {
  const key = normUser(username);
  const users = readUsers();
  const record = users[key];
  if (!record) throw new Error("No existe una cuenta con ese usuario.");
  if (record.password !== password) throw new Error("Contraseña incorrecta.");
  return { name: record.name, username: record.username, role: record.role || 1, psychId: record.psychId || null };
}

/** Cierra la sesion actual (si estan guardando la sesion en el componente padre, solo limpien su estado). */
export function logout() {
  // No-op por ahora: la sesión se maneja en memoria (estado de React) en App.jsx.
  // Si más adelante agregan tokens de sesión, límpienlos aquí.
}

export function getUsers() {
  return readUsers();
}

export function getUserTestHistory(username) {
  try {
    const key = normUser(username);
    const raw = localStorage.getItem(`psicoeval_test_history:${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}