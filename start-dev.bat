@echo off
echo 🚀 Avvio DataHost in modalità sviluppo...

if not exist "Client\DataHost.Web\package.json" (
    echo ❌ Errore: Esegui questo script dalla directory root del progetto DataHost
    pause
    exit /b 1
)

if not exist "Server\package.json" (
    echo ❌ Errore: Esegui questo script dalla directory root del progetto DataHost  
    pause
    exit /b 1
)

echo 🔍 Terminazione processi esistenti...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4300') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1

taskkill /f /im node.exe >nul 2>&1

echo ⏳ Attesa terminazione processi...
timeout /t 3 >nul

echo 📦 Verifica dipendenze backend...
cd Server
if not exist "node_modules\" (
    echo 📥 Installazione dipendenze backend...
    npm install
)

echo 📦 Verifica dipendenze frontend...
cd ..\Client\DataHost.Web
if not exist "node_modules\" (
    echo 📥 Installazione dipendenze frontend...
    npm install
)

cd ..\..

echo ✅ Avvio servizi...

echo 🔧 Avvio backend in modalità debug...
start "DataHost Backend" cmd /k "cd /d %cd%\Server && echo 🟢 Backend avviato - Debug disponibile su porta 9229 && node --inspect=0.0.0.0:9229 server.js"

echo ⏳ Attesa avvio backend...
timeout /t 5 >nul

echo ⚡ Avvio frontend Vite...
start "DataHost Frontend" cmd /k "cd /d %cd%\Client\DataHost.Web && echo 🟢 Frontend avviato su http://localhost:5173 && npm run dev"

echo.
echo 🎉 DataHost avviato con successo!
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:4300
echo 🐛 Debug: localhost:9229 (collega il debugger VS Code)
echo.
echo 💡 Per fermare tutto: chiudi le finestre dei terminali oppure riesegui questo script
echo.
pause
