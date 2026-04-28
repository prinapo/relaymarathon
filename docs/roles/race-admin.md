---
title: Race Admin
description: Permessi e funzionalità dell'amministratore di gara specifica MM26
tags: [admin, race-admin, race, permissions, race-management]
---

# Race Admin

## Identificazione

Un utente è **Race Admin** di una specifica race quando il suo UID è presente nell'array `adminUids` del documento della race.

```
Firestore: races/{raceId}
{
  "adminUids": ["uid-admin-1", "uid-admin-2", ...]
}
```

---

## Caratteristiche Chiave

- **Scope limitato**: Il ruolo è specifico per una singola race
- **Multi-race**: Un utente può essere Race Admin di più race contemporaneamente
- **Indipendente da Global Admin**: Non richiede il ruolo Global Admin

---

## Permessi

### Gestione Race

| Azione | Permesso |
|--------|----------|
| Modificare la propria race | ✅ |
| Gestire segmenti/tappe | ✅ |
| Modificare date e orari | ✅ |
| Modificare percorso | ✅ |
| Creare altre race | ❌ |
| Eliminare la propria race | ❌ |

### Gestione Team (sua race)

| Azione | Permesso |
|--------|----------|
| Creare team nella propria race | ✅ |
| Modificare team nella propria race | ✅ |
| Eliminare team nella propria race | ✅ |

### Gestione Contenuti

| Azione | Permesso |
|--------|----------|
| CRUD appointments | ❌ |
| CRUD faq | ❌ |
| CRUD help | ❌ |
| CRUD routes | ❌ |

### Accesso

| Azione | Permesso |
|--------|----------|
| Accedere /admin | ❌ |
| Vedere tutte le race | ✅ |
| Vedere tutti i team | ✅ |

---

## Funzionalità Disponibili

### In IndexPage (Home)

Il Race Admin può:
- Visualizzare e modificare la configurazione della propria race
- Modificare segmenti e relative distanze
- Impostare ritardo partenza custom

```javascript
// Logica in IndexPage.vue
const canEditSetup = computed(() => {
  if (isAdmin.value) return true; // Global admin
  if (selectedTeam.value?.captainId === user.value?.uid) return true; // Captain
  const raceAdmins = activeRace.value?.adminUids || [];
  return raceAdmins.includes(user.value?.uid); // Race admin
});
```

### In AdminPage

Il Race Admin **NON** ha accesso completo all'AdminPage. Può:
- Visualizzare i dati della propria race (solo lettura se non è anche Global Admin)

---

## Assegnazione Ruolo Race Admin

### Tramite AdminPage

1. Accedere a `/admin` (solo Global Admin)
2. Andare su tab "Race Admins"
3. Selezionare la race
4. Aggiungere l'utente tramite email o UID

### Tramite API Firestore

```javascript
// Aggiungere admin a una race
await updateDoc(doc(db, "races", raceId), {
  adminUids: arrayUnion(userUid)
});

// Rimuovere admin da una race
await updateDoc(doc(db, "races", raceId), {
  adminUids: arrayRemove(userUid)
});
```

### Funzioni Firestore disponibili

```javascript
// useFirestore.js
await addRaceAdmin(raceId, adminUid);
await removeRaceAdmin(raceId, adminUid);
```

---

## Differenza con Global Admin

| Funzionalità | Global Admin | Race Admin |
|--------------|--------------|------------|
| CRUD tutte le race | ✅ | ❌ |
| CRUD race specifica | ✅ | ✅ |
| CRUD appointments | ✅ | ❌ |
| CRUD faq/help | ✅ | ❌ |
| Accedere /admin | ✅ | ❌ |
| Assegnare altri race admin | ✅ | ❌ |
| Gestire team propria race | ✅ | ✅ |

---

## Combinazioni Ruolo

Un utente può essere simultaneamente:
- Race Admin di Race A + Race Admin di Race B
- Race Admin + Team Captain
- Race Admin + Team Member

---

## Note

- I permessi Race Admin sono verificati controllando `adminUids` nella race corrente
- La modifica dei permessi è gestita da `useFirestore.js` (`addRaceAdmin`, `removeRaceAdmin`)
- I Race Admin non possono accedere all'AdminPage ma possono modificare la propria race dalla home

Vedi anche: [Roles Overview](overview.md), [Global Admin](global-admin.md), [Team Captain](team-captain.md), [Race Management](../features/race-management.md)