$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$buildGradlePath = Join-Path $projectRoot 'src-capacitor\android\app\build.gradle'
$packageJsonPath = Join-Path $projectRoot 'package.json'
$aabPath = Join-Path $projectRoot 'src-capacitor\android\app\build\outputs\bundle\release\app-release.aab'

function Write-Utf8NoBom {
  param(
    [Parameter(Mandatory = $true)]
    [string] $Path,
    [Parameter(Mandatory = $true)]
    [string] $Content
  )

  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

if (-not (Test-Path -LiteralPath $buildGradlePath)) {
  throw "File non trovato: $buildGradlePath"
}

if (-not (Test-Path -LiteralPath $packageJsonPath)) {
  throw "File non trovato: $packageJsonPath"
}

$buildGradle = Get-Content -LiteralPath $buildGradlePath -Raw
$packageJson = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json

$versionNameMatch = [regex]::Match($buildGradle, 'versionName\s+"(?<value>\d+\.\d+\.\d+)"')
$versionCodeMatch = [regex]::Match($buildGradle, 'versionCode\s+(?<value>\d+)')

if (-not $versionNameMatch.Success) {
  throw 'Impossibile leggere versionName da build.gradle'
}

if (-not $versionCodeMatch.Success) {
  throw 'Impossibile leggere versionCode da build.gradle'
}

$currentVersion = $versionNameMatch.Groups['value'].Value
$currentVersionCode = [int] $versionCodeMatch.Groups['value'].Value
$versionParts = $currentVersion.Split('.')

if ($versionParts.Length -ne 3) {
  throw "Versione non valida: $currentVersion"
}

$major = [int] $versionParts[0]
$minor = [int] $versionParts[1]
$patch = [int] $versionParts[2]

Write-Host ""
Write-Host "Release Android guidata"
Write-Host "Versione corrente: $currentVersion (versionCode $currentVersionCode)"
Write-Host ""
Write-Host "Scegli il tipo di rilascio:"
Write-Host "  1. minor"
Write-Host "  2. major"
Write-Host ""

$choice = Read-Host "Inserisci 1 o 2"

switch ($choice.Trim().ToLowerInvariant()) {
  '1' {
    $minor += 1
    $patch = 0
  }
  'minor' {
    $minor += 1
    $patch = 0
  }
  '2' {
    $major += 1
    $minor = 0
    $patch = 0
  }
  'major' {
    $major += 1
    $minor = 0
    $patch = 0
  }
  default {
    throw "Scelta non valida: $choice"
  }
}

$newVersion = "$major.$minor.$patch"
$newVersionCode = $currentVersionCode + 1

Write-Host ""
Write-Host "Nuova versione: $newVersion"
Write-Host "Nuovo versionCode: $newVersionCode"
Write-Host ""

$confirm = Read-Host "Confermi build release Android? (y/n)"
if ($confirm.Trim().ToLowerInvariant() -notin @('y', 'yes', 's', 'si')) {
  throw 'Operazione annullata'
}

$updatedBuildGradle = [regex]::Replace($buildGradle, 'versionCode\s+\d+', "versionCode $newVersionCode", 1)
$updatedBuildGradle = [regex]::Replace($updatedBuildGradle, 'versionName\s+"\d+\.\d+\.\d+"', "versionName `"$newVersion`"", 1)
Write-Utf8NoBom -Path $buildGradlePath -Content $updatedBuildGradle

$packageJson.version = $newVersion
$packageJsonContent = $packageJson | ConvertTo-Json -Depth 100
Write-Utf8NoBom -Path $packageJsonPath -Content $packageJsonContent

Write-Host ""
Write-Host "Versioni aggiornate. Avvio build..."
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
Write-Host "Release Android completata."
Write-Host "AAB generato in:"
Write-Host "  $aabPath"
Write-Host ""
