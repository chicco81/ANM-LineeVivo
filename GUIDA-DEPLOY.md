# ANM LineeVivo – Guida Deploy Completa
## Ideato da: Guido Tartaglia (mat. 20002) | Sviluppato da: Ciro (mat. 50270)

---

## ✅ CHECKLIST PRE-DEPLOY

- [ ] Account GitHub attivo (chicco81)
- [ ] Account Firebase attivo
- [ ] Account YouTube (nuovo) creato
- [ ] File pronti: ANMLineeVivo.jsx, manifest.json, sw.js

---

## PASSO 1 — CREA IL PROGETTO FIREBASE

1. Vai su https://console.firebase.google.com
2. Clicca **"Aggiungi progetto"** → Nome: `anm-lineevivo` → Continua
3. Disabilita Google Analytics (non serve) → Crea progetto
4. Nel menu sinistra → **Realtime Database** → Crea database
5. Scegli server **Europa (europe-west1)** → Avvia in **modalità test** (per ora)
6. Copia l'URL del database: `https://anm-lineevivo-default-rtdb.europe-west1.firebasedatabase.app`

### Regole database (copia e incolla):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
> ⚠️ Queste regole vanno bene in fase di test. Più avanti le restringiamo.

---

## PASSO 2 — CONFIGURA IL FIREBASE NELL'APP

Apri `ANMLineeVivo.jsx` e alla riga 22 sostituisci:
```javascript
const FB_URL = "https://TUO-PROGETTO-default-rtdb.firebaseio.com";
```
con il tuo URL copiato al passo 1, es:
```javascript
const FB_URL = "https://anm-lineevivo-default-rtdb.europe-west1.firebasedatabase.app";
```

---

## PASSO 3 — CREA IL REPO GITHUB

1. Vai su https://github.com/chicco81
2. **New repository** → Nome: `ANM-LineeVivo`
3. Pubblico → NON inizializzare con README → Crea
4. Nel repo, crea questa struttura di file:

```
ANM-LineeVivo/
├── index.html          ← file principale (vedi sotto)
├── manifest.json       ← file fornito
├── sw.js               ← file fornito
└── icons/
    ├── icon-192.png    ← icona bus 192×192
    └── icon-512.png    ← icona bus 512×512
```

### Contenuto index.html (copia questo):
```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ANM LineeVivo</title>
  <meta name="theme-color" content="#f4821f" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="LineeVivo" />
  <link rel="manifest" href="manifest.json" />
  <link rel="apple-touch-icon" href="icons/icon-192.png" />
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module" src="app.jsx"></script>
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
          .then(r => console.log('SW registrato:', r.scope))
          .catch(e => console.warn('SW errore:', e));
      });
    }
  </script>
</body>
</html>
```

> Salva il contenuto di ANMLineeVivo.jsx come `app.jsx` nel repo.

---

## PASSO 4 — ATTIVA GITHUB PAGES

1. Nel repo GitHub → **Settings** → **Pages**
2. Source → **Deploy from a branch**
3. Branch: **main** → Folder: **/ (root)** → Salva
4. Aspetta 2-3 minuti → L'app sarà live su:
   `https://chicco81.github.io/ANM-LineeVivo/`

---

## PASSO 5 — CREA ACCOUNT YOUTUBE

1. Vai su https://youtube.com → Accedi con Gmail (o crea account Google dedicato)
2. Crea un **canale YouTube**: nome suggerito → `ANM Linee Napoli` (privato)
3. Vai su **YouTube Studio** → Impostazioni → Canale → Privacy
4. Imposta tutto come privato per default

### Come caricare un video di percorso:
1. YouTube Studio → Crea → Carica video
2. Trascina il file video
3. Titolo: `ANM C1 – Garibaldi → Capodimonte` 
4. **Visibilità: "Non in elenco"** ← OBBLIGATORIO
5. Pubblica → Copia il link dalla barra URL
6. Incolla nell'app → Pubblica

---

## PASSO 6 — ICONE PWA

Hai bisogno di icone per l'installazione. Opzioni:
- **Gratis e veloce**: https://www.pwabuilder.com/imageGenerator
  - Carica un'immagine di un autobus (o il logo ANM)
  - Genera tutti i formati necessari automaticamente
  - Scarica e metti nella cartella `icons/`

---

## PASSO 7 — TEST INSTALLAZIONE PWA

### Android (Chrome):
1. Apri `https://chicco81.github.io/ANM-LineeVivo/` su Chrome
2. Aspetta 30 secondi → apparirà banner "Installa app"
3. Oppure: menu ⋮ → "Aggiungi alla schermata Home"

### iPhone (Safari — OBBLIGATORIO usare Safari):
1. Apri Safari → vai all'URL
2. Tocca il pulsante **Condividi** □↑ (barra in basso)
3. Scorri → "Aggiungi alla schermata Home"
4. Conferma → L'icona appare come un'app vera!

---

## 🔐 CREDENZIALI DEFAULT

| Matricola | PIN  | Nome             | Ruolo              |
|-----------|------|------------------|--------------------|
| 20002     | 2002 | Guido Tartaglia  | Ideatore & Admin   |
| 50270     | 5027 | Ciro             | Sviluppatore & Admin |

> ⚠️ Cambia i PIN dopo il primo accesso! Dal pannello ⚙️ Admin.

---

## 🚨 ERRORI COMUNI

| Problema | Soluzione |
|----------|-----------|
| App bianca/vuota | Controlla la Console (F12) – probabilmente URL Firebase sbagliato |
| Video non si vede | Controlla che il video YouTube sia "Non in elenco" e NON privato |
| Mappa non carica | Connessione internet necessaria (Leaflet carica da CDN) |
| PWA non si installa su iPhone | Devi usare Safari, non Chrome |
| Firebase errore 401 | Le regole del DB non sono in modalità test – riaprile |
| Dati non si salvano | URL Firebase mancante del `.json` – questo lo gestisce l'app automaticamente |

---

## 📱 STRUTTURA FIREBASE

Il database si crea automaticamente con questa struttura:
```
root/
├── videos/
│   ├── -ABC123/
│   │   ├── linea: "C1"
│   │   ├── titolo: "C1 – Percorso completo"
│   │   ├── tipo: "normale"
│   │   ├── descrizione: "..."
│   │   ├── youtubeId: "dQw4w9W..."
│   │   ├── routeKey: "C1"
│   │   ├── routeCoords: []
│   │   ├── autore: "Ciro"
│   │   ├── matricola: "50270"
│   │   └── ts: 1706000000000
└── admins/
    ├── -XYZ456/
    │   ├── matricola: "20002"
    │   ├── pin: "2002"
    │   ├── nome: "Guido Tartaglia"
    │   └── ruolo: "Ideatore & Admin"
```

---

*ANM LineeVivo – uso interno riservato Deposito Cavalleggeri d'Aosta*
