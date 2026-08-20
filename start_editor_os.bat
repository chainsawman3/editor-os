@echo off
echo ========================================================
echo   Launching EDITOR OS v2.0
echo   Personal Video Editor Growth & Business Management
echo ========================================================
echo.
echo Starting Backend API Server (Port 3001)...
start "Editor OS Server" cmd /k "cd /d %~dp0\server && npm.cmd run dev"

echo Starting Frontend Web App (Port 5173)...
start "Editor OS Client" cmd /k "cd /d %~dp0\client && npm.cmd run dev"

timeout /t 3 >nul
echo Opening Web Application in Default Browser...
start http://localhost:5173

echo.
echo Editor OS is now live at http://localhost:5173
echo ========================================================
