# MM26 - Documentazione Tecnica

## Panoramica

MM26 e' un'app Quasar per la gestione della Milano Relay Marathon, pensata per uso web e mobile.

Funzionalita' principali:

- gestione squadre e partecipanti
- associazione a una gara
- calcolo tempi per tappa
- appuntamenti e FAQ bilingui
- area admin per la gestione dei contenuti

## Stack

- Frontend: Quasar 2 + Vue 3
- Routing: Vue Router in modalita' hash
- Backend: Firebase Authentication + Firestore
- Build tool: Quasar App Vite
- Mobile: Capacitor
- Web app: SPA con supporto PWA

Riferimenti nel repo:

- [package.json](/c:/Users/giova/quasar/mm26/package.json)
- [quasar.conf.js](/c:/Users/giova/quasar/mm26/quasar.conf.js)
- [capacitor.config.json](/c:/Users/giova/quasar/mm26/capacitor.config.json)

## Configurazione attuale

### Quasar

- Router mode: `hash`
- Colore primario: `#173A79`
- Colore secondario: `#1F9343`
- Boot file registrato: `firebase`
- Porta dev server: `9000`

### Capacitor

Configurazione root attuale:

```json
{
  "appId": "com.prinapo.relaymarathon",
  "appName": "Milano Relay Marathon",
  "webDir": "dist/spa"
}
```

Nota importante:

- il progetto usa come unica sorgente nativa le cartelle `android/` e `ios/` in root
- `capacitor.config.json` in root e i progetti nativi root sono la fonte di verita' per build, plugin e asset

## Struttura del progetto

```text
mm26/
|-- src/
|   |-- boot/
|   |   `-- firebase.js
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
|-- android/
|-- ios/
|-- src-pwa/
|-- scripts/
|-- public/
|-- firestore.rules
|-- quasar.conf.js
|-- capacitor.config.json
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
- `/route` -> percorso
- `/splash` -> splash iniziale
- `/login` -> login

Dettagli implementativi:

- il router usa `createWebHashHistory()`
- la route `/admin` richiede custom claim `admin`
- al primo avvio o in PWA viene mostrata la splash

Riferimento:

- [src/router/index.js](/c:/Users/giova/quasar/mm26/src/router/index.js)

## Autenticazione

L'app non usa solo Google Sign-In. Al momento nel codice sono presenti:

- login Google via plugin Capacitor + credenziale Firebase
- login email/password
- registrazione email/password
- reset password
- logout
- lettura custom claims per il ruolo admin

Riferimento:

- [src/composables/useAuth.js](/c:/Users/giova/quasar/mm26/src/composables/useAuth.js)

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

Per sicurezza, in questa documentazione non vengono riportati i valori reali.

### Google Sign-In

Il progetto usa due livelli distinti:

- login Google gestito dal plugin `@capgo/capacitor-social-login`
- sessione applicativa finale gestita da Firebase Auth tramite `signInWithCredential`

Strategia corrente:

- Web: login Google via provider web del plugin
- Android: login Google nativo via Capacitor plugin, poi conversione dell'`idToken` in credenziale Firebase
- iOS: struttura pronta nel codice, ma richiede ancora configurazione completa del client iOS

Dipendenze/config coinvolte:

- [src/composables/useAuth.js](/c:/Users/giova/quasar/mm26/src/composables/useAuth.js)
- [package.json](/c:/Users/giova/quasar/mm26/package.json)
- [capacitor.config.json](/c:/Users/giova/quasar/mm26/capacitor.config.json)
- [ios/App/App/AppDelegate.swift](/c:/Users/giova/quasar/mm26/ios/App/App/AppDelegate.swift)

Stato attuale verificato:

- build web OK
- `npx cap sync` OK
- build Android debug OK
- login Google web OK
- login Google Android OK su device reale dopo allineamento firma debug

Note importanti:

- su Android il `google-services.json` attuale contiene gia' il package `com.prinapo.relaymarathon`
- per iOS servono `VITE_GOOGLE_IOS_CLIENT_ID` e relativo URL scheme Google in `Info.plist`
- il logout prova a chiudere sia la sessione Firebase sia quella del provider Google

### Note tecniche emerse durante il fix Android

Durante il debug del login Google Android sono emersi tre punti importanti:

1. firma debug Android

- il login falliva con errore OAuth nativo anche se `google-services.json` sembrava corretto
- il log `adb` mostrava: `This android application is not registered to use OAuth2.0`
- la causa reale era un mismatch tra la SHA-1 registrata in Firebase e la SHA-1 usata davvero dall'APK debug installato
- Gradle stava firmando l'app con `C:\Android\.android\debug.keystore` per via dell'ambiente locale (`ANDROID_SDK_HOME=C:\Android`)
- il progetto Firebase era invece allineato alla keystore `C:\Users\giova\.android\debug.keystore`
- per rendere stabile la build debug, [android/app/build.gradle](/c:/Users/giova/quasar/mm26/android/app/build.gradle) forza esplicitamente la signing config debug verso la keystore dentro `USERPROFILE`

SHA-1 corretta attesa dal progetto Firebase:

- `74:EB:35:61:8F:A7:BA:A6:8F:4A:C7:E0:5D:6B:76:CC:CB:FB:EE:85`

2. plugin Google login su Android

- il plugin `@capgo/capacitor-social-login` su Android, in modalita' `online`, prova a ottenere sia `idToken` sia `accessToken`
- per Firebase Auth, in questo progetto, e' sufficiente l'`idToken`
- sul device reale il secondo passaggio verso `accessToken` portava a errori tipo `Account reauth failed`
- per questo motivo il flusso app usa su Android l'opzione `preferIdTokenOnly: true` in [src/composables/useAuth.js](/c:/Users/giova/quasar/mm26/src/composables/useAuth.js)
- e il plugin locale e' stato adattato per completare il login con il solo `idToken` quando richiesto dall'app

Attenzione:

- la modifica al plugin e' ora versionata nel repo tramite `patch-package`
- il file patch e' [patches/@capgo+capacitor-social-login+8.3.9.patch](/c:/Users/giova/quasar/mm26/patches/@capgo+capacitor-social-login+8.3.9.patch)
- [package.json](/c:/Users/giova/quasar/mm26/package.json) esegue `patch-package` in `postinstall`
- quindi dopo `npm install` la patch viene riapplicata automaticamente
- resta comunque una personalizzazione di una dipendenza e andrebbe idealmente sostituita in futuro con una soluzione supportata ufficialmente dal plugin

3. MainActivity Android

- e' stato necessario implementare l'interfaccia richiesta dal plugin social login in [android/app/src/main/java/com/prinapo/relaymarathon/MainActivity.java](/c:/Users/giova/quasar/mm26/android/app/src/main/java/com/prinapo/relaymarathon/MainActivity.java)
- questo non dipende da Quasar in astratto, ma dal fatto che Capacitor delega alcune integrazioni ai progetti nativi reali `android/` e `ios/`
- quando un plugin richiede hook nativi, la sola configurazione Quasar non basta

### Android Firebase

- package name atteso: `com.prinapo.relaymarathon`
- `google-services.json` e' presente in root del repo
- per la build Android il file viene letto anche dal progetto nativo tramite [android/app/build.gradle](/c:/Users/giova/quasar/mm26/android/app/build.gradle)

### Admin

L'accesso admin e' gestito tramite Firebase Custom Claims, non tramite confronto diretto con l'email nelle Firestore Rules.

Script utili presenti nel repo:

- `set-admin.js`
- `check-user.js`
- `CUSTOM_CLAIMS_SETUP.md`

## Firestore Rules

Le regole effettive sono quelle in [firestore.rules](/c:/Users/giova/quasar/mm26/firestore.rules), non quelle eventualmente copiate in documenti piu' vecchi.

Riassunto ad oggi:

- `users`: lettura/scrittura solo sul proprio documento
- `teams`: lettura pubblica, create/update per qualunque utente autenticato, delete per admin o capitano
- `races`: lettura pubblica, scrittura solo admin
- `config`: lettura pubblica, scrittura solo admin
- `appointments`: lettura pubblica, CRUD solo admin
- `faq`: lettura pubblica, CRUD solo admin

Questa e' la fonte corretta da mantenere allineata:

- [firestore.rules](/c:/Users/giova/quasar/mm26/firestore.rules)

## Modello dati usato dal codice

Le collection esplicitamente usate da `useFirestore.js` sono:

- `races`
- `teams`
- `appointments`
- `faq`
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

Il codice tratta i team in modo abbastanza flessibile e non applica una normalizzazione forte lato composable. I campi attesi dal progetto includono almeno:

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
  order: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

Riferimento:

- [src/composables/useFirestore.js](/c:/Users/giova/quasar/mm26/src/composables/useFirestore.js)

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

Per questo repo conviene pensare il flusso in due passaggi:

1. build web Quasar in `dist/spa`
2. build/sync del progetto nativo Capacitor

### Android debug

```bash
npx quasar build -m capacitor -T android -d
```

### Android release

```bash
npx quasar build -m capacitor -T android
```

### iOS

```bash
npx quasar build -m capacitor -T ios
```

Note pratiche:

- la build web viene gia' eseguita da Quasar nel flusso Capacitor
- gli artefatti finali Android/iOS dipendono dal progetto nativo e dai tool di piattaforma
- se serve l'APK/AAB finale, il riferimento piu' affidabile e' la cartella output del progetto Android, non `dist/spa`
- per iOS serve macOS con Xcode

### Script wrapper presenti

Nel repo esistono anche script batch di supporto:

- `scripts/build-web.bat`
- `scripts/build-android-debug.bat`
- `scripts/build-android-release.bat`
- `scripts/build-ios.bat`

Sono utili come scorciatoie locali, ma la documentazione principale deve continuare a rifarsi ai comandi Quasar/Capacitor e alla configurazione reale del repo.

### Sync plugin nativi

Dopo modifiche a plugin Capacitor o alla configurazione nativa, eseguire:

```bash
npx cap sync
```

Questo passaggio e' obbligatorio dopo l'aggiunta o l'aggiornamento di plugin come `@capgo/capacitor-social-login`.

## Icone app

`@quasar/icongenie` e' gia' presente nelle devDependencies.

Esempio d'uso:

```bash
npx icongenie generate -i src/assets/icon.png
```

Prima di usarlo:

- parti da un PNG quadrato, idealmente 1024x1024
- verifica quali cartelle native vuoi aggiornare davvero
- se rigeneri asset mobile, ricontrolla il progetto Android/iOS prima di committare

### Note operative su IconGenie

In passato il repo aveva una doppia struttura Capacitor e IconGenie scriveva in `src-capacitor/`, creando confusione.

Questa situazione e' stata ripulita: oggi il riferimento operativo e' solo il progetto nativo root.

Resta comunque importante sapere due cose:

1. wrapper locale non funzionante

- il comando `.bin\\icongenie.cmd` non risultava affidabile nell'ambiente corrente
- per questo e' stato usato direttamente:

```bash
node node_modules/@quasar/icongenie/bin/icongenie.js generate -m capacitor -f png -i src/assets/icona_app_safe.png --skip-trim
```

2. output generato nella cartella sbagliata rispetto al progetto nativo attivo

- dopo la pulizia strutturale, gli asset app devono essere considerati validi solo se presenti nei progetti nativi root
- l'asset sorgente da usare per l'icona launcher e' [src/assets/icona_app_safe.png](/c:/Users/giova/quasar/mm26/src/assets/icona_app_safe.png)
- [quasar.conf.js](/c:/Users/giova/quasar/mm26/quasar.conf.js) punta ora a `icona_app_safe.png` per i path icona Capacitor

Nota pratica:

- Quasar/IconGenie funziona bene quando la struttura del progetto e' coerente e c'e' un solo target Capacitor chiaro
- in questo repo il target Capacitor da considerare e' soltanto quello root

## Modifica nome app e versione

Punti da aggiornare quando cambia il branding:

- [capacitor.config.json](/c:/Users/giova/quasar/mm26/capacitor.config.json) per `appId`, `appName`, `webDir`
- [package.json](/c:/Users/giova/quasar/mm26/package.json) per `version`
- [android/app/build.gradle](/c:/Users/giova/quasar/mm26/android/app/build.gradle) per `applicationId`, `versionCode`, `versionName`
- progetto iOS/Xcode per marketing version, build number e bundle identifier
- [ios/App/App/Info.plist](/c:/Users/giova/quasar/mm26/ios/App/App/Info.plist) per il display name se necessario

Attenzione:

- oggi `package.json` riporta `0.0.1`
- oggi `android/app/build.gradle` riporta `versionName "1.0"`
- questa differenza e' reale nel repo e andrebbe allineata quando si prepara una release

## Note operative

- non fidarti di documentazione vecchia sulle Firestore Rules: usa sempre [firestore.rules](/c:/Users/giova/quasar/mm26/firestore.rules)
- i progetti nativi reali sono [android](/c:/Users/giova/quasar/mm26/android) e [ios](/c:/Users/giova/quasar/mm26/ios)
- l'admin viene deciso dalle custom claims
- il progetto supporta sia web sia mobile, ma il flusso di release mobile dipende dai tool nativi di Android Studio e Xcode
- la patch al plugin Google Android non e' piu' "nascosta" in `node_modules`: e' tracciata in `patches/` e viene riapplicata in `postinstall`
- e' stato preparato anche un draft issue upstream in [UPSTREAM_ISSUE_CAPGO_GOOGLE_ANDROID.md](/c:/Users/giova/quasar/mm26/UPSTREAM_ISSUE_CAPGO_GOOGLE_ANDROID.md) per sostituire la patch con supporto ufficiale

## TODO

- allineare `package.json` e `android/app/build.gradle` sulla stessa versione di release
- aggiungere in `.env` i valori `VITE_GOOGLE_WEB_CLIENT_ID`, `VITE_GOOGLE_IOS_CLIENT_ID` e `VITE_GOOGLE_IOS_SERVER_CLIENT_ID`
- verificare in Firebase Console che il provider Google sia abilitato
- verificare in Firebase Console che il client web OAuth corrisponda al `webClientId` usato dall'app
- decidere come mantenere la patch locale al plugin `@capgo/capacitor-social-login`:
- stato attuale: gestita con `patch-package`
- obiettivo futuro: sostituire la patch con una soluzione ufficiale del plugin
- documentare stabilmente la keystore debug attesa per Android e il motivo del forcing in [android/app/build.gradle](/c:/Users/giova/quasar/mm26/android/app/build.gradle)
- completare la configurazione iOS con URL scheme Google in [Info.plist](/c:/Users/giova/quasar/mm26/ios/App/App/Info.plist)
- testare login Google su web in ambiente locale
- testare login Google su device Android reale con account Google presente sul device
- testare logout Google + Firebase su web e Android
- verificare che dopo il login vengano lette correttamente le custom claims admin

## Checklist test

- web: apertura pagina login
- web: login Google riuscito
- web: redirect/ritorno alla home corretto
- web: persistenza sessione dopo refresh
- web: logout corretto
- android: apertura login in app nativa
- android: selezione account Google di sistema
- android: login Firebase riuscito dopo risposta Google
- android: persistenza sessione dopo riavvio app
- android: logout corretto
- admin: accesso a `/admin` consentito solo con claim `admin`
