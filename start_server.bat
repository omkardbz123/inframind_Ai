@echo off
title MIT ACSC CampusCare - Smart Campus Infrastructure Server
color 0C

echo ======================================================================
echo           MAEER'S MIT ARTS, COMMERCE AND SCIENCE COLLEGE
echo                   MIT ACSC, ALANDI (D.), PUNE
echo        Smart Campus Infrastructure and Predictive Maintenance
echo    [Local Vite Server + Google Nodemailer + Cloudflare Live Tunnel]
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Node.js environment and dependencies...
if not exist "node_modules" (
    echo Installing required packages...
    call npm install --legacy-peer-deps
) else (
    echo [OK] Node modules verified.
)

echo.
echo [2/4] Verifying Cloudflare Tunnel client...
if not exist "cloudflared.exe" (
    echo Downloading cloudflared.exe from Cloudflare...
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe' -OutFile 'cloudflared.exe'"
)
echo [OK] Cloudflare Tunnel client ready.

echo.
echo [3/4] Launching Cloudflare Public HTTPS Tunnel...
start "Cloudflare Live Public Tunnel" cmd /k "title Cloudflare Live Public Tunnel && color 0B && echo ====================================================================== && echo   CLOUDFLARE LIVE PUBLIC TUNNEL FOR MIT ACSC CAMPUSCARE && echo ====================================================================== && echo. && echo Connecting local port 5180 to Cloudflare edge network... && echo Look below for your free public https://*.trycloudflare.com URL! && echo. && cloudflared.exe tunnel --url http://localhost:5180"

echo.
echo [4/4] Opening local dashboard in your browser...
start http://localhost:5180

echo.
echo ======================================================================
echo  CAMPUSCARE IS RUNNING!
echo  - Local Dashboard URL:  http://localhost:5180
echo  - Live Cloudflare URL:  Check the opened 'Cloudflare Tunnel' window
echo  Press Ctrl+C in this terminal window anytime to stop the server.
echo ======================================================================
echo.

call npm run dev -- --host --port 5180

pause
