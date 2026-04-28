# MM26 Test Coverage Summary

## Overview

Questo documento riassume la copertura dei test E2E per tutti i tipi di utenza e funzionalità dell'app MM26.

## Test Files

| File | Descrizione | Utenti Testati |
|------|-------------|----------------|
| `global-admin.spec.js` | Test Global Admin | Global Admin |
| `race-admin.spec.js` | Test Race Admin | Race Admin |
| `captain.spec.js` | Test Team Captain | Captain |
| `runner.spec.js` | Test Team Member | Runner |
| `guest.spec.js` | Test Utente Ospite | Guest (non autenticato) |
| `login.spec.js` | Test Login/Auth | Tutti |
| `home.spec.js` | Test Home Page | Tutti |
| `team.spec.js` | Test Team Page | Captain, Runner |
| `race-filtering.spec.js` | Test Filtro Race | Tutti |
| `functional-tests.js` | Test Funzionali | Tutti |
| `admin.spec.js` | Test Admin Page | Admin |
| `timeline-icons.spec.js` | Debug Timeline | Development |

---

## Test per Tipo Utente

### 1. Global Admin

**Identificazione**: Custom claim `admin: true`

**Test Coverage** (`global-admin.spec.js`):

- [x] Accesso a `/admin`
- [x] Visualizzazione tabs admin (Gare, Admin Gara, Traduzioni)
- [x] Navigazione a Race Admins tab
- [x] Creazione nuova gara
- [x] Modifica dati gara
- [x] Aggiunta segmento a gara
- [x] Aggiunta admin a race (per email)
- [x] Rimozione admin da race
- [x] Accesso translations tab
- [x] Visualizzazione tabella traduzioni
- [x] Imposta race come default
- [x] Eliminazione race

**Credenziali**: 
- Email: `adminmm26@gmail.com`
- Password: `Adminmm26!!`

---

### 2. Race Admin

**Identificazione**: UID in `adminUids[]` in `races/{raceId}`

**Test Coverage** (`race-admin.spec.js`):

- [x] Accesso negato a `/admin`
- [x] Visualizzazione race selector in header
- [x] Visualizzazione dati race su home
- [x] Modifica configurazione race da home
- [x] Modifica nome segmento
- [x] Visualizzazione team nella propria race
- [x] Creazione team per la propria race
- [x] Accesso appointments page
- [x] Accesso FAQ page
- [x] Accesso help page
- [x] Switch tra race amministrate

**Credenziali**: 
- Email: `raceadmin@test.com`
- Password: `Raceadmin!!`

---

### 3. Team Captain

**Identificazione**: UID in `captainId` in `teams/{teamId}`

**Test Coverage** (`captain.spec.js`):

- [x] Accesso negato a `/admin`
- [x] Accesso home page
- [x] Visualizzazione pulsante crea team
- [x] Creazione nuovo team
- [x] Messaggio info ruolo captain
- [x] Visualizzazione propri team
- [x] Selezione team
- [x] Eliminazione proprio team
- [x] Visualizzazione tutti i segmenti
- [x] Modifica nome segmento
- [x] Auto-assegnazione a segmento
- [x] Generazione codice invito
- [x] Selezione race diversa
- [x] Visualizzazione timeline
- [x] Accesso appointments page
- [x] Accesso FAQ page
- [x] Accesso help page
- [x] Accesso route page
- [x] Accesso join team tab
- [x] Inserimento codice invito

**Credenziali**: 
- Email: `prova@gmail.com`
- Password: `prova_prova`

---

### 4. Team Member (Runner)

**Identificazione**: UID in `runners[]` in `teams/{teamId}`

**Test Coverage** (`runner.spec.js`):

- [x] Accesso negato a `/admin`
- [x] Accesso home page
- [x] Visualizzazione timeline gara
- [x] Selezione race
- [x] Visualizzazione propri segmenti assegnati
- [x] Click su segmento per dettagli
- [x] Modifica nome proprio segmento
- [x] Modifica propria pace
- [x] Visualizzazione page team
- [x] Visualizzazione stato vuoto (nessun team)
- [x] Join team con codice invito
- [x] NON vede pulsante modifica gara
- [x] NON vede tab admin nel drawer
- [x] NON può creare team
- [x] Accesso appointments page
- [x] Accesso FAQ page
- [x] Accesso help page
- [x] Accesso route page

**Credenziali**: 
- Email: `riprova@gmail.com`
- Password: `riprova!!`

---

### 5. Guest (Non Autenticato)

**Identificazione**: Nessun utente loggato

**Test Coverage** (`guest.spec.js`):

- [x] Redirect a login per route protette
- [x] Accesso negato a `/admin`
- [x] Home page con race selector
- [x] Timeline per race default
- [x] Navigazione a selezione race
- [x] Switch race
- [x] Accesso page login
- [x] Opzione login Google
- [x] Opzione login email
- [x] Login con credenziali invalide
- [x] Accesso FAQ page
- [x] Accesso help page
- [x] Accesso route page
- [x] Accesso appointments page
- [x] Pulsante Accedi visible
- [x] Opzioni team non visibili nel drawer

---

## Funzionalità Testate

### Autenticazione
- Login con email/password
- Login con Google
- Logout
- Credenziali invalide
- Redirect automatico dopo login

### Navigazione
- Menu drawer
- Tabs principali
- Route protette
- Breadcrumb/redirect

### Home Page
- Race selector
- Timeline visualizzazione
- Click su segmento
- Pace picker dialog
- Selezione race

### Team Page
- Crea team
- I miei team
- Entra nel team
- Configurazione
- Codici invito

### Content Pages
- Appointments
- FAQ
- Help
- Route/Percorso

### Admin
- Race management
- Segment management
- Race admin management
- Translations
- Delete/Set default race

### Security
- Accesso negato a non-admin
- Route protette
- Redirect automatico

---

## Esecuzione Test

### Comandi

```bash
# Esegui tutti i test
npm test

# Esegui test specifico per ruolo
npx playwright test tests/e2e/global-admin.spec.js
npx playwright test tests/e2e/race-admin.spec.js
npx playwright test tests/e2e/captain.spec.js
npx playwright test tests/e2e/runner.spec.js
npx playwright test tests/e2e/guest.spec.js

# Esegui con UI
npx playwright test --ui

# Esegui con headed (visibile)
npx playwright test --headed
```

### Configurazione

I test usano Playwright con:
- Base URL: `http://localhost:9000`
- Browser: Chromium
- Timeout: 30s per azione, 10s per expect
- Web server: `npm run dev` automatico

### Setup Prerequisiti

1. Installare dipendenze: `npm install`
2. Avviare dev server: `npm run dev`
3. Configurare credenziali test in `.env` (opzionale)

---

## Note

- Alcuni test sono condizionali (verificano se elementi sono presenti)
- I test verificano il comportamento, non i dati specifici
- Le credenziali di test devono esistere in Firebase
- La race "test" deve esistere per alcuni test