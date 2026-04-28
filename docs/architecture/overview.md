---
title: Stack Tecnologico
description: Panoramica completa dello stack tecnologico MM26 - Quasar, Firebase, Capacitor
tags: [stack, technology, architecture, quasar, firebase, capacitor]
---

# Architettura - Panoramica

## Stack Tecnologico

| Componente | Tecnologia | Versione |
|------------|------------|----------|
| Framework UI | Quasar | 2.x |
| Runtime JS | Vue | 3.x |
| Build Tool | Quasar App Vite | - |
| Backend | Firebase | - |
| Auth | Firebase Authentication | - |
| Database | Cloud Firestore | - |
| Mobile | Capacitor | 5.x |
| PWA | Quasar PWA | - |

## Architettura Applicazione

```
┌─────────────────────────────────────────────────────────────┐
│                        MM26 App                             │
├─────────────────────────────────────────────────────────────┤
│  Web (SPA/PWA)           │  Mobile (Capacitor)             │
│  ───────────────         │  ─────────────────              │
│  • Browser               │  • Android APK                  │
│  • PWA installable       │  • iOS (Xcode required)         │
└──────────────────────────┴──────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Firebase                                │
├─────────────────────────────────────────────────────────────┤
│  • Authentication (Google, Email/Password)                  │
│  • Firestore (Database)                                     │
│  • Custom Claims (Admin)                                    │
└─────────────────────────────────────────────────────────────┘
```

## Configurazione Corrente

### Quasar
- **Router mode**: `hash` (web hash history)
- **Colore primario**: `#173A79`
- **Colore secondario**: `#1F9343`
- **Porta dev server**: `9000`

### Capacitor
```json
{
  "appId": "com.prinapo.relaymarathon",
  "appName": "Milano Relay Marathon",
  "webDir": "dist/spa"
}
```

### Firebase Environment Variables

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_GOOGLE_WEB_CLIENT_ID=
VITE_GOOGLE_IOS_CLIENT_ID=
VITE_GOOGLE_IOS_SERVER_CLIENT_ID=
```

## Flusso Dati

```
User Action → Vue Component → Composable (useXxx) → Firebase SDK → Firestore
                    ↑                                              │
                    └──────────── UI Update ← onSnapshot ─────────┘
```

### Composables Principali

| Composable | Responsabilità |
|------------|----------------|
| `useAuth.js` | Autenticazione, login, logout, custom claims |
| `useFirestore.js` | CRUD per tutte le collezioni Firestore |
| `useTeamContext.js` | Context team selezionato |
| `useTimeCalculator.js` | Calcolo tempi gara |
| `useI18n.js` | Internazionalizzazione (IT/EN) |

## Routing

- **Modo**: `createWebHashHistory()`
- **Route protette**: `/admin`, `/team` (richiedono auth)
- **Route admin-only**: `/admin` (richiede `admin: true` claim)

Vedi anche: [Project Structure](project-structure.md), [Data Model](data-model.md)