$base='http://localhost:5235/api'
Write-Host "Reset password..."
try {
    Invoke-RestMethod -Uri "$base/auth/reset-password" -Method Put -Body (@{ email='admin@autoservice.md'; newPassword='Admin123!' } | ConvertTo-Json) -ContentType 'application/json'
    Write-Host "Reset OK"
} catch {
    Write-Host "Reset failed: $_"
    exit 1
}

Write-Host "Login..."
try {
    $loginRes = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -Body (@{ email='admin@autoservice.md'; password='Admin123!' } | ConvertTo-Json) -ContentType 'application/json'
    $token = $loginRes.token
    Write-Host "Token: $($token.Substring(0,20))..."
} catch {
    Write-Host "Login failed: $_"
    exit 1
}

$headers = @{ Authorization = "Bearer $token" }

Write-Host "Create service..."
try {
    $service = Invoke-RestMethod -Uri "$base/services" -Method Post -Body (@{ name='E2E Test Service'; description='Created by automated smoke test'; price=1234 } | ConvertTo-Json) -ContentType 'application/json' -Headers $headers
    Write-Host "Created service id: $($service.id)"
} catch {
    Write-Host "Create service failed: $_"
    exit 1
}

Write-Host "List services..."
try {
    $all = Invoke-RestMethod -Uri "$base/services" -Method Get -Headers $headers
    Write-Host "Services count: $($all.Count)"
} catch {
    Write-Host "List services failed: $_"
}

Write-Host "Update service..."
try {
    Invoke-RestMethod -Uri "$base/services/$($service.id)" -Method Put -Body (@{ id=$service.id; name='E2E Test Service Updated'; description='Updated by test'; price=2222 } | ConvertTo-Json) -ContentType 'application/json' -Headers $headers
    Write-Host "Service updated"
} catch {
    Write-Host "Update service failed: $_"
}

Write-Host "Delete service..."
try {
    Invoke-RestMethod -Uri "$base/services/$($service.id)" -Method Delete -Headers $headers
    Write-Host "Service deleted"
} catch {
    Write-Host "Delete service failed: $_"
}

Write-Host "Create appointment..."
try {
    $appoint = Invoke-RestMethod -Uri "$base/appointments" -Method Post -Body (@{ customerId=1; vehicleId=1; mechanicId=1; serviceId=1; scheduledDate='2026-06-10T10:00:00'; problemDescription='E2E smoke' } | ConvertTo-Json) -ContentType 'application/json' -Headers $headers
    Write-Host "Created appointment id: $($appoint.id)"
} catch {
    Write-Host "Create appointment failed: $_"
    exit 1
}

Write-Host "List appointments..."
try {
    $apps = Invoke-RestMethod -Uri "$base/appointments" -Method Get -Headers $headers
    Write-Host "Appointments count: $($apps.Count)"
} catch {
    Write-Host "List appointments failed: $_"
}

Write-Host "Update appointment..."
try {
    Invoke-RestMethod -Uri "$base/appointments/$($appoint.id)" -Method Put -Body (@{ id=$appoint.id; appointmentCode=$appoint.appointmentCode; customerId=1; vehicleId=1; mechanicId=1; serviceId=1; scheduledDate='2026-06-10T12:00:00'; problemDescription='Updated by test'; status='Programat' } | ConvertTo-Json) -ContentType 'application/json' -Headers $headers
    Write-Host "Appointment updated"
} catch {
    Write-Host "Update appointment failed: $_"
}

Write-Host "Delete appointment..."
try {
    Invoke-RestMethod -Uri "$base/appointments/$($appoint.id)" -Method Delete -Headers $headers
    Write-Host "Appointment deleted"
} catch {
    Write-Host "Delete appointment failed: $_"
}

Write-Host "CRUD tests finished."
