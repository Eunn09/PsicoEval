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

async function registerUserLocal(name, username, password, psychId = null, role = 1, email = "", clinic = "") {
  const key = normUser(username);
  if (!key) throw new Error("El usuario no puede estar vacío.");
  if (!name.trim()) throw new Error("Ingresa tu nombre completo.");
  if (password.length < 4) throw new Error("La contraseña debe tener al menos 4 caracteres.");

  const users = readUsers();
  if (users[key]) throw new Error("Ese usuario ya está registrado.");
  const roleNum = Number(role) === 2 ? 2 : 1;
  users[key] = { name: name.trim(), username: key, password, role: roleNum };
  if (psychId) {
    users[key].psychId = psychId;
  }
  writeUsers(users);

  if (roleNum === 2) {
    const psych = addPsychologist({ name, email, clinic, ownerUsername: key });
    users[key].psychId = psych.id;
    writeUsers(users);
  }

  if (psychId && roleNum === 1) {
    assignPatientToPsychologist(psychId, key);
  }

  return { name: users[key].name, username: key, role: users[key].role, psychId: users[key].psychId || null };
}

async function loginUserLocal(username, password) {
  const key = normUser(username);
  const users = readUsers();
  const record = users[key];
  if (!record) throw new Error("No existe una cuenta con ese usuario.");
  if (record.password !== password) throw new Error("Contraseña incorrecta.");
  return { name: record.name, username: record.username, role: record.role || 1, psychId: record.psychId || null };
}

function addPsychologistLocal({ name, email = "", clinic = "", ownerUsername = null, id = null }) {
  const list = getPsychologists();
  const psychId = id || `p_${Date.now()}`;
  const item = { id: psychId, name: name.trim(), email: email || "", clinic: clinic || "", patients: [], ownerUsername };
  if (!list.some((p) => p.id === psychId)) {
    list.push(item);
    savePsychologists(list);
  }
  return item;
}

function mergePsychologists(serverList, localList) {
  const serverIds = new Set(serverList.map((p) => p.id));
  return [...serverList, ...localList.filter((p) => !serverIds.has(p.id))];
}

export async function registerUser(name, username, password, psychId = null, role = 1, email = "", clinic = "") {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password, psychId, role, email, clinic }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || "Error al registrarse en el servidor.");
    }

    const key = normUser(username);
    const users = readUsers();
    users[key] = { name: name.trim(), username: key, password, role: Number(role) === 2 ? 2 : 1, psychId: data.psychId || null };
    writeUsers(users);
    if (Number(role) === 2) {
      addPsychologistLocal({ name, email, clinic, ownerUsername: key, id: data.psychId });
    }
    return data;
  } catch (err) {
    if (err instanceof TypeError) {
      return registerUserLocal(name, username, password, psychId, role, email, clinic);
    }
    throw err;
  }
}

export async function loginUser(username, password) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (res.status === 401) {
        return loginUserLocal(username, password);
      }
      throw new Error(data?.message || "Error al iniciar sesión en el servidor.");
    }
    return data;
  } catch (err) {
    if (err instanceof TypeError) {
      return loginUserLocal(username, password);
    }
    throw err;
  }
}

export function getPsychologists() {
  try {
    const raw = localStorage.getItem(PSYCH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function fetchPsychologists() {
  try {
    const res = await fetch("/api/psychologists");
    if (!res.ok) throw new Error("API unavailable");
    const list = await res.json();
    if (!Array.isArray(list)) throw new Error("Invalid psychologist list");
    const merged = mergePsychologists(list, getPsychologists());
    savePsychologists(merged);
    return merged;
  } catch {
    return getPsychologists();
  }
}

export async function createPsychologist({ name, email, clinic, ownerUsername = null }) {
  try {
    const res = await fetch("/api/psychologists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, clinic, ownerUsername }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || "Error al crear psicólogo en el servidor.");
    }
    addPsychologistLocal({ name, email, clinic, ownerUsername, id: data.id });
    return data;
  } catch (err) {
    if (err instanceof TypeError) {
      return addPsychologist({ name, email, clinic, ownerUsername });
    }
    throw err;
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