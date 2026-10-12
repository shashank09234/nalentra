#!/bin/bash
# Shell script to spin up the local development platform
echo "Starting Nalentra Local Platform..."
docker compose -f docker/compose/docker-compose.yml up -d --build
echo "Platform starting in background. Check status using: ./logs-local.sh"
