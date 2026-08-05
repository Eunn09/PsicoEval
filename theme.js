// theme.js
// Tokens de diseño compartidos por Login.jsx y Register.jsx (colores, tipografías).
// Impórtalos donde los necesites: import { C, FONT_DISPLAY, FONT_BODY, FONT_MONO } from "./theme";

export const C = {
  navy: "#0F2A4A",
  blue: "#1E4F8C",
  blueDeep: "#153B6B",
  blueTint: "#EAF1FB",
  orange: "#F2871F",
  orangeDeep: "#D96F0C",
  orangeTint: "#FFEBD6",
  ink: "#152436",
  slate: "#5B6B80",
  paper: "#F6F8FC",
  white: "#FFFFFF",
  line: "#DCE4EF",
  danger: "#C0392B",
  dangerTint: "#FBEAE8",
};

export const FONT_DISPLAY = "'Space Grotesk', 'Segoe UI', sans-serif";
export const FONT_BODY = "'IBM Plex Sans', 'Segoe UI', sans-serif";
export const FONT_MONO = "'IBM Plex Mono', 'Courier New', monospace";

// Carga las tipografías desde Google Fonts (llámalo una vez, por ejemplo en App.jsx)
export function loadPsicoevalFonts() {
  if (typeof document === "undefined") return;
  if (document.getElementById("psicoeval-fonts")) return;
  const link = document.createElement("link");
  link.id = "psicoeval-fonts";
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap";
  document.head.appendChild(link);
}