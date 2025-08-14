#!/bin/bash

echo "🚀 SentinelOne Lite - Starting up..."
echo "======================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose and try again."
    exit 1
fi

# Copy environment files if they don't exist
if [ ! -f "api/.env" ]; then
    echo "📝 Creating API environment file..."
    cp api/env.example api/.env
    echo "   ✅ Created api/.env (edit this file to configure alerts)"
fi

if [ ! -f "web/.env" ]; then
    echo "📝 Creating web environment file..."
    cp web/env.example web/.env
    echo "   ✅ Created web/.env"
fi

echo ""
echo "🔧 Starting services..."
echo "   This may take a few minutes on first run..."

# Start the services
if command -v docker-compose &> /dev/null; then
    docker-compose -f infra/docker-compose.yml up --build -d
else
    docker compose -f infra/docker-compose.yml up --build -d
fi

echo ""
echo "⏳ Waiting for services to be ready..."

# Wait for API to be ready
echo "   Waiting for API..."
until curl -s http://localhost:8000/health > /dev/null 2>&1; do
    echo "   ⏳ API not ready yet..."
    sleep 5
done

echo "   ✅ API is ready!"

# Wait for web to be ready
echo "   Waiting for web dashboard..."
until curl -s http://localhost:5173 > /dev/null 2>&1; do
    echo "   ⏳ Web dashboard not ready yet..."
    sleep 5
done

echo "   ✅ Web dashboard is ready!"

echo ""
echo "🎉 SentinelOne Lite is ready!"
echo "=============================="
echo ""
echo "📊 Dashboard: http://localhost:5173"
echo "🔌 API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🏥 Health Check: http://localhost:8000/health"
echo ""
echo "🧪 Test the system:"
echo "   python3 api/test_basic.py"
echo ""
echo "📋 View logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker compose down"
echo ""
echo "🚀 Happy monitoring!"
