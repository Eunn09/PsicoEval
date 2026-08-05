import express from "express";
import cors from "cors";
import registerHandler from "./api/auth/register.js";
import loginHandler from "./api/auth/login.js";
import psychologistsHandler from "./api/psychologists.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

app.post("/api/auth/register", registerHandler);
app.post("/api/auth/login", loginHandler);
app.get("/api/psychologists", psychologistsHandler);
app.post("/api/psychologists", psychologistsHandler);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`PsicoEval backend running on port ${PORT}`);
});
