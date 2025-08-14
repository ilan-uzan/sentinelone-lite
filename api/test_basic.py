#!/usr/bin/env python3
"""
Basic test script for SentinelOne Lite API
Run this to verify the system is working correctly
"""

import requests
import time
import json

def test_api():
    """Test the basic API functionality"""
    base_url = "http://localhost:8000"
    
    print("🧪 Testing SentinelOne Lite API...")
    
    # Test 1: Health Check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health check passed: {health_data['status']}")
            print(f"   Database: {health_data['database']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test 2: Get incidents (should be empty initially)
    print("\n2. Testing incidents endpoint...")
    try:
        response = requests.get(f"{base_url}/incidents", timeout=10)
        if response.status_code == 200:
            incidents = response.json()
            print(f"✅ Incidents endpoint working: {len(incidents)} incidents found")
        else:
            print(f"❌ Incidents endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Incidents endpoint error: {e}")
        return False
    
    # Test 3: Get daily stats
    print("\n3. Testing daily stats endpoint...")
    try:
        response = requests.get(f"{base_url}/stats/daily", timeout=10)
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Daily stats endpoint working: {stats['today_count']} incidents today")
        else:
            print(f"❌ Daily stats endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Daily stats endpoint error: {e}")
        return False
    
    # Test 4: Generate test events
    print("\n4. Testing test event generation...")
    try:
        response = requests.post(f"{base_url}/test-event", timeout=30)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Test events generated: {result['events_created']} events")
            print(f"   Expected incidents: {len(result['expected_incidents'])}")
        else:
            print(f"❌ Test event generation failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Test event generation error: {e}")
        return False
    
    # Test 5: Wait and check for incidents
    print("\n5. Waiting for detection engine to process events...")
    time.sleep(5)
    
    try:
        response = requests.get(f"{base_url}/incidents", timeout=10)
        if response.status_code == 200:
            incidents = response.json()
            print(f"✅ Detection working: {len(incidents)} incidents detected")
            
            if len(incidents) > 0:
                print("\n📊 Detected incidents:")
                for incident in incidents[:3]:  # Show first 3
                    print(f"   • {incident['type']} from {incident['ip']} - {incident['severity']} severity")
            else:
                print("   ⚠️  No incidents detected yet (may need more time)")
        else:
            print(f"❌ Failed to get incidents after detection: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking incidents after detection: {e}")
        return False
    
    print("\n🎉 All basic tests completed!")
    return True

if __name__ == "__main__":
    print("🚀 SentinelOne Lite - Basic API Test")
    print("=" * 50)
    
    success = test_api()
    
    if success:
        print("\n✅ System is working correctly!")
        print("\nNext steps:")
        print("1. Open dashboard at http://localhost:5173")
        print("2. Click 'Generate Demo Traffic' button")
        print("3. Watch incidents appear in real-time")
    else:
        print("\n❌ Some tests failed. Check the logs above.")
        print("\nTroubleshooting:")
        print("1. Ensure all services are running: docker compose -f ../infra/docker-compose.yml ps")
        print("2. Check API logs: docker compose -f ../infra/docker-compose.yml logs api")
        print("3. Check database logs: docker compose -f ../infra/docker-compose.yml logs db")
