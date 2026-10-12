# PowerShell script to spin up the local development platform
Write-Host "Starting Nalentra Local Platform..." -ForegroundColor Green
docker compose -f docker/compose/docker-compose.yml up -d --build
Write-Host "Platform starting in background. Check status using: .\logs-local.ps1" -ForegroundColor Yellow
