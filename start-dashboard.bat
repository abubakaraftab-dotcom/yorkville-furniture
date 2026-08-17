@echo off
cd /d "%~dp0"
if not exist .env.local (
  echo NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD=choose-a-private-password> .env.local
  echo Created .env.local. Please replace choose-a-private-password with your private dashboard password, save the file, and run this launcher again.
  pause
  exit /b 0
)
call npm run dev
pause
