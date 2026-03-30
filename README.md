# MM26

App Quasar + Firebase per la gestione della Milano Relay Marathon, con supporto web e mobile tramite Capacitor.

## Stack

- Quasar 2
- Vue 3
- Firebase Authentication
- Firestore
- Capacitor

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

## Mobile

Build Android debug:

```bash
npx quasar build -m capacitor -T android -d
```

Build Android release:

```bash
npx quasar build -m capacitor -T android
```

Build iOS:

```bash
npx quasar build -m capacitor -T ios
```

Nota:

- la configurazione Capacitor principale e' in [capacitor.config.json](/c:/Users/giova/quasar/mm26/capacitor.config.json)
- il repo usa come unica sorgente nativa i progetti [android](/c:/Users/giova/quasar/mm26/android) e [ios](/c:/Users/giova/quasar/mm26/ios)

## Configurazione

Il progetto usa variabili ambiente Firebase con prefisso `VITE_` in `.env`.

Per Google Sign-In sono previste anche queste variabili:

- `VITE_GOOGLE_WEB_CLIENT_ID`
- `VITE_GOOGLE_IOS_CLIENT_ID`
- `VITE_GOOGLE_IOS_SERVER_CLIENT_ID`

File e riferimenti utili:

- [DOCUMENTAZIONE.md](/c:/Users/giova/quasar/mm26/DOCUMENTAZIONE.md)
- [quasar.conf.js](/c:/Users/giova/quasar/mm26/quasar.conf.js)
- [firestore.rules](/c:/Users/giova/quasar/mm26/firestore.rules)
- [CUSTOM_CLAIMS_SETUP.md](/c:/Users/giova/quasar/mm26/CUSTOM_CLAIMS_SETUP.md)

## Funzionalita' principali

- gestione squadre
- calcolo tempi gara per tappa
- appuntamenti e FAQ bilingui
- area admin con custom claims Firebase

## Stato login Google

Il login Google e' stato impostato con flusso ibrido:

- web tramite provider web
- Android tramite plugin Capacitor nativo + Firebase credential
- iOS predisposto a livello codice, ma da completare lato credenziali/config nativa

Nota Android:

- la build debug usa esplicitamente la keystore `C:\Users\giova\.android\debug.keystore` per restare coerente con la SHA-1 registrata nel progetto Firebase
- nel repo e' presente anche una patch versionata al plugin Google login Android in [patches/@capgo+capacitor-social-login+8.3.9.patch](/c:/Users/giova/quasar/mm26/patches/@capgo+capacitor-social-login+8.3.9.patch)
- la patch viene riapplicata automaticamente da `patch-package` durante `npm install`

Per stato tecnico, TODO e checklist test, vedi [DOCUMENTAZIONE.md](/c:/Users/giova/quasar/mm26/DOCUMENTAZIONE.md).

Per dettagli su struttura del progetto, routing, modello dati e note operative, vedi [DOCUMENTAZIONE.md](/c:/Users/giova/quasar/mm26/DOCUMENTAZIONE.md).
