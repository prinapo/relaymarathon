---
title: Gestione Squadre
description: Funzionalità di gestione squadre e runner in MM26
tags: [team, teams, runner, invitation, captain]
---

# Gestione Squadre

## Panoramica

Il sistema di gestione squadre permette di creare team, assegnare runner ai segmenti e gestire i tempi di gara.

---

## Creazione Team

### Flusso

```
1. Utente autenticato va su /team
2. Crea nuovo team selezionando una race
3. Il creatore diventa automaticamente Captain
4. Il team viene salvato in Firestore
```

### Struttura Dati

```javascript
// Creazione team
{
  name: "Running Team Milano",
  captainId: user.uid,           // Chi crea diventa captain
  raceId: selectedRaceId,
  startDelay: 0,
  hasCustomStartDelay: false,
  runners: [],                   // Vuoto inizialmente
  groupPaces: {},                // Pace di gruppo per segmenti group
  invitationCodes: {}            // Codici invito per segmento
}
```

---

## Ruoli nel Team

### Captain

Il Captain ha pieno controllo del team:
- Modifica nome team
- Assegna/rimuove runner
- Genera codici invito
- Modifica pace di gruppo
- Elimina il team

### Runner/Member

Il Runner può:
- Vedere i tempi della gara
- Modificare la propria pace
- Modificare il proprio nome (segmenti solo)
- Assegnarsi/disassegnarsi da segmenti

---

## Assegnazione Runner

### Metodi di Assegnazione

1. **Assegnazione diretta**: Il Captain assegna un utente a un segmento
2. **Self-assignment**: Il runner si assegna a un segmento libero
3. **Invito con codice**: Il Captain genera un codice invito

### Self-Assignment

```
Segmento libero → Runner clicca "Assegnati" → Runner aggiunto a runners[]
```

### Logica UI

```javascript
// In IndexPage.vue
const canAssignToMe = (segment) => {
  // Non assegnato a nessuno
  if (!segment.assignedRunnerId) return true;
  // Assegnato a me stesso
  return segment.assignedRunnerId === user.value?.uid;
};
```

---

## Codici Invito

### Generazione

Il Captain può generare un codice invito per ogni segmento:

```javascript
const generateInviteCode = (segmentId) => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  // Salva nel team
  await updateDoc(doc(db, "teams", teamId), {
    [`invitationCodes.${segmentId}`]: code
  });
  // Copia negli appunti
  await navigator.clipboard.writeText(code);
};
```

### Utilizzo

Il codice viene condiviso con il runner che vuole partecipare. Il runner:
1. Va su /team
2. Inserisce il codice
3. Viene aggiunto al team nel segmento corretto

---

## Segmenti

### Tipi di Segmento

| Tipo | Descrizione | Gestione Pace |
|------|-------------|---------------|
| `solo` | Un solo runner | Pace personale |
| `group` | Runner multipli | Pace di gruppo |

### Gestione Pace

#### Segmenti Solo

Ogni runner imposta la propria pace:
```
Runner A: 5:30 min/km
Runner B: 6:00 min/km
```

#### Segmenti Group

Il Captain imposta una pace di gruppo:
```
Segmento 2 (group): 5:45 min/km (per tutti i runner del segmento)
```

---

## Calcolo Tempi

### Formula

```
tempo_segmento = distanza_segmento × pace
arrivo_segmento_n = partenza + somma(tempo_segmenti_1...n)
```

### Visualizzazione

La timeline mostra:
- Orario di partenza pianificato
- Orario di partenza reale
- Tempo di percorrenza per ogni segmento
- Orario di arrivo previsto

---

## Eliminazione Team

### Regole

| Chi | Può eliminare |
|-----|---------------|
| Captain | Il proprio team |
| Global Admin | Qualsiasi team |
| Race Admin | Team della propria race |

### Cascade

L'eliminazione del team rimuove solo il documento team. I profili utente non vengono modificati.

---

## Team Multipli

Un utente può:
- Essere Captain di più team
- Essere Membro di più team
- Essere Captain di un team e Membro di altri

---

## Note

- I segmenti sono definiti nella race, non nel team
- Il team eredita la struttura dei segmenti dalla race
- La modifica dei segmenti nella race non influenza team già creati

Vedi anche: [Team Captain](../roles/team-captain.md), [Team Member](../roles/team-member.md), [Race Management](race-management.md)