#!/bin/bash
# Shell script to reset database and storage volumes
echo "Resetting Nalentra Platform (Deleting volumes)..."
docker compose -f docker/compose/docker-compose.yml down -v
echo "Re-initializing platform containers..."
docker compose -f docker/compose/docker-compose.yml up -d --build
