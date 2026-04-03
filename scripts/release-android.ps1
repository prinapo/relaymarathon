$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$versionScriptPath = Join-Path $projectRoot 'version.js'
$aabPath = Join-Path $projectRoot 'src-capacitor\android\app\build\outputs\bundle\release\app-release.aab'

Write-Host ""
Write-Host "Release Android guidata"
Write-Host ""

$currentVersion = node $versionScriptPath get
Write-Host "Versione corrente: $currentVersion"
Write-Host ""

Write-Host "Scegli il tipo di rilascio:"
Write-Host "  1. minor (bug fix, nuove funzionalita')"
Write-Host "  2. major (breaking changes)"
Write-Host "  p. patch (piccole correzioni)"
Write-Host ""

$choice = Read-Host "Inserisci 1, 2 o p"

switch ($choice.Trim().ToLowerInvariant()) {
  '1' { $releaseType = 'minor' }
  '2' { $releaseType = 'major' }
  'p' { $releaseType = 'patch' }
  'minor' { $releaseType = 'minor' }
  'major' { $releaseType = 'major' }
  'patch' { $releaseType = 'patch' }
  default { throw "Scelta non valida: $choice" }
}

Write-Host ""
$confirm = Read-Host "Confermi build release $releaseType? (y/n)"
if ($confirm.Trim().ToLowerInvariant() -notin @('y', 'yes', 's', 'si')) {
  Write-Host "Operazione annullata"
  exit 0
}

Write-Host ""
Write-Host "Aggiornamento versione..."
Write-Host ""

node $versionScriptPath release $releaseType

if ($LASTEXITCODE -ne 0) {
  throw "Aggiornamento versione fallito"
}

$newVersion = node $versionScriptPath get

Write-Host ""
Write-Host "Build release Android in corso..."
Write-Host ""

Push-Location $projectRoot
try {
  & quasar build -m capacitor -T android
  if ($LASTEXITCODE -ne 0) {
    throw "quasar build fallito con exit code $LASTEXITCODE"
  }

  Push-Location (Join-Path $projectRoot 'src-capacitor\android')
  try {
    & .\gradlew.bat bundleRelease
    if ($LASTEXITCODE -ne 0) {
      throw "bundleRelease fallito con exit code $LASTEXITCODE"
    }
  }
  finally {
    Pop-Location
  }
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "=========================================="
Write-Host "Release Android completata!"
Write-Host "Versione: $newVersion"
Write-Host "VersionCode: $((Get-Content (Join-Path $projectRoot 'quasar.config.js') -Raw) -match 'versionCode:\s*(\d+)' | $Matches[1])"
Write-Host "=========================================="
Write-Host ""
Write-Host "AAB generato in:"
Write-Host "  $aabPath"
Write-Host ""
