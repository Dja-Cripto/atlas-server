@echo off
title Conectando ao Atlas Studio no Servidor (VPS)...
echo ========================================================
echo   Atlas Studio - Conexao Segura com Servidor VPS
echo ========================================================
echo.
echo 1. Abrindo tunel seguro SSH na porta 4310...
echo 2. O painel sera aberto automaticamente no seu navegador.
echo.
echo NOTA: Mantenha esta janela aberta enquanto estiver usando o Atlas Studio.
echo Para encerrar a conexao, basta fechar esta janela.
echo ========================================================
echo.

start "" "http://localhost:4310"

ssh -i "C:\Users\da338\OneDrive\Desktop\vpss\ssh-key-2026-02-13.key" -N -L 4310:127.0.0.1:4310 ubuntu@137.131.171.144
