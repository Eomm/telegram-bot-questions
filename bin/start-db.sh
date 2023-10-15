#!/bin/bash

# Check if container is already running
if docker ps --filter "name=t-bot-retros" --format "{{.Names}}" | grep -q "t-bot-retros"; then
    echo "Container is already running."
else
    # Run the Docker command
    docker run --rm -p 5432:5432 --name t-bot-retros -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=t-bot -d postgres:15-alpine
fi
