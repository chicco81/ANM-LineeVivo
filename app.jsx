
/* ════════════════════════════════════════════════════════════════════
   ANM LINEEVIVO  –  Percorsi in Video per i Colleghi
   ────────────────────────────────────────────────────────────────────
   Ideato da : Guido Tartaglia  (mat. 20002)
   Sviluppato: Ciro Esposito             (mat. 50270)
   Deposito  : Cavalleggeri d'Aosta – ANM Napoli
   ════════════════════════════════════════════════════════════════════

   ⚙️  SETUP RAPIDO (3 passi):
   1. Sostituisci FB_URL con l'URL del tuo Firebase Realtime DB
   2. Carica su GitHub Pages → chicco81.github.io/ANM-LineeVivo/
   3. Aggiungi manifest.json e sw.js (vedi file allegati)
*/

// ── 1. FIREBASE CONFIG ────────────────────────────────────────────
const { useState, useEffect, useRef, useCallback } = React;

// ── FIREBASE FCM CONFIG ───────────────────────────────────────────
const FB_CONFIG = {
  apiKey: "AIzaSyA99hZr8n2jPbmGPKR15Btf1LnfJCRynGk",
  authDomain: "anm-lineevivo.firebaseapp.com",
  databaseURL: "https://anm-lineevivo-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "anm-lineevivo",
  storageBucket: "anm-lineevivo.firebasestorage.app",
  messagingSenderId: "224724563682",
  appId: "1:224724563682:web:8771592abdfb4df89c10bb"
};
const VAPID_KEY = "N7pwbqtpP2M0jlt5kYrSDiMxV4cb4WcwxmpvvFPgnLg";

// Inizializza Firebase Messaging (solo se disponibile)
let fbMessaging = null;
function initFCM() {
  try {
    if (!window.firebase) return;
    if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
    fbMessaging = firebase.messaging();
  } catch(e) { console.warn("FCM non disponibile:", e); }
}

async function requestNotifPermission() {
  try {
    initFCM();
    if (!fbMessaging) return null;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
    const token = await fbMessaging.getToken({ vapidKey: VAPID_KEY });
    if (token) {
      await fbPut(`/tokens/${token.slice(0,20)}`, { token, ts: Date.now() });
      return token;
    }
  } catch(e) { console.warn("Notifiche non disponibili:", e); }
  return null;
}

async function sendDeviationNotif(titolo, linea) {
  try {
    const tokens = await fbGet("/tokens");
    if (!tokens) return;
    const tokenList = Object.values(tokens).map(t => t.token).filter(Boolean);
    if (!tokenList.length) return;
    // Salva la notifica nel DB così il SW la mostra
    await fbPost("/notifications", {
      title: `⚠ DEVIAZIONE Linea ${linea}`,
      body: titolo,
      ts: Date.now(),
      tokens: tokenList.length
    });
  } catch(e) { console.warn("Errore invio notifica:", e); }
}

const FB_URL = "https://anm-lineevivo-default-rtdb.europe-west1.firebasedatabase.app";
// es: "https://anm-lineevivo-default-rtdb.firebaseio.com"

// ── 2. ADMIN DI DEFAULT ───────────────────────────────────────────
// Questi vengono sincronizzati su Firebase al primo avvio
const SEED_ADMINS = [
  { matricola: "20002", pin: "2002", nome: "Guido Tartaglia", ruolo: "Ideatore & Admin", ts: Date.now() },
  { matricola: "50270", pin: "5027", nome: "Ciro Esposito",            ruolo: "Sviluppatore & Admin", ts: Date.now() },
];

// ── 3. PERCORSI PREDEFINITI ANM (coordinate approssimative) ───────
const ROUTE_PRESETS = {
  "C1":  [[40.8529,14.2681],[40.8545,14.2705],[40.8568,14.2718],[40.8590,14.2698],[40.8612,14.2665],[40.8635,14.2640],[40.8652,14.2610]],
  "C2":  [[40.8529,14.2681],[40.8510,14.2720],[40.8495,14.2760],[40.8480,14.2800],[40.8465,14.2840]],
  "C3":  [[40.8529,14.2681],[40.8550,14.2650],[40.8575,14.2620],[40.8600,14.2590],[40.8625,14.2560]],
  "C16": [[40.8529,14.2681],[40.8555,14.2730],[40.8582,14.2778],[40.8608,14.2820],[40.8630,14.2860]],
  "C31": [[40.8870,14.2420],[40.8840,14.2480],[40.8800,14.2540],[40.8760,14.2600],[40.8720,14.2650],[40.8680,14.2690]],
  "140": [[40.8290,14.2490],[40.8320,14.2450],[40.8350,14.2410],[40.8375,14.2360],[40.8395,14.2300]],
  "151": [[40.8400,14.2200],[40.8430,14.2250],[40.8460,14.2300],[40.8490,14.2350],[40.8520,14.2400]],
  "R2":  [[40.8529,14.2681],[40.8558,14.2640],[40.8585,14.2600],[40.8612,14.2562],[40.8638,14.2525]],
  "R4":  [[40.8529,14.2681],[40.8500,14.2710],[40.8470,14.2740],[40.8440,14.2770],[40.8410,14.2800]],
};

// ── PALETTE (dark + light) ────────────────────────────────────────
const THEMES = {
  dark: {
    bg:"#070b14", surface:"#0c1220", card:"#101828",
    border:"#182338", borderHi:"#243552",
    accent:"#f4821f", accentGlow:"rgba(244,130,31,0.20)",
    danger:"#e53e3e", dangerDim:"rgba(229,62,62,0.15)",
    success:"#38a169", successDim:"rgba(56,161,105,0.15)",
    text:"#e8edf5", textMid:"#647d9e", textDim:"#263550",
  },
  light: {
    bg:"#f0f4f8", surface:"#ffffff", card:"#ffffff",
    border:"#dde3ec", borderHi:"#bfcbdc",
    accent:"#f4821f", accentGlow:"rgba(244,130,31,0.15)",
    danger:"#e53e3e", dangerDim:"rgba(229,62,62,0.10)",
    success:"#38a169", successDim:"rgba(56,161,105,0.10)",
    text:"#1a2535", textMid:"#4a5f7a", textDim:"#9bafc4",
  }
};
// C viene impostato dinamicamente nell'app — default dark
let C = THEMES.dark;

// ── HELPERS ───────────────────────────────────────────────────────
const ytId  = u => { if (!u) return null; const m = u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([^?&\n\/]+)/); return m?.[1] ?? null; };
const ytThumb = id => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
const ago   = ts => { const d=Date.now()-ts, m=~~(d/6e4), h=~~(m/60), g=~~(h/24); return m<1?"adesso":m<60?`${m}m fa`:h<24?`${h}h fa`:`${g}g fa`; };
const parseCoords = raw => { try { return raw.trim().split("\n").map(r=>{ const[a,b]=r.trim().split(","); return [parseFloat(a),parseFloat(b)]; }).filter(r=>!isNaN(r[0])&&!isNaN(r[1])); } catch{ return []; } };

// ── FIREBASE HELPERS ──────────────────────────────────────────────
const fbGet  = async p => { try { const r = await fetch(`${FB_URL}${p}.json`); return r.json(); } catch { return null; } };
const fbPost = async (p,d) => { try { const r = await fetch(`${FB_URL}${p}.json`,{method:"POST",body:JSON.stringify(d)}); return r.json(); } catch { return null; } };
const fbPut  = async (p,d) => { try { await fetch(`${FB_URL}${p}.json`,{method:"PUT",body:JSON.stringify(d)}); } catch {} };
const fbDel  = async p => { try { await fetch(`${FB_URL}${p}.json`,{method:"DELETE"}); } catch {} };

// ── MOCK DATA (rimossi dopo collegamento Firebase) ─────────────────
const MOCK = [
  { id:"m1", linea:"C1", titolo:"C1 – Percorso completo Garibaldi → Capodimonte", tipo:"normale", descrizione:"Percorso standard. Attenzione alla svolta stretta su Via Foria al km 2.", youtubeId:"dQw4w9WgXcQ", routeKey:"C1", routeCoords:[], autore:"Ciro Esposito", matricola:"50270", ts:Date.now()-7200000 },
  { id:"m2", linea:"C1", titolo:"C1 – DEVIAZIONE Corso Umberto (cantiere)", tipo:"deviazione", descrizione:"Dal 20/01 deviazione per lavori stradali. Svoltare su Via Duomo invece di Corso Umberto. Fermata 'Università' temporaneamente sospesa.", youtubeId:"ScMzIvxBSi4", routeKey:"C1", routeCoords:[], autore:"Guido Tartaglia", matricola:"20002", ts:Date.now()-18000000 },
  { id:"m3", linea:"C31", titolo:"C31 – Piscinola → Pianura completo", tipo:"normale", descrizione:"Tratto integrale. Il tratto Pianura centro è difficile, prestare attenzione alla larghezza.", youtubeId:"3JZ_D3ELwOQ", routeKey:"C31", routeCoords:[], autore:"Ciro Esposito", matricola:"50270", ts:Date.now()-86400000 },
  { id:"m4", linea:"140", titolo:"140 – Lungomare DEVIAZIONE evento", tipo:"deviazione", descrizione:"Deviazione attiva nei weekend per eventi sul lungomare. Tornio da Mergellina via Riviera di Chiaia.", youtubeId:"L_jWHffIx5E", routeKey:"140", routeCoords:[], autore:"Guido Tartaglia", matricola:"20002", ts:Date.now()-172800000 },
];

// ═══════════════════════════════════════════════════════════════════
//  COMPONENTI
// ═══════════════════════════════════════════════════════════════════

// ── BADGE ─────────────────────────────────────────────────────────
function Badge({ tipo, small }) {
  const dev = tipo === "deviazione";
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:3,
      padding: small ? "1px 7px" : "2px 9px",
      borderRadius:4, fontSize: small?10:11, fontWeight:700,
      letterSpacing:"0.07em", textTransform:"uppercase",
      background: dev ? C.danger : C.success,
      color:"#fff", whiteSpace:"nowrap",
    }}>
      {dev ? "⚠ DEVIAZIONE" : "✓ NORMALE"}
    </span>
  );
}

// ── MAPPA LEAFLET ─────────────────────────────────────────────────
function RouteMap({ coords }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const [rdy, setRdy] = useState(!!window.L);

  useEffect(() => {
    if (window.L) { setRdy(true); return; }
    if (!document.getElementById("lf-css")) {
      const l=document.createElement("link"); l.id="lf-css"; l.rel="stylesheet";
      l.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(l);
    }
    const s=document.createElement("script"); s.id="lf-js";
    s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.onload=()=>setRdy(true); document.head.appendChild(s);
  }, []);

  useEffect(() => {
    if (!rdy || !divRef.current || !coords?.length) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current=null; }
    const L = window.L;
    const map = L.map(divRef.current,{zoomControl:true,scrollWheelZoom:false,attributionControl:false});
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(map);
    const poly = L.polyline(coords,{color:C.accent,weight:5,opacity:0.9}).addTo(map);
    const mk = (pos,label,color) => L.marker(pos,{icon:L.divIcon({
      html:`<div style="background:${color};color:#fff;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:10px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)">${label}</div>`,
      className:"",iconSize:[22,22],iconAnchor:[11,11]
    })}).addTo(map);
    mk(coords[0],"A",C.success);
    mk(coords[coords.length-1],"B",C.danger);
    map.fitBounds(poly.getBounds(),{padding:[16,16]});
    mapRef.current = map;
    return () => { if(mapRef.current){mapRef.current.remove();mapRef.current=null;} };
  }, [rdy, coords]);

  if (!coords?.length) return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:C.surface,borderRadius:8,color:C.textDim,gap:8}}>
      <span style={{fontSize:36}}>🗺️</span>
      <span style={{fontSize:12}}>Percorso non disponibile</span>
    </div>
  );
  return (
    <div style={{height:"100%",borderRadius:8,overflow:"hidden",position:"relative"}}>
      {!rdy && <div style={{position:"absolute",inset:0,background:C.surface,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10,color:C.textMid,fontSize:13}}>Caricamento mappa…</div>}
      <div ref={divRef} style={{height:"100%",width:"100%"}} />
    </div>
  );
}

// ── VIDEO CARD ────────────────────────────────────────────────────
function VideoCard({ v, onClick, onDelete, isAdmin }) {
  const [imgErr,setImgErr] = useState(false);
  return (
    <div
      onClick={()=>onClick(v)}
      style={{
        background:C.card, border:`1px solid ${C.border}`, borderRadius:14,
        overflow:"hidden", cursor:"pointer",
        transition:"transform .18s, border-color .18s, box-shadow .18s",
      }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor=C.accent;e.currentTarget.style.boxShadow=`0 8px 28px ${C.accentGlow}`;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow="none";}}
    >
      {/* Thumbnail */}
      <div style={{position:"relative",paddingBottom:"56.25%",background:"#000"}}>
        {!imgErr
          ? <img src={ytThumb(v.youtubeId)} onError={()=>setImgErr(true)} alt=""
              style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.8}} />
          : <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:C.textDim,fontSize:40}}>🎬</div>
        }
        {/* Play button */}
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(244,130,31,.92)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,.5)"}}>
            <span style={{fontSize:18,marginLeft:3}}>▶</span>
          </div>
        </div>
        {/* Linea pill */}
        <div style={{position:"absolute",top:10,left:10,background:C.accent,color:"#fff",fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:14,padding:"3px 10px",borderRadius:6,boxShadow:"0 2px 8px rgba(0,0,0,.4)"}}>
          {v.linea}
        </div>
        {v.tipo==="deviazione" && <div style={{position:"absolute",top:10,right:10}}><Badge tipo="deviazione" small /></div>}
        {isAdmin && (
          <button onClick={e=>{e.stopPropagation();onDelete(v);}} style={{
            position:"absolute",bottom:8,right:8,background:"rgba(229,62,62,.85)",border:"none",
            borderRadius:6,color:"#fff",padding:"4px 8px",fontSize:11,cursor:"pointer",fontWeight:700,
          }}>✕ Elimina</button>
        )}
      </div>
      {/* Info */}
      <div style={{padding:"13px 15px 15px"}}>
        {v.tipo==="normale" && <div style={{marginBottom:6}}><Badge tipo="normale" small /></div>}
        <h3 style={{margin:"4px 0 7px",fontSize:13,fontWeight:700,lineHeight:1.45,color:C.text,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{v.titolo}</h3>
        {v.descrizione && <p style={{margin:"0 0 9px",fontSize:12,color:C.textMid,lineHeight:1.5}}>{v.descrizione.length>75?v.descrizione.slice(0,75)+"…":v.descrizione}</p>}
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.textDim}}>
          <span>👤 {v.autore} · {v.matricola}</span>
          <span>{ago(v.ts)}</span>
        </div>
      </div>
    </div>
  );
}

// ── VIDEO MODAL (player + mappa) ──────────────────────────────────
function VideoModal({ v, onClose }) {
  const [comments,setComments] = useState([]);
  const [newComment,setNewComment] = useState("");
  const [loadingC,setLoadingC] = useState(false);

  useEffect(()=>{
    (async()=>{
      const data = await fbGet(`/comments/${v.id}`);
      if (data) {
        const arr = Object.entries(data).map(([id,c])=>({id,...c}));
        arr.sort((a,b)=>b.ts-a.ts);
        setComments(arr);
      }
    })();
  },[v.id]);

  const addComment = async () => {
    if (!newComment.trim()) return;
    setLoadingC(true);
    const c = { testo: newComment.trim(), autore: "Collega", ts: Date.now() };
    const res = await fbPost(`/comments/${v.id}`, c);
    if (res?.name) setComments(p=>[{...c,id:res.name},...p]);
    setNewComment("");
    setLoadingC(false);
  };

  if (!v) return null;
  const coords = v.routeCoords?.length ? v.routeCoords : (ROUTE_PRESETS[v.routeKey] ?? ROUTE_PRESETS[v.linea] ?? []);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0e1522",borderRadius:18,width:"100%",maxWidth:960,border:`1px solid ${C.borderHi}`,overflow:"hidden",boxShadow:"0 32px 100px rgba(0,0,0,.8)",display:"flex",flexDirection:"column",maxHeight:"92vh"}}>
        {/* Header strip */}
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{background:C.accent,color:"#fff",fontFamily:"'DM Mono',monospace",fontWeight:700,fontSize:14,padding:"3px 12px",borderRadius:6}}>Linea {v.linea}</span>
            <Badge tipo={v.tipo} small />
          </div>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.textMid,padding:"5px 14px",borderRadius:8,cursor:"pointer",fontSize:13}}>✕ Chiudi</button>
        </div>
        {/* Body: video + mappa */}
        <div style={{display:"flex",gap:0,flex:1,overflow:"hidden",minHeight:0}}>
          {/* Video */}
          <div style={{flex:"0 0 55%",position:"relative",paddingBottom:"calc(55% * 0.5625)"}}>
            <iframe
              src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=1&rel=0`}
              style={{position:"absolute",inset:0,width:"100%",height:"100%",border:"none"}}
              allow="autoplay; encrypted-media; fullscreen" allowFullScreen
            />
          </div>
          {/* Map */}
          <div style={{flex:1,padding:12,background:C.surface,minHeight:260}}>
            <div style={{fontSize:11,color:C.textMid,marginBottom:6,fontWeight:600,letterSpacing:"0.06em"}}>🗺️ PERCORSO LINEA</div>
            <div style={{height:"calc(100% - 22px)",minHeight:200}}>
              <RouteMap coords={coords} />
            </div>
          </div>
        </div>
        {/* Footer info */}
        <div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:4,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{v.titolo}</div>
              {v.descrizione && <p style={{margin:"0 0 8px",fontSize:13,color:C.textMid,lineHeight:1.6}}>{v.descrizione}</p>}
              <div style={{fontSize:11,color:C.textDim}}>👤 {v.autore} (mat. {v.matricola}) · caricato {ago(v.ts)}</div>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:"inline-flex",alignItems:"center",gap:6,
                background:"#ff0000",color:"#fff",border:"none",
                padding:"8px 14px",borderRadius:8,cursor:"pointer",
                fontSize:12,fontWeight:700,textDecoration:"none",
                whiteSpace:"nowrap",flexShrink:0,
                boxShadow:"0 2px 8px rgba(255,0,0,0.3)",
              }}
            >
              ⛶ Schermo intero
            </a>
          </div>
          {/* Commenti */}
          <div style={{marginTop:14,borderTop:`1px solid ${C.border}`,paddingTop:12}}>
            <div style={{fontSize:11,color:C.textMid,fontWeight:700,marginBottom:8,letterSpacing:"0.06em"}}>💬 NOTE DEI COLLEGHI</div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input
                value={newComment}
                onChange={e=>setNewComment(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addComment()}
                placeholder="Aggiungi una nota o commento…"
                style={{flex:1,background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,color:C.text,padding:"8px 12px",fontSize:12,outline:"none",fontFamily:"inherit"}}
              />
              <button onClick={addComment} disabled={loadingC||!newComment.trim()} style={{background:C.accent,border:"none",color:"#fff",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,opacity:loadingC?.6:1}}>
                Invia
              </button>
            </div>
            <div style={{maxHeight:120,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
              {comments.length===0
                ? <div style={{fontSize:12,color:C.textDim,fontStyle:"italic"}}>Nessuna nota ancora — sii il primo!</div>
                : comments.map(c=>(
                  <div key={c.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,padding:"7px 10px"}}>
                    <div style={{fontSize:12,color:C.text}}>{c.testo}</div>
                    <div style={{fontSize:10,color:C.textDim,marginTop:2}}>{c.autore} · {ago(c.ts)}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADD VIDEO MODAL ───────────────────────────────────────────────
function AddModal({ user, onClose, onAdd }) {
  const [f,setF] = useState({linea:"",titolo:"",tipo:"normale",descrizione:"",ytUrl:"",routeMode:"preset",customCoords:""});
  const [err,setErr] = useState("");
  const [saving,setSaving] = useState(false);
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const id = ytId(f.ytUrl);

  const submit = async () => {
    if (!f.linea.trim()) return setErr("Inserisci il numero di linea");
    if (!f.titolo.trim()) return setErr("Inserisci un titolo");
    if (!f.ytUrl.trim()) return setErr("Incolla il link YouTube");
    if (!id) return setErr("Link YouTube non valido — copia l'URL dal browser");
    setErr(""); setSaving(true);
    const coords = f.routeMode==="preset" ? [] : parseCoords(f.customCoords);
    const rec = { linea:f.linea.trim().toUpperCase(), titolo:f.titolo.trim(), tipo:f.tipo,
      descrizione:f.descrizione.trim(), youtubeId:id,
      routeKey:f.linea.trim().toUpperCase(), routeCoords:coords,
      autore:user.nome, matricola:user.matricola, ts:Date.now() };
    await onAdd(rec);
    setSaving(false);
  };

  const inp = { width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,
    color:C.text,padding:"10px 13px",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit" };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0e1522",borderRadius:18,width:"100%",maxWidth:520,border:`1px solid ${C.borderHi}`,padding:28,boxShadow:"0 32px 100px rgba(0,0,0,.8)",maxHeight:"90vh",overflowY:"auto"}}>
        <h2 style={{margin:"0 0 4px",fontSize:17,fontWeight:800,color:C.text,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>📹 Carica nuovo video</h2>
        <p style={{margin:"0 0 20px",fontSize:12,color:C.textDim}}>Carica prima il video su YouTube come "Non in elenco", poi incolla il link qui sotto</p>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* Linea */}
          <div>
            <label style={{fontSize:11,color:C.textMid,display:"block",marginBottom:4,fontWeight:700,letterSpacing:"0.07em"}}>LINEA *</label>
            <input placeholder="es. C1 · C31 · 140 · R2 · 151…" value={f.linea} onChange={e=>set("linea",e.target.value)} style={inp} />
          </div>

          {/* Tipo */}
          <div>
            <label style={{fontSize:11,color:C.textMid,display:"block",marginBottom:6,fontWeight:700,letterSpacing:"0.07em"}}>TIPO *</label>
            <div style={{display:"flex",gap:8}}>
              {["normale","deviazione"].map(t=>(
                <button key={t} onClick={()=>set("tipo",t)} style={{
                  flex:1,padding:"9px 0",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,
                  border:f.tipo===t?"none":`1px solid ${C.border}`,
                  background:f.tipo===t?(t==="deviazione"?C.danger:C.success):C.surface,
                  color:f.tipo===t?"#fff":C.textMid, transition:"all .15s",
                }}>
                  {t==="deviazione"?"⚠ Deviazione":"✓ Normale"}
                </button>
              ))}
            </div>
          </div>

          {/* Titolo */}
          <div>
            <label style={{fontSize:11,color:C.textMid,display:"block",marginBottom:4,fontWeight:700,letterSpacing:"0.07em"}}>TITOLO *</label>
            <input placeholder="es. C1 – Percorso completo Garibaldi → Capodimonte" value={f.titolo} onChange={e=>set("titolo",e.target.value)} style={inp} />
          </div>

          {/* YouTube */}
          <div>
            <label style={{fontSize:11,color:C.textMid,display:"block",marginBottom:4,fontWeight:700,letterSpacing:"0.07em"}}>LINK YOUTUBE *</label>
            <input placeholder="https://youtu.be/xxxx" value={f.ytUrl} onChange={e=>set("ytUrl",e.target.value)} style={{...inp,fontFamily:"'DM Mono',monospace",fontSize:12}} />
            {f.ytUrl && (id
              ? <div style={{marginTop:4,fontSize:11,color:C.success}}>✓ Link valido  ·  ID: {id}</div>
              : <div style={{marginTop:4,fontSize:11,color:C.danger}}>✗ Link non riconosciuto</div>
            )}
          </div>

          {/* Percorso */}
          <div>
            <label style={{fontSize:11,color:C.textMid,display:"block",marginBottom:6,fontWeight:700,letterSpacing:"0.07em"}}>PERCORSO SULLA MAPPA</label>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              {[["preset","📌 Usa preset"],["custom","✏️ Coordinate custom"]].map(([k,l])=>(
                <button key={k} onClick={()=>set("routeMode",k)} style={{
                  flex:1,padding:"7px 0",borderRadius:7,cursor:"pointer",fontSize:12,
                  background:f.routeMode===k?C.accent:C.surface,
                  border:f.routeMode===k?"none":`1px solid ${C.border}`,
                  color:f.routeMode===k?"#fff":C.textMid,fontWeight:600,
                }}>
                  {l}
                </button>
              ))}
            </div>
            {f.routeMode==="preset"
              ? <div style={{fontSize:12,color:C.textDim,padding:"9px 13px",background:C.surface,borderRadius:8,border:`1px solid ${C.border}`}}>
                  Se la tua linea è tra C1, C2, C3, C16, C31, 140, 151, R2, R4 il percorso si carica automaticamente. Altrimenti usa "Coordinate custom".
                </div>
              : <textarea placeholder={"Una coordinata per riga:\n40.8529,14.2681\n40.8558,14.2705\n40.8582,14.2731\n…"} value={f.customCoords} onChange={e=>set("customCoords",e.target.value)} rows={5}
                  style={{...inp,resize:"vertical",lineHeight:1.6,fontFamily:"'DM Mono',monospace",fontSize:12}} />
            }
          </div>

          {/* Note */}
          <div>
            <label style={{fontSize:11,color:C.textMid,display:"block",marginBottom:4,fontWeight:700,letterSpacing:"0.07em"}}>NOTE PER I COLLEGHI</label>
            <textarea placeholder="Punti critici, fermate chiuse, cause della deviazione, durata prevista…" value={f.descrizione} onChange={e=>set("descrizione",e.target.value)} rows={3}
              style={{...inp,resize:"vertical",lineHeight:1.5}} />
          </div>

          {err && <div style={{background:C.dangerDim,border:`1px solid rgba(229,62,62,.3)`,borderRadius:8,padding:"8px 12px",color:"#fc8181",fontSize:13}}>⚠ {err}</div>}

          <div style={{display:"flex",gap:10,marginTop:4}}>
            <button onClick={onClose} style={{flex:1,padding:"11px 0",borderRadius:9,cursor:"pointer",background:"transparent",border:`1px solid ${C.border}`,color:C.textMid,fontSize:13,fontWeight:600}}>Annulla</button>
            <button onClick={submit} disabled={saving} style={{flex:2,padding:"11px 0",borderRadius:9,cursor:"pointer",background:C.accent,border:"none",color:"#fff",fontSize:14,fontWeight:800,opacity:saving?.6:1,boxShadow:`0 4px 16px ${C.accentGlow}`}}>
              {saving?"Pubblicazione…":"Pubblica video ↗"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GUIDA MODAL ───────────────────────────────────────────────────
const STEPS = [
  { icon:"🎬", title:"1. Gira il video", body:"Mentre sei in servizio sulla linea, registra il percorso con il telefono. Tieni il telefono fermo sul cruscotto. Non serve qualità cinematografica: basta che si vedano strade e cartelli.", tip:"Registra in orizzontale, almeno 720p. Copri l'intero percorso A→B per massima utilità." },
  { icon:"▶️", title:"2. Carica su YouTube", body:"Apri YouTube → + → Carica video → seleziona il file → Visibilità: «Non in elenco» (OBBLIGATORIO) → Pubblica → copia il link dalla barra del browser.", tip:"«Non in elenco» = solo chi ha il link vede il video. Non appare nelle ricerche. I tuoi colleghi lo vedono solo dall'app." },
  { icon:"➕", title:"3. Aggiungi all'app", body:"Tocca il pulsante arancione «+ Carica video» in alto → scegli la linea e il tipo → incolla il link YouTube → aggiungi note utili per i colleghi → «Pubblica». Il video è subito visibile a tutti.", tip:"Per le deviazioni: specifica sempre causa, data di inizio/fine e percorso alternativo." },
  { icon:"🗺️", title:"4. Mappa del percorso", body:"Ogni video mostra la mappa Leaflet affiancata al player. Se la linea è nei preset (C1, C2, C3, C16, C31, 140, 151, R2, R4) il percorso si carica automaticamente. Per le altre: usa «Coordinate custom» nel form.", tip:"Per trovare coordinate: Google Maps → tieni premuto su un punto → copia lat,lng dal banner in basso." },
  { icon:"🔐", title:"5. Login e permessi", body:"Visualizzatori: accedono con matricola + PIN e vedono tutti i contenuti. Amministratori: possono caricare, modificare ed eliminare video. Ammins attivi: Guido Tartaglia (20002) e Ciro Esposito (50270).", tip:"Nuovi admin: pannello ⚙️ Admin → Gestione Utenti → solo gli admin esistenti possono promuovere altri." },
  { icon:"📲", title:"6. Installa l'app (PWA)", body:"Android (Chrome): menu ⋮ → «Installa app» oppure «Aggiungi alla schermata Home».\niPhone (Safari): tasto Condividi □↑ → «Aggiungi alla schermata Home».\nDopo l'installazione si apre come un'app nativa, senza browser!", tip:"iPhone: usa SEMPRE Safari per installare. Su Chrome iOS l'installazione PWA non funziona." },
];

function GuideModal({ onClose }) {
  const [step,setStep] = useState(0);
  const s = STEPS[step];
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0e1522",borderRadius:18,width:"100%",maxWidth:500,border:`1px solid ${C.borderHi}`,overflow:"hidden",boxShadow:"0 32px 100px rgba(0,0,0,.8)"}}>
        {/* Header */}
        <div style={{background:C.accent,padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{fontWeight:800,fontSize:16,color:"#fff",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>📖 Guida all'uso</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.2)",border:"none",color:"#fff",borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:13}}>✕</button>
        </div>
        {/* Step dots */}
        <div style={{display:"flex",justifyContent:"center",gap:8,padding:"16px 0 4px"}}>
          {STEPS.map((_,i)=>(
            <button key={i} onClick={()=>setStep(i)} style={{width:i===step?24:8,height:8,borderRadius:4,background:i===step?C.accent:C.border,border:"none",cursor:"pointer",transition:"all .2s"}} />
          ))}
        </div>
        {/* Content */}
        <div style={{padding:"16px 28px 28px"}}>
          <div style={{fontSize:40,marginBottom:12,textAlign:"center"}}>{s.icon}</div>
          <h3 style={{margin:"0 0 12px",fontSize:17,fontWeight:800,color:C.text,fontFamily:"'Plus Jakarta Sans',sans-serif",textAlign:"center"}}>{s.title}</h3>
          <p style={{margin:"0 0 14px",fontSize:13,color:C.textMid,lineHeight:1.7,whiteSpace:"pre-line"}}>{s.body}</p>
          <div style={{background:`rgba(244,130,31,.1)`,border:`1px solid rgba(244,130,31,.25)`,borderRadius:8,padding:"10px 14px",marginBottom:20}}>
            <span style={{fontSize:11,color:C.accent,fontWeight:700}}>💡 CONSIGLIO  </span>
            <span style={{fontSize:12,color:"#d4956a",lineHeight:1.6}}>{s.tip}</span>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setStep(p=>Math.max(0,p-1))} disabled={step===0}
              style={{flex:1,padding:"10px 0",borderRadius:9,cursor:step===0?"not-allowed":"pointer",background:C.surface,border:`1px solid ${C.border}`,color:step===0?C.textDim:C.textMid,fontSize:13,opacity:step===0?.4:1}}>
              ← Indietro
            </button>
            {step < STEPS.length-1
              ? <button onClick={()=>setStep(p=>p+1)} style={{flex:2,padding:"10px 0",borderRadius:9,cursor:"pointer",background:C.accent,border:"none",color:"#fff",fontSize:13,fontWeight:700}}>Avanti →</button>
              : <button onClick={onClose} style={{flex:2,padding:"10px 0",borderRadius:9,cursor:"pointer",background:C.success,border:"none",color:"#fff",fontSize:13,fontWeight:700}}>✓ Ho capito!</button>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN PANEL ───────────────────────────────────────────────────
function AdminPanel({ onClose, admins, onAddAdmin, onRemoveAdmin }) {
  const [f,setF] = useState({matricola:"",pin:"",nome:"",ruolo:"Admin"});
  const [err,setErr] = useState("");
  const inp = {background:C.surface,border:`1px solid ${C.border}`,borderRadius:7,color:C.text,padding:"8px 11px",fontSize:12,outline:"none",fontFamily:"inherit"};

  const add = () => {
    if (!f.matricola||!f.pin||!f.nome) return setErr("Compila tutti i campi");
    if (admins.find(a=>a.matricola===f.matricola)) return setErr("Matricola già presente");
    setErr(""); onAddAdmin({...f,ts:Date.now()});
    setF({matricola:"",pin:"",nome:"",ruolo:"Admin"});
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0e1522",borderRadius:18,width:"100%",maxWidth:500,border:`1px solid ${C.borderHi}`,padding:28,boxShadow:"0 32px 100px rgba(0,0,0,.8)",maxHeight:"85vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{margin:0,fontSize:17,fontWeight:800,color:C.text,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>⚙️ Pannello Admin</h2>
          <button onClick={onClose} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.textMid,padding:"5px 13px",borderRadius:7,cursor:"pointer",fontSize:12}}>✕</button>
        </div>

        {/* Lista admins */}
        <div style={{marginBottom:24}}>
          <div style={{fontSize:11,color:C.textMid,fontWeight:700,letterSpacing:"0.07em",marginBottom:10}}>AMMINISTRATORI ATTIVI</div>
          {admins.map(a=>(
            <div key={a.matricola} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"10px 14px",marginBottom:8}}>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:C.text}}>{a.nome}</div>
                <div style={{fontSize:11,color:C.textDim}}>mat. {a.matricola} · {a.ruolo}</div>
              </div>
              {a.matricola!=="20002"&&a.matricola!=="50270" && (
                <button onClick={()=>onRemoveAdmin(a.matricola)} style={{background:C.dangerDim,border:`1px solid rgba(229,62,62,.3)`,color:"#fc8181",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>Rimuovi</button>
              )}
              {(a.matricola==="20002"||a.matricola==="50270") && <span style={{fontSize:10,color:C.textDim,background:C.surface,padding:"2px 8px",borderRadius:4,border:`1px solid ${C.textDim}`}}>PROTETTO</span>}
            </div>
          ))}
        </div>

        {/* Aggiungi admin */}
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:20}}>
          <div style={{fontSize:11,color:C.textMid,fontWeight:700,letterSpacing:"0.07em",marginBottom:12}}>AGGIUNGI ADMIN</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <div><label style={{fontSize:10,color:C.textDim,display:"block",marginBottom:3}}>MATRICOLA</label><input value={f.matricola} onChange={e=>setF(p=>({...p,matricola:e.target.value}))} placeholder="es. 48901" style={{...inp,width:"100%",boxSizing:"border-box"}} /></div>
            <div><label style={{fontSize:10,color:C.textDim,display:"block",marginBottom:3}}>PIN (4 cifre)</label><input type="password" value={f.pin} onChange={e=>setF(p=>({...p,pin:e.target.value}))} placeholder="••••" style={{...inp,width:"100%",boxSizing:"border-box"}} /></div>
          </div>
          <div style={{marginBottom:10}}><label style={{fontSize:10,color:C.textDim,display:"block",marginBottom:3}}>NOME COMPLETO</label><input value={f.nome} onChange={e=>setF(p=>({...p,nome:e.target.value}))} placeholder="Nome Cognome" style={{...inp,width:"100%",boxSizing:"border-box"}} /></div>
          <div style={{marginBottom:12}}><label style={{fontSize:10,color:C.textDim,display:"block",marginBottom:3}}>RUOLO</label><input value={f.ruolo} onChange={e=>setF(p=>({...p,ruolo:e.target.value}))} placeholder="es. Admin, Capo Deposito…" style={{...inp,width:"100%",boxSizing:"border-box"}} /></div>
          {err && <div style={{color:"#fc8181",fontSize:12,marginBottom:10}}>⚠ {err}</div>}
          <button onClick={add} style={{width:"100%",padding:"10px 0",borderRadius:9,cursor:"pointer",background:C.accent,border:"none",color:"#fff",fontSize:13,fontWeight:800}}>+ Aggiungi Admin</button>
        </div>
      </div>
    </div>
  );
}

// ── LOGIN SCREEN ──────────────────────────────────────────────────
function LoginScreen({ admins, allUsers, onLogin }) {
  const [mat,setMat] = useState("");
  const [pin,setPin] = useState("");
  const [err,setErr] = useState("");
  const [mode,setMode] = useState("admin"); // "admin" | "viewer"

  const doLogin = () => {
    if (mode==="admin") {
      const a = admins.find(x=>x.matricola===mat.trim()&&x.pin===pin.trim());
      if (!a) return setErr("Matricola o PIN errati");
      onLogin({...a,isAdmin:true});
    } else {
      if (!mat.trim()) return setErr("Inserisci la tua matricola");
      onLogin({matricola:mat.trim(),nome:`Matricola ${mat.trim()}`,isAdmin:false});
    }
  };

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');`}</style>
      <div style={{width:"100%",maxWidth:420}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:72,height:72,background:C.accent,borderRadius:20,fontSize:36,marginBottom:16,boxShadow:`0 8px 32px ${C.accentGlow}`}}>🚌</div>
          <h1 style={{margin:"0 0 4px",fontSize:28,fontWeight:800,color:C.text,letterSpacing:"-0.03em"}}>ANM <span style={{color:C.accent}}>Linee</span>Vivo</h1>
          <p style={{margin:0,fontSize:13,color:C.textDim}}>Percorsi in video · Deposito Cavalleggeri d'Aosta</p>
        </div>

        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:28,boxShadow:"0 24px 80px rgba(0,0,0,.5)"}}>
          {/* Mode toggle */}
          <div style={{display:"flex",background:C.surface,borderRadius:10,padding:4,marginBottom:22}}>
            {[["admin","🔐 Admin"],["viewer","👁 Visualizzatore"]].map(([k,l])=>(
              <button key={k} onClick={()=>{setMode(k);setErr("");}} style={{
                flex:1,padding:"8px 0",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:700,border:"none",
                background:mode===k?C.accent:"transparent",color:mode===k?"#fff":C.textMid,transition:"all .15s",
              }}>{l}</button>
            ))}
          </div>

          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,color:C.textMid,display:"block",marginBottom:5,fontWeight:700,letterSpacing:"0.07em"}}>MATRICOLA</label>
            <input value={mat} onChange={e=>setMat(e.target.value)} placeholder="es. 50270"
              style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,color:C.text,padding:"11px 14px",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"'DM Mono',monospace"}} />
          </div>

          {mode==="admin" && (
            <div style={{marginBottom:16}}>
              <label style={{fontSize:11,color:C.textMid,display:"block",marginBottom:5,fontWeight:700,letterSpacing:"0.07em"}}>PIN</label>
              <input type="password" value={pin} onChange={e=>setPin(e.target.value)} placeholder="••••"
                onKeyDown={e=>e.key==="Enter"&&doLogin()}
                style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,color:C.text,padding:"11px 14px",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"'DM Mono',monospace"}} />
            </div>
          )}

          {err && <div style={{background:C.dangerDim,border:`1px solid rgba(229,62,62,.3)`,borderRadius:8,padding:"8px 12px",color:"#fc8181",fontSize:13,marginBottom:14}}>⚠ {err}</div>}

          <button onClick={doLogin} style={{width:"100%",padding:"13px 0",borderRadius:10,cursor:"pointer",background:C.accent,border:"none",color:"#fff",fontSize:15,fontWeight:800,boxShadow:`0 6px 20px ${C.accentGlow}`}}>
            Accedi →
          </button>

          {mode==="viewer" && (
            <p style={{margin:"12px 0 0",fontSize:11,color:C.textDim,textAlign:"center"}}>
              I visualizzatori possono solo guardare i video. Per caricare serve accesso Admin.
            </p>
          )}
        </div>

        {/* Credits */}
        <div style={{textAlign:"center",marginTop:24,fontSize:11,color:C.textDim,lineHeight:1.8}}>
          <div>Ideato da <span style={{color:C.textMid}}>Guido Tartaglia</span> (mat. 20002)</div>
          <div>Sviluppato da <span style={{color:C.textMid}}>Ciro Esposito</span> (mat. 50270)</div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  APP PRINCIPALE
// ═══════════════════════════════════════════════════════════════════
function App() {
  const [user,setUser]     = useState(null);
  const [videos,setVideos] = useState(MOCK);
  const [admins,setAdmins] = useState(SEED_ADMINS);
  const [filterLinea,setFL]= useState("TUTTE");
  const [filterTipo,setFT] = useState("tutti");
  const [search,setSearch] = useState("");
  const [selVideo,setSel]  = useState(null);
  const [showAdd,setAdd]   = useState(false);
  const [showGuide,setGuide]= useState(false);
  const [showAdmin,setAdminP]= useState(false);
  const [fbLoaded,setFbL]  = useState(false);
  const [theme,setTheme]   = useState("dark");
  const [newDeviation,setNewDev] = useState(null);
  const [lastCheck,setLastCheck] = useState(Date.now());
  const [filterData,setFD] = useState("tutti");
  C = THEMES[theme];

  // Carica da Firebase al login
  useEffect(()=>{
    if (!user || fbLoaded) return;
    (async()=>{
      const data = await fbGet("/videos");
      if (data) {
        const arr = Object.entries(data).map(([id,v])=>({id,...v}));
        arr.sort((a,b)=>b.ts-a.ts);
        setVideos(arr);
      }
      const adm = await fbGet("/admins");
      if (adm) setAdmins(Object.values(adm));
      setFbL(true);
    })();
  },[user]);

  // Auto-refresh ogni 30 secondi — controlla nuove deviazioni
  useEffect(()=>{
    if (!user) return;
    const interval = setInterval(async () => {
      const data = await fbGet("/videos");
      if (data) {
        const arr = Object.entries(data).map(([id,v])=>({id,...v}));
        arr.sort((a,b)=>b.ts-a.ts);
        // Controlla se ci sono deviazioni più nuove dell'ultimo check
        const nuove = arr.filter(v=>v.tipo==="deviazione" && v.ts > lastCheck);
        if (nuove.length > 0) {
          setNewDev(nuove[0]);
        }
        setVideos(arr);
        setLastCheck(Date.now());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user, lastCheck]);

  // Seed admins su Firebase se vuoti
  useEffect(()=>{
    if (!fbLoaded) return;
    (async()=>{
      const adm = await fbGet("/admins");
      if (!adm) {
        for (const a of SEED_ADMINS) {
          await fbPost("/admins", a);
        }
      }
    })();
  },[fbLoaded]);

  const linee = ["TUTTE",...Array.from(new Set(videos.map(v=>v.linea))).sort()];
  const filtered = videos.filter(v=>{
    if (filterLinea!=="TUTTE"&&v.linea!==filterLinea) return false;
    if (filterTipo==="deviazione"&&v.tipo!=="deviazione") return false;
    if (filterTipo==="normale"&&v.tipo!=="normale") return false;
    if (search&&!`${v.titolo} ${v.linea} ${v.descrizione}`.toLowerCase().includes(search.toLowerCase())) return false;
    const now = Date.now();
    if (filterData==="oggi"&&now-v.ts>86400000) return false;
    if (filterData==="settimana"&&now-v.ts>604800000) return false;
    if (filterData==="mese"&&now-v.ts>2592000000) return false;
    return true;
  });

  const devCount = videos.filter(v=>v.tipo==="deviazione").length;

  const handleAdd = async rec => {
    const res = await fbPost("/videos", rec);
    const newV = res?.name ? {...rec,id:res.name} : {...rec,id:Date.now().toString()};
    setVideos(p=>[newV,...p]);
    if (rec.tipo === "deviazione") {
      await sendDeviationNotif(rec.titolo, rec.linea);
    }
    setAdd(false);
  };

  const handleDelete = async v => {
    if (!window.confirm(`Eliminare "${v.titolo}"?`)) return;
    await fbDel(`/videos/${v.id}`);
    setVideos(p=>p.filter(x=>x.id!==v.id));
  };

  const handleAddAdmin = async a => {
    await fbPost("/admins", a);
    setAdmins(p=>[...p,a]);
  };

  const handleRemoveAdmin = async mat => {
    const adm = await fbGet("/admins");
    if (adm) {
      const entry = Object.entries(adm).find(([,v])=>v.matricola===mat);
      if (entry) await fbDel(`/admins/${entry[0]}`);
    }
    setAdmins(p=>p.filter(a=>a.matricola!==mat));
  };

  if (!user) return <LoginScreen admins={admins} onLogin={setUser} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:${C.bg};color:${C.text};font-family:'Plus Jakarta Sans',sans-serif;transition:background .3s,color .3s}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(229,62,62,0.4)}50%{box-shadow:0 0 0 8px rgba(229,62,62,0)}}
        .card-animate{animation:fadeIn .3s ease both}
      `}</style>

      <div style={{minHeight:"100vh",background:C.bg,color:C.text,transition:"background .3s,color .3s"}}>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <header style={{background:C.surface,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:100,transition:"background .3s"}}>
          <div style={{maxWidth:1140,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:62}}>
            {/* Brand */}
            <div style={{display:"flex",alignItems:"center",gap:11}}>
              <div style={{background:C.accent,borderRadius:10,width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🚌</div>
              <div>
                <div style={{fontWeight:800,fontSize:16,letterSpacing:"-0.02em"}}>ANM <span style={{color:C.accent}}>Linee</span>Vivo</div>
                <div style={{fontSize:10,color:C.textDim}}>Cavalleggeri d'Aosta</div>
              </div>
            </div>
            {/* Right actions */}
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {devCount>0&&<div style={{background:C.dangerDim,border:`1px solid rgba(229,62,62,.3)`,borderRadius:20,padding:"3px 11px",fontSize:11,color:"#fc8181",fontWeight:700}}>⚠ {devCount} deviaziо{devCount===1?"ne":"ni"}</div>}
              <button onClick={()=>setGuide(true)} style={{background:C.surface,border:`1px solid ${C.border}`,color:C.textMid,padding:"6px 13px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600}}>📖 Guida</button>
              <button onClick={()=>setTheme(t=>t==="dark"?"light":"dark")} style={{background:C.surface,border:`1px solid ${C.border}`,color:C.textMid,padding:"6px 13px",borderRadius:8,cursor:"pointer",fontSize:16}} title="Cambia tema">{theme==="dark"?"☀️":"🌙"}</button>
              {user.isAdmin&&<button onClick={()=>setAdminP(true)} style={{background:C.surface,border:`1px solid ${C.border}`,color:C.textMid,padding:"6px 13px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600}}>⚙️ Admin</button>}
              {user.isAdmin&&<button onClick={()=>setAdd(true)} style={{background:C.accent,border:"none",color:"#fff",padding:"7px 15px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:800,boxShadow:`0 4px 14px ${C.accentGlow}`}}>+ Video</button>}
              <button onClick={()=>setUser(null)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.textDim,padding:"6px 10px",borderRadius:8,cursor:"pointer",fontSize:11}}>⎋</button>
            </div>
          </div>
        </header>

        <main style={{maxWidth:1140,margin:"0 auto",padding:"24px 20px"}}>

          {/* ── BANNER NUOVA DEVIAZIONE ────────────────────────── */}
          {newDeviation && (
            <div style={{
              background:"rgba(229,62,62,0.12)",
              border:"2px solid #e53e3e",
              borderRadius:12,
              padding:"14px 20px",
              marginBottom:20,
              display:"flex",
              alignItems:"center",
              justifyContent:"space-between",
              animation:"pulse 1.5s ease-in-out infinite",
            }}>
              <div>
                <div style={{fontWeight:800,fontSize:15,color:"#fc8181"}}>
                  🚨 NUOVA DEVIAZIONE — Linea {newDeviation.linea}
                </div>
                <div style={{fontSize:13,color:"#feb2b2",marginTop:3}}>
                  {newDeviation.titolo}
                </div>
              </div>
              <button onClick={()=>{setSel(newDeviation);setNewDev(null);}} style={{
                background:"#e53e3e",border:"none",color:"#fff",
                padding:"8px 16px",borderRadius:8,cursor:"pointer",
                fontSize:12,fontWeight:700,whiteSpace:"nowrap",marginLeft:12,
              }}>Vedi subito →</button>
            </div>
          )}

          {/* ── STATS ──────────────────────────────────────────── */}
          <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
            {[
              {label:"Video",val:videos.length,icon:"🎬"},
              {label:"Linee",val:new Set(videos.map(v=>v.linea)).size,icon:"🗺️"},
              {label:"Deviazioni",val:devCount,icon:"⚠️",alert:devCount>0},
              {label:"Utente",val:user.nome.split(" ")[0],icon:"👤"},
            ].map(s=>(
              <div key={s.label} style={{flex:"1 1 130px",background:s.alert?C.dangerDim:C.card,border:`1px solid ${s.alert?"rgba(229,62,62,.3)":C.border}`,borderRadius:10,padding:"11px 16px"}}>
                <div style={{fontSize:10,color:s.alert?"#fc8181":C.textMid,marginBottom:3,fontWeight:700}}>{s.icon} {s.label.toUpperCase()}</div>
                <div style={{fontSize:20,fontWeight:800,color:s.alert?"#fc8181":C.text,fontFamily:"'DM Mono',monospace"}}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* ── SEARCH ─────────────────────────────────────────── */}
          <input placeholder="🔍  Cerca linea, titolo, parola chiave…" value={search} onChange={e=>setSearch(e.target.value)}
            style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:10,color:C.text,padding:"11px 16px",fontSize:13,outline:"none",marginBottom:16,fontFamily:"inherit"}} />

          {/* ── FILTERS ────────────────────────────────────────── */}
          <div style={{display:"flex",gap:20,marginBottom:22,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {linee.map(l=>(
                <button key={l} onClick={()=>setFL(l)} style={{
                  padding:"5px 13px",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:700,
                  background:filterLinea===l?C.accent:C.card,
                  border:`1px solid ${filterLinea===l?C.accent:C.border}`,
                  color:filterLinea===l?"#fff":C.textMid,transition:"all .15s",
                }}>{l==="TUTTE"?"Tutte":`Linea ${l}`}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:6}}>
              {[["tutti","Tutti"],["normale","✓ Normali"],["deviazione","⚠ Deviazioni"]].map(([k,l])=>(
                <button key={k} onClick={()=>setFT(k)} style={{
                  padding:"5px 13px",borderRadius:20,cursor:"pointer",fontSize:11,fontWeight:700,
                  background:filterTipo===k?C.borderHi:"transparent",
                  border:`1px solid ${filterTipo===k?C.borderHi:C.border}`,
                  color:filterTipo===k?C.text:C.textDim,transition:"all .15s",
                }}>{l}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:6}}>
              {[["tutti","📅 Tutti"],["oggi","Oggi"],["settimana","7 giorni"],["mese","30 giorni"]].map(([k,l])=>(
                <button key={k} onClick={()=>setFD(k)} style={{
                  padding:"5px 13px",borderRadius:20,cursor:"pointer",fontSize:11,fontWeight:700,
                  background:filterData===k?C.accent:"transparent",
                  border:`1px solid ${filterData===k?C.accent:C.border}`,
                  color:filterData===k?"#fff":C.textDim,transition:"all .15s",
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* ── GRID ───────────────────────────────────────────── */}
          {filtered.length===0
            ? <div style={{textAlign:"center",padding:"80px 0",color:C.textDim}}>
                <div style={{fontSize:44,marginBottom:10}}>🔍</div>
                <div>Nessun video per questa selezione</div>
              </div>
            : <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(285px,1fr))",gap:16}}>
                {filtered.map((v,i)=>(
                  <div key={v.id} className="card-animate" style={{animationDelay:`${i*40}ms`}}>
                    <VideoCard v={v} onClick={setSel} onDelete={handleDelete} isAdmin={user.isAdmin} />
                  </div>
                ))}
              </div>
          }

          {/* ── FOOTER ─────────────────────────────────────────── */}
          <div style={{marginTop:48,paddingTop:18,borderTop:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,fontSize:11,color:C.textDim}}>
            <span>ANM LineeVivo · Deposito Cavalleggeri d'Aosta · uso interno riservato</span>
            <span>💡 Ideato da <span style={{color:C.textMid}}>Guido Tartaglia</span> (mat. 20002) · Sviluppato da <span style={{color:C.textMid}}>Ciro Esposito</span> (mat. 50270)</span>
          </div>
        </main>
      </div>

      {selVideo  && <VideoModal v={selVideo} onClose={()=>setSel(null)} />}
      {showAdd   && <AddModal user={user} onClose={()=>setAdd(false)} onAdd={handleAdd} />}
      {showGuide && <GuideModal onClose={()=>setGuide(false)} />}
      {showAdmin && <AdminPanel onClose={()=>setAdminP(false)} admins={admins} onAddAdmin={handleAddAdmin} onRemoveAdmin={handleRemoveAdmin} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
