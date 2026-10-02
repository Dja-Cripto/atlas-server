@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title Atlas Studio - Teste da busca de midia
echo =======================================================
echo   ATLAS STUDIO - TESTE REAL DA BUSCA DE MIDIA
echo =======================================================
echo Escolhe um tema aleatorio (ou use: Testar Busca de Midia.cmd "titulo do tema"),
echo busca em todas as fontes e pede ao Gemini para avaliar cada imagem.
echo Usa suas chaves salvas. Custo estimado: menos de US$ 0,10.
echo.
node --no-warnings scripts\test-media-search.mjs %*
set RC=%ERRORLEVEL%
if not %RC%==0 (echo. & echo O teste falhou. Copie o texto acima e envie ao assistente. & goto :end)
for /f "tokens=2 delims==" %%p in ('node --no-warnings -e "const fs=require('fs');const d='data/relatorios';const f=fs.readdirSync(d).filter(x=>x.startsWith('teste-busca-')&&x.endsWith('.html')).sort().pop();console.log('REPORT='+require('path').resolve(d,f))"') do start "" "%%p"
:end
echo.
pause
