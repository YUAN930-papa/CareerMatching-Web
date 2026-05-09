@echo off
setlocal

cd /d "%~dp0"

echo [1/2] Checking Node module: docx
if not exist "node_modules\docx" (
  echo Installing docx...
  call npm install docx
)

echo [2/2] Starting API proxy server...
start "Career API Proxy" cmd /k "cd /d "%~dp0" && python server.py"

timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:8080/jd-analysis.html"

echo Done. Keep API proxy terminal window running.
pause
