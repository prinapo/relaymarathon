# MM26

App Quasar + Firebase per la gestione della Milano Relay Marathon, con supporto web e mobile tramite Capacitor.

## Stack

- Quasar 2 + Vue 3
- Firebase Authentication + Firestore
- Capacitor (Android + iOS)

## Avvio rapido

Installazione dipendenze:

```bash
npm install
```

Avvio in sviluppo:

```bash
npm run dev
```

Build SPA:

```bash
npm run build
```

Build PWA:

```bash
npm run build:pwa
```

## Build e Deploy

### Web

Build:

```bash
npm run build
```

Deploy sul server:

```bash
npm run deploy:web
```

Lo script builda e carica via FTP su `relaymarathon.sostienilsostegno.com`.

### Mobile

Build Android debug:

```bash
quasar build -m capacitor -T android -debug
```

Build Android release:

```bash
quasar build -m capacitor -T android
```

Bundle Android release per Google Play:

```bash
cd src-capacitor\android
.\gradlew.bat bundleRelease
```

Script guidato per nuova release Android:

```bash
npm run release:android
```

Lo script:

- chiede se la release e' `minor`, `major` o `patch`
- aggiorna `version` in quasar.config.js
- incrementa `versionCode` in quasar.config.js
- esegue `quasar build -m capacitor -T android`
- esegue `bundleRelease`

Output atteso:

```
src-capacitor/android/app/build/outputs/bundle/release/app-release.aab
```

### Build + install rapido

```bash
npm run version dev debug --install
```

Questo comando builda l'APK, lo installa sul telefono collegato e avvia l'app.

## Versione

La versione è gestita dallo script `version.js` che legge da `package.json`.

Comandi:

```bash
node version.js get                    # Leggi versione + versionCode
node version.js set 1.4.0              # Imposta versione
node version.js set 1.4.0 10           # Imposta versione + versionCode
node version.js release minor          # Incrementa (minor|major|patch)
```

Build + install rapido:

```bash
node version.js dev debug --install
```

Questo comando builda l'APK, lo installa sul telefono collegato e avvia l'app.

## Configurazione

Il progetto usa variabili ambiente Firebase con prefisso `VITE_` in `.env`.

Per Google Sign-In sono previste anche queste variabili:

- `VITE_GOOGLE_WEB_CLIENT_ID`
- `VITE_GOOGLE_IOS_CLIENT_ID`
- `VITE_GOOGLE_IOS_SERVER_CLIENT_ID`

File e riferimenti utili:

- [DOCUMENTAZIONE.md](DOCUMENTAZIONE.md)
- [quasar.config.js](quasar.config.js)
- [firestore.rules](firestore.rules)
- [firebase-setup.md](firebase-setup.md)
- [CUSTOM_CLAIMS_SETUP.md](CUSTOM_CLAIMS_SETUP.md)

## Funzionalita' principali

- gestione squadre con codici invito
- calcolo tempi gara per tappa
- appuntamenti, FAQ e help bilingui
- area admin con custom claims Firebase
- supporto multi-gara

## Google Login

Il login Google supporta web e Android:

- web: provider Firebase
- Android: plugin Capacitor + Firebase credential

La configurazione Capacitor e' in `src-capacitor/capacitor.config.json`.

## Note

- La configurazione Capacitor principale e' in `src-capacitor/capacitor.config.json`
- I progetti nativi sono in `src-capacitor/android` e `src-capacitor/ios`
- Per Google Play, la firma viene letta da `keystore.properties` in root
