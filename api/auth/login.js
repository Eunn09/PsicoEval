import { loadUsers, normalizeUsername } from "../lib/dataStore.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    res.status(400).json({ message: "Usuario y contraseña son obligatorios." });
    return;
  }

  const key = normalizeUsername(username);
  const users = await loadUsers();
  const user = users[key];
  if (!user || user.password !== password) {
    res.status(401).json({ message: "Usuario o contraseña incorrectos." });
    return;
  }

  res.status(200).json({ name: user.name, username: user.username, role: user.role || 1, psychId: user.psychId || null });
}
