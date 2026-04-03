# Firebase Setup

Il progetto Firebase "milano-relay-marathon" e' gia' configurato con l'app web "Milano Relay Marathon Timing".

## Configurazione attuale

1. **Authentication**: Provider Google abilitato
2. **Firestore**: Database creato
3. **Security Rules**: Aggiornate come da file [firestore.rules](firestore.rules)
4. **Admin User**: giovanni.prinetti@gmail.com con custom claims admin

## Firestore Security Rules

Le regole attuali sono in [firestore.rules](firestore.rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /teams/{teamId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null
        && (request.auth.token.admin == true || request.auth.uid == resource.data.captainId);
    }

    match /races/{raceId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    match /config/{docId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    match /appointments/{appointmentId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && request.auth.token.admin == true;
    }

    match /faq/{faqId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && request.auth.token.admin == true;
    }

    match /help/{helpId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

Per impostare gli admin, vedi [CUSTOM_CLAIMS_SETUP.md](CUSTOM_CLAIMS_SETUP.md).

## Configurazione iniziale

Dopo aver completato il setup, accedi all'app come admin e usa il pannello Admin per:

1. Creare le gare (es. Milano Relay Marathon)
2. Definire le tappe con distanze
3. Configurare appuntamenti, FAQ e help

### Esempio di gara

- Nome: `Milano Relay`
- Luogo: `Milano`
- Data: `2026-04-12`
- Orario: `09:15`
- Ritardo default: `3` minuti
- Tappe:
  - `Sempione - Pagano` `13 km` `solo`
  - `Pagano - Lotto` `9.8 km` `solo`
  - `Lotto - Uruguay` `6.8 km` `solo`
  - `Uruguay - Cavour` `12.6 km` `solo`
  - `Cavour - Palestro` `0.4 km` `group`

## Riferimenti

- [DOCUMENTAZIONE.md](DOCUMENTAZIONE.md)
- [CUSTOM_CLAIMS_SETUP.md](CUSTOM_CLAIMS_SETUP.md)
