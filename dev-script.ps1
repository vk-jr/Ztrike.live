# Development environment setup script
$ErrorActionPreference = 'Stop'

Write-Host "Starting development environment..." -ForegroundColor Green

function Start-DevService {
    param (
        [string]$Name,
        [scriptblock]$ScriptBlock
    )
    
    Write-Host "Starting $Name..." -ForegroundColor Cyan
    $job = Start-Process pwsh -ArgumentList "-NoExit", "-Command", $ScriptBlock -PassThru
    return $job
}

# Start services
$firebaseJob = Start-DevService -Name "Firebase Emulators" -ScriptBlock {
    Set-Location "e:\Rahul\Ztrike main project\75 done\ztrike-sports-platform"
    firebase emulators:start
}

$nextJob = Start-DevService -Name "Next.js Development Server" -ScriptBlock {
    Set-Location "d:\Aman\Startups&Works\ztrike\ztrike-sports-platform"
    npm run dev
}

Write-Host "`nDevelopment environment is running!" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all services`n" -ForegroundColor Yellow

try {
    # Keep script running and wait for Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
        if (!$firebaseJob.HasExited -and !$nextJob.HasExited) {
            continue
        }
        Write-Host "One of the services has stopped unexpectedly!" -ForegroundColor Red
        break
    }
}
finally {
    # Cleanup when script is terminated
    if ($firebaseJob) { Stop-Process -Id $firebaseJob.Id -Force -ErrorAction SilentlyContinue }
    if ($nextJob) { Stop-Process -Id $nextJob.Id -Force -ErrorAction SilentlyContinue }
    Write-Host "`nDevelopment environment stopped." -ForegroundColor Green
}