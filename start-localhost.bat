@echo off
echo ===================================================
echo Starting VowCrafts Next.js Storefront on Localhost
echo Port: 8080
echo ===================================================

cd /d "%~dp0"

:: Free port 8080 if occupied
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Terminating lingering process on port 8080 (PID: %%a)...
    taskkill /F /PID %%a 2>nul
)

echo Starting Next.js Dev Server on http://localhost:8080 ...
start "VowCrafts Next.js (Port 8080)" npm run dev

echo.
echo ===================================================
echo Storefront:  http://localhost:8080/
echo Admin Panel: http://localhost:8080/admin
echo ===================================================
