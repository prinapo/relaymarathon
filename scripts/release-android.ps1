$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$versionScriptPath = Join-Path $projectRoot 'version.js'
$capDir = Join-Path $projectRoot 'src-capacitor'

Write-Host ""
Write-Host "=========================================="
Write-Host "  Release Android - Milano Relay Marathon"
Write-Host "=========================================="
Write-Host ""

$currentVersion = node $versionScriptPath get
Write-Host "Versione corrente: $currentVersion"
Write-Host ""

Write-Host "1. AUMENTO VERSIONE"
Write-Host "   --------------------"
Write-Host "   m = major (breaking changes)"
Write-Host "   n = minor (nuove funzionalita)"
Write-Host "   s = skip (usa versione attuale)"
Write-Host ""

$versionChoice = Read-Host "Scelta (m/n/s)"
switch ($versionChoice.ToLower()) {
  'm' { $releaseType = 'major'; $doVersionBump = $true }
  'n' { $releaseType = 'minor'; $doVersionBump = $true }
  's' { $releaseType = ''; $doVersionBump = $false }
  default { throw "Scelta non valida: $versionChoice" }
}

if ($doVersionBump) {
  Write-Host ""
  $confirm = Read-Host "Aumentare a $releaseType? (y/n)"
  if ($confirm.ToLower() -notin @('y', 'yes', 's', 'si')) {
    Write-Host "Operazione annullata"
    exit 0
  }
  node $versionScriptPath release $releaseType
  if ($LASTEXITCODE -ne 0) { throw "Aggiornamento versione fallito" }
  $newVersion = node $versionScriptPath get
  Write-Host "Nuova versione: $newVersion"
}

Write-Host ""
Write-Host "2. TIPO BUILD"
Write-Host "   --------------------"
Write-Host "   1 = APK (debug/release)"
Write-Host "   2 = AAB (Google Play)"
Write-Host "   3 = Entrambi"
Write-Host ""

$buildChoice = Read-Host "Scelta (1/2/3)"
switch ($buildChoice) {
  '1' { $buildApk = $true; $buildAab = $false }
  '2' { $buildApk = $false; $buildAab = $true }
  '3' { $buildApk = $true; $buildAab = $true }
  default { throw "Scelta non valida: $buildChoice" }
}

Write-Host ""
Write-Host "3. INSTALLAZIONE"
Write-Host "   --------------------"
Write-Host "   0 = Non installare"
Write-Host "   1 = Solo APK sul dispositivo"
Write-Host "   2 = Solo AAB sul dispositivo"
Write-Host "   3 = Entrambi sul dispositivo"
Write-Host ""

$installChoice = Read-Host "Scelta (0/1/2/3)"
switch ($installChoice) {
  '0' { $installApk = $false; $installAab = $false; $installToDevice = $false }
  '1' { $installApk = $true; $installAab = $false; $installToDevice = $true }
  '2' { $installApk = $false; $installAab = $true; $installToDevice = $true }
  '3' { $installApk = $true; $installAab = $true; $installToDevice = $true }
  default { throw "Scelta non valida: $installChoice" }
}

$devices = @()
if ($installToDevice) {
  Write-Host ""
  Write-Host "Ricerca dispositivi collegati..."
  $rawDevices = & adb devices | Select-Object -Skip 1 | Where-Object { $_ -match 'device$' }
  
  foreach ($line in $rawDevices) {
    $parts = $line -split "`t"
    $deviceId = $parts[0]
    if ($deviceId) {
      $deviceModel = "Unknown"
      try {
        $model = & adb -s $deviceId shell getprop ro.product.model 2>$null
        if ($model -and $model.Trim()) {
          $deviceModel = $model.Trim()
        }
      } catch {}
      $devices += @{
        Id = $deviceId
        Info = $deviceModel
      }
    }
  }

  if ($devices.Count -eq 0) {
    Write-Host ""
    Write-Host "Nessun dispositivo collegato. Installazione annullata."
    $installToDevice = $false
    $installApk = $false
    $installAab = $false
  } else {
    Write-Host ""
    Write-Host "Dispositivi trovati:"
    Write-Host "   0 = Non installare"
    for ($i = 0; $i -lt $devices.Count; $i++) {
      $info = $devices[$i].Info
      $id = $devices[$i].Id
      if ($info -and $info -ne "Unknown") {
        Write-Host "   $($i + 1) = $info"
      } else {
        Write-Host "   $($i + 1) = $id"
      }
    }
    Write-Host ""

    $deviceChoice = Read-Host "Scegli dispositivo (0-$($devices.Count))"
    if ($deviceChoice -eq '0') {
      $installToDevice = $false
      $installApk = $false
      $installAab = $false
      $selectedDevice = $null
    } else {
      $idx = [int]$deviceChoice - 1
      if ($idx -lt 0 -or $idx -ge $devices.Count) { throw "Dispositivo non valido" }
      $selectedDevice = $devices[$idx].Id
      $selectedDeviceName = $devices[$idx].Info
      if ($selectedDeviceName -and $selectedDeviceName -ne "Unknown") {
        Write-Host "Selezionato: $selectedDeviceName"
      } else {
        Write-Host "Selezionato: $selectedDevice"
      }
    }
  }
}

Write-Host ""
Write-Host "=========================================="
Write-Host "RIEPILOGO"
Write-Host "=========================================="
if ($doVersionBump) { Write-Host "Versione: $newVersion" } else { Write-Host "Versione: $currentVersion (skip)" }
$buildType = ""
if ($buildApk -and $buildAab) { $buildType = "APK + AAB" }
elseif ($buildApk) { $buildType = "APK" }
elseif ($buildAab) { $buildType = "AAB" }
Write-Host "Build: $buildType"
if ($installToDevice) {
  if ($selectedDeviceName -and $selectedDeviceName -ne "Unknown") {
    Write-Host "Installa su: $selectedDeviceName"
  } else {
    Write-Host "Installa su: $selectedDevice"
  }
} else {
  Write-Host "Installa su: No"
}
Write-Host "=========================================="
Write-Host ""

$confirm = Read-Host "Procedere? (y/n)"
if ($confirm.ToLower() -notin @('y', 'yes', 's', 'si')) {
  Write-Host "Operazione annullata"
  exit 0
}

Write-Host ""
Write-Host "Build in corso..."
Write-Host ""

Push-Location $projectRoot
try {
  & quasar build -m capacitor -T android
  if ($LASTEXITCODE -ne 0) { throw "quasar build fallito" }
}
finally {
  Pop-Location
}

$apkPath = Join-Path $capDir "android\app\build\outputs\apk\release"
$aabPath = Join-Path $capDir "android\app\build\outputs\bundle\release"

if ($buildAab) {
  Write-Host ""
  Write-Host "Generazione AAB..."
  Push-Location (Join-Path $capDir "android")
  try {
    & .\gradlew.bat bundleRelease
    if ($LASTEXITCODE -ne 0) { throw "bundleRelease fallito" }
  }
  finally {
    Pop-Location
  }
}

Write-Host ""
Write-Host "=========================================="
Write-Host "BUILD COMPLETATI"
Write-Host "=========================================="

if ($buildApk) {
  $latestApk = Get-ChildItem "$apkPath\*.apk" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($latestApk) {
    Write-Host "APK: $($latestApk.FullName)"
    if ($installApk -and $selectedDevice) {
      Write-Host "Disinstallazione app precedente..."
      & adb -s $selectedDevice uninstall com.prinapo.relaymarathon 2>$null
      Write-Host "Installazione APK..."
      & adb -s $selectedDevice install $latestApk.FullName
      Write-Host "APK installato!"
    }
  }
}

if ($buildAab) {
  $latestAab = Get-ChildItem "$aabPath\*.aab" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($latestAab) {
    Write-Host "AAB: $($latestAab.FullName)"
    if ($installAab -and $selectedDevice) {
      Write-Host "Disinstallazione app precedente..."
      & adb -s $selectedDevice uninstall com.prinapo.relaymarathon 2>$null
      Write-Host "Installazione AAB..."
      & adb -s $selectedDevice install $latestAab.FullName
      Write-Host "AAB installato!"
    }
  }
}

Write-Host "=========================================="
Write-Host ""
