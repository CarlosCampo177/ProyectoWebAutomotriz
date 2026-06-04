// src/modules/Usuario/sections/SecConsultaIA.jsx

import { useState, useRef, useEffect } from "react";
import "./SecConsultaIA.css";

const SERVICIOS = [
  "Cambio de aceite y filtros",
  "Revisión de frenos",
  "Alineación y balanceo",
  "Diagnóstico eléctrico",
  "Cambio de correa de distribución",
  "Mantenimiento preventivo",
  "Cambio de llantas",
  "Revisión de suspensión",
];

const SUGERENCIAS = [
  { texto: "Mi carro hace un ruido extraño al frenar", emoji: "🔊" },
  { texto: "El motor tiembla cuando arranco",          emoji: "⚡" },
  { texto: "Se calienta mucho el motor",               emoji: "🌡️" },
  { texto: "El volante vibra a alta velocidad",        emoji: "🌀" },
  { texto: "La luz del motor está encendida",          emoji: "💡" },
  { texto: "Consumo excesivo de gasolina",             emoji: "⛽" },
];

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "";

export default function SecConsultaIA() {
  const [mensajes, setMensajes]   = useState([]);
  const [input,    setInput]      = useState("");
  const [cargando, setCargando]   = useState(false);
  const [consultas, setConsultas] = useState(0);
  const bottomRef                 = useRef(null);
  const textareaRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviar = async (texto) => {
    const msg = texto || input.trim();
    if (!msg || cargando) return;

    setInput("");
    setConsultas(c => c + 1);

    const nuevosMensajes = [...mensajes, { rol: "usuario", texto: msg }];
    setMensajes(nuevosMensajes);
    setCargando(true);

    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          max_tokens: 1000,
          messages: [
            {
              role: "system",
              content: `Eres AutoTech IA, un asistente experto en diagnóstico de vehículos para el taller AutoTech.
Tu trabajo es ayudar a los clientes a identificar qué servicio necesita su vehículo según los síntomas que describen.

Los servicios disponibles en AutoTech son:
${SERVICIOS.map((s, i) => `${i + 1}. ${s}`).join("\n")}

Instrucciones:
- Responde siempre en español, de forma clara y amable
- Analiza los síntomas y sugiere el servicio más adecuado de la lista
- Explica brevemente por qué ese servicio resuelve el problema
- Si los síntomas pueden indicar varios problemas, menciona las opciones
- Sé conciso: máximo 3-4 oraciones
- No inventes servicios que no están en la lista
- Si el problema es urgente (frenos, temperatura, etc.) indícalo claramente
- Termina siempre recomendando agendar una cita`,
            },
            ...nuevosMensajes.map(m => ({
              role: m.rol === "usuario" ? "user" : "assistant",
              content: m.texto,
            })),
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || `Error ${response.status}`);

      const respuesta = data.choices?.[0]?.message?.content || "No pude procesar tu consulta. Intenta de nuevo.";
      setMensajes(prev => [...prev, { rol: "ia", texto: respuesta }]);
    } catch (e) {
      console.error(e);
      setMensajes(prev => [...prev, {
        rol: "ia",
        texto: "Hubo un error al conectar con la IA. Por favor intenta de nuevo.",
        error: true,
      }]);
    } finally {
      setCargando(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  const limpiar = () => { setMensajes([]); setConsultas(0); };

  return (
    <div className="ia-wrap">

      {/* ── HEADER ── */}
      <div className="ia-header">
        <div className="ia-header-left">
          <div className="ia-avatar-pulse">
            <div className="ia-avatar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
              </svg>
            </div>
          </div>
          <div>
            <h6 className="ia-titulo">AutoTech <span className="ia-titulo-glow">IA</span></h6>
            <div className="ia-status">
              <span className="ia-status-dot"></span>
              Diagnóstico inteligente activo
            </div>
          </div>
        </div>
        <div className="ia-header-right">
          {consultas > 0 && (
            <span className="ia-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {consultas} {consultas === 1 ? "consulta" : "consultas"}
            </span>
          )}
          {mensajes.length > 0 && (
            <button className="ia-btn-limpiar" onClick={limpiar}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Nueva consulta
            </button>
          )}
        </div>
      </div>

      {/* ── CHAT ── */}
      <div className="ia-chat">
        {mensajes.length === 0 && (
          <div className="ia-bienvenida">
            <div className="ia-bienvenida-orb">
              <div className="ia-orb-ring ia-orb-ring-1"></div>
              <div className="ia-orb-ring ia-orb-ring-2"></div>
              <div className="ia-orb-ring ia-orb-ring-3"></div>
              <div className="ia-orb-core">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
            </div>
            <h5 className="ia-bienvenida-titulo">¿Qué le pasa a tu vehículo?</h5>
            <p className="ia-bienvenida-sub">Cuéntame los síntomas y te digo exactamente qué necesita</p>
            <div className="ia-sugerencias">
              {SUGERENCIAS.map((s, i) => (
                <button key={i} className="ia-sugerencia-btn" style={{"--i": i}} onClick={() => enviar(s.texto)}>
                  <span className="ia-sug-emoji">{s.emoji}</span>
                  {s.texto}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map((m, i) => (
          <div key={i} className={`ia-msg ia-msg--${m.rol}`} style={{"--idx": i}}>
            {m.rol === "ia" && (
              <div className="ia-msg-avatar ia-msg-avatar--ia">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                </svg>
              </div>
            )}
            <div className={`ia-msg-burbuja ${m.error ? "ia-msg-error" : ""}`}>
              {m.texto}
            </div>
            {m.rol === "usuario" && (
              <div className="ia-msg-avatar ia-msg-avatar--usuario">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
          </div>
        ))}

        {cargando && (
          <div className="ia-msg ia-msg--ia">
            <div className="ia-msg-avatar ia-msg-avatar--ia">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
              </svg>
            </div>
            <div className="ia-msg-burbuja ia-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* ── INPUT ── */}
      <div className="ia-input-area">
        <div className="ia-input-wrap">
          <textarea
            ref={textareaRef}
            className="ia-input"
            placeholder="Describe los síntomas de tu vehículo..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={2}
            disabled={cargando}
          />
          <button className="ia-btn-enviar" onClick={() => enviar()} disabled={!input.trim() || cargando}>
            {cargando ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ia-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m22 2-7 20-4-9-9-4 20-7z"/><path d="M22 2 11 13"/>
              </svg>
            )}
          </button>
        </div>
        <p className="ia-hint">Enter para enviar &nbsp;·&nbsp; Shift+Enter para nueva línea</p>
      </div>
    </div>
  );
}