# Script PowerShell per avviare frontend e backend in modalità debug
# Uso: .\start-dev.ps1

Write-Host "🚀 Avvio DataHost in modalità sviluppo..." -ForegroundColor Green

# Funzione per killare processi che usano porte specifiche
function Kill-ProcessOnPort {
    param($Port)
    try {
        $process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
        if ($process) {
            Write-Host "🔪 Terminando processo sulla porta $Port (PID: $process)" -ForegroundColor Yellow
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
    } catch {
        # Porta non in uso, continua
    }
}

# Funzione per killare processi Node.js e Vite
function Kill-DevProcesses {
    Write-Host "🔍 Ricerca processi di sviluppo esistenti..." -ForegroundColor Yellow
    
    # Kill processi Node.js che potrebbero essere il backend
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { 
        $_.ProcessName -eq "node" 
    } | ForEach-Object {
        Write-Host "🔪 Terminando processo Node.js (PID: $($_.Id))" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Kill processi che usano le porte standard
    Kill-ProcessOnPort 4300  # Backend porta
    Kill-ProcessOnPort 5173  # Vite dev server porta
    Kill-ProcessOnPort 3000  # Alternative frontend porta
    
    Start-Sleep -Seconds 3
}

if (-not (Test-Path ".\Client\DataHost.Web\package.json") -or -not (Test-Path ".\Server\package.json")) {
    Write-Host "❌ Errore: Esegui questo script dalla directory root del progetto DataHost" -ForegroundColor Red
    exit 1
}

Kill-DevProcesses

Write-Host "📦 Verifica dipendenze..." -ForegroundColor Cyan

Set-Location ".\Server"
if (-not (Test-Path ".\node_modules")) {
    Write-Host "📥 Installazione dipendenze backend..." -ForegroundColor Yellow
    npm install
}

Set-Location "..\Client\DataHost.Web"
if (-not (Test-Path ".\node_modules")) {
    Write-Host "📥 Installazione dipendenze frontend..." -ForegroundColor Yellow
    npm install
}

# Torna alla directory root
Set-Location "..\..\"

Write-Host "✅ Avvio servizi..." -ForegroundColor Green

# Avvia backend in debug mode
Write-Host "🔧 Avvio backend in modalità debug (porta 4300)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)\Server'; Write-Host '🟢 Backend avviato - Debug disponibile su porta 9229' -ForegroundColor Green; node --inspect=0.0.0.0:9229 server.js" -WindowStyle Normal

# Aspetta che il backend si avvii
Start-Sleep -Seconds 5

# Avvia frontend
Write-Host "⚡ Avvio frontend Vite (porta 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$(Get-Location)\Client\DataHost.Web'; Write-Host '🟢 Frontend avviato su http://localhost:5173' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "🎉 DataHost avviato con successo!" -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:4300" -ForegroundColor Cyan  
Write-Host "🐛 Debug: localhost:9229 (collega il debugger VS Code)" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Per fermare tutto: Ctrl+C nelle finestre dei terminali oppure riesegui questo script" -ForegroundColor Gray
