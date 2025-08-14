#!/bin/bash

echo "🛑 Stopping SentinelOne Lite..."
echo "================================"

# Stop the services
if command -v docker-compose &> /dev/null; then
    docker-compose -f infra/docker-compose.yml down
else
    docker compose -f infra/docker-compose.yml down
fi

echo ""
echo "✅ Services stopped!"
echo ""
echo "💡 To start again, run:"
echo "   ./start.sh"
