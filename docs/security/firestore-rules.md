---
title: Firestore Security Rules
description: Regole di sicurezza Firestore per MM26 - controllo accesso dati
tags: [firestore, security, rules, permissions, access-control]
---

# Firestore Security Rules

## Panoramica

Le Firestore Rules controllano l'accesso ai dati a livello server. Sono definite in `firestore.rules` e supportano Firebase Authentication e custom claims.

---

## File: firestore.rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ═══════════════════════════════════════════════════════
    // USERS
    // ═══════════════════════════════════════════════════════
    match /users/{userId} {
      // Leggi/scrivi solo il proprio documento
      allow read, write: if request.auth != null 
                          && request.auth.uid == userId;
    }

    // ═══════════════════════════════════════════════════════
    // TEAMS
    // ═══════════════════════════════════════════════════════
    match /teams/{teamId} {
      // Lettura pubblica (nome team, runner, etc.)
      allow read: if true;
      
      // Creazione: utente autenticato
      allow create: if request.auth != null;
      
      // Modifica: utente autenticato
      allow update: if request.auth != null;
      
      // Eliminazione: admin globale O captain del team
      allow delete: if request.auth != null
        && (request.auth.token.admin == true 
            || request.auth.uid == resource.data.captainId);
    }

    // ═══════════════════════════════════════════════════════
    // RACES
    // ═══════════════════════════════════════════════════════
    match /races/{raceId} {
      // Lettura pubblica
      allow read: if true;
      
      // Scrittura: solo admin globale
      allow write: if request.auth != null 
                    && request.auth.token.admin == true;
    }

    // ═══════════════════════════════════════════════════════
    // CONFIG
    // ═══════════════════════════════════════════════════════
    match /config/{docId} {
      allow read: if true;
      allow write: if request.auth != null 
                    && request.auth.token.admin == true;
    }

    // ═══════════════════════════════════════════════════════
    // APPOINTMENTS
    // ═══════════════════════════════════════════════════════
    match /appointments/{appointmentId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null 
                                      && request.auth.token.admin == true;
    }

    // ═══════════════════════════════════════════════════════
    // FAQ
    // ═══════════════════════════════════════════════════════
    match /faq/{faqId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null 
                                      && request.auth.token.admin == true;
    }

    // ═══════════════════════════════════════════════════════
    // HELP
    // ═══════════════════════════════════════════════════════
    match /help/{helpId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null 
                                      && request.auth.token.admin == true;
    }
  }
}
```

---

## Spiegazione Regole

### Collezione `users`

```
allow read, write: if request.auth != null && request.auth.uid == userId;
```

- Solo l'utente proprietario può leggere/scrivere il proprio documento
- `userId` nella path deve coincidere con `request.auth.uid`

### Collezione `teams`

| Operazione | Regola | Descrizione |
|------------|--------|-------------|
| read | `if true` | Pubblico |
| create | `if request.auth != null` | Qualsiasi utente autenticato |
| update | `if request.auth != null` | Qualsiasi utente autenticato |
| delete | `admin == true OR captainId == uid` | Solo admin globale o captain |

**Nota**: La regola di delete usa `resource.data` (dato prima della modifica) per verificare il captain.

### Collezione `races`

| Operazione | Regola | Descrizione |
|------------|--------|-------------|
| read | `if true` | Pubblico |
| write | `admin == true` | Solo global admin |

### Collezioni Contenuti (appointments, faq, help)

| Operazione | Regola | Descrizione |
|------------|--------|-------------|
| read | `if true` | Pubblico |
| create/update/delete | `admin == true` | Solo global admin |

---

## Custom Claims Utilizzate

### `admin` (boolean)
- Impostato su `true` per Global Admin
- Accessibile tramite `request.auth.token.admin`

```javascript
// Esempio verifica
request.auth.token.admin == true
```

---

## Limitazioni Attuali

Le regole attuali NON implementano:

1. **Race Admin a livello Firestore**: I Race Admin sono verificati solo lato client (UI), non nelle Firestore Rules
2. **Verifica captain per update team**: Attualmente qualsiasi utente autenticato può modificare qualsiasi team
3. **Verifica membership per modifica segmenti**: La logica di modifica segmenti è gestita solo lato client

### Race Admin

I permessi Race Admin sono attualmente gestiti solo lato client:

```javascript
// In IndexPage.vue
const canEditSetup = computed(() => {
  if (isAdmin.value) return true;  // Global admin
  if (selectedTeam.value?.captainId === user.value?.uid) return true;
  const raceAdmins = activeRace.value?.adminUids || [];
  return raceAdmins.includes(user.value?.uid);  // Race admin
});
```

---

## Best Practices

### 1. Sempre validare lato server
Le regole attuali permettono update team a qualsiasi utente autenticato. Per una sicurezza più Strict:

```javascript
// Esempio miglioramento
allow update: if request.auth != null && (
  request.auth.token.admin == true ||
  request.auth.uid == resource.data.captainId ||
  request.auth.uid == request.resource.data.captainId
);
```

### 2. Validare i campi
Assicurarsi che i campi modificati siano quelli consentiti.

### 3. Testare con Firebase Emulator
Usare `firebase emulators:start` per testare le regole in locale.

---

## Testing

### Firebase Emulator Suite

```bash
# Avvia emulatori
firebase emulators:start

# Test specifico Firestore
# Tramite UI: http://localhost:4000/firestore
```

### Regole di Test Comuni

```javascript
// Test lettura pubblica
expect(result.data.size).toBe(0);

// Test scrittura negata
expect(result.error).toBeDefined();
```

---

## Progetto Firebase

Il progetto Firebase "milano-relay-marathon" è configurato con:
- **Authentication**: Provider Google abilitato
- **Firestore**: Database creato
- **Admin User**: giovanni.prinetti@gmail.com con custom claims `admin: true`

### Configurazione Iniziale Admin

Dopo il setup iniziale, accedere all'app come admin e usare il pannello Admin per:
1. Creare le gare (es. Milano Relay Marathon)
2. Definire le tappe con distanze
3. Configurare appuntamenti, FAQ e help

#### Esempio di Gara

| Campo | Valore |
|-------|--------|
| Nome | `Milano Relay` |
| Luogo | `Milano` |
| Data | `2026-04-12` |
| Orario | `09:15` |
| Ritardo default | `3` minuti |

**Tappe:**
| Nome | Distanza | Tipo |
|------|----------|------|
| Sempione - Pagano | 13 km | solo |
| Pagano - Lotto | 9.8 km | solo |
| Lotto - Uruguay | 6.8 km | solo |
| Uruguay - Cavour | 12.6 km | solo |
| Cavour - Palestro | 0.4 km | group |

Vedi anche: [Custom Claims Setup](authentication.md#configurazione-admin)

---

## Deploy

```bash
# Deploy regole
firebase deploy --only firestore:rules

#oppure
firebase firestore:rules:deploy
```

Vedi anche: [Roles Overview](../roles/overview.md), [Authentication](authentication.md)