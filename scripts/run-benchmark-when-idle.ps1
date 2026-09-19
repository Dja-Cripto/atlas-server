$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$logFile = Join-Path $projectRoot 'benchmarks\motion-models\benchmark.log'
New-Item -ItemType Directory -Force (Split-Path -Parent $logFile) | Out-Null
while ($true) {
  try {
    $state = (Invoke-WebRequest -Uri 'http://127.0.0.1:4310/api/state' -UseBasicParsing -TimeoutSec 10).Content | ConvertFrom-Json
    if (-not ($state.jobs | Where-Object { $_.status -eq 'running' })) { break }
  } catch {
    Add-Content $logFile "$(Get-Date -Format o) aguardando servidor: $($_.Exception.Message)"
  }
  Start-Sleep -Seconds 15
}
Set-Location $projectRoot
Add-Content $logFile "$(Get-Date -Format o) iniciando benchmark isolado"
& node 'scripts/benchmark-motion-models.mjs' '87da905a-f39e-4532-a03d-b0998938f3bb' *>> $logFile
Add-Content $logFile "$(Get-Date -Format o) benchmark finalizado (exit=$LASTEXITCODE)"
