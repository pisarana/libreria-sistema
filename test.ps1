Write-Host "=== TEST LOGIN ==="
$body = '{"correo":"admin@libreria.com","password":"admin123"}'
try {
    $res = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $body -ContentType "application/json" -SessionVariable ws
    Write-Host "Status: $($res.StatusCode)"
    Write-Host "Body: $($res.Content)"
} catch {
    Write-Host "ERROR: $_"
}

Write-Host ""
Write-Host "=== TEST /api/auth/me (sin sesion) ==="
try {
    $res2 = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/me" -Method GET
    Write-Host "Status: $($res2.StatusCode)"
} catch {
    Write-Host "Status esperado 401: $($_.Exception.Response.StatusCode)"
}

Write-Host ""
Write-Host "=== TEST LIBROS (sin sesion) ==="
try {
    $res3 = Invoke-WebRequest -Uri "http://localhost:8080/api/libros" -Method GET
    Write-Host "Status: $($res3.StatusCode)"
    Write-Host "Body: $($res3.Content.Substring(0, [Math]::Min(300, $res3.Content.Length)))"
} catch {
    Write-Host "Status esperado 401: $($_.Exception.Response.StatusCode)"
}

Write-Host ""
Write-Host "=== TEST LOGIN + LIBROS CON SESION ==="
try {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $login = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $body -ContentType "application/json" -WebSession $session
    Write-Host "Login status: $($login.StatusCode)"

    $libros = Invoke-WebRequest -Uri "http://localhost:8080/api/libros" -Method GET -WebSession $session
    Write-Host "Libros status: $($libros.StatusCode)"
    Write-Host "Libros body: $($libros.Content.Substring(0, [Math]::Min(500, $libros.Content.Length)))"
} catch {
    Write-Host "ERROR: $_"
}

Write-Host ""
Write-Host "=== TEST DASHBOARD STATS ==="
try {
    $session2 = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $login2 = Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $body -ContentType "application/json" -WebSession $session2
    $dash = Invoke-WebRequest -Uri "http://localhost:8080/api/dashboard/stats" -Method GET -WebSession $session2
    Write-Host "Dashboard status: $($dash.StatusCode)"
    Write-Host "Dashboard body: $($dash.Content)"
} catch {
    Write-Host "ERROR: $_"
}

Write-Host ""
Write-Host "=== TEST AUTORES ==="
try {
    $session3 = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $body -ContentType "application/json" -WebSession $session3 | Out-Null
    $autores = Invoke-WebRequest -Uri "http://localhost:8080/api/autores" -Method GET -WebSession $session3
    Write-Host "Autores status: $($autores.StatusCode)"
    Write-Host "Body: $($autores.Content.Substring(0, [Math]::Min(400, $autores.Content.Length)))"
} catch {
    Write-Host "ERROR: $_"
}

Write-Host ""
Write-Host "=== TEST CATEGORIAS ==="
try {
    $session4 = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $body -ContentType "application/json" -WebSession $session4 | Out-Null
    $cats = Invoke-WebRequest -Uri "http://localhost:8080/api/categorias" -Method GET -WebSession $session4
    Write-Host "Categorias status: $($cats.StatusCode)"
    Write-Host "Body: $($cats.Content.Substring(0, [Math]::Min(400, $cats.Content.Length)))"
} catch {
    Write-Host "ERROR: $_"
}
