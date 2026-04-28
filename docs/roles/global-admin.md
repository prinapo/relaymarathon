---
title: Global Admin
description: Permessi e funzionalità dell'amministratore globale MM26
tags: [admin, global-admin, permissions, system-admin]
---

# Global Admin

## Identificazione

Un utente è **Global Admin** quando possiede il custom claim `admin: true` nei Firebase Auth token.

```javascript
// Verifica in useAuth.js
const isAdmin = computed(() => userClaims.value?.admin === true);
```

---

## Permessi

### Gestione Contenuti

| Azione | Permesso |
|--------|----------|
| CRUD tutte le race | ✅ |
| CRUD appointments | ✅ |
| CRUD faq | ✅ |
| CRUD help | ✅ |
| CRUD routes | ✅ |
| Gestire richieste admin | ✅ |

### Gestione Utenti

| Azione | Permesso |
|--------|----------|
| Assegnare ruolo Global Admin | ✅ |
| Rimuovere ruolo Global Admin | ✅ |
| Visualizzare richieste admin | ✅ |

### Gestione Team

| Azione | Permesso |
|--------|----------|
| Creare team | ✅ |
| Modificare qualsiasi team | ✅ |
| Eliminare qualsiasi team | ✅ |

### Accesso

| Azione | Permesso |
|--------|----------|
| Accedere /admin | ✅ |
| Vedere tutte le race | ✅ |
| Vedere tutti i team | ✅ |

---

## Funzionalità Admin Panel

### Tab Races
- Creare nuove race
- Modificare tutte le race
- Eliminare race
- Impostare race predefinita
- Gestire segmenti/tappe

### Tab Race Admins (solo Global Admin)
- Visualizzare tutti gli admin di ciascuna race
- Aggiungere/rimuovere race admin

### Tab Translations
- Gestire contenuti bilingue (IT/EN)
- CRUD per appointments, faq, help

---

## Assegnazione Ruolo Global Admin

### Tramite Firebase Admin SDK

Il ruolo viene assegnato tramite custom claims. Vedere [CUSTOM_CLAIMS_SETUP.md](../../CUSTOM_CLAIMS_SETUP.md).

```javascript
// Esempio con Firebase Admin SDK
await auth.setCustomUserClaims(uid, { admin: true });
```

### Script nel progetto

Il progetto include script utili:

```bash
node set-admin.js <uid>      # Rende utente global admin
node check-user.js <uid>     # Verifica claims utente
```

---

## Differenza con Race Admin

| Funzionalità | Global Admin | Race Admin |
|--------------|--------------|------------|
| CRUD tutte le race | ✅ | ❌ |
| CRUD race specifica | ✅ | ✅ |
| CRUD appointments | ✅ | ❌ |
| CRUD faq/help | ✅ | ❌ |
| Accedere /admin | ✅ | ❌ |
| Assegnare race admin | ✅ | ❌ |

---

## Note

- Il ruolo Global Admin è ** singleton non esclusivo**: più utenti possono essere Global Admin
- I permessi sono controllati sia lato client (mostra/nasconde UI) sia lato server (Firestore Rules)
- La route `/admin` è protetta e accessibile solo a chi ha `admin: true`

Vedi anche: [Roles Overview](overview.md), [Race Admin](race-admin.md), [Firestore Rules](../security/firestore-rules.md)