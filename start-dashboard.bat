@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"
set "ROOT=%~dp0"
set "REPO=abubakaraftab-dotcom/yorkville-furniture"
set "BRANCH=main"
set "WORK=%TEMP%\yorkville-dashboard-update-%RANDOM%"
set "ZIP=%WORK%\yorkville.zip"
set "EXTRACT=%WORK%\extract"
set "LOG=%ROOT%dashboard-update.log"

if exist "%LOG%" del /Q "%LOG%" >nul

echo.
echo ================================================
echo   Yorkville Furniture Dashboard - Auto Update
echo ================================================
echo.

rem ---------- Stage 1: download the latest code ----------
if not exist "%WORK%" mkdir "%WORK%"

powershell -NoProfile -ExecutionPolicy Bypass -Command "try{ [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12 }catch{}; $ErrorActionPreference='Stop'; New-Item -ItemType Directory -Force -Path '%EXTRACT%' | Out-Null; Invoke-WebRequest -Uri 'https://codeload.github.com/%REPO%/zip/refs/heads/%BRANCH%' -OutFile '%ZIP%' -TimeoutSec 120; Expand-Archive -LiteralPath '%ZIP%' -DestinationPath '%EXTRACT%' -Force" > "%LOG%" 2>&1
if errorlevel 1 (
  echo Retrying download once...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "try{ [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12 }catch{}; $ErrorActionPreference='Stop'; Invoke-WebRequest -Uri 'https://codeload.github.com/%REPO%/zip/refs/heads/%BRANCH%' -OutFile '%ZIP%' -TimeoutSec 240; Expand-Archive -LiteralPath '%ZIP%' -DestinationPath '%EXTRACT%' -Force" >> "%LOG%" 2>&1
)
if errorlevel 1 (
  echo Could not download the latest version. Check your internet connection.
  echo See dashboard-update.log in this folder for details.
  goto :cleanup
)

rem ---------- Stage 2: locate extracted folder ----------
for /d %%D in ("%EXTRACT%\*") do set "SOURCE=%%~fD"
if not defined SOURCE (
  echo The downloaded project could not be opened.
  echo See dashboard-update.log in this folder for details.
  goto :cleanup
)

rem ---------- Stage 3: protect local password ----------
if not exist "%ROOT%.env.local" (
  echo NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD=choose-a-private-password> "%ROOT%.env.local"
  echo.
  echo A private password file was created: .env.local
  echo Open it, replace choose-a-private-password, save it, and run this launcher again.
  goto :cleanup
)
if exist "%ROOT%.env.local" copy /Y "%ROOT%.env.local" "%WORK%\.env.local.backup" >nul

rem ---------- Stage 4: copy project files ----------
rem robocopy returns errorlevel 1-7 on success (it counts as warning);
rem only 8+ is a real failure, so we always run the reliable fallback copy
rem first and treat robocopy only as an optional speed-up helper.
echo Copying project files (this may take a few minutes)...
call node "%~dp0scripts\dashboard-copy.mjs" "%SOURCE%" "%ROOT%" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo Node.js copy failed. Retrying with robocopy...
  robocopy "%SOURCE%" "%ROOT%" /E /R:1 /W:1 /XD node_modules .next out .git /XF .env.local yorkville-dashboard-package.json >> "%LOG%" 2>&1
  if errorlevel 8 (
    echo File copy failed. See dashboard-update.log for details.
    goto :cleanup
  )
)
echo Project files copied successfully.

if exist "%WORK%\.env.local.backup" copy /Y "%WORK%\.env.local.backup" "%ROOT%.env.local" >nul

rem ---------- Stage 5: install packages ----------
echo Installing or updating packages...
call npm install >> "%LOG%" 2>&1
if errorlevel 1 (
  echo npm install failed. Check that Node.js is installed: node -v
  echo See dashboard-update.log for details.
  goto :cleanup
)

rem ---------- Stage 6: start the dashboard ----------
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
