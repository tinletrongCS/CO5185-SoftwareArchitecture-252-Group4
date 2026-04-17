#!/bin/sh
set -e

echo "=== Entrypoint starting ==="
echo "Current dir: $(pwd)"
echo "Current user: $(whoami)"
ls -la
echo "=== Contents of /app ==="
ls -la /app 2>/dev/null || echo "/app not found"

if [ -f /app/mvnw ]; then
    echo "=== mvnw found, making executable ==="
    chmod +x /app/mvnw
    ls -la /app/mvnw
    echo "=== Running mvnw ==="
    cd /app && /app/mvnw spring-boot:run
else
    echo "=== mvnw NOT found in /app ==="
    echo "=== Trying current dir ==="
    ls -la mvnw 2>/dev/null || echo "mvnw not in current dir"
    if [ -f ./mvnw ]; then
        chmod +x ./mvnw
        ./mvnw spring-boot:run
    fi
fi