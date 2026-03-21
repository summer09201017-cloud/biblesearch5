@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:4173/' -TimeoutSec 2 ^| Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  start "Bible Search Server" cmd /k "cd /d %~dp0 && node server.js"
  timeout /t 2 /nobreak >nul
)

start "" "http://localhost:4173"
