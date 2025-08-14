#!/bin/bash

echo "📊 SentinelOne Lite - Status Check"
echo "=================================="

# Check if services are running
echo "🔍 Checking service status..."

if command -v docker-compose &> /dev/null; then
    docker-compose -f infra/docker-compose.yml ps
else
    docker compose -f infra/docker-compose.yml ps
fi

echo ""
echo "🏥 Health Checks:"
echo "=================="

# Check API health
echo "🔌 API (http://localhost:8000):"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    api_health=$(curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || echo "Response received")
    echo "   ✅ Running - $api_health"
else
    echo "   ❌ Not responding"
fi

# Check web dashboard
echo "📊 Web Dashboard (http://localhost):"
if curl -s http://localhost > /dev/null 2>&1; then
    echo "   ✅ Running"
else
    echo "   ❌ Not responding"
fi

# Check database
echo "🗄️  Database:"
if docker ps | grep -q "infra-db-1"; then
    echo "   ✅ Container running"
else
    echo "   ❌ Container not found"
fi

echo ""
echo "📋 Recent Incidents:"
echo "===================="

# Get recent incidents
if curl -s http://localhost:8000/incidents > /dev/null 2>&1; then
    incidents=$(curl -s http://localhost:8000/incidents | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f'   📊 {len(data)} incidents found')
    if data:
        print('   Recent:')
        for incident in data[:3]:
            print(f'     • {incident[\"type\"]} from {incident[\"ip\"]} - {incident[\"severity\"]}')
except:
    print('   ⚠️  Could not parse incidents')
")
    echo "$incidents"
else
    echo "   ❌ Could not fetch incidents"
fi

echo ""
echo "💡 Quick Actions:"
echo "   Start:  ./start.sh"
echo "   Stop:   ./stop.sh"
echo "   Test:   python3 api/test_basic.py"
echo "   Logs:   docker compose -f infra/docker-compose.yml logs -f"
