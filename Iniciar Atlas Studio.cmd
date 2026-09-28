@echo off
cd /d "%~dp0"
echo =======================================================
echo          ATLAS STUDIO - VERSAO 3
echo =======================================================
echo Abrindo painel no navegador: http://127.0.0.1:4310
start http://127.0.0.1:4310
echo Servidor iniciado em http://127.0.0.1:4310
node server.mjs
pause
