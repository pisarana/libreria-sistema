$MVN = "C:\Users\misae\.m2\wrapper\dists\apache-maven-3.9.11-bin\6mqf5t809d9geo83kj4ttckcbc\apache-maven-3.9.11\bin\mvn.cmd"
$PROJECT = "C:\Users\misae\Documents\unviersidad\Lenguaje de Programacion\libreria-sistema"
$LOG = "$PROJECT\server.log"
$ERR = "$PROJECT\server-err.log"

# Limpiar logs anteriores
if (Test-Path $LOG) { Remove-Item $LOG }
if (Test-Path $ERR) { Remove-Item $ERR }

Start-Process -FilePath $MVN `
    -ArgumentList "spring-boot:run" `
    -WorkingDirectory $PROJECT `
    -RedirectStandardOutput $LOG `
    -RedirectStandardError $ERR `
    -WindowStyle Hidden

Write-Host "Servidor arrancando... esperando 35 segundos"
Start-Sleep -Seconds 35
Write-Host "=== STDOUT (ultimas 50 lineas) ==="
if (Test-Path $LOG) { Get-Content $LOG | Select-Object -Last 50 }
Write-Host "=== STDERR ==="
if (Test-Path $ERR) { Get-Content $ERR | Select-Object -Last 20 }
