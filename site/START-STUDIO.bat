@echo off
title STATIC Content Studio
cd /d "D:\roblox game 4 research\site"
echo.
echo   ==============================
echo    STATIC Content Studio
echo.
echo    If your browser did not open,
echo    go to:  http://127.0.0.1:4323
   
echo   ==============================
echo.
node scripts/studio.mjs
if errorlevel 1 (
  echo.
  echo  Studio exited. If it said "port busy / already running",
  echo  just open your browser at:  http://127.0.0.1:4323
)
pause

