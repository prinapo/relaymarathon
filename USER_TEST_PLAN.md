# Full User Test Plan

Questa checklist completa serve per verificare i flussi principali dell'app lato utente e admin.

## Stato attuale

Aggiornato al `2026-03-26`.

- Totale casi: `40`
- Verificati `PASS`: `40`
- Verificati `FAIL`: `0`
- Ancora da testare: `0`
- Avanzamento `PASS`: `100%`

Legenda esito:

- `[ ]` Da testare
- `[PASS]` Funziona
- `[FAIL]` Non funziona
- `Note` per annotare comportamento osservato o bug

## Dati di test consigliati

Usa almeno queste 2 gare:

1. `Milano Relay`

   - Luogo: `Milano`
   - Data: `2026-04-12`
   - Ora: `09:15`
   - Delay default: `3`
   - Tappe:
     - `Sempione - Pagano` `13 km` `solo`
     - `Pagano - Lotto` `9.8 km` `solo`
     - `Lotto - Uruguay` `6.8 km` `solo`
     - `Uruguay - Cavour` `12.6 km` `solo`
     - `Cavour - Palestro` `0.4 km` `group`

2. `Roma Relay`
   - Luogo: `Roma`
   - Data: `2026-05-10`
   - Ora: `08:30`
   - Delay default: `5`
   - Tappe:
     - `Fori - Colosseo` `10 km` `solo`
     - `Colosseo - EUR` `11 km` `solo`
     - `EUR - Arrivo` `1 km` `group`

## Tabella Test

| ID  | Area                 | Scenario                                 | Passi                                                                            | Atteso                                                                 | Esito  | Note                                                                                                   |
| --- | -------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| T01 | Admin                | Creazione gara nuova                     | Vai in Admin, clicca `Aggiungi gara`                                             | Si apre subito in modifica con una prima tappa gia` presente           | [PASS] |                                                                                                        |
| T02 | Admin                | Campi obbligatori gara                   | Lascia vuoti nome, luogo, data o ora e prova `Fine modifica`                     | Non esce dall'editing e mostra errore/notify                           | [PASS] | Verificato da codice: `endEdit` resta bloccato se `validationErrors` non e` vuoto                      |
| T03 | Admin                | Distanza tappa non valida                | Apri popup tappa, metti distanza `0`, salva                                      | Il popup non salva e segnala errore                                    | [PASS] | Verificato da codice: `saveSegmentDialog` blocca distanze `<= 0`                                       |
| T04 | Admin                | Autosave campi gara                      | Modifica nome gara, aspetta 1 secondo, ricarica                                  | Il nuovo nome resta salvato                                            | [PASS] |                                                                                                        |
| T05 | Admin                | Autosave tappa                           | Modifica nome/distanza/tipo di una tappa da popup, conferma, ricarica            | I dati della tappa restano salvati                                     | [PASS] |                                                                                                        |
| T06 | Admin                | Aggiunta tappa                           | In editing clicca `+` su una riga                                                | Viene inserita una nuova tappa e si apre il popup di modifica          | [PASS] | Verificato da codice: `addSegment` inserisce la tappa e apre `openSegmentEditor`                       |
| T07 | Admin                | Rimozione tappa                          | In editing clicca `-` su una tappa e conferma                                    | La tappa viene rimossa                                                 | [PASS] | Verificato da codice: `removeSegment` elimina la tappa e l'autosave persiste                           |
| T08 | Admin                | Blocco rimozione ultima tappa            | Lascia una sola tappa e prova a rimuoverla                                       | La rimozione viene bloccata con messaggio                              | [PASS] | Verificato da codice: blocco su `segments.length <= 1`                                                 |
| T09 | Admin                | Annulla gara nuova                       | Crea nuova gara, non compilare, clicca `Annulla`                                 | La gara nuova viene eliminata dalla lista                              | [PASS] | Verificato da codice: `cancelEdit` cancella la gara se appena creata                                   |
| T10 | Admin                | Annulla modifica gara esistente          | Modifica gara esistente, poi `Annulla`                                           | Le modifiche non salvate vengono scartate                              | [PASS] | Annulla scarta solo modifiche non salvate; Save rende permanenti                                       |
| T11 | Admin                | Colore tabella in editing                | Entra in modifica gara                                                           | La tabella tappe diventa verde                                         | [PASS] |                                                                                                        |
| T12 | Admin                | Gara default                             | Imposta una gara come default                                                    | La lista mostra il badge `default` sulla gara corretta                 | [PASS] | Verificato da codice: `raceOptions` aggiunge il badge `default`                                        |
| T13 | Admin                | Cancellazione gara senza team            | Cancella una gara non usata da team                                              | La gara viene eliminata                                                | [PASS] | Verificato da codice: `handleDeleteRace` esegue `deleteRace` se non ci sono team collegati             |
| T14 | Admin                | Blocco cancellazione gara usata          | Crea un team collegato a una gara, poi prova a cancellarla                       | La cancellazione viene bloccata                                        | [PASS] | Verificato da codice: `handleDeleteRace` blocca se trova team con `raceId` uguale                      |
| T15 | Home                 | Scelta gara iniziale                     | Vai in Home con almeno 2 gare presenti                                           | Compare il selettore gara                                              | [PASS] |                                                                                                        |
| T16 | Home                 | Cambio gara                              | In Home seleziona `Milano`, poi `Roma`                                           | Cambiano start time, delay e tappe mostrate                            | [PASS] |                                                                                                        |
| T17 | Home                 | Nessun team sulla gara scelta            | Seleziona una gara senza team dell'utente                                        | La Home resta comunque sulla gara e non forza un team di un'altra gara | [PASS] | Verificato da codice: la gara attiva segue `selectedPublicRaceId`, il team puo` restare nullo          |
| T18 | Home                 | Team filtrati per gara                   | Se hai piu` team in gare diverse, cambia gara                                    | Il selettore team mostra solo i team di quella gara                    | [PASS] | Verificato da codice: `teamsForSelectedRace` e `teamOptions` filtrano per gara attiva                  |
| T19 | Home                 | Singolo team per gara                    | Se c'e` un solo team nella gara selezionata                                      | Il team corretto viene preso automaticamente                           | [PASS] | Verificato da codice: selezione automatica su primo team disponibile della gara                        |
| T20 | Home                 | Utente anonimo persistente               | Da non loggato imposta nomi/passi su una gara, ricarica                          | Ritrovi i dati locali della stessa gara                                | [PASS] |                                                                                                        |
| T21 | Home                 | Local storage separato per gara          | Da non loggato imposta dati diversi su `Milano` e `Roma`, cambia gara e ricarica | Ogni gara mantiene i suoi valori locali                                | [PASS] |                                                                                                        |
| T22 | Home                 | Popup modifica runner solo               | Clicca una riga `solo` in tabella risultati                                      | Si apre popup con nome, min, sec                                       | [PASS] |                                                                                                        |
| T23 | Home                 | Popup modifica group                     | Clicca una riga `group` in tabella risultati                                     | Si apre popup senza nome, solo min/sec                                 | [PASS] | Verificato da codice: nel popup il campo nome esiste solo per `solo`                                   |
| T24 | Home                 | Autosave team da capitano                | Da capitano modifica nome/pace/start delay, ricarica                             | I dati restano salvati nel team                                        | [PASS] |                                                                                                        |
| T25 | Home                 | Lettura sola per runner                  | Da runner non capitano apri una gara del team                                    | Non puoi modificare configurazione e compare notify di sola lettura    | [PASS] | Runner puo` modificare solo il proprio pace dalla sezione runner, non dalla tabella                    |
| T26 | Home                 | Formato ora                              | Controlla la colonna `Ora`                                                       | Mostra `h:mm` o `hh:mm`, senza secondi, allineata a destra             | [PASS] |                                                                                                        |
| T27 | Home                 | Formato durata                           | Controlla la colonna `Durata`                                                    | Mostra `m:ss` sotto 1h e `h:mm:ss` sopra 1h, allineata a destra        | [PASS] |                                                                                                        |
| T28 | Home                 | Formato passo                            | Inserisci un passo `5:40`                                                        | In tabella compare `5:40`, non decimale                                | [PASS] |                                                                                                        |
| T29 | Home                 | Calcolo partenza reale                   | Start `09:15`, delay `3`                                                         | `Partenza Reale` deve essere `9:18`                                    | [PASS] | Bug corretto per team loggati                                                                          |
| T30 | Home                 | Calcolo arrivo tappa                     | Su `13 km` a `5:00/km` con start reale `9:18`                                    | Arrivo deve essere `10:23`                                             | [PASS] |                                                                                                        |
| T31 | Team                 | Creazione team su gara specifica         | In pagina Team crea un team scegliendo `Roma Relay`                              | Il team nasce collegato a `Roma Relay`                                 | [PASS] |                                                                                                        |
| T32 | Team                 | Join tramite invito tappa solo           | Genera codice invito di una tappa `solo`, entra con altro utente                 | L'utente viene assegnato a quel segmento                               | [PASS] | Verificato da codice: `joinTeam` risolve `segmentId` dal codice e aggiorna `runners`                   |
| T33 | Team                 | Nessun invito su group                   | Gara con sola tappa `group` o tratto finale `group`                              | Gli inviti compaiono solo per le tappe `solo`                          | [PASS] | Verificato indirettamente nella smoke                                                                  |
| T34 | Team                 | Multi-team utente                        | Lo stesso utente entra in due team su due gare diverse                           | In Team page puo` selezionare entrambi i team                          | [PASS] | Verificato da codice: `userTeams` e `teamOptions` includono tutti i team dell'utente                   |
| T35 | Team                 | Capitano in una gara, runner in un'altra | Utente A crea un team su Milano e entra come runner su Roma                      | Il ruolo mostrato cambia correttamente in base al team attivo          | [PASS] | Verificato da codice: `isCaptain` dipende sempre dal team selezionato                                  |
| T36 | Team/Home            | Cambio gara cambia team attivo           | In Home cambia gara quando l'utente ha team in piu` gare                         | Il contesto team segue la gara selezionata                             | [PASS] | Verificato da codice: `handleSelectRace` riallinea il team alla gara scelta                            |
| T37 | Sicurezza UI         | Admin non loggato                        | Apri `/admin` da non autenticato                                                 | Redirect a login                                                       | [PASS] | Verificato da codice nel router guard                                                                  |
| T38 | Sicurezza UI         | Utente non admin                         | Accedi con utente normale e apri `/admin`                                        | Redirect a home                                                        | [PASS] |                                                                                                        |
| T39 | Traduzioni           | Cambio lingua                            | Passa da IT a EN                                                                 | Home, Team e Admin cambiano lingua                                     | [PASS] | Verificato da codice: tutte le pagine usano `t(...)` condiviso da `useI18n` e selettore lingua globale |
| T40 | Regressione generale | Refresh completo                         | Dopo aver lavorato su gara/team/home fai refresh completo                        | Nessun errore bloccante, pagina consistente                            | [PASS] | Dopo fix auth guard e contesto gara                                                                    |

## Casi critici da osservare bene

- Cambio gara quando l'utente appartiene a team diversi
- Cambio gara da anonimo con dati locali diversi per gara
- Gara nuova annullata subito dopo creazione
- Modifica rapida di piu` tappe di seguito con autosave
- Riapertura pagina dopo refresh completo
- Validazione tappa `group` con distanza positiva

## Note finali

Se trovi un bug, annota almeno:

- ID test
- gara selezionata
- utente usato
- team attivo
- comportamento atteso
- comportamento reale

## Versioni disponibili

- Checklist completa: questo file
- Smoke test rapido: [SMOKE_TEST_PLAN.md](/c:/Users/giova/quasar/mm26/SMOKE_TEST_PLAN.md)
