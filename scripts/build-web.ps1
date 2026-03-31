$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$outputPath = Join-Path $projectRoot 'dist\spa'

Write-Host ""
Write-Host "Build Web MM26"
Write-Host ""

Push-Location $projectRoot
try {
  & quasar build
  if ($LASTEXITCODE -ne 0) {
    throw "Build web fallita con exit code $LASTEXITCODE"
  }
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "Build web completata."
Write-Host "Output:"
Write-Host "  $outputPath"
Write-Host ""
