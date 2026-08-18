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

echo Node.js check:
where node >> "%LOG%" 2>&1
if errorlevel 1 (
  echo ERROR: Node.js not found. Please install Node.js from https://nodejs.org
  echo and run this launcher again.
  goto :cleanup
)
for /f "tokens=*" %%V in ('node -v') do echo Using Node.js: %%V
node -v >> "%LOG%" 2>&1

rem ---------- Stage 1: download the latest code ----------
if not exist "%WORK%" mkdir "%WORK%"

powershell -NoProfile -ExecutionPolicy Bypass -Command "try{ [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12 }catch{}; $ErrorActionPreference='Stop'; New-Item -ItemType Directory -Force -Path '%EXTRACT%' | Out-Null; Invoke-WebRequest -Uri 'https://codeload.github.com/%REPO%/zip/refs/heads/%BRANCH%' -OutFile '%ZIP%' -TimeoutSec 240; Expand-Archive -LiteralPath '%ZIP%' -DestinationPath '%EXTRACT%' -Force" > "%LOG%" 2>&1
if errorlevel 1 (
  echo Retrying download once...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "try{ [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12 }catch{}; $ErrorActionPreference='Stop'; Invoke-WebRequest -Uri 'https://codeload.github.com/%REPO%/zip/refs/heads/%BRANCH%' -OutFile '%ZIP%' -TimeoutSec 300; Expand-Archive -LiteralPath '%ZIP%' -DestinationPath '%EXTRACT%' -Force" >> "%LOG%" 2>&1
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
echo Downloaded and extracted the latest code.

rem ---------- Stage 3: protect local password ----------
if not exist "%ROOT%.env.local" (
  echo NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD=choose-a-private-password> "%ROOT%.env.local"
  echo.
  echo A private password file was created: .env.local
  echo Open it in Notepad, replace choose-a-private-password with your own
  echo private password, save, and run this launcher again.
  goto :cleanup
)
if exist "%ROOT%.env.local" copy /Y "%ROOT%.env.local" "%WORK%\.env.local.backup" >nul

rem ---------- Stage 4: copy project files ----------
echo Copying project files (this may take a few minutes)...
set "COPY_OK=0"

rem Method 1: Node.js copy (handles locked files, always logs reasons)
node "%ROOT%scripts\dashboard-copy.mjs" "%SOURCE%" "%ROOT%" > "%WORK%\copy-node.log" 2>&1
if not errorlevel 1 (
  set "COPY_OK=1"
  echo Node.js copy finished OK.
) else (
  echo Node.js copy finished with some skipped items; verifying files next.
)

rem Method 2: verify essential files exist regardless of warnings
set "ESSENTIAL_OK=1"
if not exist "%ROOT%package.json" set "ESSENTIAL_OK=0"
if not exist "%ROOT%next.config.ts" set "ESSENTIAL_OK=0"
if not exist "%ROOT%src\data\products.json" set "ESSENTIAL_OK=0"
if not exist "%ROOT%scripts\import-dashboard-package.mjs" set "ESSENTIAL_OK=0"
if not exist "%ROOT%src\components\admin\ProductDashboardClient.tsx" set "ESSENTIAL_OK=0"

if "%ESSENTIAL_OK%"=="1" (
  set "COPY_OK=1"
) else (
  echo Essential files are missing; trying robocopy...
  robocopy "%SOURCE%" "%ROOT%" /E /R:1 /W:1 /XD node_modules .next out .git /XF .env.local yorkville-dashboard-package.json >> "%LOG%" 2>&1
  if not errorlevel 8 set "COPY_OK=1"
  if "%COPY_OK%"=="1" (
    echo Robocopy finished.
  ) else (
    echo xcopy fallback...
    (echo \node_modules\) > "%WORK%\xcopy-exclude.txt"
    (echo \.next\) >> "%WORK%\xcopy-exclude.txt"
    (echo \out\) >> "%WORK%\xcopy-exclude.txt"
    (echo \.git\) >> "%WORK%\xcopy-exclude.txt"
    (echo .env.local) >> "%WORK%\xcopy-exclude.txt"
    (echo yorkville-dashboard-package.json) >> "%WORK%\xcopy-exclude.txt"
    xcopy "%SOURCE%\*" "%ROOT%" /E /Y /R /I /EXCLUDE:"%WORK%\xcopy-exclude.txt" > "%WORK%\copy-xcopy.log" 2>&1
    if not errorlevel 1 set "COPY_OK=1"
    if "%COPY_OK%"=="1" (
      echo Xcopy finished.
    )
  )
)

if "%COPY_OK%"=="1" (
  echo Project files copied successfully.
) else (
  echo File copy failed. See dashboard-update.log in this folder for details.
  echo Send this log file to get help.
  goto :cleanup
)

rem Final integrity check: node verification script confirms key files
node -e "const fs=require('fs');const key=['package.json','src/data/products.json','src/components/admin/ProductDashboardClient.tsx','scripts/dashboard-copy.mjs'];let ok=true;for(const k of key){if(!fs.existsSync(k)){console.log('MISSING: '+k);ok=false;}}console.log(ok?'Integrity check passed.':'Integrity check FAILED.');process.exit(ok?0:1);" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo Integrity check failed. See dashboard-update.log for the missing files.
  echo Send this log file to get help.
  goto :cleanup
)

if exist "%WORK%\.env.local.backup" copy /Y "%WORK%\.env.local.backup" "%ROOT%.env.local" >nul

rem ---------- Stage 5: install packages ----------
echo Installing or updating packages...
call npm install >> "%LOG%" 2>&1
if errorlevel 1 (
  echo npm install failed. Check that Node.js is installed: node -v
  echo See dashboard-update.log for details.
  goto :cleanup
)
echo Packages ready.

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
