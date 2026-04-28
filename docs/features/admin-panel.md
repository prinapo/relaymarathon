---
title: Admin Panel
description: Funzionalità del pannello di amministrazione MM26
tags: [admin, admin-panel, admin-page, management]
---

# Admin Panel

## Panoramica

Il pannello di amministrazione (`/admin`) è accessibile solo ai **Global Admin** (utenti con custom claim `admin: true`).

---

## Accesso

### Protezione Route

```javascript
// src/router/index.js
{
  path: '/admin',
  component: () => import('pages/AdminPage.vue'),
  meta: { requiresAuth: true, requiresAdmin: true }
}
```

### Verifica Permessi

```javascript
// In AdminPage.vue
const isAdmin = computed(() => userClaims.value?.admin === true);
```

Se un utente senza permessi admin tenta di accedere a `/admin`, viene reindirizzato alla home.

---

## Schede Disponibili

### Tab Races

| Funzionalità | Descrizione |
|--------------|-------------|
| Seleziona race | Dropdown per scegliere quale race modificare |
| Crea nuova race | Pulsante per creare una nuova gara |
| Modifica dati | Modifica nome, location, date, orari |
| Gestione segmenti | Aggiungi/rimuovi/modifica segmenti |
| Imposta predefinita | Rende una race quella predefinita |

### Tab Race Admins

| Funzionalità | Descrizione |
|--------------|-------------|
| Visualizza admin | Mostra gli admin di ogni race |
| Aggiungi admin | Aggiunge un utente come admin della race |
| Rimuovi admin | Rimuove un admin dalla race |

**Nota**: Questa tab è visibile SOLO ai Global Admin.

### Tab Translations

| Funzionalità | Descrizione |
|--------------|-------------|
| Appointments | CRUD appuntamenti (IT/EN) |
| FAQ | CRUD FAQ (IT/EN) |
| Help | CRUD help (IT/EN) |

---

## Gestione Race

### Creazione Nuova Race

```javascript
const handleCreateRace = async () => {
  await createRace({
    name: "Nuova Gara",
    location: "",
    date: "",
    startTime: "08:00",
    defaultStartDelay: 0,
    segments: [createSegment(1)]
  });
};
```

### Modifica Race

I campi modificabili:
- Nome
- Location
- Start Location
- Data
- Orario partenza
- Ritardo default
- Embed code percorso
- Segmenti

### Segmenti

Ogni segmento ha:
- Nome
- Distanza (km)
- Tipo (`solo` o `group`)

---

## Gestione Race Admin

### Aggiungi Admin

```
1. Selezionare la race
2. Inserire UID o email dell'utente
3. Cliccare "Aggiungi Admin"
```

### Rimovi Admin

```
1. Selezionare la race
2. Cliccare "Rimuovi" accanto all'admin
```

---

## Gestione Contenuti Bilingue

Tutti i contenuti supportano italiano e inglese:

| Campo IT | Campo EN |
|----------|----------|
| title | titleEn |
| question | questionEn |
| answer | answerEn |
| description | descriptionEn |

### Struttura Appointment

```javascript
{
  title: "Briefing Squadre",
  titleEn: "Team Briefing",
  date: "2026-05-14",
  time: "18:00",
  location: "Piazza Duomo",
  locationEn: "Duomo Square",
  description: "...",
  descriptionEn: "..."
}
```

---

## Note

- Le modifiche sono salvate automaticamente (auto-save)
- Il pannello richiede connessione a Firestore
- Le modifiche sono in tempo reale per tutti gli utenti
- Race Admin può vedere i dati della propria race ma non modificarli da qui

Vedi anche: [Global Admin](../roles/global-admin.md), [Race Admin](../roles/race-admin.md), [Race Management](race-management.md)