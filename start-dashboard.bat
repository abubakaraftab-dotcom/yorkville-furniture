@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
set "ROOT=%~dp0"
set "REPO=abubakaraftab-dotcom/yorkville-furniture"
set "BRANCH=main"
set "WORK=%TEMP%\yorkville-dashboard-update-%RANDOM%"
set "ZIP=%WORK%\yorkville.zip"
set "EXTRACT=%WORK%\extract"

echo.
echo ================================================
echo   Yorkville Furniture Dashboard - Auto Update
echo ================================================
echo.
echo Downloading the latest dashboard from GitHub...

if not exist "%WORK%" mkdir "%WORK%"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; New-Item -ItemType Directory -Force -Path '%EXTRACT%' | Out-Null; Invoke-WebRequest -Uri 'https://codeload.github.com/%REPO%/zip/refs/heads/%BRANCH%' -OutFile '%ZIP%'; Expand-Archive -LiteralPath '%ZIP%' -DestinationPath '%EXTRACT%' -Force"
if errorlevel 1 (
  echo.
  echo Could not download the latest version. Check your internet connection.
  goto :cleanup
)

for /d %%D in ("%EXTRACT%\*") do set "SOURCE=%%~fD"
if not defined SOURCE (
  echo The downloaded project could not be opened.
  goto :cleanup
)

if not exist "%ROOT%.env.local" (
  echo NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD=choose-a-private-password> "%ROOT%.env.local"
  echo.
  echo A private password file was created: .env.local
  echo Open it, replace choose-a-private-password, save it, and run this launcher again.
  goto :cleanup
)

if exist "%ROOT%.env.local" copy /Y "%ROOT%.env.local" "%WORK%\.env.local.backup" >nul

echo Updating project files while preserving your local password...
robocopy "%SOURCE%" "%ROOT%" /E /R:2 /W:2 /XD node_modules .next out .git /XF .env.local yorkville-dashboard-package.json >nul
if errorlevel 8 (
  echo Project file update failed.
  goto :cleanup
)

if exist "%WORK%\.env.local.backup" copy /Y "%WORK%\.env.local.backup" "%ROOT%.env.local" >nul

echo Installing or updating packages...
call npm install
if errorlevel 1 (
  echo npm install failed. Please check that Node.js is installed.
  goto :cleanup
)

echo.
echo Starting the dashboard. Keep this window open.
echo Open: http://localhost:3000/admin/products/
echo.
call npm run dev

goto :cleanup

:cleanup
if exist "%WORK%" rmdir /S /Q "%WORK%" >nul 2>&1
endlocal
pause
