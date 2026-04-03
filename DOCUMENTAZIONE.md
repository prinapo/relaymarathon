# MM26 - Documentazione Tecnica

## Panoramica

MM26 e' un'app Quasar per la gestione della Milano Relay Marathon, pensata per uso web e mobile.

Funzionalita' principali:

- gestione squadre e partecipanti
- associazione a una gara
- calcolo tempi per tappa
- appuntamenti, FAQ e help bilingui
- area admin per la gestione dei contenuti

## Stack

- Frontend: Quasar 2 + Vue 3
- Routing: Vue Router in modalita' hash
- Backend: Firebase Authentication + Firestore
- Mobile UX: Gestione tasto Back Android via Boot File
- Build tool: Quasar App Vite
- Mobile: Capacitor
- Web app: SPA con supporto PWA

Riferimenti nel repo:

- [package.json](package.json)
- [quasar.config.js](quasar.config.js)
- [src-capacitor/capacitor.config.json](src-capacitor/capacitor.config.json)

## Configurazione attuale

### Quasar

- Router mode: `hash`
- Colore primario: `#173A79`
- Colore secondario: `#1F9343`
- Boot file registrati: `app-version`, `firebase`, `android-back-button`, `status-bar`
- Porta dev server: `9000`

### Capacitor

Configurazione attuale:

```json
{
  "appId": "com.prinapo.relaymarathon",
  "appName": "Milano Relay Marathon",
  "webDir": "dist/spa"
}
```

## Struttura del progetto

```
mm26/
|-- src/
|   |-- boot/
|   |   |-- android-back-button.js
|   |   |-- app-version.js
|   |   |-- firebase.js
|   |   `-- status-bar.js
|   |-- composables/
|   |   |-- defaultTranslations.js
|   |   |-- useAuth.js
|   |   |-- useFirestore.js
|   |   |-- useI18n.js
|   |   |-- useTeamContext.js
|   |   `-- useTimeCalculator.js
|   |-- layouts/
|   |   |-- AuthLayout.vue
|   |   `-- MainLayout.vue
|   |-- pages/
|   |   |-- AdminPage.vue
|   |   |-- AppointmentsPage.vue
|   |   |-- ErrorNotFound.vue
|   |   |-- FaqPage.vue
|   |   |-- HelpPage.vue
|   |   |-- IndexPage.vue
|   |   |-- LoginPage.vue
|   |   |-- PercorsoPage.vue
|   |   |-- SplashPage.vue
|   |   `-- TeamPage.vue
|   |-- router/
|   |   `-- index.js
|   |-- assets/
|   |-- App.vue
|   `-- firebase.js
|-- src-capacitor/
|   |-- android/
|   |-- ios/
|   |-- capacitor.config.json
|   `-- package.json
|-- src-pwa/
|-- scripts/
|   |-- deploy-web.ps1          # Build + upload FTP web
|   |-- release-android.ps1    # Release Android guidata
|   |-- build-ios.bat           # Build iOS (macOS richiesto)
|-- public/
|-- firestore.rules
|-- quasar.config.js
|-- DOCUMENTAZIONE.md
`-- package.json
```

## Routing e pagine

Pagine presenti:

- `/` -> redirect logico a splash o home
- `/home` -> home con tabella tempi
- `/team` -> gestione squadre, route protetta
- `/admin` -> area amministrativa, route protetta e admin-only
- `/appointments` -> appuntamenti
- `/faq` -> FAQ
- `/help` -> help
- `/route` -> percorso
- `/splash` -> splash iniziale
- `/login` -> login

Dettagli implementativi:

- il router usa `createWebHashHistory()`
- la route `/admin` richiede custom claim `admin`
- al primo avvio o in PWA viene mostrata la splash

Riferimento:

- [src/router/index.js](src/router/index.js)

## Autenticazione

L'app supporta:

- login Google via plugin Capacitor (mobile) / Firebase popup (web)
- login email/password
- registrazione email/password
- reset password
- logout
- lettura custom claims per il ruolo admin

Riferimento:

- [src/composables/useAuth.js](src/composables/useAuth.js)

## Firebase

### Variabili ambiente

Le variabili attese sono in `.env` e iniziano con prefisso `VITE_`.

Chiavi attese:

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

### Google Sign-In

Il progetto usa due livelli:

- login Google gestito dal plugin `@capgo/capacitor-social-login`
- sessione applicativa gestita da Firebase Auth tramite `signInWithCredential`

Strategia corrente:

- Web: login Google via provider web Firebase (`signInWithPopup`)
- Android: login Google nativo via Capacitor plugin, poi conversione dell'`idToken` in credenziale Firebase
- iOS: struttura ready, richiede configurazione completa del client iOS

Dipendenze/config coinvolte:

- [src/composables/useAuth.js](src/composables/useAuth.js)
- [package.json](package.json)
- [src-capacitor/capacitor.config.json](src-capacitor/capacitor.config.json)

Stato attuale verificato:

- build web OK
- `npx cap sync` OK
- build Android debug OK
- login Google web OK
- login Google Android OK

Note importanti:

- su Android il `google-services.json` contiene il package `com.prinapo.relaymarathon`
- per iOS servono `VITE_GOOGLE_IOS_CLIENT_ID` e relativo URL scheme Google in `Info.plist`
- il logout chiude sia la sessione Firebase sia quella del provider Google

### Note tecniche Android

1. **Firma debug Android**
   - il login potrebbe fallire con errore OAuth se la SHA-1 registrata in Firebase non corrisponde a quella usata dalla build
   - Gradle firma l'APK debug con la keystore in `USERPROFILE\.android\debug.keystore`
   - in [build.gradle](src-capacitor/android/app/build.gradle) la signing config debug viene forzata verso questa keystore

   SHA-1 attesa:
   - `74:EB:35:61:8F:A7:BA:A6:8F:4A:C7:E0:5D:6B:76:CC:CB:FB:EE:85`

2. **Plugin Google login su Android**
   - il plugin `@capgo/capacitor-social-login` in modalita' `online` richiede entrambi `idToken` e `accessToken`
   - per Firebase Auth e' sufficiente l'`idToken`
   - il codice in [useAuth.js](src/composables/useAuth.js) gestisce questo caso usando `signInWithCredential` con il solo `idToken`

### Admin

L'accesso admin e' gestito tramite Firebase Custom Claims.

Script utili presenti nel repo:

- `set-admin.js`
- `check-user.js`
- `CUSTOM_CLAIMS_SETUP.md`

## Firestore Rules

Le regole effettive sono quelle in [firestore.rules](firestore.rules).

Riassunto:

- `users`: lettura/scrittura solo sul proprio documento
- `teams`: lettura pubblica, create/update per qualunque utente autenticato, delete per admin o capitano
- `races`: lettura pubblica, scrittura solo admin
- `config`: lettura pubblica, scrittura solo admin
- `appointments`: lettura pubblica, CRUD solo admin
- `faq`: lettura pubblica, CRUD solo admin
- `help`: lettura pubblica, CRUD solo admin

## Modello dati

Le collection usate da `useFirestore.js` sono:

- `races`
- `teams`
- `appointments`
- `faq`
- `help`
- `users`

### `races`

```js
{
  name: string,
  location: string,
  date: string,
  startTime: string,
  defaultStartDelay: number,
  isDefault: boolean,
  segments: [
    {
      id: string,
      name: string,
      distance: number,
      type: "solo" | "group"
    }
  ]
}
```

### `teams`

```js
{
  name: string,
  captainId: string,
  raceId: string,
  runners: array,
  invitationCodes: object,
  groupPaces: object,
  startDelay: number,
  hasCustomStartDelay: boolean
}
```

### `appointments`

```js
{
  title: string,
  titleEn: string,
  date: string,
  time: string,
  location: string,
  locationEn: string,
  description: string,
  descriptionEn: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `faq`

```js
{
  question: string,
  questionEn: string,
  answer: string,
  answerEn: string,
  hidden: boolean,
  order: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `help`

```js
{
  title: string,
  titleEn: string,
  body: string,
  bodyEn: string,
  hidden: boolean,
  order: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

Riferimento:

- [src/composables/useFirestore.js](src/composables/useFirestore.js)

## Comandi di sviluppo

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

Output web atteso:

- `dist/spa/` per SPA

## Build mobile con Capacitor

### Sviluppo Rapido (HMR)

Per sviluppare direttamente sul dispositivo:

```bash
npm run dev:android
```

Il flusso:

1. Quasar compila la UI web
2. Quasar sincronizza `src-capacitor/android`
3. Gradle produce l'APK debug o release

### Android debug

```bash
quasar build -m capacitor -T android -debug
```

APK generato:

```
dist/capacitor/android/apk/debug/app-debug.apk
```

Installazione sul telefono collegato:

```bash
adb devices
adb -s <DEVICE_ID> install -r dist\capacitor\android\apk\debug\app-debug.apk
```

### Android release

```bash
quasar build -m capacitor -T android
```

Per il caricamento su Google Play:

```bash
cd src-capacitor\android
.\gradlew.bat bundleRelease
```

Output atteso:

```
src-capacitor/android/app/build/outputs/bundle/release/app-release.aab
```

### Script guidato release Android

```bash
npm run release:android
```

Lo script [scripts/release-android.ps1](scripts/release-android.ps1):

1. legge la versione corrente da [quasar.config.js](quasar.config.js)
2. chiede se il rilascio e' `minor`, `major` o `patch`
3. aggiorna `version` in quasar.config.js
4. incrementa `versionCode` in quasar.config.js
5. aggiorna `versionName` in [build.gradle](src-capacitor/android/app/build.gradle)
6. allinea `version` in [package.json](package.json)
7. esegue `quasar build -m capacitor -T android`
8. esegue `.\gradlew.bat bundleRelease`
9. mostra il percorso finale dell'AAB

Regole di incremento:

- `minor`: `1.2.0` -> `1.3.0`
- `major`: `1.2.0` -> `2.0.0`
- `patch`: `1.2.0` -> `1.2.1`
- `versionCode`: sempre `+1`

### Comandi versione

```bash
node version.js get                    # Leggi versione + versionCode
node version.js set 1.4.0              # Imposta versione specifica
node version.js set 1.4.0 10           # Imposta versione + versionCode specifico
node version.js release minor          # Incrementa versione (minor|major|patch)
node version.js dev debug              # Build debug APK
node version.js dev debug --install    # Build + installa + avvia sul device
node version.js dev release            # Build release + bundle AAB per Google Play
```

### Deploy web

```bash
npm run deploy:web
```

Lo script [scripts/deploy-web.ps1](scripts/deploy-web.ps1):

1. Builda l'app web (`npm run build`)
2. Carica tutti i file via FTP sul server

Configurazione in [ftp-config.json](ftp-config.json) (esclusa da git):

- host: `relaymarathon.sostienilsostegno.com`
- remote path: `/public_html`

### iOS

```bash
quasar build -m capacitor -T ios
```

Richiede macOS con Xcode.

### Firma release Android

La build `bundleRelease` legge i dati firma da:

1. file `keystore.properties` in root progetto
2. variabili d'ambiente `ANDROID_RELEASE_STORE_FILE`, `ANDROID_RELEASE_STORE_PASSWORD`, `ANDROID_RELEASE_KEY_ALIAS`, `ANDROID_RELEASE_KEY_PASSWORD`

Template iniziale:

- [src-capacitor/android/keystore.properties.example](src-capacitor/android/keystore.properties.example)

Configurazione locale attuale:

- keystore: `mm26-upload.keystore` in root progetto
- alias: `upload`
- proprieta': [keystore.properties](keystore.properties)

### Flusso Google Play

1. aggiorna la versione con `npm run release:android`
2. prepara la upload keystore locale
3. verifica [keystore.properties](keystore.properties)
4. esegui `npm run release:android`
5. verifica l'output `app-release.aab`
6. carica su Google Play Console
7. completa scheda store, Data safety, content rating e release notes

### Sync plugin nativi

Dopo modifiche a plugin Capacitor:

```bash
cd src-capacitor
npx cap sync
```

## Icone app

`@quasar/icongenie` e' presente nelle devDependencies.

Esempio d'uso:

```bash
npx icongenie generate -i src/assets/icon.png
```

Asset sorgente per l'icona launcher:

- [src/assets/icona_app_safe.png](src/assets/icona_app_safe.png)

[quasar.config.js](quasar.config.js) punta a `icona_app_safe.png` per i path icona Capacitor.

### Versione (singolo punto di verità)

La versione è gestita dallo script [version.js](version.js) che legge da [package.json](package.json).

```js
// package.json
{
  "version": "1.4.3",
  "versionCode": 8
}
```

Lo script aggiorna automaticamente:

- [package.json](package.json) -> `version` e `versionCode`
- [src/boot/app-version.js](src/boot/app-version.js) -> `APP_VERSION`
- [src-capacitor/android/app/build.gradle](src-capacitor/android/app/build.gradle) -> `versionName` e `versionCode`

Comandi per gestione versione:

```bash
node version.js get                    # Leggi versione + versionCode
node version.js set 1.4.0              # Imposta versione specifica
node version.js set 1.4.0 10           # Imposta versione + versionCode
node version.js release minor         # Incrementa (minor|major|patch)
node version.js dev debug             # Build debug APK
node version.js dev debug --install   # Build + installa + avvia sul device
node version.js dev release           # Build release + bundle AAB
```

Per Android, la versione è composta da:

- `versionName` (es. `1.4.3`) - visibile all'utente
- `versionCode` (es. `8`) - numero incrementale per Google Play

Il `versionCode` viene incrementato automaticamente ad ogni release.

Versione attuale:

- version: `1.4.3`
- versionCode: `8`

## Team Management (IndexPage)

### Popup di editing segmenti

Il popup di dettaglio segmento (in [IndexPage.vue](src/pages/IndexPage.vue)) permette al capitano di:

1. **Modificare nome team** - campo visibile solo per captain, salva immediatamente su Firestore
2. **Modificare nome runner** - per segmenti di tipo `solo`
3. **Modificare pace** - per tutti i segmenti, espresso in minuti:secondo
4. **Modificare pace di gruppo** - per segmenti di tipo `group`, visibile solo per captain

### Logica di assegnazione segmenti

Il popup mostra diversi pulsanti in base allo stato di assegnazione del segmento:

| Stato              | Pulsanti visibili (captain)             |
| ------------------ | --------------------------------------- |
| Non assegnato      | "Assegna a me" + "Invita"               |
| Assegnato a me     | "Disassegna"                            |
| Assegnato ad altri | "Assegna a me" + "Invita" (con warning) |

**Nota**: Un capitano puo' assegnarsi a piu' segmenti.

### Funzione inviteRunner

La funzione `inviteRunner` (in [IndexPage.vue](src/pages/IndexPage.vue)):

1. Se esiste gia' un codice di invito per il segmento, mostra un dialog di conferma
2. Genera un nuovo codice di invito
3. Copia automaticamente il codice negli appunti

### Indicatore visivo segmenti assegnati

I segmenti assegnati al captain sono identificati tramite un'icona verde (funzione `getSegmentColor`).

### Team selezionabile in home

Il dropdown di selezione team e' visibile quando l'utente ha almeno un team.

### TeamPage

[TeamPage.vue](src/pages/TeamPage.vue) mostra:

- Info team (nome, ID, data creazione)
- Pulsante per eliminare il team
- Tabella di assegnazione segmenti rimossa (spostata nel popup IndexPage)

## Note operative

- usa sempre [firestore.rules](firestore.rules) come fonte delle regole
- i progetti nativi sono [src-capacitor/android](src-capacitor/android) e [src-capacitor/ios](src-capacitor/ios)
- l'admin viene deciso dalle custom claims
- il progetto supporta sia web sia mobile

## Checklist test

- web: apertura pagina login
- web: login Google riuscito
- web: redirect alla home corretto
- web: persistenza sessione dopo refresh
- web: logout corretto
- android: apertura login in app nativa
- android: selezione account Google
- android: login Firebase riuscito
- android: persistenza sessione dopo riavvio app
- android: logout corretto
- admin: accesso a `/admin` consentito solo con claim `admin`

## TODO

- verificare in Firebase Console che il provider Google sia abilitato
- verificare in Firebase Console che il client web OAuth corrisponda al `webClientId` usato dall'app
- completare la configurazione iOS con URL scheme Google in Info.plist
- testare login Google su web in ambiente locale
- testare login Google su device Android reale con account Google presente sul device
- testare logout Google + Firebase su web e Android
- verificare che dopo il login vengano lette correttamente le custom claims admin
