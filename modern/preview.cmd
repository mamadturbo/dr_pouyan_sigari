@echo off
setlocal
cd /d "%~dp0"
set "SIGARI_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%SIGARI_NODE%" (
  echo Bundled Node.js was not found. Open this project in Codex to restore its runtime.
  pause
  exit /b 1
)
if not exist "out\index.html" (
  echo The static export is missing. Build the project before previewing.
  pause
  exit /b 1
)
echo Keep this window open, then visit http://127.0.0.1:4175
"%SIGARI_NODE%" "scripts\serve.mjs"
if errorlevel 1 pause
