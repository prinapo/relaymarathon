$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$ftpConfigPath = Join-Path $projectRoot 'ftp-config.json'

if (-not (Test-Path -LiteralPath $ftpConfigPath)) {
  throw "File di configurazione non trovato: $ftpConfigPath"
}

$ftpConfig = Get-Content -LiteralPath $ftpConfigPath | ConvertFrom-Json

Write-Host ""
Write-Host "=========================================="
Write-Host "Build e Upload Web"
Write-Host "=========================================="
Write-Host ""

Push-Location $projectRoot
try {
  Write-Host "[1/2] Build web in corso..."
  Write-Host ""
  
  & npm run build
  
  if ($LASTEXITCODE -ne 0) {
    throw "Build fallito con exit code $LASTEXITCODE"
  }
  
  Write-Host ""
  Write-Host "[2/2] Upload FTP in corso..."
  Write-Host ""
  Write-Host "Host: $($ftpConfig.host)"
  Write-Host "Path: $($ftpConfig.remotePath)"
  Write-Host ""
  
  $distPath = Join-Path $projectRoot 'dist\spa'
  
  if (-not (Test-Path -LiteralPath $distPath)) {
    throw "Cartella dist/spa non trovata dopo il build"
  }
  
  $files = Get-ChildItem -LiteralPath $distPath -Recurse -File
  $credential = "$($ftpConfig.username):$($ftpConfig.password)"
  
  foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($distPath.Length + 1)
    $remotePath = "$($ftpConfig.remotePath)/$relativePath"
    
    Write-Host "Upload: $relativePath"
    
    $fullUrl = "ftp://$($ftpConfig.host)$remotePath"
    
    try {
      & cmd /c "curl.exe -T `"$($file.FullName)`" -u $credential `"$fullUrl`" --ftp-ssl --insecure 2>&1"
      if ($LASTEXITCODE -eq 0) {
        Write-Host "  -> OK"
      } else {
        Write-Host "  -> ERRORE (exit code: $LASTEXITCODE)"
      }
    }
    catch {
      Write-Host "  -> ERRORE: $($_.Exception.Message)"
    }
  }
  
  Write-Host ""
  Write-Host "=========================================="
  Write-Host "Upload completato!"
  Write-Host "=========================================="
  Write-Host ""
  Write-Host "Sito pubblico: https://relaymarathon.sostienilsostegno.com"
  Write-Host ""
}
finally {
  Pop-Location
}
