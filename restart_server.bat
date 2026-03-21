@echo off
setlocal
cd /d "%~dp0"

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":4173 .*LISTENING"') do (
  taskkill /PID %%P /F >nul 2>&1
)

timeout /t 1 /nobreak >nul
start "Bible Search Server" cmd /k "cd /d %~dp0 && node server.js"
timeout /t 2 /nobreak >nul
start "" "http://localhost:4173"
