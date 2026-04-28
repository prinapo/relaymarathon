---
title: Documentation Index
description: MM26 documentation entry point - navigazione completa per sviluppatori e AI
tags: [mm26, documentation, overview, quick-start]
---

# MM26 Documentation

> App Quasar + Firebase per la gestione della Milano Relay Marathon

## Quick Navigation

### Per Ruolo
- [Global Admin](roles/global-admin.md) - Amministratore sistema
- [Race Admin](roles/race-admin.md) - Amministratore gara specifica
- [Team Captain](roles/team-captain.md) - Capitano squadra
- [Team Member](roles/team-member.md) - Membro squadra

### Per Tema
- [Architettura](architecture/overview.md) - Stack tecnologico
- [Struttura Progetto](architecture/project-structure.md) - Cartelle e file
- [Modello Dati](architecture/data-model.md) - Schema Firestore
- [Autenticazione](security/authentication.md) - Login Google/Email
- [Firestore Rules](security/firestore-rules.md) - Regole di sicurezza
- [Gestione Squadre](features/team-management.md) - Team e runner
- [Gestione Gare](features/race-management.md) - Races e segmenti
- [Admin Panel](features/admin-panel.md) - Funzionalità admin
- [Quick Start](deployment/quick-start.md) - Setup sviluppo
- [Build Commands](deployment/build-commands.md) - Comandi build
- [Android](deployment/android.md) - Build Android
- [Web Deploy](deployment/web.md) - Deploy FTP

---

## Panoramica Rapida

| Componente | Tecnologia |
|------------|------------|
| Frontend | Quasar 2 + Vue 3 |
| Backend | Firebase Auth + Firestore |
| Mobile | Capacitor (Android/iOS) |
| Router | Vue Router (hash mode) |
| Build | Quasar App Vite |

**Link rapido**: [Stack completo](architecture/overview.md)

---

## Indice Contenuti

```
docs/
├── index.md                    # ← Tu sei qui
├── architecture/
│   ├── overview.md             # Stack, architettura
│   ├── project-structure.md    # Struttura cartelle
│   └── data-model.md           # Schema Firestore
├── roles/
│   ├── overview.md             # Matrice ruoli
│   ├── global-admin.md         # Dettagli global admin
│   ├── race-admin.md           # Dettagli race admin
│   ├── team-captain.md         # Dettagli capitano
│   └── team-member.md          # Dettagli membro
├── security/
│   ├── authentication.md       # Login Google, email
│   └── firestore-rules.md      # Regole accesso
├── features/
│   ├── team-management.md      # Gestione squadre
│   ├── race-management.md      # Gestione gare
│   └── admin-panel.md          # Admin panel
└── deployment/
    ├── quick-start.md          # Setup sviluppo
    ├── build-commands.md       # Comandi build
    ├── android.md              # Build Android
    └── web.md                  # Deploy web
```

---

## Informazioni Chiave per AI

### Domande Frequenti

**Q: Come funziona il sistema di ruoli?**
> Vedi [Roles Overview](roles/overview.md) - Un utente può avere ruoli multipli simultaneamente (es. Global Admin + Race Admin + Captain).

**Q: Quali sono le regole di sicurezza Firestore?**
> Vedi [Firestore Rules](security/firestore-rules.md) - Le regole si basano su custom claims (`admin`) e campi nei documenti (`adminUids`, `captainId`).

**Q: Come faccio il build per Android?**
> Vedi [Android Build](deployment/android.md) - `quasar build -m capacitor -T android`

**Q: Dove sono le variabili ambiente?**
> File `.env` con prefisso `VITE_`. Vedi [Quick Start](deployment/quick-start.md).