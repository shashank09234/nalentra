# PowerShell script to reset database and storage volumes
Write-Host "Resetting Nalentra Platform (Deleting volumes)..." -ForegroundColor Red
docker compose -f docker/compose/docker-compose.yml down -v
Write-Host "Re-initializing platform containers..." -ForegroundColor Green
docker compose -f docker/compose/docker-compose.yml up -d --build
