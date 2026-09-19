$ErrorActionPreference = 'Stop'
$atlasRoot = Split-Path -Parent $PSScriptRoot
try {
  $atlasState = Invoke-RestMethod -Uri 'http://127.0.0.1:4310/api/state' -TimeoutSec 3
  if (@($atlasState.jobs | Where-Object { $_.status -eq 'running' }).Count -gt 0) { throw 'Há produção ativa; aguarde antes de reiniciar.' }
} catch {
  if ($_.Exception.Message -match 'produção ativa') { throw }
}
$atlasListeners = @(Get-NetTCPConnection -LocalPort 4310 -State Listen -ErrorAction SilentlyContinue)
foreach ($atlasListener in $atlasListeners) {
  $atlasProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($atlasListener.OwningProcess)"
  if ($atlasProcess.CommandLine -notmatch 'nodejs\\node.exe.*server\.mjs') { throw 'Processo na porta não reconhecido. Nenhum processo foi finalizado.' }
  & taskkill.exe /PID $atlasProcess.ProcessId /F
  if ($LASTEXITCODE -ne 0) { throw 'Não foi possível encerrar o servidor antigo.' }
}
Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -ArgumentList 'server.mjs' -WorkingDirectory $atlasRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $atlasRoot 'data/server.log') -RedirectStandardError (Join-Path $atlasRoot 'data/server-error.log')
Write-Output 'Atlas Studio reiniciado na porta 4310.'
