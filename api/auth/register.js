import { loadUsers, saveUsers, loadPsychologists, savePsychologists, normalizeUsername } from "../lib/dataStore.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { name, username, password, psychId = null, role = 1, email = "", clinic = "" } = req.body || {};
  if (!name || !username || !password) {
    res.status(400).json({ message: "Nombre, usuario y contraseña son obligatorios." });
    return;
  }

  const key = normalizeUsername(username);
  if (!key) {
    res.status(400).json({ message: "El usuario no puede estar vacío." });
    return;
  }

  const users = await loadUsers();
  if (users[key]) {
    res.status(409).json({ message: "Ese usuario ya está registrado." });
    return;
  }

  if (password.length < 4) {
    res.status(400).json({ message: "La contraseña debe tener al menos 4 caracteres." });
    return;
  }

  const roleNum = Number(role) === 2 ? 2 : 1;
  users[key] = {
    name: name.trim(),
    username: key,
    password,
    role: roleNum,
    psychId: null,
  };

  const psychologists = await loadPsychologists();

  if (roleNum === 2) {
    const psychIdValue = `p_${Date.now()}`;
    const psychRecord = {
      id: psychIdValue,
      name: name.trim(),
      email: email.trim(),
      clinic: clinic.trim(),
      ownerUsername: key,
      patients: [],
    };
    psychologists.push(psychRecord);
    users[key].psychId = psychIdValue;
    await savePsychologists(psychologists);
  } else if (psychId) {
    const target = psychologists.find((item) => item.id === psychId);
    if (target) {
      if (!Array.isArray(target.patients)) target.patients = [];
      const exists = target.patients.some((patient) => patient.username === key);
      if (!exists) {
        target.patients.push({ username: key, name: name.trim(), progress: 0 });
      }
      users[key].psychId = psychId;
      await savePsychologists(psychologists);
    }
  }

  await saveUsers(users);
  res.status(201).json({ name: users[key].name, username: users[key].username, role: users[key].role, psychId: users[key].psychId || null });
}
