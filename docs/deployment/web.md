---
title: Deploy Web
description: Guida al deploy web FTP di MM26
tags: [web, deploy, ftp, hosting, production]
---

# Deploy Web

## Panoramica

L'app web può essere deployata via FTP sul server di produzione.

---

## Configurazione FTP

### File di Configurazione

Creare `ftp-config.json` nella root del progetto (NON tracciato da git):

```json
{
  "host": "relaymarathon.sostienilsostegno.com",
  "port": 21,
  "user": "your-username",
  "password": "your-password",
  "remotePath": "/public_html",
  "secure": false
}
```

---

## Deploy Manuale

### 1. Build

```bash
npm run build
```

Output in: `dist/spa/`

### 2. Upload FTP

Usare un client FTP (FileZilla, WinSCP) o script:

```bash
# Upload manuale
# Host: relaymarathon.sostienilsostegno.com
# User: [dalla config]
# Password: [dalla config]
# Remote: /public_html
```

---

## Deploy Automatico

### Script PowerShell

```bash
npm run deploy:web
```

Lo script:
1. Esegue `npm run build`
2. Carica tutti i file via FTP
3. Usa la configurazione in `ftp-config.json`

---

## Struttura Upload

```
public_html/
├── index.html
├── css/
├── js/
├── assets/
└── ...
```

---

## Configurazione Hosting

### Requisiti

- PHP non richiesto (SPA statica)
- Supporto HTTPS consigliato
- Possibilità di configurare redirect per SPA (tutte le route verso index.html)

### Configurazione Apache (.htaccess)

Se il server usa Apache, aggiungere in `/public_html/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Configurazione Nginx

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Ambiente di Produzione

### Variabili Ambiente

In produzione, le variabili in `.env` DEVONO puntare al progetto Firebase corretto:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_GOOGLE_WEB_CLIENT_ID=...
```

### Firebase Console

Verificare che in Firebase Console:
- Authorized JavaScript origins includa il dominio di produzione
- Google Sign-In sia abilitato

---

## HTTPS

### Certificato

Il server di produzione dovrebbe avere un certificato SSL/TLS.

### Note

- Firebase Authentication richiede HTTPS in produzione
- Il login Google potrebbe non funzionare su HTTP

---

## Troubleshooting

### Errori CORS

Se ci sono problemi con richieste API:
- Verificare che il dominio sia autorizzato in Firebase Console

### Pagina Bianca

Se l'app non carica:
- Verificare che `index.html` sia presente
- Controllare console browser per errori JavaScript

### Route Non Funzionanti

Se le route (es. `/team`, `/admin`) danno 404:
- Verificare configurazione server per SPA (redirect a index.html)

---

## Checklist Deploy

- [ ] Build completato con successo
- [ ] Variabili ambiente configurate per produzione
- [ ] Dominio autorizzato in Firebase Console
- [ ] Upload FTP completato
- [ ] HTTPS funzionante
- [ ] Redirect SPA configurato
- [ ] Test login Google funziona
- [ ] Test navigazione route funziona

Vedi anche: [Quick Start](quick-start.md), [Build Commands](build-commands.md)