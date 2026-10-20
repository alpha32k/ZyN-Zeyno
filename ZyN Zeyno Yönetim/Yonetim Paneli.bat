@echo off
chcp 65001 >nul
title ZyN Zeyno - Yonetim Paneli
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js bu bilgisayarda kurulu degil.
  echo   Acilan sayfadan "LTS" surumunu indirip kurun, sonra bu dosyayi tekrar acin.
  echo.
  start "" "https://nodejs.org/tr"
  pause
  exit /b 1
)

node "program\sunucu.js"
if errorlevel 1 pause
