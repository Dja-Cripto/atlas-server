@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title Atlas Studio - Salvar versao atual no GitHub
echo =======================================================
echo   ATLAS STUDIO - SALVAR VERSAO ATUAL NO GITHUB
echo =======================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :nogit

for /f "delims=" %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyy-MM-dd_HH-mm-ss"') do set TS=%%i
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set BRANCH=%%b
if "%BRANCH%"=="" goto :norepo
echo Branch atual: %BRANCH%
echo.

rem --- 1. Indice do Git corrompido? Reconstroi sem tocar nos arquivos.
git status --porcelain >nul 2>&1
if errorlevel 1 (
  echo O indice do Git parece corrompido. Guardando copia e reconstruindo...
  if exist ".git\index" copy /y ".git\index" ".git\index.corrupt-%TS%" >nul
  del /f /q ".git\index" >nul 2>&1
  git reset -q
)

rem --- 2. Garante que segredos e arquivos pesados nunca sejam versionados.
findstr /x /c:"cookies.txt" .gitignore >nul 2>&1 || echo cookies.txt>>.gitignore
findstr /x /c:".vault-key" .gitignore >nul 2>&1 || echo .vault-key>>.gitignore
findstr /x /c:"*.sqlite*" .gitignore >nul 2>&1 || echo *.sqlite*>>.gitignore
git rm --cached -q --ignore-unmatch cookies.txt >nul 2>&1

rem --- 3. Prepara os arquivos (respeita o .gitignore).
git add -A
git diff --cached --name-only > "%TEMP%\atlas_staged.txt"

findstr /i /r /c:"cookies\.txt" /c:"\.vault-key" /c:"\.sqlite" /c:"\.env" /c:"\.mp4$" /c:"\.mp3$" /c:"\.wav$" /c:"\.mov$" /c:"service-account" "%TEMP%\atlas_staged.txt"
if not errorlevel 1 goto :blocked

set BIG=
for /f "delims=" %%f in ('powershell -NoProfile -Command "git -c core.quotepath=false diff --cached --name-only | ForEach-Object { if ((Test-Path -LiteralPath $_) -and ((Get-Item -LiteralPath $_).Length -gt 50MB)) { $_ } }"') do set BIG=%%f
if defined BIG goto :bigfile

echo Arquivos que serao salvos:
git status --short
echo.
echo Nada de chaves, banco de dados, musicas, midias ou renders sera enviado.
echo Pressione qualquer tecla para SALVAR no GitHub, ou feche esta janela para cancelar.
pause >nul

rem --- 4. Commit e etiqueta (tag) imutavel desta versao.
git diff --cached --quiet
if errorlevel 1 (
  git commit -q -m "Snapshot Atlas Studio %TS%" -m "Versao salva pelo botao Salvar no GitHub."
  if errorlevel 1 goto :commitfail
) else (
  echo Nenhuma alteracao nova. Salvando o estado atual mesmo assim.
)
set TAG=atlas-save-%TS%
git tag -a "%TAG%" -m "Versao salva em %TS%"

rem --- 5. Envio seguro, sem sobrescrever o que ja existe no GitHub.
echo.
echo Conectando ao GitHub...
git fetch origin --tags -q
if errorlevel 1 goto :netfail

git rev-parse --verify -q "origin/%BRANCH%" >nul 2>&1
if errorlevel 1 goto :normalpush
git merge-base --is-ancestor "origin/%BRANCH%" HEAD
if errorlevel 1 goto :diverged

:normalpush
git push -u origin "%BRANCH%"
if errorlevel 1 goto :pushfail
git push origin "%TAG%"
echo.
echo =======================================================
echo   SALVO COM SUCESSO
echo   Branch: %BRANCH%
echo   Etiqueta para voltar a esta versao: %TAG%
echo =======================================================
goto :end

:diverged
echo.
echo O GitHub tem alteracoes que esta pasta nao tem. Nada foi sobrescrito.
echo Salvando esta versao em um branch separado de backup...
git push origin "HEAD:refs/heads/backup/%TS%"
if errorlevel 1 goto :pushfail
git push origin "%TAG%"
echo.
echo =======================================================
echo   SALVO COMO BACKUP: branch backup/%TS%
echo   Etiqueta: %TAG%
echo   O branch %BRANCH% do GitHub nao foi alterado.
echo =======================================================
goto :end

:blocked
echo.
echo PAROU: os arquivos acima parecem segredos, banco ou midia pesada e nao devem ir ao GitHub.
git reset -q
goto :end
:bigfile
echo.
echo PAROU: arquivo maior que 50 MB na lista de envio: %BIG%
git reset -q
goto :end
:commitfail
echo Falha ao criar o commit. Nada foi enviado.
goto :end
:netfail
echo Nao foi possivel falar com o GitHub. Verifique a internet e o login. A versao ficou salva so localmente com a etiqueta %TAG%.
goto :end
:pushfail
echo O envio falhou. Verifique o login do GitHub. A versao ficou salva localmente com a etiqueta %TAG%.
goto :end
:nogit
echo Git nao encontrado. Instale o Git for Windows e tente de novo.
goto :end
:norepo
echo Esta pasta nao e um repositorio Git.
:end
echo.
pause
