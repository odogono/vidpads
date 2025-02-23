#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Run build script and store its exit status
./docker_build.sh

# If we get here, build was successful
docker stop vopads-server || true
docker rm vopads-server || true
docker run -d -e SERVER_PORT=3000 -p 3000:3000 --restart unless-stopped --name vopads-server vopads-server