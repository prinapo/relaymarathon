# Firebase Custom Claims Setup

## Why Custom Claims?

Custom Claims are the **Firebase recommended way** to manage admin roles because:
- ✅ Signed in JWT token (secure)
- ✅ Verified server-side via Security Rules
- ✅ Cached in the app automatically
- ✅ No need to check Firestore for every permission
- ✅ Works offline with cached token

## How to Add Custom Claims

### Option 1: Cloud Shell (Firebase Console - CONSIGLIATO)
1. Apri [Firebase Console](https://console.firebase.google.com/)
2. Vai a **Authentication > Users**
3. Clicca sull'icona **Cloud Shell** in basso a destra (>_)
4. Esegui questo comando:
```bash
firebase auth:set-custom-claims USER_UID '{"admin":true}'
```
5. Sostituisci `USER_UID` con l'ID dell'utente (vedi nella lista Users)
6. Premi Enter

Esempio:
```bash
firebase auth:set-custom-claims Ujjgeyji7nfnHan0xEeVt63TZPf2 '{"admin":true}'
```

### Option 2: Terminale Locale con Firebase Admin SDK (CONSIGLIATO)

Se Cloud Shell non funziona, usa il terminale locale:

1. **Scarica il Service Account Key:**
   - Va su [Firebase Console](https://console.firebase.google.com/)
   - Vai a **Project Settings (gear icon) > Service Accounts**
   - Clicca **Generate New Private Key**
   - Salva il file come `serviceAccountKey.json` nella **root del progetto Quasar**

2. **Installa Firebase Admin SDK** (nel progetto):
```bash
npm install firebase-admin
```

3. **Crea un file `set-admin.js`** nella root del progetto:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = process.argv[2];
if (!uid) {
  console.error('Usage: node set-admin.js USER_UID');
  process.exit(1);
}

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('✓ Custom claims set for user:', uid);
    process.exit(0);
  })
  .catch(error => {
    console.error('✗ Error:', error);
    process.exit(1);
  });
```

4. **Esegui il comando:**
```bash
node set-admin.js Ujjgeyji7nfnHan0xEeVt63TZPf2
```

Dovresti vedere: `✓ Custom claims set for user: Ujjgeyji7nfnHan0xEeVt63TZPf2`

5. **Opzionale:** Aggiungi a `.gitignore` per non committare il service account:
```
serviceAccountKey.json
```

### Option 3: Per Rimuovere Admin Status

Crea un file `remove-admin.js`:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = process.argv[2];
admin.auth().setCustomUserClaims(uid, {})
  .then(() => {
    console.log('✓ Custom claims removed for user:', uid);
    process.exit(0);
  })
  .catch(error => {
    console.error('✗ Error:', error);
    process.exit(1);
  });
```

Esegui:
```bash
node remove-admin.js USER_UID
```

## Update Security Rules

Go to Firestore > Rules and update:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Teams: public read, write only for captains
    match /teams/{teamId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == resource.data.captainId;
      allow update, delete: if request.auth != null && request.auth.uid == get(/databases/$(database)/documents/teams/$(teamId)).data.captainId;
    }
    
    // Config: public read, write only for admin users
    match /config/distances {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## In Your App

The auth composable now automatically reads custom claims:

```javascript
const { isAdmin } = useAuth()

if (isAdmin()) {
  // User has admin: true custom claim
}
```

## To Remove Admin Status

### Via Console:
1. Go to User > Custom claims
2. Edit the JSON to: `{}`
3. Save

### Via CLI:
```bash
firebase auth:set-custom-claims USER_UID --custom-claims '{}'
```

This removes all custom claims.