#!/bin/bash
# Shell script to halt container operations
echo "Stopping Nalentra Local Platform..."
docker compose -f docker/compose/docker-compose.yml down
echo "Platform stopped."
