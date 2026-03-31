import { useState, useEffect, useRef } from "react";

// ─── FIREBASE CONFIG ────────────────────────────────────────────────────────
// Sostituisci con la tua config Firebase reale
const FIREBASE_URL = "https://TUO-PROGETTO-default-rtdb.firebaseio.com";

// ─── HELPERS ────────────────────────────────────────────────────────────────
function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getYoutubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ora";
  if (m < 60) return `${m}m fa`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h fa`;
  const d = Math.floor(h / 24);
  return `${d}g fa`;
}

// ─── MOCK DATA (rimpiazzi con Firebase) ─────────────────────────────────────
const MOCK_VIDEOS = [
  {
    id: "1",
    linea: "C1",
    titolo: "C1 – Percorso completo Piazza Garibaldi → Capodimonte",
    tipo: "normale",
    descrizione: "Percorso standard completo. Attenzione alla svolta su Via Foria.",
    youtubeId: "dQw4w9WgXcQ",
    autore: "Ciro",
    matricola: "50270",
    ts: Date.now() - 3600000 * 2,
  },
  {
    id: "2",
    linea: "C1",
    titolo: "C1 – DEVIAZIONE via Duomo (lavori in corso)",
    tipo: "deviazione",
    descrizione: "Dal 15/01 deviazione per cantiere su Corso Umberto. Seguire indicazioni.",
    youtubeId: "ScMzIvxBSi4",
    autore: "Mario R.",
    matricola: "48901",
    ts: Date.now() - 3600000 * 5,
  },
  {
    id: "3",
    linea: "C31",
    titolo: "C31 – Percorso normale Piscinola → Pianura",
    tipo: "normale",
    descrizione: "Tratto completo con tutte le fermate. Difficile il tratto Pianura centro.",
    youtubeId: "3JZ_D3ELwOQ",
    autore: "Luigi M.",
    matricola: "47200",
    ts: Date.now() - 3600000 * 24,
  },
  {
    id: "4",
    linea: "140",
    titolo: "140 – Lungomare deviazione evento",
    tipo: "deviazione",
    descrizione: "Deviazione per mercatino natalizio. Tornio da Mergellina via Riviera.",
    youtubeId: "L_jWHffIx5E",
    autore: "Anna V.",
    matricola: "51100",
    ts: Date.now() - 3600000 * 48,
  },
];

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function Badge({ tipo }) {
  const isDeviation = tipo === "deviazione";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 10px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        background: isDeviation ? "#ff4d00" : "#00b86b",
        color: "#fff",
      }}
    >
      {isDeviation ? "⚠ DEVIAZIONE" : "✓ NORMALE"}
    </span>
  );
}

function VideoCard({ video, onClick }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      onClick={() => onClick(video)}
      style={{
        background: "#16213e",
        border: "1px solid #1e2d4a",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.18s, border-color 0.18s, box-shadow 0.18s",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = "#f4821f";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(244,130,31,0.2)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "#1e2d4a";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", paddingBottom: "56.25%", background: "#0a0f1e" }}>
        {!imgError ? (
          <img
            src={getYoutubeThumbnail(video.youtubeId)}
            alt={video.titolo}
            onError={() => setImgError(true)}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", opacity: 0.85,
            }}
          />
        ) : (
          <div style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "#0d1829", color: "#2a3f5f", fontSize: 40,
          }}>🎬</div>
        )}
        {/* Play overlay */}
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "rgba(244,130,31,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
          }}>
            <span style={{ fontSize: 20, marginLeft: 4 }}>▶</span>
          </div>
        </div>
        {/* Line badge */}
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: "#f4821f",
          color: "#fff",
          fontFamily: "'DM Mono', monospace",
          fontWeight: 700,
          fontSize: 15,
          padding: "3px 10px",
          borderRadius: 6,
          letterSpacing: "0.05em",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}>
          Linea {video.linea}
        </div>
        {/* Deviation badge */}
        {video.tipo === "deviazione" && (
          <div style={{ position: "absolute", top: 10, right: 10 }}>
            <Badge tipo={video.tipo} />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ marginBottom: 6 }}>
          {video.tipo === "normale" && <Badge tipo={video.tipo} />}
        </div>
        <h3 style={{
          margin: "6px 0 8px",
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.4,
          color: "#e8eaf0",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          {video.titolo}
        </h3>
        {video.descrizione && (
          <p style={{
            margin: "0 0 10px",
            fontSize: 12,
            color: "#6b7fa3",
            lineHeight: 1.5,
          }}>
            {video.descrizione.length > 80 ? video.descrizione.slice(0, 80) + "…" : video.descrizione}
          </p>
        )}
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 11, color: "#4a5f82",
        }}>
          <span>👤 {video.autore} · {video.matricola}</span>
          <span>{timeAgo(video.ts)}</span>
        </div>
      </div>
    </div>
  );
}

function VideoModal({ video, onClose }) {
  if (!video) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#111827",
          borderRadius: 16,
          width: "100%",
          maxWidth: 800,
          border: "1px solid #1e2d4a",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Video */}
        <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        </div>
        {/* Info */}
        <div style={{ padding: "20px 24px 24px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
            <span style={{
              background: "#f4821f", color: "#fff", padding: "3px 12px",
              borderRadius: 6, fontSize: 13, fontWeight: 700,
              fontFamily: "'DM Mono', monospace",
            }}>
              Linea {video.linea}
            </span>
            <Badge tipo={video.tipo} />
          </div>
          <h2 style={{
            margin: "0 0 8px", fontSize: 18, fontWeight: 700,
            color: "#e8eaf0", fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {video.titolo}
          </h2>
          <p style={{ margin: "0 0 16px", color: "#8fa3c4", fontSize: 14, lineHeight: 1.6 }}>
            {video.descrizione}
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#4a5f82" }}>
              👤 {video.autore} (mat. {video.matricola}) · {timeAgo(video.ts)}
            </span>
            <button
              onClick={onClose}
              style={{
                background: "transparent", border: "1px solid #2a3f5f",
                color: "#8fa3c4", padding: "6px 16px", borderRadius: 8,
                cursor: "pointer", fontSize: 13,
              }}
            >
              Chiudi ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddVideoModal({ onClose, onAdd, currentUser }) {
  const [form, setForm] = useState({
    linea: "", titolo: "", tipo: "normale", descrizione: "", youtubeUrl: "",
  });
  const [error, setError] = useState("");

  const handle = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.linea.trim()) return setError("Inserisci il numero di linea");
    if (!form.titolo.trim()) return setError("Inserisci un titolo");
    if (!form.youtubeUrl.trim()) return setError("Inserisci il link YouTube");
    const ytId = extractYouTubeId(form.youtubeUrl);
    if (!ytId) return setError("Link YouTube non valido. Copia l'URL dal browser o da YouTube.");
    setError("");
    onAdd({ ...form, youtubeId: ytId });
  };

  const inputStyle = {
    width: "100%", background: "#0d1829", border: "1px solid #1e2d4a",
    borderRadius: 8, color: "#e8eaf0", padding: "10px 14px",
    fontSize: 14, outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  };
  const labelStyle = { fontSize: 12, color: "#6b7fa3", display: "block", marginBottom: 4, fontWeight: 600 };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#111827", borderRadius: 16, width: "100%", maxWidth: 520,
          border: "1px solid #1e2d4a", padding: 28,
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h2 style={{
            margin: 0, fontSize: 18, fontWeight: 700, color: "#e8eaf0",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            📹 Carica nuovo video
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#4a5f82" }}>
            Carica prima il video su YouTube come "Non in elenco", poi incolla il link qui
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Linea */}
          <div>
            <label style={labelStyle}>NUMERO LINEA *</label>
            <input
              placeholder="es. C1, C31, 140, R2..."
              value={form.linea}
              onChange={e => handle("linea", e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Tipo */}
          <div>
            <label style={labelStyle}>TIPO *</label>
            <div style={{ display: "flex", gap: 8 }}>
              {["normale", "deviazione"].map(t => (
                <button
                  key={t}
                  onClick={() => handle("tipo", t)}
                  style={{
                    flex: 1, padding: "9px 0", borderRadius: 8, cursor: "pointer",
                    fontWeight: 700, fontSize: 13, textTransform: "uppercase",
                    border: form.tipo === t ? "none" : "1px solid #1e2d4a",
                    background: form.tipo === t
                      ? (t === "deviazione" ? "#ff4d00" : "#00b86b")
                      : "#0d1829",
                    color: form.tipo === t ? "#fff" : "#4a5f82",
                    transition: "all 0.15s",
                  }}
                >
                  {t === "deviazione" ? "⚠ Deviazione" : "✓ Normale"}
                </button>
              ))}
            </div>
          </div>

          {/* Titolo */}
          <div>
            <label style={labelStyle}>TITOLO *</label>
            <input
              placeholder="es. C1 – Percorso completo verso Capodimonte"
              value={form.titolo}
              onChange={e => handle("titolo", e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* YouTube URL */}
          <div>
            <label style={labelStyle}>LINK YOUTUBE *</label>
            <input
              placeholder="https://youtu.be/xxxx o https://www.youtube.com/watch?v=xxxx"
              value={form.youtubeUrl}
              onChange={e => handle("youtubeUrl", e.target.value)}
              style={{ ...inputStyle, fontFamily: "'DM Mono', monospace", fontSize: 12 }}
            />
            {form.youtubeUrl && extractYouTubeId(form.youtubeUrl) && (
              <div style={{ marginTop: 4, fontSize: 11, color: "#00b86b" }}>
                ✓ Link valido – ID: {extractYouTubeId(form.youtubeUrl)}
              </div>
            )}
          </div>

          {/* Descrizione */}
          <div>
            <label style={labelStyle}>NOTE / DESCRIZIONE</label>
            <textarea
              placeholder="Aggiungi note per i colleghi: punti critici, deviazioni temporanee, fermate chiuse..."
              value={form.descrizione}
              onChange={e => handle("descrizione", e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
            />
          </div>

          {error && (
            <div style={{
              background: "rgba(255,77,0,0.1)", border: "1px solid rgba(255,77,0,0.3)",
              borderRadius: 8, padding: "8px 12px", color: "#ff6b35", fontSize: 13,
            }}>
              ⚠ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: "11px 0", borderRadius: 8, cursor: "pointer",
                background: "transparent", border: "1px solid #2a3f5f",
                color: "#6b7fa3", fontSize: 14, fontWeight: 600,
              }}
            >
              Annulla
            </button>
            <button
              onClick={submit}
              style={{
                flex: 2, padding: "11px 0", borderRadius: 8, cursor: "pointer",
                background: "#f4821f", border: "none",
                color: "#fff", fontSize: 14, fontWeight: 700,
                boxShadow: "0 4px 16px rgba(244,130,31,0.35)",
              }}
            >
              Pubblica video ↗
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [filterLinea, setFilterLinea] = useState("TUTTE");
  const [filterTipo, setFilterTipo] = useState("tutti");
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [currentUser] = useState({ nome: "Ciro", matricola: "50270" });

  // Linee disponibili
  const linee = ["TUTTE", ...Array.from(new Set(videos.map(v => v.linea))).sort()];

  // Filtro
  const filtered = videos.filter(v => {
    if (filterLinea !== "TUTTE" && v.linea !== filterLinea) return false;
    if (filterTipo === "deviazione" && v.tipo !== "deviazione") return false;
    if (filterTipo === "normale" && v.tipo !== "normale") return false;
    if (search && !`${v.titolo} ${v.linea} ${v.descrizione}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAdd = (data) => {
    const newVideo = {
      id: Date.now().toString(),
      ...data,
      autore: currentUser.nome,
      matricola: currentUser.matricola,
      ts: Date.now(),
    };
    setVideos(v => [newVideo, ...v]);
    setShowAdd(false);
    // TODO: salva su Firebase RTDB
    // fetch(`${FIREBASE_URL}/videos.json`, { method: "POST", body: JSON.stringify(newVideo) })
  };

  const deviazioni = videos.filter(v => v.tipo === "deviazione").length;

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0f1e; color: #e8eaf0; font-family: 'Plus Jakarta Sans', sans-serif; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #1e2d4a; border-radius: 3px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0a0f1e" }}>

        {/* ── HEADER ── */}
        <header style={{
          background: "#0d1422",
          borderBottom: "1px solid #1a2540",
          padding: "0 24px",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{
            maxWidth: 1100, margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            height: 64,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                background: "#f4821f",
                borderRadius: 8,
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>🚌</div>
              <div>
                <div style={{
                  fontWeight: 800, fontSize: 17, color: "#fff",
                  letterSpacing: "-0.02em",
                }}>
                  ANM <span style={{ color: "#f4821f" }}>Linee</span>Vivo
                </div>
                <div style={{ fontSize: 11, color: "#4a5f82", marginTop: -1 }}>
                  Deposito Cavalleggeri d'Aosta
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {deviazioni > 0 && (
                <div style={{
                  background: "rgba(255,77,0,0.15)",
                  border: "1px solid rgba(255,77,0,0.3)",
                  borderRadius: 20,
                  padding: "4px 12px",
                  fontSize: 12,
                  color: "#ff6b35",
                  fontWeight: 600,
                }}>
                  ⚠ {deviazioni} deviaziо{deviazioni === 1 ? "ne" : "ni"} attive
                </div>
              )}
              <button
                onClick={() => setShowAdd(true)}
                style={{
                  background: "#f4821f",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  boxShadow: "0 4px 12px rgba(244,130,31,0.3)",
                }}
              >
                <span style={{ fontSize: 16 }}>+</span> Carica video
              </button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

          {/* ── STATS BAR ── */}
          <div style={{
            display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap",
          }}>
            {[
              { label: "Video totali", value: videos.length, icon: "🎬" },
              { label: "Linee coperte", value: new Set(videos.map(v => v.linea)).size, icon: "🗺️" },
              { label: "Deviazioni attive", value: deviazioni, icon: "⚠️", alert: deviazioni > 0 },
              { label: "Autista", value: `Mat. ${currentUser.matricola}`, icon: "👤" },
            ].map(s => (
              <div key={s.label} style={{
                background: s.alert ? "rgba(255,77,0,0.1)" : "#111827",
                border: `1px solid ${s.alert ? "rgba(255,77,0,0.3)" : "#1e2d4a"}`,
                borderRadius: 10, padding: "12px 18px",
                flex: 1, minWidth: 140,
              }}>
                <div style={{ fontSize: 11, color: s.alert ? "#ff6b35" : "#4a5f82", marginBottom: 4 }}>
                  {s.icon} {s.label}
                </div>
                <div style={{
                  fontSize: 20, fontWeight: 800,
                  color: s.alert ? "#ff6b35" : "#e8eaf0",
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── SEARCH ── */}
          <div style={{ marginBottom: 20 }}>
            <input
              placeholder="🔍  Cerca per linea, titolo o parola chiave..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%",
                background: "#111827",
                border: "1px solid #1e2d4a",
                borderRadius: 10,
                color: "#e8eaf0",
                padding: "12px 18px",
                fontSize: 14,
                outline: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            />
          </div>

          {/* ── FILTERS ── */}
          <div style={{ display: "flex", gap: 24, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
            {/* Linee */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {linee.map(l => (
                <button
                  key={l}
                  onClick={() => setFilterLinea(l)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                    fontSize: 13, fontWeight: 700,
                    background: filterLinea === l ? "#f4821f" : "#111827",
                    border: `1px solid ${filterLinea === l ? "#f4821f" : "#1e2d4a"}`,
                    color: filterLinea === l ? "#fff" : "#6b7fa3",
                    transition: "all 0.15s",
                  }}
                >
                  {l === "TUTTE" ? "Tutte le linee" : `Linea ${l}`}
                </button>
              ))}
            </div>
            {/* Tipo */}
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { key: "tutti", label: "Tutti" },
                { key: "normale", label: "✓ Normali" },
                { key: "deviazione", label: "⚠ Deviazioni" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setFilterTipo(t.key)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, cursor: "pointer",
                    fontSize: 12, fontWeight: 600,
                    background: filterTipo === t.key ? "#1e2d4a" : "transparent",
                    border: `1px solid ${filterTipo === t.key ? "#2a4070" : "#1e2d4a"}`,
                    color: filterTipo === t.key ? "#e8eaf0" : "#4a5f82",
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── GRID ── */}
          {filtered.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "80px 0",
              color: "#2a3f5f", fontSize: 16,
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              Nessun video trovato per questa selezione
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
              gap: 18,
            }}>
              {filtered.map(v => (
                <VideoCard key={v.id} video={v} onClick={setSelectedVideo} />
              ))}
            </div>
          )}

          {/* ── FOOTER NOTE ── */}
          <div style={{
            marginTop: 48, paddingTop: 20,
            borderTop: "1px solid #111827",
            display: "flex", justifyContent: "space-between",
            fontSize: 11, color: "#2a3f5f",
          }}>
            <span>ANM LineeVivo · Deposito Cavalleggeri d'Aosta · uso interno</span>
            <span>I video vengono caricati come "Non in elenco" su YouTube</span>
          </div>
        </main>
      </div>

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
      {showAdd && (
        <AddVideoModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          currentUser={currentUser}
        />
      )}
    </>
  );
}
