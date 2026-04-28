---
title: Team Captain
description: Permessi e funzionalità del capitano di squadra MM26
tags: [captain, team, team-captain, permissions, team-management]
---

# Team Captain

## Identificazione

Un utente è **Team Captain** quando il suo UID è presente come `captainId` nel documento del team.

```
Firestore: teams/{teamId}
{
  "captainId": "uid-captain"
}
```

---

## Caratteristiche Chiave

- **Scope team**: Il ruolo è specifico per un singolo team
- **Multi-team**: Un utente può essere Captain di più team
- **Indipendente**: Non richiede ruoli admin

---

## Permessi

### Gestione Team

| Azione | Permesso |
|--------|----------|
| Modificare nome team | ✅ |
| Eliminare team | ✅ |
| Impostare ritardo partenza custom | ✅ |
| Creare team | ✅ (se auth) |

### Gestione Runner

| Azione | Permesso |
|--------|----------|
| Assegnare runner ai segmenti | ✅ |
| Rimuovere runner dai segmenti | ✅ |
| Generare codici invito | ✅ |
| Modificare pace di gruppo | ✅ |
| Modificare pace dei segmenti | ✅ |

### Gestione Segmenti

| Azione | Permesso |
|--------|----------|
| Modificare nome runner (solo segmenti solo) | ✅ |
| Modificare pace personale | ✅ |
| Assegnarsi a segmenti | ✅ |
| Disassegnarsi da segmenti | ✅ |

### Accesso

| Azione | Permesso |
|--------|----------|
| Accedere /admin | ❌ |
| Vedere tutte le race | ✅ |
| Vedere tutti i team | ✅ |

---

## Funzionalità Disponibili

### IndexPage (Home)

Il Captain ha accesso completo alla gestione del team:

1. **Popup dettaglio segmento**:
   - Modifica nome team
   - Modifica nome runner (segmenti solo)
   - Modifica pace personale
   - Modifica pace di gruppo (segmenti group)

2. **Assegnazione segmenti**:
   - "Assegna a me" - assegna il segmento a sé stessi
   - "Invita" - genera codice invito per il segmento
   - "Disassegna" - rimuove runner dal segmento

3. **Indicatori visivi**:
   - Segmenti assegnati al captain mostrano icona verde

### TeamPage

Il Captain può:
- Visualizzare info team (nome, ID, data creazione)
- Eliminare il team

---

## Gestione Inviti

### Codici Invito

Il Captain può generare codici invito per ogni segmento:

```javascript
// Logica in IndexPage.vue
const inviteRunner = (segmentId) => {
  // 1. Se esiste già un codice, conferma sovrascrittura
  // 2. Genera nuovo codice random
  // 3. Copia negli appunti
  // 4. Salva in invitationCodes nel team
};
```

### Flusso Invito

```
Captain genera codice → Copia negli appunti → Invia a runner → Runner usa codice per partecipare
```

---

## Assegnazione Ruolo Captain

### Alla Creazione Team

```javascript
// TeamPage.vue
const createTeam = async () => {
  await createTeam({
    name: teamName,
    captainId: user.value.uid,  // Chi crea diventa captain
    raceId: selectedRaceId,
    // ...
  });
};
```

### Trasferimento Captaincy

Un Captain può trasferire il ruolo modificando `captainId` nel team (solo via Firestore direttamente o tramite modifica manuale).

---

## Combinazioni Ruolo

Un utente può essere simultaneamente:

| Combinazione | Possibile |
|--------------|-----------|
| Captain + Team Member (altro team) | ✅ |
| Captain + Race Admin | ✅ |
| Captain + Global Admin | ✅ |
| Captain di più team | ✅ |

---

## Esempio Completo

```
User A:
├── Global Admin: true
├── Race Admin (Milano 2026): adminUids includes A
└── Captain (Team Alpha): captainId = A
```

Questo utente può:
- Accedere a /admin (Global Admin)
- Modificare la gara Milano 2026 (Race Admin)
- Gestire Team Alpha (Captain)

---

## Note

- Il Captain è l'unico che può eliminare il proprio team
- I permessi di modifica team sono verificati in Firestore Rules
- Un utente può essere Captain senza essere in nessun team come membro

Vedi anche: [Roles Overview](overview.md), [Team Member](team-member.md), [Team Management](../features/team-management.md)