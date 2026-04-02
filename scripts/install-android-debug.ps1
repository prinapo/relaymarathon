$ErrorActionPreference = "Stop"

# Definizione root del progetto rispetto alla posizione dello script
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot

Write-Host "Verifica requisiti di sistema..." -ForegroundColor Cyan
if ($null -eq (Get-Command adb -ErrorAction SilentlyContinue)) {
    Write-Host "Errore: ADB (Android Debug Bridge) non è installato o non è presente nel PATH di sistema." -ForegroundColor Red
    Write-Host "Assicurati di aver installato gli Android SDK Platform-Tools." -ForegroundColor Yellow
    exit 1
}

if ($null -eq (Get-Command quasar -ErrorAction SilentlyContinue)) {
    Write-Host "Errore: Quasar CLI non trovata." -ForegroundColor Red
    Write-Host "Esegui 'npm install -g @quasar/cli' per installarla." -ForegroundColor Yellow
    exit 1
}

Write-Host "--- MM26: Generazione e Installazione Build Android Debug ---" -ForegroundColor Cyan

# 1. Esecuzione build Quasar
# Il comando build -m capacitor compila la UI web e sincronizza il progetto nativo
quasar build -m capacitor -T android -debug

if ($LASTEXITCODE -ne 0) {
    Write-Host "Errore durante il build Quasar." -ForegroundColor Red
    exit $LASTEXITCODE
}

# Percorso APK (riferimento standard come da DOCUMENTAZIONE.md)
$apkPath = "dist\capacitor\android\apk\debug\app-debug.apk"

if (-not (Test-Path $apkPath)) {
    # Fallback al percorso interno del progetto Android se dist non è sincronizzato
    $apkPath = "src-capacitor\android\app\build\outputs\apk\debug\app-debug.apk"
    if (-not (Test-Path $apkPath)) {
        Write-Host "Errore: Impossibile trovare l'APK in $apkPath" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Build terminato con successo." -ForegroundColor Green
Write-Host "Ricerca dispositivi collegati via ADB..." -ForegroundColor Cyan

# 2. Recupero lista dispositivi collegati
$adbOutput = adb devices | Select-String -Pattern "\tdevice$"
$devices = @()
foreach ($line in $adbOutput) {
    $id = $line.ToString().Split("`t")[0].Trim()
    if ($id) { $devices += $id }
}

if ($devices.Count -eq 0) {
    Write-Host "Nessun dispositivo trovato. Collega un telefono con Debug USB attivo." -ForegroundColor Yellow
    exit 1
}

$target = ""
if ($devices.Count -eq 1) {
    $target = $devices[0]
    Write-Host "Dispositivo rilevato: $target" -ForegroundColor Gray
} else {
    Write-Host "Trovati $($devices.Count) dispositivi collegati:" -ForegroundColor Green
    for ($i=0; $i -lt $devices.Count; $i++) {
        Write-Host "[$i] $($devices[$i])"
    }
    $selection = Read-Host "Seleziona l'indice del dispositivo su cui installare"
    if ($selection -match '^\d+$' -and $selection -ge 0 -and $selection -lt $devices.Count) {
        $target = $devices[$selection]
    } else {
        Write-Host "Selezione non valida." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Installazione APK su $target..." -ForegroundColor Cyan
adb -s $target install -r $apkPath

Write-Host "Avvio applicazione..." -ForegroundColor Cyan
adb -s $target shell monkey -p com.prinapo.relaymarathon -c android.intent.category.LAUNCHER 1

Pop-Location