---
title: Autenticazione
description: Sistema di autenticazione MM26 - Google Sign-In, Email/Password, Custom Claims
tags: [authentication, login, google, firebase, security]
---

# Autenticazione

## Panoramica

MM26 utilizza **Firebase Authentication** con due provider:
- **Google Sign-In** (web + Android)
- **Email/Password** (web + mobile)

---

## Provider Supportati

| Provider | Web | Android | iOS |
|----------|-----|---------|-----|
| Google | ✅ (Popup) | ✅ (Native) | ⚠️ (Configurazione richiesta) |
| Email/Password | ✅ | ✅ | ✅ |

---

## Flusso Google Sign-In

### Web (Firebase Popup)

```
1. Utente clicca "Accedi con Google"
2. Firebase apre popup OAuth Google
3. Utente seleziona account Google
4. Firebase restituisce credential
5. App crea sessione con signInWithPopup
```

### Android (Capacitor + Firebase)

```
1. Utente clicca "Accedi con Google"
2. @capgo/capacitor-social-login apre native Google Sign-In
3. Ottenuto idToken da Google
4. Conversione in Firebase Credential
5. signInWithCredential(auth, credential)
```

---

## Implementazione

### useAuth.js - Variabili Principali

```javascript
// Stato auth
const user = ref(null);                    // Utente Firebase corrente
const userClaims = ref(null);              // Custom claims
const isAdmin = computed(() => userClaims.value?.admin === true);
const authInitialized = ref(false);

// Login Google
await SocialLogin.login({ provider: "google" });
const idToken = result.result.idToken;
const credential = GoogleAuthProvider.credential(idToken);
await signInWithCredential(auth, credential);

// Logout
await Promise.allSettled([
  signOut(auth),
  SocialLogin.logout({ provider: "google" })
]);
```

### Custom Claims

I custom claims sono leggibili tramite `getIdTokenResult()`:

```javascript
const tokenResult = await firebaseUser.getIdTokenResult(true);
userClaims.value = tokenResult.claims;
// { admin: true } per Global Admin
```

---

## Variabili Ambiente

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Google Sign-In
VITE_GOOGLE_WEB_CLIENT_ID=
VITE_GOOGLE_IOS_CLIENT_ID=
VITE_GOOGLE_IOS_SERVER_CLIENT_ID=
```

---

## Configurazione Google Sign-In

### Web

1. Abilitare Google provider in Firebase Console
2. Aggiungere authorized JavaScript origins:
   - `http://localhost:9000` (dev)
   - `https://tuodominio.com` (produzione)

### Android

1. Scaricare `google-services.json` da Firebase Console
2. Inserire in `src-capacitor/android/app/`
3. Verificare package name: `com.prinapo.relaymarathon`
4. Registrare SHA-1 della keystore di debug/release

### iOS

1. Configurare OAuth consent screen in Google Cloud Console
2. Aggiungere URL scheme in `Info.plist`
3. Inserire `GoogleService-Info.plist` in progetto

---

## Note Tecniche Android

### Debug SHA-1

La build debug usa la keystore in `~/.android/debug.keystore`.

SHA-1 atteso:
```
74:EB:35:61:8F:A7:BA:A6:8F:4A:C7:E0:5D:6B:76:CC:CB:FB:EE:85
```

### Errore OAuth Comune

Se il login fallisce con errore OAuth:
- Verificare che la SHA-1 in Firebase Console corrisponda a quella usata dalla build
- In `build.gradle` configurare la signing config debug verso la keystore corretta

---

## Email/Password

### Registration

```javascript
await createUserWithEmailAndPassword(auth, email, password);
```

### Login

```javascript
await signInWithEmailAndPassword(auth, email, password);
```

### Reset Password

```javascript
await sendPasswordResetEmail(auth, email);
```

---

## Protezione Route

### Router Configuration (src/router/index.js)

```javascript
const routes = [
  {
    path: '/admin',
    component: () => import('pages/AdminPage.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/team',
    component: () => import('pages/TeamPage.vue'),
    meta: { requiresAuth: true }
  }
];
```

### Guards

```javascript
router.beforeEach((to, from, next) => {
  const { isAdmin } = useAuth();
  
  if (to.meta.requiresAdmin && !isAdmin.value) {
    next('/'); // Redirect se non admin
  }
  next();
});
```

---

## Logout

Il logout chiude sia la sessione Firebase che quella del provider Google:

```javascript
const logout = async () => {
  if (Platform.is.capacitor) {
    await Promise.allSettled([
      signOut(auth),
      SocialLogin.logout({ provider: "google" }).catch(() => undefined)
    ]);
  } else {
    await signOut(auth);
  }
};
```

---

## Sicurezza

### Custom Claims

I custom claims (come `admin: true`) sono:
- Impostati solo lato server (Firebase Admin SDK)
- Includi nel token ID
- Non modificabili dal client

### Best Practices

1. **Non fidarsi solo del client**: Verificare sempre permessi anche lato server (Firestore Rules)
2. **Token refresh**: Firebase rinnova automaticamente i token
3. **Sessione persistenza**: Firebase usa localStorage/sessionStorage sul web

---

## Configurazione Admin

### Come Impostare Custom Claims

#### Opzione 1: Cloud Shell (Firebase Console) - Consigliato

1. Apri [Firebase Console](https://console.firebase.google.com/)
2. Vai a **Authentication > Users**
3. Clicca sull'icona **Cloud Shell** in basso a destra (>_)
4. Esegui:

```bash
firebase auth:set-custom-claims USER_UID '{"admin":true}'
```

Sostituisci `USER_UID` con l'ID dell'utente dalla lista Users.

#### Opzione 2: Terminale Locale con Firebase Admin SDK

1. **Scarica il Service Account Key:**
   - Firebase Console > Project Settings (gear icon) > Service Accounts
   - Clicca **Generate New Private Key**
   - Salva come `serviceAccountKey.json` nella root del progetto

2. **Installa Firebase Admin SDK:**

```bash
npm install firebase-admin
```

3. **Crea `set-admin.js`** nella root:

```javascript
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = process.argv[2];
if (!uid) {
  console.error("Usage: node set-admin.js USER_UID");
  process.exit(1);
}

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("✓ Custom claims set for user:", uid);
    process.exit(0);
  })
  .catch((error) => {
    console.error("✗ Error:", error);
    process.exit(1);
  });
```

4. **Esegui:**

```bash
node set-admin.js USER_UID
```

5. **Opzionale:** Aggiungi a `.gitignore`:

```
serviceAccountKey.json
```

#### Opzione 3: Rimuovere Admin Status

Via Firebase Console: User > Custom claims > Edit JSON to: `{}`

Via CLI:

```bash
firebase auth:set-custom-claims USER_UID --custom-claims '{}'
```

### Verifica nell'App

```javascript
const { isAdmin } = useAuth();

if (isAdmin()) {
  // Utente ha admin: true custom claim
}
```

Vedi anche: [Firestore Rules](firestore-rules.md), [Global Admin](../roles/global-admin.md)