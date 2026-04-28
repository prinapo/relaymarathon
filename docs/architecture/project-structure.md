---
title: Struttura Progetto
description: Struttura completa delle cartelle e file del progetto MM26
tags: [project, structure, folders, files]
---

# Struttura Progetto

## Tree Completo

```
mm26/
├── .github/
│   └── copilot-instructions.md    # Istruzioni Copilot
├── src/
│   ├── boot/
│   │   ├── android-back-button.js # Gestione back button Android
│   │   ├── app-version.js         # Versione app
│   │   ├── firebase.js            # Inizializzazione Firebase
│   │   └── status-bar.js          # Status bar mobile
│   ├── composables/
│   │   ├── defaultTranslations.js # Traduzioni default
│   │   ├── useAuth.js             # Autenticazione
│   │   ├── useFirestore.js        # Firestore CRUD
│   │   ├── useI18n.js             # Internazionalizzazione
│   │   ├── useTeamContext.js      # Context team
│   │   └── useTimeCalculator.js   # Calcolo tempi
│   ├── layouts/
│   │   ├── AuthLayout.vue         # Layout autenticazione
│   │   └── MainLayout.vue         # Layout principale
│   ├── pages/
│   │   ├── AdminPage.vue          # Pannello admin
│   │   ├── AdminRequestPage.vue   # Richieste admin
│   │   ├── AppointmentsPage.vue   # Appuntamenti
│   │   ├── ErrorNotFound.vue      # 404
│   │   ├── FaqPage.vue            # FAQ
│   │   ├── HelpPage.vue           # Help
│   │   ├── IndexPage.vue          # Home + tempi
│   │   ├── LoginPage.vue          # Login
│   │   ├── PercorsoPage.vue       # Percorso gara
│   │   ├── SplashPage.vue         # Splash screen
│   │   └── TeamPage.vue           # Gestione team
│   ├── router/
│   │   └── index.js               # Configurazione route
│   ├── assets/                    # Static assets
│   ├── App.vue                    # Root component
│   └── firebase.js                # Config Firebase
├── src-capacitor/
│   ├── android/                   # Progetto Android nativo
│   ├── ios/                       # Progetto iOS nativo
│   ├── capacitor.config.json      # Config Capacitor
│   └── package.json               # Dipendenze Android
├── src-pwa/                       # Configurazione PWA
├── scripts/
│   ├── deploy-web.ps1             # Deploy FTP web
│   └── release-android.ps1        # Release Android guidata
├── public/                        # File pubblici
├── docs/                          # Documentazione
├── firestore.rules                # Firestore security rules
├── quasar.config.js               # Config Quasar
├── package.json                   # Dipendenze Node
├── version.js                     # Gestione versione
├── firebase-setup.md              # Setup Firebase
├── CUSTOM_CLAIMS_SETUP.md         # Setup custom claims
└── DOCUMENTAZIONE.md              # Documentazione legacy
```

## Descrizione Cartelle Chiave

### `src/`
Codice sorgente principale dell'applicazione Vue/Quasar.

### `src/boot/`
File di inizializzazione eseguiti all'avvio dell'app:
- `firebase.js` - Inizializza Firebase SDK
- `app-version.js` - Espone versione app
- `android-back-button.js` - Gestisce tasto back su Android
- `status-bar.js` - Configura status bar mobile

### `src/composables/` (o `src/composables/`)
Hook Vue 3 per logica riutilizzabile. Vedi [Composable useFirestore.js](#).

### `src/pages/`
Componenti Vue per le route dell'applicazione.

### `src-capacitor/`
Progetti nativi generati da Capacitor:
- `android/` - Progetto Android (Gradle)
- `ios/` - Progetto iOS (Xcode)

### `scripts/`
Script PowerShell per automazione:
- `deploy-web.ps1` - Build + upload FTP
- `release-android.ps1` - Release Android guidata

## File di Configurazione

| File | Descrizione |
|------|-------------|
| `quasar.config.js` | Configurazione Quasar (version, boot files, capacitor, PWA) |
| `package.json` | Dipendenze Node, script npm, version |
| `firestore.rules` | Security rules Firestore |
| `version.js` | Script per gestione versione (get, set, release) |
| `.env` | Variabili ambiente (NON tracciato da git) |

Vedi anche: [Overview](overview.md), [Data Model](data-model.md)