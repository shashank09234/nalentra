#!/bin/bash
# Shell script to trace containers log output
docker compose -f docker/compose/docker-compose.yml logs -f
