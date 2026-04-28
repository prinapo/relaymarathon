---
title: Quick Start
description: Guida rapida per setup ambiente di sviluppo MM26
tags: [setup, development, quick-start, install, npm]
---

# Quick Start

## Prerequisiti

| Strumento | Versione minima |
|-----------|-----------------|
| Node.js | 18.x |
| npm | 9.x |
| Android Studio | 2022.x (per Android) |
| Xcode | 15.x (per iOS, solo macOS) |

---

## Installazione

### 1. Clona il progetto

```bash
git clone <repository-url>
cd mm26
```

### 2. Installa dipendenze

```bash
npm install
```

### 3. Configura variabili ambiente

Crea un file `.env` nella root del progetto:

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Sign-In
VITE_GOOGLE_WEB_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_GOOGLE_IOS_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_GOOGLE_IOS_SERVER_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## Sviluppo Web

### Avvio server di sviluppo

```bash
npm run dev
```

L'app sarà disponibile su: `http://localhost:9000`

### Build SPA

```bash
npm run build
```

Output in: `dist/spa/`

### Build PWA

```bash
npm run build:pwa
```

Output in: `dist/pwa/`

---

## Sviluppo Mobile

### Prerequisiti Android

1. Android Studio installato
2. JDK 17+ configurato
3. Variabile `ANDROID_HOME` impostata

### Sync Capacitor

```bash
cd src-capacitor
npx cap sync
```

### Avvio debug Android

```bash
npm run dev:android
```

Questo comando:
1. Compila la UI web
2. Sincronizza con il progetto Android
3. Builda e安装 l'APK sul dispositivo collegato

### Build manuale Android

```bash
# Debug APK
quasar build -m capacitor -T android -debug

# Release APK
quasar build -m capacitor -T android
```

---

## Versione App

### Leggi versione

```bash
node version.js get
```

### Imposta versione

```bash
node version.js set 1.4.0
node version.js set 1.4.0 10
```

### Release version

```bash
node version.js release minor  # 1.4.0 → 1.5.0
node version.js release major  # 1.4.0 → 2.0.0
node version.js release patch  # 1.4.0 → 1.4.1
```

---

## Comandi Utili

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvio web dev server |
| `npm run dev:android` | Avvio Android con HMR |
| `npm run build` | Build SPA |
| `npm run build:pwa` | Build PWA |
| `npm run deploy:web` | Build + deploy FTP |
| `npm run release:android` | Release Android guidata |

---

## Troubleshooting

### Errori Firebase

- Verificare che le variabili in `.env` siano corrette
- Verificare che il progetto Firebase sia configurato

### Errori Android Build

- Verificare `ANDROID_HOME` e JDK
- Eseguire `npx cap sync` dopo modifiche ai plugin

### Errori Google Login

- Verificare SHA-1 in Firebase Console
- Verificare `google-services.json` corretto

---

## Prossimi Passi

- [Build Commands](build-commands.md) - Dettaglio comandi
- [Android](android.md) - Build Android
- [Web](web.md) - Deploy web

Vedi anche: [Architecture Overview](../architecture/overview.md)