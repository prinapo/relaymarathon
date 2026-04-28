---
title: Full User Test Plan
description: Checklist completa per verificare tutti i flussi dell'app
tags: [testing, user-test, e2e, playwright]
---

# Full User Test Plan

Questa checklist completa serve per verificare i flussi principali dell'app lato utente e admin.

## Playwright E2E Tests

Il progetto include test E2E con Playwright.

### Struttura

```
tests/e2e/
  └── login.spec.js    # Test login, home, team
```

### Account di test

```
# Account 1 (captain)
prova@gmail.com
prova_prova

# Account 2 (runner)
riprova@gmail.com
riprova!!
```

### Comandi

```bash
# Installa browser Playwright
npx playwright install chromium

# Esegui tutti i test
npx playwright test

# Esegui test specifici
npx playwright test tests/e2e/login.spec.js
npx playwright test tests/e2e/home.spec.js
npx playwright test tests/e2e/team.spec.js
npx playwright test tests/e2e/admin.spec.js

# Esegui con UI interattiva
npx playwright test --ui

# Esegui con debug
npx playwright test --debug
```

### Note

- I test richiedono che `npm run dev` sia attivo (porta 9000)
- Playwright configurato in `playwright.config.js`
- Alcuni test dipendono da dati reali (gare, team) nel database
- I test di login richiedono account di test pre-creati

---

## Dati di test consigliati

Usa almeno queste 2 gare:

**1. Milano Relay**
- Luogo: `Milano`
- Data: `2026-04-12`
- Ora: `09:15`
- Delay default: `3`
- Tappe:
  - Sempione - Pagano: 13 km (solo)
  - Pagano - Lotto: 9.8 km (solo)
  - Lotto - Uruguay: 6.8 km (solo)
  - Uruguay - Cavour: 12.6 km (solo)
  - Cavour - Palestro: 0.4 km (group)

**2. Roma Relay**
- Luogo: `Roma`
- Data: `2026-05-10`
- Ora: `08:30`
- Delay default: `5`
- Tappe:
  - Fori - Colosseo: 10 km (solo)
  - Colosseo - EUR: 11 km (solo)
  - EUR - Arrivo: 1 km (group)

---

## Tabella Test

| ID  | Area | Scenario | Passi | Atteso | Esito | Note |
| --- | ---- | -------- | ----- | ------ | ----- | ---- |
| T01 | Admin | Creazione gara nuova | Vai in Admin, clicca `Aggiungi gara` | Si apre subito in modifica con una prima tappa già presente | | |
| T02 | Admin | Campi obbligatori gara | Lascia vuoti nome, luogo, data o ora e prova `Fine modifica` | Non esce dall'editing e mostra errore/notify | | |
| T03 | Admin | Distanza tappa non valida | Apri popup tappa, metti distanza `0`, salva | Il popup non salva e segnala errore | | |
| T04 | Admin | Autosave campi gara | Modifica nome gara, aspetta 1 secondo, ricarica | Il nuovo nome resta salvato | | |
| T05 | Admin | Autosave tappa | Modifica nome/distanza/tipo di una tappa da popup, conferma, ricarica | I dati della tappa restano salvati | | |
| T06 | Admin | Aggiunta tappa | In editing clicca `+` su una riga | Viene inserita una nuova tappa e si apre il popup di modifica | | |
| T07 | Admin | Rimozione tappa | In editing clicca `-` su una tappa e conferma | La tappa viene rimossa | | |
| T08 | Admin | Blocco rimozione ultima tappa | Lascia una sola tappa e prova a rimuoverla | La rimozione viene bloccata con messaggio | | |
| T09 | Admin | Annulla gara nuova | Crea nuova gara, non compilare, clicca `Annulla` | La gara nuova viene eliminata dalla lista | | |
| T10 | Admin | Annulla modifica gara esistente | Modifica gara esistente, poi `Annulla` | Le modifiche non salvate vengono scartate | | |
| T11 | Admin | Colore tabella in editing | Entra in modifica gara | La tabella tappe diventa verde | | |
| T12 | Admin | Gara default | Imposta una gara come default | La lista mostra il badge `default` sulla gara corretta | | |
| T13 | Admin | Cancellazione gara senza team | Cancella una gara non usata da team | La gara viene eliminata | | |
| T14 | Admin | Blocco cancellazione gara usata | Crea un team collegato a una gara, poi prova a cancellarla | La cancellazione viene bloccata | | |
| T15 | Home | Scelta gara iniziale | Vai in Home con almeno 2 gare presenti | Compare il selettore gara | | |
| T16 | Home | Cambio gara | In Home seleziona `Milano`, poi `Roma` | Cambiano start time, delay e tappe mostrate | | |
| T17 | Home | Nessun team sulla gara scelta | Seleziona una gara senza team dell'utente | La Home resta comunque sulla gara | | |
| T18 | Home | Team filtrati per gara | Se hai più team in gare diverse, cambia gara | Il selettore team mostra solo i team di quella gara | | |
| T19 | Home | Singolo team per gara | Se c'è un solo team nella gara selezionata | Il team corretto viene preso automaticamente | | |
| T20 | Home | Utente anonimo persistente | Da non loggato imposta nomi/passi su una gara, ricarica | Ritrovi i dati locali della stessa gara | | |
| T21 | Home | Local storage separato per gara | Da non loggato imposta dati diversi su `Milano` e `Roma`, cambia gara e ricarica | Ogni gara mantiene i suoi valori locali | | |
| T22 | Home | Popup modifica runner solo | Clicca una riga `solo` in tabella risultati | Si apre popup con nome, min, sec | | |
| T23 | Home | Popup modifica group | Clicca una riga `group` in tabella risultati | Si apre popup senza nome, solo min/sec | | |
| T24 | Home | Autosave team da capitano | Da capitano modifica nome/pace/start delay, ricarica | I dati restano salvati nel team | | |
| T25 | Home | Lettura sola per runner | Da runner non capitano apri una gara del team | Non puoi modificare configurazione e compare notify di sola lettura | | |
| T26 | Home | Formato ora | Controlla la colonna `Ora` | Mostra `h:mm` o `hh:mm`, senza secondi, allineata a destra | | |
| T27 | Home | Formato durata | Controlla la colonna `Durata` | Mostra `m:ss` sotto 1h e `h:mm:ss` sopra 1h | | |
| T28 | Home | Formato passo | Inserisci un passo `5:40` | In tabella compare `5:40`, non decimale | | |
| T29 | Home | Calcolo partenza reale | Start `09:15`, delay `3` | `Partenza Reale` deve essere `9:18` | | |
| T30 | Home | Calcolo arrivo tappa | Su `13 km` a `5:00/km` con start reale `9:18` | Arrivo deve essere `10:23` | | |
| T31 | Team | Creazione team su gara specifica | In pagina Team crea un team scegliendo `Roma Relay` | Il team nasce collegato a `Roma Relay` | | |
| T32 | Team | Join tramite invito tappa solo | Genera codice invito di una tappa `solo`, entra con altro utente | L'utente viene assegnato a quel segmento | | |
| T33 | Team | Nessun invito su group | Gara con sola tappa `group` o tratto finale `group` | Gli inviti compaiono solo per le tappe `solo` | | |
| T34 | Team | Multi-team utente | Lo stesso utente entra in due team su due gare diverse | In Team page può selezionare entrambi i team | | |
| T35 | Team | Capitano in una gara, runner in un'altra | Utente A crea un team su Milano e entra come runner su Roma | Il ruolo mostrato cambia correttamente in base al team attivo | | |
| T36 | Team/Home | Cambio gara cambia team attivo | In Home cambia gara quando l'utente ha team in più gare | Il contesto team segue la gara selezionata | | |
| T37 | Sicurezza UI | Admin non loggato | Apri `/admin` da non autenticato | Redirect a login | | |
| T38 | Sicurezza UI | Utente non admin | Accedi con utente normale e apri `/admin` | Redirect a home | | |
| T39 | Traduzioni | Cambio lingua | Passa da IT a EN | Home, Team e Admin cambiano lingua | | |
| T40 | Regressione generale | Refresh completo | Dopo aver lavorato su gara/team/home fai refresh completo | Nessun errore bloccante, pagina consistente | | |
| T41 | Appointments | Filtraggio per gara | Seleziona Milano Relay, verifica che solo gli appuntamenti di Milano siano visibili | Solo gli appuntamenti associati a Milano Relay sono mostrati | | |
| T42 | FAQs | Filtraggio per gara | Seleziona Roma Relay, verifica che solo le FAQ di Roma siano visibili | Solo le FAQ associate a Roma Relay sono mostrate | | |
| T43 | Help | Filtraggio per gara | Seleziona Milano Relay, poi Roma Relay, verifica cambio contenuto help | Il contenuto help cambia in base alla gara selezionata | | |
| T44 | Race Switching | Contenuti misti | Crea contenuti per entrambe le gare, cambia gara, verifica isolamento | Ogni gara mostra solo i propri contenuti, nessun mescolamento | | |

---

## Casi critici da osservare bene

- Cambio gara quando l'utente appartiene a team diversi
- Cambio gara da anonimo con dati locali diversi per gara
- Gara nuova annullata subito dopo creazione
- Modifica rapida di più tappe di seguito con autosave
- Riapertura pagina dopo refresh completo
- Validazione tappa `group` con distanza positiva

---

## Note finali

Se trovi un bug, annota almeno:
- ID test
- gara selezionata
- utente usato
- team attivo
- comportamento atteso
- comportamento reale

---

## Versioni disponibili

- Checklist completa: questo file
- Smoke test rapido: [Smoke Tests](smoke-tests.md)