---
title: Smoke Test Plan
description: Checklist rapida per verificare i flussi principali dopo modifiche
tags: [testing, smoke-test, checklist]
---

# Smoke Test Plan

Questa checklist rapida serve per verificare in pochi minuti che i flussi più importanti siano ancora sani dopo una modifica.

## Dati minimi consigliati

Usa almeno:
- 2 gare
- 1 team su gara A
- 1 team su gara B
- 1 utente admin/capitano
- 1 utente runner

## Smoke Test

| ID | Area | Test rapido | Atteso | Esito | Note |
|---|---|---|---|---|---|
| S01 | Admin | Apri Admin e seleziona una gara | La gara si carica senza errori | | |
| S02 | Admin | Clicca `Modifica gara` | Entri in editing e la tabella tappe diventa verde | | |
| S03 | Admin | Modifica una tappa da popup e conferma | La modifica si salva e resta dopo refresh | | |
| S04 | Admin | Aggiungi una tappa con `+` | La nuova tappa compare e può essere compilata | | Verificato da codice: `addSegment` |
| S05 | Admin | Lascia una distanza a `0` e prova a chiudere | Il sistema blocca il salvataggio/uscita | | Verificato da codice |
| S06 | Home | Apri Home con almeno 2 gare | Compare il selettore gara | | |
| S07 | Home | Cambia gara | Cambiano contesto, tappe e dati mostrati | | |
| S08 | Home | Clicca una riga `solo` nei risultati | Si apre popup con nome, min, sec | | |
| S09 | Home | Verifica formato tabella | `Ora` a destra senza secondi, `Durata` a destra, `Passo` in `m:ss` | | |
| S10 | Team | Apri pagina Team e cambia team attivo | Il team cambia correttamente | | |
| S11 | Team | Genera un codice invito per una tappa `solo` | Il codice viene mostrato e resta salvato | | |
| S12 | Accessi | Accedi come utente non admin e prova `/admin` | Nessun accesso alla pagina admin | | |
| S13 | Appointments | Verifica filtraggio per gara | Solo gli appuntamenti della gara selezionata sono visibili | | |
| S14 | FAQs | Verifica filtraggio per gara | Solo le FAQ della gara selezionata sono visibili | | |
| S15 | Help | Verifica filtraggio per gara | Solo l'aiuto della gara selezionata è visibile | | |

## Quando usarla

Usa questa smoke test:
- dopo modifiche UI alla home
- dopo modifiche alla logica multi-gara
- dopo modifiche alla gestione team/inviti
- prima di una demo

## Se uno smoke test fallisce

Passa alla checklist completa: [User Test Plan](user-test-plan.md)