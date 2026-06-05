#!/bin/bash

# DevLeap AI Production Setup Script
# This script sets up the application for production deployment

set -e

echo "🚀 DevLeap AI Production Setup"
echo "=============================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose installed"
echo ""

# Create directories
echo "📁 Creating necessary directories..."
mkdir -p backend/logs
mkdir -p ssl
mkdir -p data/mongodb
mkdir -p data/redis
echo "✅ Directories created"
echo ""

# Generate JWT Secret if not exists
echo "🔐 Generating JWT Secret..."
if grep -q "JWT_SECRET=generate_a_secure" backend/.env 2>/dev/null || [ ! -f backend/.env ]; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo "Generated JWT_SECRET: $JWT_SECRET"
    echo "⚠️  Please update backend/.env with this secret"
else
    echo "✅ JWT_SECRET already configured"
fi
echo ""

# Check environment variables
echo "🔧 Environment Variables Check..."
if [ ! -f backend/.env ]; then
    echo "⚠️  Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    echo "📝 Please update backend/.env with your credentials:"
    echo "   - MONGO_URI"
    echo "   - JWT_SECRET"
    echo "   - GOOGLE_CLIENT_ID & SECRET"
    echo "   - GEMINI_API_KEY"
    echo "   - EMAIL_USER & EMAIL_PASS"
else
    echo "✅ backend/.env exists"
fi
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "   Backend..."
cd backend
npm install
cd ..
echo "   Frontend..."
cd frontend
npm install
cd ..
echo "✅ Dependencies installed"
echo ""

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build
echo "✅ Docker images built"
echo ""

# Create SSL certificates (development)
echo "🔐 Setting up SSL certificates..."
if [ ! -f ssl/cert.pem ]; then
    echo "   Generating self-signed certificate for development..."
    openssl req -x509 -newkey rsa:4096 -nodes \
        -out ssl/cert.pem -keyout ssl/key.pem -days 365 \
        -subj "/C=US/ST=State/L=City/O=DevLeap/CN=localhost"
    echo "✅ SSL certificate generated"
else
    echo "✅ SSL certificate already exists"
fi
echo ""

# Start services
echo "🚀 Starting services..."
docker-compose up -d
echo "✅ Services started"
echo ""

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 15

# Health checks
echo "🏥 Running health checks..."

BACKEND_HEALTH=$(curl -s http://localhost:5000/health | grep -q "healthy" && echo "healthy" || echo "unhealthy")
FRONTEND_HEALTH=$(curl -s http://localhost/health 2>/dev/null | grep -q "healthy" && echo "healthy" || echo "unhealthy")

echo "   Backend: $BACKEND_HEALTH"
echo "   Frontend: $FRONTEND_HEALTH"
echo ""

if [ "$BACKEND_HEALTH" = "healthy" ]; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend might need more time to start. Check logs with:"
    echo "   docker-compose logs backend"
fi

# Seed database
echo ""
echo "🌱 Seeding database..."
echo "   Run: docker-compose exec backend npm run seed"
echo ""

# Summary
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "📊 Access the application:"
echo "   Frontend: http://localhost"
echo "   API: http://localhost:5000"
echo "   Health: http://localhost:5000/health"
echo ""
echo "📋 Important URLs:"
echo "   API Docs: http://localhost:5000/api/docs"
echo "   MongoDB: mongodb://localhost:27017"
echo "   Redis: redis://localhost:6379"
echo ""
echo "📝 Next steps:"
echo "   1. Update backend/.env with your credentials"
echo "   2. Run: docker-compose exec backend npm run seed"
echo "   3. Access http://localhost in your browser"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose down"
echo ""
echo "📚 Documentation:"
echo "   - PRODUCTION_SETUP.md"
echo "   - README.md"
echo ""
