@echo off
title CoverCraft Dev Server
cd /d "d:\CoverGen"
set "PATH=C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"
set "NODE=C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "PNPM_JS=C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\pnpm\bin\pnpm.cjs"

echo Starting CoverCraft development server...
echo Local:   http://localhost:5173
echo Network: http://192.168.0.105:5173
start http://localhost:5173

"%NODE%" "%PNPM_JS%" dev --host
pause
