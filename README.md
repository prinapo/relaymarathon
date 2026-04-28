# MM26

App Quasar + Firebase per la gestione della Milano Relay Marathon (web + mobile).

## Stack
- **Frontend**: Quasar 2 + Vue 3
- **Backend**: Firebase Auth + Firestore
- **Mobile**: Capacitor (Android/iOS)

## Quick Start

```bash
npm install
npm run dev
```

## Build

| Comando | Output |
|---------|--------|
| `npm run build` | `dist/spa/` (SPA) |
| `npm run build:pwa` | `dist/pwa/` (PWA) |
| `quasar build -m capacitor -T android -debug` | Debug APK |
| `npm run release:android` | Release AAB |

## Documentazione

Documentazione completa in [`docs/`](docs/index.md):

- [Architettura](docs/architecture/overview.md) - Stack, struttura, modello dati
- [Ruoli](docs/roles/overview.md) - Global Admin, Race Admin, Captain, Member
- [Sicurezza](docs/security/firestore-rules.md) - Auth, Firestore Rules
- [Deploy](docs/deployment/quick-start.md) - Setup, Android, Web

## Variabili Ambiente

Creare `.env` con:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_PROJECT_ID=
VITE_GOOGLE_WEB_CLIENT_ID=
```

## Note
- Package: `com.prinapo.relaymarathon`
- Router: hash mode (`#`)
- Versione: gestita tramite `node version.js`