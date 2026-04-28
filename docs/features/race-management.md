---
title: Gestione Gare
description: Funzionalità di gestione gare (races) e segmenti in MM26
tags: [race, races, segment, stage, race-management]
---

# Gestione Gare

## Panoramica

Le **Race** rappresentano le gare organizzate. Ogni race ha:
- Dati anagrafici (nome, location, data)
- Configurazione (orario partenza, ritardo)
- Segmenti/tappe (distinte per tipo e distanza)
- Admin dedicati

---

## Struttura Race

```javascript
{
  name: "Milano Relay Marathon 2026",
  location: "Milano",
  startLocation: "Parco Sempione",
  date: "2026-05-15",
  startTime: "08:00",
  defaultStartDelay: 0,
  isDefault: true,
  routeEmbedCode: "<iframe src='...'>",
  adminUids: ["uid1", "uid2"],
  segments: [
    { id: "seg-1", name: "Tappa 1", distance: 5.2, type: "solo" },
    { id: "seg-2", name: "Tappa 2", distance: 3.8, type: "group" }
  ]
}
```

---

## Creazione Race

### Requisiti

Solo il **Global Admin** può creare nuove race.

### Dati Necessari

| Campo | Obbligatorio | Descrizione |
|-------|--------------|-------------|
| name | ✅ | Nome della gara |
| location | ✅ | Luogo |
| date | ✅ | Data (YYYY-MM-DD) |
| startTime | ✅ | Orario partenza (HH:MM) |
| segments | ✅ | Almeno un segmento |

---

## Segmenti

### Struttura

```javascript
{
  id: "segment-1",
  name: "Tappa 1",
  distance: 5.2,    // km
  type: "solo"      // "solo" | "group"
}
```

### Tipi di Segmento

| Tipo | Descrizione |
|------|-------------|
| `solo` | Un solo runner per segmento. Ogni runner ha la propria pace. |
| `group` | Runner multipli. Il Captain imposta una pace di gruppo. |

### Gestione Segmenti

Solo il **Global Admin** e il **Race Admin** della race possono modificare i segmenti.

Operazioni:
- Aggiungere segmento
- Rimuovere segmento
- Modificare nome
- Modificare distanza
- Modificare tipo

---

## Race Predefinita

### Definizione

Una race può essere impostata come **predefinita** (`isDefault: true`).

Quando un utente non autenticato o nuovo apre l'app, viene mostrata la race predefinita.

### Cambio Race Predefinita

```javascript
const setDefaultRace = async (raceId) => {
  const races = await getRaces();
  const batch = writeBatch(db);
  
  races.forEach((race) => {
    batch.update(doc(db, "races", race.id), {
      isDefault: race.id === raceId
    });
  });
  
  await batch.commit();
};
```

---

## Race Admin

### Assegnazione

Il Global Admin può assegnare uno o più admin a una race:

```javascript
// Aggiungere admin
await updateDoc(doc(db, "races", raceId), {
  adminUids: arrayUnion(adminUid)
});

// Rimuovere admin
await updateDoc(doc(db, "races", raceId), {
  adminUids: arrayRemove(adminUid)
});
```

### Permessi Race Admin

| Azione | Race Admin |
|--------|------------|
| Modificare race | ✅ |
| Gestire segmenti | ✅ |
| Modificare date/orari | ✅ |
| CRUD contenuti | ❌ |
| Eliminare race | ❌ |

---

## Percorso (Routes)

### Embed Google Maps

Il campo `routeEmbedCode` contiene un iframe Google Maps:

```html
<iframe 
  src="https://www.google.com/maps/embed?..." 
  width="600" height="450" style="border:0;" 
  allowfullscreen="" loading="lazy">
</iframe>
```

### Visualizzazione

La pagina `/route` mostra il percorso embedato per la race selezionata.

---

## Eliminazione Race

### Regole

Solo il **Global Admin** può eliminare una race.

### Comportamento

- Se la race eliminata era quella predefinita, un'altra race diventa predefinita
- I team associati alla race NON vengono eliminati (orphan teams)
- I segmenti eliminati non hanno effetto sui team esistenti

---

## Note

- Le race sono **pubbliche**: chiunque può leggere i dati
- Solo Global Admin può creare/eliminare race
- Race Admin può solo modificare la propria race
- I segmenti sono centralizzati nella race, non nel team

Vedi anche: [Race Admin](../roles/race-admin.md), [Global Admin](../roles/global-admin.md), [Team Management](team-management.md)