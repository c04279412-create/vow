@echo off
echo ========================================================
echo   VowCrafts: Building React Frontend + PHP Backend
echo ========================================================
echo.

cd /d "%~dp0"

echo 1. Running Next.js Static Build (React + Tailwind CSS)...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Check errors above.
    pause
    exit /b %errorlevel%
)

echo.
echo 2. Assembling PHP Backend, API router, and .htaccess into /out...
node scripts/prepare-dist.js
if %errorlevel% neq 0 (
    echo [ERROR] Assembly failed!
    pause
    exit /b %errorlevel%
)

echo.
echo 3. Packaging into vowcrafts-hostinger-php-deploy.zip...
powershell -Command "Compress-Archive -Path '.\out\*' -DestinationPath '.\vowcrafts-hostinger-php-deploy.zip' -Force"

echo.
echo ========================================================
echo   SUCCESS! Deployment package ready!
echo   File: vowcrafts-hostinger-php-deploy.zip
echo ========================================================
echo.
echo Hostinger par upload karne ke liye:
echo 1. Hostinger hPanel - File Manager - public_html par jayein.
echo 2. Yeh zip file upload karein aur Extract kar dein.
echo 3. Website vowcrafts.com par live ho jayegi!
echo.
pause
