@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Please install Node.js 18+ first.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies, this may take a while...
  call npm install
  if errorlevel 1 ( echo [ERROR] npm install failed. & pause & exit /b 1 )
)

if not exist dist\index.html (
  echo Building the app, please wait...
  call npm run build
  if errorlevel 1 ( echo [ERROR] build failed. & pause & exit /b 1 )
)

echo.
echo ============================================================
echo   Read-Something local server
echo   PC:      http://localhost:4173/
echo   Phone:   http://YOUR-PC-IP:4173/   (same WiFi)
echo   Press Ctrl+C to stop.
echo ============================================================
echo.
start "" http://localhost:4173/
call npm run preview -- --host 0.0.0.0 --port 4173
pause
