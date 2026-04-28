---
title: Modello Dati
description: Schema completo delle collezioni Firestore in MM26
tags: [firestore, database, schema, data-model, collections]
---

# Modello Dati - Firestore

## Collezioni

L'app utilizza le seguenti collezioni Firestore:

| Collezione | Descrizione | Leggibile | Scrivibile |
|------------|-------------|-----------|------------|
| `users` | Profili utente | Proprio doc | Proprio doc |
| `races` | Gare | Pubblico | Global/Race Admin |
| `teams` | Squadre | Pubblico | Auth users |
| `appointments` | Appuntamenti | Pubblico | Global Admin |
| `faq` | FAQ | Pubblico | Global Admin |
| `help` | Help | Pubblico | Global Admin |
| `routes` | Percorsi | Pubblico | Global Admin |
| `adminRequests` | Richieste admin | Global Admin | Auth users |

---

## Struttura Documenti

### `races/{raceId}`

```json
{
  "name": "Milano Relay Marathon 2026",
  "location": "Milano",
  "startLocation": "Parco Sempione",
  "date": "2026-05-15",
  "startTime": "08:00",
  "defaultStartDelay": 0,
  "isDefault": true,
  "routeEmbedCode": "<iframe src='...'>",
  "adminUids": ["uid1", "uid2"],
  "segments": [
    {
      "id": "segment-1",
      "name": "Tappa 1",
      "distance": 5.2,
      "type": "solo"
    },
    {
      "id": "segment-2", 
      "name": "Tappa 2",
      "distance": 3.8,
      "type": "group"
    }
  ]
}
```

#### Campi

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `name` | string | Nome della gara |
| `location` | string | Luogo |
| `startLocation` | string | Luogo partenza |
| `date` | string | Data (YYYY-MM-DD) |
| `startTime` | string | Orario partenza (HH:MM) |
| `defaultStartDelay` | number | Ritardo default (minuti) |
| `isDefault` | boolean | Se true, gara predefinita |
| `routeEmbedCode` | string | Embed code mappa |
| `adminUids` | array[string] | UID degli admin della gara |
| `segments` | array[object] | Segmenti/tappe della gara |

#### Segmenti

| Campo | Tipo | Valori |
|-------|------|--------|
| `id` | string | ID univoco segmento |
| `name` | string | Nome visualizzato |
| `distance` | number | Distanza in km |
| `type` | string | `"solo"` o `"group"` |

---

### `teams/{teamId}`

```json
{
  "name": "Running Team Milano",
  "captainId": "user-uid-123",
  "raceId": "race-uid-456",
  "startDelay": 0,
  "hasCustomStartDelay": false,
  "runners": [
    {
      "id": "user-uid-123",
      "segmentId": "segment-1",
      "name": "Mario Rossi"
    },
    {
      "id": "user-uid-456", 
      "segmentId": "segment-2",
      "name": "Luca Bianchi"
    }
  ],
  "groupPaces": {
    "segment-2": 5.5
  },
  "invitationCodes": {
    "segment-2": "ABC123"
  }
}
```

#### Campi

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `name` | string | Nome team |
| `captainId` | string | UID del capitano |
| `raceId` | string | UID della gara |
| `startDelay` | number | Ritardo partenza custom |
| `hasCustomStartDelay` | boolean | Se usa ritardo custom |
| `runners` | array[object] | Runner assegnati ai segmenti |
| `groupPaces` | object | Pace di gruppo per segmenti |
| `invitationCodes` | object | Codici invito per segmento |

#### Runner

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | string | UID dell'utente |
| `segmentId` | string | ID segmento assegnato |
| `name` | string | Nome runner |

---

### `users/{userId}`

```json
{
  "email": "user@example.com",
  "displayName": "Mario Rossi",
  "photoURL": "https://...",
  "createdAt": "2026-01-15T10:30:00Z",
  "updatedAt": "2026-04-20T14:00:00Z"
}
```

#### Campi

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `email` | string | Email utente |
| `displayName` | string | Nome visualizzato |
| `photoURL` | string | URL foto profilo |
| `createdAt` | timestamp | Data creazione |
| `updatedAt` | timestamp | Ultimo aggiornamento |

---

### `appointments/{appointmentId}`

```json
{
  "title": "Briefing Squadre",
  "titleEn": "Team Briefing",
  "date": "2026-05-14",
  "time": "18:00",
  "location": "Piazza Duomo",
  "locationEn": "Duomo Square",
  "description": "Presentazione per tutti i capitani",
  "descriptionEn": "Presentation for all captains",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

---

### `faq/{faqId}`

```json
{
  "question": "Come funziona la gara?",
  "questionEn": "How does the race work?",
  "answer": "La gara consiste in...",
  "answerEn": "The race consists of...",
  "hidden": false,
  "order": 0,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

---

### `help/{helpId}`

```json
{
  "title": "Come iscriversi",
  "titleEn": "How to register",
  "body": "Istruzioni dettagliate...",
  "bodyEn": "Detailed instructions...",
  "hidden": false,
  "order": 0,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

---

### `routes/{routeId}`

```json
{
  "raceId": "race-uid-456",
  "name": "Percorso Milano 2026",
  "embedCode": "<iframe src='...'>",
  "isDefault": true,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

---

### `adminRequests/{requestId}`

```json
{
  "userId": "user-uid-123",
  "userEmail": "user@example.com",
  "raceId": "race-uid-456",
  "raceName": "Milano Relay Marathon",
  "requestType": "race_admin",
  "status": "pending",
  "createdAt": "2026-04-20T10:00:00Z"
}
```

---

## Note Importanti

1. **Multi-race support**: Il sistema supporta multiple gare. La gara "default" (`isDefault: true`) viene selezionata automaticamente.

2. **Ruoli multipli**: Un utente può essere:
   - Global Admin (custom claim `admin: true`)
   - Race Admin di più race (presente in `adminUids[]`)
   - Captain di più team (presente come `captainId`)
   - Membro di più team (presente in `runners[]`)

3. **Codici invito**: Ogni segmento può avere un codice invito univoco per invitare runner esterni.

Vedi anche: [Firestore Rules](../security/firestore-rules.md), [Roles Overview](../roles/overview.md)