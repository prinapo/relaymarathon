---
title: Build Android
description: Guida completa per build Android APK/AAB di MM26
tags: [android, build, apk, aab, capacitor, google-play]
---

# Build Android

## Prerequisiti

| Requisito | Note |
|-----------|------|
| Node.js 18+ | - |
| Android Studio | 2022.x+ |
| JDK 17 | Richiesto da AGP 8.x |
| Android SDK | API 33+ consigliato |
| `google-services.json` | Deve essere in `src-capacitor/android/app/` |

---

## Configurazione Iniziale

### 1. google-services.json

Scaricare da Firebase Console e posizionare in:

```
src-capacitor/android/app/google-services.json
```

### 2. Variabili Ambiente

```bash
# Windows (PowerShell)
$env:ANDROID_HOME = "C:\Users\$USER\AppData\Local\Android\Sdk"

# Verifica
echo $env:ANDROID_HOME
```

### 3. Sync Capacitor

```bash
cd src-capacitor
npx cap sync
```

---

## Build Debug

### Quick Build

```bash
npm run dev:android
```

Questo comando:
1. Compila la UI web
2. Sincronizza con Android
3. Builda APK
4. Installa sul device collegato

### Build Manuale

```bash
quasar build -m capacitor -T android -debug
```

Output: `dist/capacitor/android/apk/debug/app-debug.apk`

### Installazione Manuale

```bash
# Lista device collegati
adb devices

# Installa APK
adb install dist\capacitor\android\apk\debug\app-debug.apk
adb install -r dist\capacitor\android\apk\debug\app-debug.apk  # reinstall
```

---

## Build Release

### Prerequisiti Keystore

Il keystore per la release deve essere configurato in:

```
src-capacitor/android/keystore.properties
```

Contenuto:
```properties
storeFile=../../mm26-upload.keystore
storePassword=your_password
keyAlias=upload
keyPassword=your_password
```

### Build Release APK

```bash
quasar build -m capacitor -T android
```

Output: `dist/capacitor/android/apk/release/app-release.apk`

### Build AAB (per Google Play)

```bash
cd src-capacitor\android
.\gradlew.bat bundleRelease
```

Output: `src-capacitor/android/app/build/outputs/bundle/release/app-release.aab`

---

## Release Guidata

### Script Automatizzato

```bash
npm run release:android
```

Lo script:
1. Legge versione corrente da `package.json`
2. Chiede tipo release: `minor`, `major`, `patch`
3. Aggiorna `version` in `quasar.config.js`
4. Incrementa `versionCode`
5. Aggiorna `versionName` in `build.gradle`
6. Sincronizza version in `package.json`
7. Esegue build Android
8. Esegue `bundleRelease`
9. Mostra percorso AAB finale

### Regole Incremento Versione

| Tipo | Esempio | Nuova versione |
|------|---------|----------------|
| patch | 1.4.0 → 1.4.1 | Bug fix |
| minor | 1.4.0 → 1.5.0 | Nuova funzionalità |
| major | 1.4.0 → 2.0.0 | Breaking change |

---

## Firma APK

### Debug

La build debug è firmata automaticamente con la keystore di debug.

### Release

La build release usa il keystore configurato in `keystore.properties`.

---

## Google Play Store

### Upload AAB

1. Accedere a [Google Play Console](https://play.google.com/console)
2. Selezionare app
3. Release → Production → Upload
4. Caricare `app-release.aab`

### Checklist Pubblicazione

- [ ] Scheda Store completa
- [ ] Screenshot e graphic assets
- [ ] Data safety dichiarazione
- [ ] Content rating completato
- [ ] Release notes scritti
- [ ] AAB caricato e validato

---

## Troubleshooting

### Errore: SHA-1 non corrisponde

**Problema**: Login Google non funziona.

**Soluzione**: Verificare che la SHA-1 in Firebase Console corrisponda a quella usata dalla build.

### Errore: Package name mismatch

**Problema**: Il package in `google-services.json` non corrisponde a quello in `capacitor.config.json`.

**Soluzione**: Entrambi devono essere `com.prinapo.relaymarathon`.

### Errore: Keystore not found

**Problema**: Impossibile trovare il keystore per la release.

**Soluzione**: Verificare `keystore.properties` e percorso del file.

---

## Note

- Il package name è `com.prinapo.relaymarathon`
- L'APK debug è installabile direttamente senza Play Store
- L'AAB è richiesto per il Play Store (non APK)
- Il versionCode deve essere incrementato per ogni release

Vedi anche: [Quick Start](quick-start.md), [Build Commands](build-commands.md)