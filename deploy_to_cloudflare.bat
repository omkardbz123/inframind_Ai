@echo off
title Deploy MIT ACSC CampusCare to Cloudflare
color 0B

echo ======================================================================
echo           MAEER'S MIT ARTS, COMMERCE AND SCIENCE COLLEGE
echo                   MIT ACSC, ALANDI (D.), PUNE
echo           Deploy CampusCare Directly to Cloudflare Edge
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/3] Building production bundle (Vite + TypeScript)...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed. Please fix errors before deploying.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Checking Cloudflare Authentication...
echo If this is your first time, Cloudflare will open your browser to log in.
echo.

echo [3/3] Deploying static assets to Cloudflare...
call npx wrangler deploy

echo.
echo ======================================================================
echo  Deployment complete! Check the URL above to view your live website.
echo ======================================================================
echo.

pause
