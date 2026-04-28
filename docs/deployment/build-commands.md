---
title: Build Commands
description: Comandi di build completi per MM26 - web, mobile, release
tags: [build, npm, commands, build-commands, script]
---

# Build Commands

## Comandi npm

### Sviluppo

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Avvio web dev server su porta 9000 |
| `npm run dev:android` | Build + install + avvio APK su device |

### Build

| Comando | Output | Descrizione |
|---------|--------|-------------|
| `npm run build` | `dist/spa/` | Build SPA (Single Page App) |
| `npm run build:pwa` | `dist/pwa/` | Build PWA (Progressive Web App) |

### Deploy

| Comando | Descrizione |
|---------|-------------|
| `npm run deploy:web` | Build + upload FTP |
| `npm run release:android` | Release Android guidata |

---

## Quasar Commands

### Build Manuale

```bash
# SPA
quasar build

# PWA
quasar build -m pwa

# Capacitor Android
quasar build -m capacitor -T android
quasar build -m capacitor -T android -debug

# Capacitor iOS
quasar build -m capacitor -T ios
```

### Parametri

| Parametro | Valori | Descrizione |
|-----------|--------|-------------|
| `-m` | `spa`, `pwa`, `capacitor` | Modalità build |
| `-T` | `android`, `ios` | Target mobile |
| `-debug` | - | Build debug (non firmato) |

---

## Script version.js

Gestione versione dell'app.

### Comandi

```bash
# Leggi versione attuale
node version.js get

# Imposta versione specifica
node version.js set 1.4.0
node version.js set 1.4.0 10

# Incrementa versione
node version.js release minor   # 1.4.0 → 1.5.0
node version.js release major   # 1.4.0 → 2.0.0
node version.js release patch   # 1.4.0 → 1.4.1

# Build + install rapido
node version.js dev debug
node version.js dev debug --install
node version.js dev release
```

### Versione Corrente

```
version: 1.4.3
versionCode: 8
```

---

## Output Build

### Web

| Tipo | Directory | Note |
|------|-----------|------|
| SPA | `dist/spa/` | Default |
| PWA | `dist/pwa/` | Con service worker |

### Android

| Tipo | File | Note |
|------|------|------|
| Debug APK | `dist/capacitor/android/apk/debug/app-debug.apk` | Non firmato |
| Release APK | `dist/capacitor/android/apk/release/app-release.apk` | Firmato |
| AAB | `src-capacitor/android/app/build/outputs/bundle/release/app-release.aab` | Per Google Play |

### iOS

| Tipo | Note |
|------|------|
| Xcode Project | `src-capacitor/ios/` |

---

## Build Flags Comuni

### Debug

```bash
# Android debug
quasar build -m capacitor -T android -debug
```

### Release

```bash
# Android release (richiede keystore)
quasar build -m capacitor -T android
```

### Without Cache

```bash
# Build senza cache
quasar build --no-cache
```

---

## Troubleshooting Build

### Errore: Module not found

```bash
# Pulisci node_modules e reinstalla
rm -rf node_modules
npm install
```

### Errore: Android SDK not found

Verificare variabile `ANDROID_HOME`:

```bash
# Windows
echo %ANDROID_HOME%

# macOS/Linux
echo $ANDROID_HOME
```

### Errore: Keystore not found

Verificare `keystore.properties` in root progetto.

---

## Note

- I comandi Quasar usano Vite sotto il hood
- L'output di build è configurato in `quasar.config.js`
- I file generati sono in `dist/` (web) o `src-capacitor/` (mobile)

Vedi anche: [Quick Start](quick-start.md), [Android](android.md), [Web](web.md)