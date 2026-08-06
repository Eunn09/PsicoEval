import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import registerHandler from "./api/auth/register.js";
import loginHandler from "./api/auth/login.js";
import psychologistsHandler from "./api/psychologists.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 4000;
const distPath = path.join(__dirname, "dist");

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.post("/api/auth/register", registerHandler);
app.post("/api/auth/login", loginHandler);
app.get("/api/psychologists", psychologistsHandler);
app.post("/api/psychologists", psychologistsHandler);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

if (fs.existsSync(distPath)) {
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`PsicoEval backend running on port ${PORT}`);
});
