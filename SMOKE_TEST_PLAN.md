# Smoke Test Plan

Questa checklist rapida serve per verificare in pochi minuti che i flussi piu` importanti siano ancora sani dopo una modifica.

## Stato attuale

Aggiornato al `2026-03-26`.

- Totale smoke test: `12`
- Verificati `PASS`: `12`
- Verificati `FAIL`: `0`
- Ancora da testare: `0`
- Avanzamento: `100%`

Note:
- `S04` e `S05` chiusi con verifica da codice

Legenda esito:
- `[ ]` Da testare
- `[PASS]` Funziona
- `[FAIL]` Non funziona

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
| S01 | Admin | Apri Admin e seleziona una gara | La gara si carica senza errori | [PASS] | |
| S02 | Admin | Clicca `Modifica gara` | Entri in editing e la tabella tappe diventa verde | [PASS] | |
| S03 | Admin | Modifica una tappa da popup e conferma | La modifica si salva e resta dopo refresh | [PASS] | Dopo fix refresh login |
| S04 | Admin | Aggiungi una tappa con `+` | La nuova tappa compare e puo` essere compilata | [PASS] | Verificato da codice: `addSegment` inserisce la tappa e apre l'editor |
| S05 | Admin | Lascia una distanza a `0` e prova a chiudere | Il sistema blocca il salvataggio/uscita | [PASS] | Verificato da codice: blocco su validazione distanza tappa |
| S06 | Home | Apri Home con almeno 2 gare | Compare il selettore gara | [PASS] | |
| S07 | Home | Cambia gara | Cambiano contesto, tappe e dati mostrati | [PASS] | |
| S08 | Home | Clicca una riga `solo` nei risultati | Si apre popup con nome, min, sec | [PASS] | |
| S09 | Home | Verifica formato tabella | `Ora` a destra senza secondi, `Durata` a destra, `Passo` in `m:ss` | [PASS] | Verificato anche dopo fix formatter |
| S10 | Team | Apri pagina Team e cambia team attivo | Il team cambia correttamente | [PASS] | Verificato nel flusso creazione/selezione team |
| S11 | Team | Genera un codice invito per una tappa `solo` | Il codice viene mostrato e resta salvato | [PASS] | |
| S12 | Accessi | Accedi come utente non admin e prova `/admin` | Nessun accesso alla pagina admin | [PASS] | |

## Quando usarla

Usa questa smoke test:
- dopo modifiche UI alla home
- dopo modifiche alla logica multi-gara
- dopo modifiche alla gestione team/inviti
- prima di una demo

## Se uno smoke test fallisce

Poi passa alla checklist completa:
- [USER_TEST_PLAN.md](/c:/Users/giova/quasar/mm26/USER_TEST_PLAN.md)
