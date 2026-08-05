import fs from "fs/promises";
import path from "path";

const rootDir = process.cwd();
const devDir = path.join(rootDir, "data");
const tmpDir = path.join(process.env.TMPDIR || process.env.TEMP || "/tmp", "psicoeval-data");
const dataDir = process.env.PSICOEVAL_DATA_DIR || (process.env.NODE_ENV === "development" ? devDir : tmpDir);
const usersFile = path.join(dataDir, "users.json");
const psychsFile = path.join(dataDir, "psychologists.json");

const initialPsychologists = [
  {
    id: "p_ana_gomez",
    name: "Dra. Ana Gómez",
    email: "ana.gomez@psicoeval.com",
    clinic: "Centro PsicoVida",
    ownerUsername: "ana.gomez",
    patients: [],
  },
  {
    id: "p_miguel_ruiz",
    name: "Dr. Miguel Ruiz",
    email: "miguel.ruiz@psicoeval.com",
    clinic: "Consultorio MindCare",
    ownerUsername: "miguel.ruiz",
    patients: [],
  },
  {
    id: "p_luisa_martinez",
    name: "Dra. Luisa Martínez",
    email: "luisa.martinez@psicoeval.com",
    clinic: "Salud Emocional",
    ownerUsername: "luisa.martinez",
    patients: [],
  },
  {
    id: "p_diego_ramirez",
    name: "Dr. Diego Ramírez",
    email: "diego.ramirez@psicoeval.com",
    clinic: "Espacio Mental",
    ownerUsername: "diego.ramirez",
    patients: [],
  },
];

const initialUsers = {};

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {
    // ignore
  }
}

async function readJson(filePath, fallback) {
  try {
    await ensureDataDir();
    const text = await fs.readFile(filePath, "utf8");
    return JSON.parse(text || "null") || fallback;
  } catch (error) {
    if (error.code === "ENOENT") {
      await saveJson(filePath, fallback);
      return fallback;
    }
    return fallback;
  }
}

async function saveJson(filePath, value) {
  try {
    await ensureDataDir();
    await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
    return true;
  } catch {
    return false;
  }
}

export async function loadUsers() {
  return readJson(usersFile, initialUsers);
}

export async function saveUsers(users) {
  return saveJson(usersFile, users);
}

export async function loadPsychologists() {
  return readJson(psychsFile, initialPsychologists);
}

export async function savePsychologists(list) {
  return saveJson(psychsFile, list);
}

export function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase().replace(/\s+/g, "");
}
