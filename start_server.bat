@echo off
title MIT ACSC CampusCare - Smart Campus Infrastructure Server
color 0C

echo ======================================================================
echo           MAEER'S MIT ARTS, COMMERCE AND SCIENCE COLLEGE
echo                   MIT ACSC, ALANDI (D.), PUNE
echo        Smart Campus Infrastructure and Predictive Maintenance
echo       [Integrated Nodemailer Google SMTP and Gemini AI Vision]
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js dependencies...
if not exist "node_modules" (
    echo Installing required packages...
    call npm install --legacy-peer-deps
) else (
    echo [OK] Dependencies verified.
)

echo.
echo [2/3] Launching MIT ACSC CampusCare in your browser...
start http://localhost:5180

echo.
echo [3/3] Starting CampusCare Unified Server on http://localhost:5180 ...
echo.
echo ======================================================================
echo  CampusCare is LIVE!
echo  - Web Application & Email Service: http://localhost:5180
echo  Press Ctrl+C in this terminal anytime to stop the server.
echo ======================================================================
echo.

call npm run dev -- --host --port 5180

pause
