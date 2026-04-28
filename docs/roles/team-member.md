---
title: Team Member
description: Permessi e funzionalità del membro di squadra MM26
tags: [member, team, team-member, runner, permissions]
---

# Team Member

## Identificazione

Un utente è **Team Member** quando il suo UID è presente nell'array `runners` nel documento del team.

```
Firestore: teams/{teamId}
{
  "runners": [
    { "id": "uid-runner-1", "segmentId": "seg-1", "name": "Mario Rossi" },
    { "id": "uid-runner-2", "segmentId": "seg-2", "name": "Luca Bianchi" }
  ]
}
```

---

## Caratteristiche Chiave

- **Scope segmento**: Il ruolo è legato a un segmento specifico del team
- **Multi-team**: Un utente può far parte di più team (in segmenti diversi)
- **Ruolo base**: Non richiede ruoli admin o captain

---

## Permessi

### Gestione Team

| Azione | Permesso |
|--------|----------|
| Modificare nome team | ❌ |
| Eliminare team | ❌ |
| Creare team | ❌ |
| Assegnare runner | ❌ |

### Gestione Proprio Segmento

| Azione | Permesso |
|--------|----------|
| Modificare la propria pace | ✅ |
| Modificare il proprio nome (segmenti solo) | ✅ |
| Assegnarsi a un segmento libero | ✅ |
| Disassegnarsi dal proprio segmento | ✅ |

### Gestione Altro Team

| Azione | Permesso |
|--------|----------|
| Modificare segmenti altrui | ❌ |
| Assegnare altri runner | ❌ |

### Accesso

| Azione | Permesso |
|--------|----------|
| Accedere /admin | ❌ |
| Vedere tutte le race | ✅ |
| Vedere tutti i team | ✅ |

---

## Funzionalità Disponibili

### IndexPage (Home)

Il Team Member può:

1. **Visualizzare i tempi**:
   - Vedere la timeline completa della gara
   - Vedere tempi di arrivo previsti per ogni segmento

2. **Gestire il proprio segmento**:
   - Nel popup dettaglio segmento, può modificare:
     - Nome runner (solo segmenti tipo `solo`)
     - Pace personale (minuti:secondi)

3. **Assegnazione**:
   - Se il segmento è libero: può "Assegnare a me"
   - Se assegnato a sé: può "Disassegnarsi"

### Limitazioni UI

Il Team Member **non vede**:
- Pulsanti di gestione runner (assegna/rimuovi)
- Pulsanti di invito
- Pulsante elimina team
- Pace di gruppo (solo Captain può modificarla)

---

## Assegnazione come Membro

### Tramite Invito

Il Captain genera un codice invito per un segmento:
```javascript
// Captain genera codice
invitationCodes: {
  "segment-2": "ABC123"
}
```

Il runner usa il codice per partecipare al team.

### Tramite Assegnazione Direct

Il Captain o un altro runner può assegnare direttamente un utente a un segmento.

### Quando un Utente Crea un Team

Quando un utente crea un team, diventa automaticamente:
1. **Captain** del team (è impostato come `captainId`)
2. **Membro** del team (è aggiunto a `runners` con un segmento)

---

## Combinazioni Ruolo

Un utente può essere simultaneamente:

| Combinazione | Possibile |
|--------------|-----------|
| Membro + Captain (altro team) | ✅ |
| Membro + Race Admin | ✅ |
| Membro + Global Admin | ✅ |
| Membro di più team | ✅ |

---

## Esempio

```
User B (Runner):
├── Membro di Team Alpha: runners includes B (segment-1)
├── Membro di Team Beta: runners includes B (segment-3)
└── Captain di Team Gamma: captainId = B
```

Questo utente può:
- Gestire il proprio segmento in Team Alpha e Beta
- Gestire completamente Team Gamma
- Eventualmente modificare race se è anche Race Admin

---

## Note

- Un utente può essere Membro di un team di cui non è Captain
- I permessi di modifica sono limitati al proprio segmento
- La modifica della pace viene salvata automaticamente su Firestore
- L'indicatore visivo mostra i segmenti assegnati all'utente corrente

Vedi anche: [Roles Overview](overview.md), [Team Captain](team-captain.md), [Team Management](../features/team-management.md)