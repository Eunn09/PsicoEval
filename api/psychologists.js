import { loadPsychologists, savePsychologists } from "./lib/dataStore.js";

export default async function handler(req, res) {
  const psychologists = await loadPsychologists();

  if (req.method === "GET") {
    res.status(200).json(psychologists);
    return;
  }

  if (req.method === "POST") {
    const { name, email = "", clinic = "", ownerUsername = null } = req.body || {};
    if (!name) {
      res.status(400).json({ message: "El nombre del psicólogo es obligatorio." });
      return;
    }

    const id = `p_${Date.now()}`;
    const psych = {
      id,
      name: name.trim(),
      email: email.trim(),
      clinic: clinic.trim(),
      ownerUsername: ownerUsername ? String(ownerUsername).trim().toLowerCase().replace(/\s+/g, "") : null,
      patients: [],
    };

    psychologists.push(psych);
    await savePsychologists(psychologists);
    res.status(201).json(psych);
    return;
  }

  res.status(405).json({ message: "Method not allowed" });
}
