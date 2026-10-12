# PowerShell script to halt container operations
Write-Host "Stopping Nalentra Local Platform..." -ForegroundColor Red
docker compose -f docker/compose/docker-compose.yml down
Write-Host "Platform stopped." -ForegroundColor Green
