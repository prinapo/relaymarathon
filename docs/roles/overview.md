---
title: Panoramica Ruoli
description: Sistema di ruoli e permessi MM26 - Matrice completa ruoli x azioni
tags: [roles, permissions, users, access-control, admin, captain]
---

# Panoramica Ruoli Utente

## Introduzione

MM26 implementa un **sistema di ruoli gerarchico e non esclusivo**. Un utente può avere **ruoli multipli simultaneamente**, permettendo combinazioni come:
- Global Admin + Race Admin di una race
- Race Admin + Captain di un'altra race
- Global Admin + Captain di più team

---

## Ruoli Disponibili

| Ruolo | Identificazione | Scope |
|-------|-----------------|-------|
| **Global Admin** | Custom claim `admin: true` | Intera app |
| **Race Admin** | UID in `adminUids[]` in `races/{raceId}` | Singola gara |
| **Team Captain** | UID in `captainId` in `teams/{teamId}` | Singolo team |
| **Team Member** | UID in `runners[]` in `teams/{teamId}` | Singolo team |

---

## Matrice Permessi

### Gestione Contenuti

| Azione | Global Admin | Race Admin | Captain | Member |
|--------|--------------|------------|---------|--------|
| CRUD tutte le race | ✅ | ❌ | ❌ | ❌ |
| CRUD propria race | ✅ | ✅ | ❌ | ❌ |
| CRUD appointments | ✅ | ❌ | ❌ | ❌ |
| CRUD faq | ✅ | ❌ | ❌ | ❌ |
| CRUD help | ✅ | ❌ | ❌ | ❌ |

### Gestione Team

| Azione | Global Admin | Race Admin | Captain | Member |
|--------|--------------|------------|---------|--------|
| Creare team | ✅ | ✅ | ✅* | ❌ |
| Modificare qualsiasi team | ✅ | ❌ | ❌ | ❌ |
| Modificare proprio team | ✅ | ✅ | ✅ | ❌ |
| Eliminare qualsiasi team | ✅ | ❌ | ❌ | ❌ |
| Eliminare proprio team | ✅ | ✅ | ✅ | ❌ |
| Assegnare runner | ✅ | ❌ | ✅ | ❌ |
| Modificare propri segmenti | ✅ | ✅ | ✅ | ✅ |

### Accesso

| Azione | Global Admin | Race Admin | Captain | Member |
|--------|--------------|------------|---------|--------|
| Accedere /admin | ✅ | ❌ | ❌ | ❌ |
| Vedere tutte le race | ✅ | ✅ | ✅ | ✅ |
| Vedere tutti i team | ✅ | ✅ | ✅ | ✅ |

*Solo se fa parte della race

---

## Schema Identificazione Ruoli

### Global Admin
```
Firebase Auth Custom Claims:
{
  "admin": true
}
```

### Race Admin
```
Firestore - races/{raceId}:
{
  "adminUids": ["uid-admin-1", "uid-admin-2", ...]
}
```

### Team Captain
```
Firestore - teams/{teamId}:
{
  "captainId": "uid-captain"
}
```

### Team Member
```
Firestore - teams/{teamId}:
{
  "runners": [
    { "id": "uid-runner-1", "segmentId": "seg-1", "name": "..." },
    { "id": "uid-runner-2", "segmentId": "seg-2", "name": "..." }
  ]
}
```

---

## Esempi Combinazioni Ruoli

### Esempio 1: Organizzatore Gara
```
User A: Global Admin + Race Admin (Milano 2026) + Captain (Team A)
```
- Gestisce tutti i contenuti app
- Amministra la gara Milano 2026
- È capitano del Team A

### Esempio 2: Gestore Team
```
User B: Race Admin (Roma 2026) + Captain (Team B) + Captain (Team C)
```
- Amministra la gara Roma 2026
- È capitano di due team

### Esempio 3: Runner Semplice
```
User C: Team Member (Team D)
```
- Nessun permesso admin
- Può gestire solo il proprio segmento nel Team D

---

## Logica di Verifica Permessi

La logica di verifica nel codice (`src/pages/IndexPage.vue`):

```javascript
const canEditSetup = computed(() => {
  // 1. Global admin ha sempre accesso
  if (isAdmin.value) return true;
  
  // 2. Captain del team può modificare
  if (selectedTeam.value?.captainId === user.value?.uid) return true;
  
  // 3. Race admin può modificare la propria race
  const raceAdmins = activeRace.value?.adminUids || [];
  return raceAdmins.includes(user.value?.uid);
});
```

---

## Considerazioni Importanti

1. **Ereditarietà limitata**: I permessi non si ereditano automaticamente. Un Race Admin può amministrare la race ma non ha automaticamente permessi da Captain.

2. **Race Admin vs Global Admin**: I Race Admin NON possono accedere all'/admin panel globale né gestire contenuti non关联 alla loro race.

3. **Captain indipendenti**: Un utente può essere Captain senza essere Race Admin, e viceversa.

4. **Verifica runtime**: I permessi vengono verificati sia lato client (UI) sia lato server (Firestore Rules).

Vedi anche: [Firestore Rules](../security/firestore-rules.md), [Global Admin](global-admin.md)