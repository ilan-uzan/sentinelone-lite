#!/bin/bash

echo "🎬 SentinelOne Lite - Live Demo"
echo "================================"

# Check if system is running
echo "🔍 Checking system status..."

if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "❌ System is not running. Please start it first with:"
    echo "   ./start.sh"
    exit 1
fi

echo "✅ System is running!"
echo ""

# Show initial state
echo "📊 Initial State:"
echo "=================="
initial_incidents=$(curl -s http://localhost:8000/incidents | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f'   📋 {len(data)} incidents currently in system')
except:
    print('   ⚠️  Could not parse incidents')
")
echo "$initial_incidents"

echo ""
echo "🚀 Generating Demo Traffic..."
echo "============================"

# Generate test events
response=$(curl -s -X POST http://localhost:8000/test-event)
if [ $? -eq 0 ]; then
    echo "✅ Test events generated successfully!"
    
    # Parse response
    events_created=$(echo "$response" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('events_created', 'Unknown'))
except:
    print('Unknown')
")
    
    echo "   📊 Created $events_created test events"
    echo "   ⏳ Waiting for detection engine to process..."
    
    # Wait for processing
    sleep 5
    
    echo ""
    echo "🔍 Checking for Detected Incidents..."
    echo "===================================="
    
    # Check for new incidents
    final_incidents=$(curl -s http://localhost:8000/incidents | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f'   📋 {len(data)} incidents now in system')
    if data:
        print('   🚨 Detected Incidents:')
        for incident in data:
            print(f'     • {incident[\"type\"]} from {incident[\"ip\"]}')
            print(f'       Severity: {incident[\"severity\"]}')
            print(f'       Count: {incident[\"count\"]}')
            if incident.get('meta', {}).get('ports'):
                ports = incident['meta']['ports'][:5]  # Show first 5 ports
                print(f'       Ports: {ports}')
            print('')
except Exception as e:
    print(f'   ⚠️  Error: {e}')
")
    
    echo "$final_incidents"
    
    echo ""
    echo "📈 Daily Statistics:"
    echo "===================="
    
    # Get daily stats
    stats=$(curl -s http://localhost:8000/stats/daily | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f'   📊 Today\'s Total: {data.get(\"today_count\", 0)} incidents')
    print(f'   🔍 By Type: {data.get(\"by_type\", {})}')
except Exception as e:
    print(f'   ⚠️  Error: {e}')
")
    
    echo "$stats"
    
else
    echo "❌ Failed to generate test events"
    exit 1
fi

echo ""
echo "🎉 Demo Complete!"
echo "================"
echo ""
echo "🌐 Open your browser to see the dashboard:"
echo "   http://localhost:5173"
echo ""
echo "📊 The dashboard will show:"
echo "   • KPI cards with incident counts"
echo "   • Hourly chart of incidents"
echo "   • Table of all detected incidents"
echo ""
echo "🔄 Try clicking 'Generate Demo Traffic' again!"
echo ""
echo "💡 Other useful commands:"
echo "   ./status.sh    - Check system status"
echo "   ./stop.sh      - Stop the system"
echo "   python3 api/test_basic.py - Run automated tests"
