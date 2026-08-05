import React, { useEffect, useMemo, useRef, useState } from "react";
import { Brain, ArrowRight, HeartPulse, ShieldAlert, Sparkles, Activity, History } from "lucide-react";

const categories = [
  {
    id: "depression",
    title: "Trastornos de depresión",
    description: "Evalúa síntomas relacionados con depresión mayor, distimia y otros subtipos.",
    icon: HeartPulse,
  },
  {
    id: "anxiety",
    title: "Trastornos de ansiedad",
    description: "Explora señales de ansiedad generalizada, fobia o ataques de pánico.",
    icon: ShieldAlert,
  },
  {
    id: "stress",
    title: "Trastornos de estrés o trauma",
    description: "Identifica patrones asociados a estrés crónico o trauma psicológico.",
    icon: Sparkles,
  },
  {
    id: "psychotic",
    title: "Trastornos psicóticos",
    description: "Revisa síntomas como desorganización, delirios o alteraciones perceptivas.",
    icon: Brain,
  },
  {
    id: "bipolar",
    title: "Trastornos bipolares",
    description: "Analiza cambios de ánimo, energía y actividad que sugieren bipolaridad.",
    icon: Activity,
  },
  {
    id: "personality",
    title: "Trastornos de personalidad",
    description: "Valora patrones de relación, impulsividad e identidad persistentes.",
    icon: Brain,
  },
];

const questionnaireMap = {
  depression: [
    { prompt: "¿Sientes que tu ánimo está bajo la mayor parte del día, casi todos los días?", field: "sadness" },
    { prompt: "¿Has perdido interés o placer en actividades que antes disfrutabas?", field: "anhedonia" },
    { prompt: "¿Te cuesta concentrarte o tomar decisiones?", field: "focus" },
    { prompt: "¿Has notado un descenso de energía o fatiga persistente?", field: "energy" },
    { prompt: "¿Tienes pensamientos recurrentes de inutilidad o culpa excesiva?", field: "guilt" },
  ],
  anxiety: [
    { prompt: "¿Te preocupas de forma excesiva por situaciones cotidianas?", field: "worry" },
    { prompt: "¿Te cuesta relajarte o controlar la tensión?", field: "tension" },
    { prompt: "¿Sientes inquietud o nerviosismo constante?", field: "restlessness" },
    { prompt: "¿Has tenido sensaciones de pánico o temor intenso sin razón aparente?", field: "panic" },
    { prompt: "¿Evitas actividades o lugares por miedo a que ocurra algo negativo?", field: "avoidance" },
  ],
  stress: [
    { prompt: "¿Has tenido recuerdos o pensamientos intrusivos relacionados con experiencias muy difíciles?", field: "intrusion" },
    { prompt: "¿Te sientes constantemente alerta o en tensión?", field: "alertness" },
    { prompt: "¿Te cuesta dormir o descansar adecuadamente?", field: "sleep" },
    { prompt: "¿Te irritas o reaccionas con facilidad a estímulos cotidianos?", field: "irritability" },
    { prompt: "¿Te cuesta volver a sentir seguridad o calma después de una experiencia intensa?", field: "safety" },
  ],
  psychotic: [
    { prompt: "¿Has percibido cosas que otras personas no perciben?", field: "hallucinations" },
    { prompt: "¿Has tenido creencias muy firmes que no parecen compartidas por otros?", field: "delusions" },
    { prompt: "¿Tu forma de hablar o pensar te ha parecido desorganizada?", field: "disorganized" },
    { prompt: "¿Te ha costado distinguir entre lo que es real y lo que no?", field: "reality" },
    { prompt: "¿Has tenido cambios bruscos en la percepción o la conducta?", field: "behavior" },
  ],
  bipolar: [
    { prompt: "¿Has experimentado periodos de energía muy elevada o euforia?", field: "mania" },
    { prompt: "¿Te has sentido más impulsivo de lo habitual durante esos periodos?", field: "impulsivity" },
    { prompt: "¿Has tenido cambios rápidos en tu estado de ánimo?", field: "moodSwings" },
    { prompt: "¿Has notado que necesitas menos sueño y te sientes muy activo?", field: "sleepNeed" },
    { prompt: "¿Esos cambios alternan con periodos de desánimo o apatía?", field: "depressiveEpisodes" },
  ],
  personality: [
    { prompt: "¿Tienes dificultades recurrentes para mantener relaciones estables?", field: "relationships" },
    { prompt: "¿Sueles actuar de forma impulsiva o arriesgada?", field: "impulsivity" },
    { prompt: "¿Te cuesta regular tus emociones o reacciones?", field: "emotionalRegulation" },
    { prompt: "¿Sientes que tu identidad o tus valores cambian con facilidad?", field: "identity" },
    { prompt: "¿Tienes patrones de pensamiento o conducta que te dificultan adaptarte?", field: "adaptation" },
  ],
};

const options = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "A veces" },
  { value: 2, label: "Frecuentemente" },
  { value: 3, label: "Casi siempre" },
];

function scoreToReport(category, scores) {
  const total = Object.values(scores).reduce((sum, value) => sum + value, 0);
  const normalized = Math.round((total / (Object.values(scores).length * 3)) * 100);

  const reportMap = {
    depression: {
      title: "Depresión",
      subtypes: [
        { name: "Depresión mayor", score: Math.max(0, scores.sadness + scores.anhedonia + scores.guilt) },
        { name: "Distimia", score: Math.max(0, scores.energy + scores.focus + scores.guilt) },
        { name: "Trastorno disfórico premensual", score: Math.max(0, scores.sadness + scores.energy + scores.focus) },
      ],
    },
    anxiety: {
      title: "Ansiedad",
      subtypes: [
        { name: "Ansiedad generalizada", score: Math.max(0, scores.worry + scores.tension + scores.restlessness) },
        { name: "Pánico", score: Math.max(0, scores.panic + scores.avoidance + scores.tension) },
        { name: "Ansiedad social", score: Math.max(0, scores.avoidance + scores.restlessness + scores.worry) },
      ],
    },
    stress: {
      title: "Estrés / trauma",
      subtypes: [
        { name: "Estrés crónico", score: Math.max(0, scores.alertness + scores.irritability + scores.sleep) },
        { name: "TEPT", score: Math.max(0, scores.intrusion + scores.safety + scores.alertness) },
        { name: "Reajuste emocional", score: Math.max(0, scores.sleep + scores.irritability + scores.safety) },
      ],
    },
    psychotic: {
      title: "Psicosis",
      subtypes: [
        { name: "Esquizofrenia", score: Math.max(0, scores.hallucinations + scores.delusions + scores.disorganized) },
        { name: "Trastorno psicótico breve", score: Math.max(0, scores.reality + scores.behavior + scores.delusions) },
      ],
    },
    bipolar: {
      title: "Bipolaridad",
      subtypes: [
        { name: "Bipolaridad tipo I", score: Math.max(0, scores.mania + scores.impulsivity + scores.moodSwings) },
        { name: "Bipolaridad tipo II", score: Math.max(0, scores.depressiveEpisodes + scores.moodSwings + scores.sleepNeed) },
      ],
    },
    personality: {
      title: "Personalidad",
      subtypes: [
        { name: "Personalidad límite", score: Math.max(0, scores.relationships + scores.emotionalRegulation + scores.identity) },
        { name: "Personalidad evitativa", score: Math.max(0, scores.relationships + scores.adaptation + scores.emotionalRegulation) },
      ],
    },
  };

  const subtypes = reportMap[category].subtypes.sort((a, b) => b.score - a.score);
  const dominant = subtypes[0];

  return {
    normalized,
    dominant,
    subtypes,
    title: reportMap[category].title,
  };
}

function HistoryPanel({ history }) {
  return (
    <div style={{ marginTop: 18, background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #DCE4EF" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <History size={18} color="#1E4F8C" />
        <h3 style={{ margin: 0, fontSize: 18 }}>Historial de tests</h3>
      </div>
      {history.length === 0 ? (
        <p style={{ margin: 0, color: "#5B6B80" }}>Aún no hay registros de tests completados.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {history.map((item) => (
            <div key={item.id} style={{ border: "1px solid #DCE4EF", borderRadius: 12, padding: "10px 12px", background: "#F6F8FC" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <strong>{item.categoryLabel}</strong>
                <span style={{ fontSize: 12, color: "#5B6B80" }}>{item.date}</span>
              </div>
              <div style={{ fontSize: 13, color: "#5B6B80", marginTop: 4 }}>
                Coincidencia {item.normalized}% · {item.dominant}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TestSelector({ currentUser }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const lastSavedRef = useRef("");

  const questions = useMemo(() => (selectedCategory ? questionnaireMap[selectedCategory] : []), [selectedCategory]);
  const progress = questions.length ? Math.round(((currentQuestion + 1) / questions.length) * 100) : 0;

  const handleAnswer = (value) => {
    const current = questions[currentQuestion];
    setScores((prev) => ({ ...prev, [current.field]: value }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setSubmitted(true);
    }
  };

  const reset = () => {
    setSelectedCategory(null);
    setCurrentQuestion(0);
    setScores({});
    setSubmitted(false);
  };

  const report = submitted && selectedCategory ? scoreToReport(selectedCategory, scores) : null;

  useEffect(() => {
    const storageKey = currentUser?.username ? `psicoeval_test_history:${currentUser.username}` : "psicoeval_test_history";

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setHistory(Array.isArray(saved) ? saved : []);
    } catch {
      setHistory([]);
    }
  }, [currentUser?.username]);

  useEffect(() => {
    if (!submitted || !selectedCategory || !report) return;

    const storageKey = currentUser?.username ? `psicoeval_test_history:${currentUser.username}` : "psicoeval_test_history";
    const marker = `${storageKey}:${selectedCategory}:${report.normalized}:${report.dominant?.name}`;
    if (lastSavedRef.current === marker) return;
    lastSavedRef.current = marker;

    const entry = {
      id: `${selectedCategory}-${Date.now()}`,
      categoryId: selectedCategory,
      categoryLabel: categories.find((c) => c.id === selectedCategory)?.title || selectedCategory,
      date: new Date().toLocaleString(),
      dominant: report.dominant?.name || "Sin subtipo",
      normalized: report.normalized,
      user: currentUser?.username || "anon",
    };

    setHistory((prev) => {
      const nextHistory = [entry, ...prev].slice(0, 8);
      localStorage.setItem(storageKey, JSON.stringify(nextHistory));
      return nextHistory;
    });
  }, [submitted, selectedCategory, report, currentUser?.username]);

  return (
    <div style={{ padding: 24, maxWidth: 1040, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 28 }}>Test orientativo de trastornos</h2>
        <p style={{ marginTop: 8, color: "#5B6B80", lineHeight: 1.6 }}>
          Selecciona una categoría para comenzar un cuestionario breve con escala de respuesta.
          El resultado es orientativo y no sustituye un diagnóstico clínico profesional.
        </p>
      </div>

      {!selectedCategory ? (
        <>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setCurrentQuestion(0);
                  setScores({});
                  setSubmitted(false);
                }}
                style={{
                  textAlign: "left",
                  border: "1px solid #DCE4EF",
                  borderRadius: 16,
                  padding: 18,
                  background: "#fff",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(30,79,140,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #1E4F8C, #F2871F)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} color="#fff" />
                  </div>
                  <strong>{category.title}</strong>
                </div>
                <span style={{ fontSize: 13.5, color: "#5B6B80", lineHeight: 1.5 }}>{category.description}</span>
                <div style={{ marginTop: 12, color: "#1E4F8C", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  Comenzar <ArrowRight size={16} />
                </div>
              </button>
            );
          })}
          </div>

          <HistoryPanel history={history} />
        </>
      ) : !submitted ? (
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #DCE4EF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, textTransform: "uppercase", color: "#1E4F8C", fontWeight: 700 }}>Cuestionario</div>
              <h3 style={{ margin: "4px 0 0", fontSize: 20 }}>{categories.find((c) => c.id === selectedCategory)?.title}</h3>
            </div>
            <button onClick={reset} style={{ border: "none", background: "transparent", color: "#1E4F8C", cursor: "pointer", fontWeight: 700 }}>
              Volver
            </button>
          </div>

          <div style={{ height: 10, borderRadius: 999, background: "#EAF1FB", marginBottom: 16 }}>
            <div style={{ height: 10, width: `${progress}%`, borderRadius: 999, background: "linear-gradient(90deg, #1E4F8C, #F2871F)" }} />
          </div>

          <div style={{ marginBottom: 16, color: "#5B6B80" }}>
            Pregunta {currentQuestion + 1} de {questions.length}
          </div>

          <p style={{ fontSize: 18, marginBottom: 18, lineHeight: 1.7 }}>{questions[currentQuestion]?.prompt}</p>

          <div style={{ display: "grid", gap: 10 }}>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                style={{
                  border: "1px solid #DCE4EF",
                  borderRadius: 12,
                  padding: "12px 14px",
                  background: "#F6F8FC",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : report ? (
        <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #DCE4EF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, textTransform: "uppercase", color: "#1E4F8C", fontWeight: 700 }}>Reporte orientativo</div>
              <h3 style={{ margin: "4px 0 0", fontSize: 24 }}>{report.title}</h3>
            </div>
            <button onClick={reset} style={{ border: "none", background: "transparent", color: "#1E4F8C", cursor: "pointer", fontWeight: 700 }}>
              Hacer otro test
            </button>
          </div>

          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", alignItems: "start" }}>
            <div style={{ background: "linear-gradient(135deg, #1E4F8C, #F2871F)", borderRadius: 18, padding: 20, color: "#fff" }}>
              <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>Nivel de coincidencia</div>
              <div style={{ fontSize: 44, fontWeight: 800 }}>{report.normalized}%</div>
              <div style={{ marginTop: 8, fontSize: 14, opacity: 0.95 }}>Subtipo dominante: {report.dominant?.name}</div>
            </div>

            <div style={{ border: "1px solid #DCE4EF", borderRadius: 18, padding: 18 }}>
              <h4 style={{ marginTop: 0, marginBottom: 10 }}>Desglose por subtipo</h4>
              {report.subtypes.map((subtype) => (
                <div key={subtype.name} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}>
                    <span>{subtype.name}</span>
                    <strong>{subtype.score}</strong>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "#EAF1FB" }}>
                    <div style={{ height: 8, width: `${Math.min(100, Math.round((subtype.score / 15) * 100))}%`, borderRadius: 999, background: "#1E4F8C" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 18, padding: 14, background: "#F6F8FC", borderRadius: 14, color: "#5B6B80", lineHeight: 1.6 }}>
            Este reporte es orientativo y no constituye un diagnóstico clínico. Para una evaluación más precisa, consulta a un profesional de salud mental.
          </div>

          <HistoryPanel history={history} />
        </div>
      ) : null}
    </div>
  );
}
