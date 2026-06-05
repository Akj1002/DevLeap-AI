#!/bin/bash

# DevLeap AI - Quick Setup Script
# This script automates the initial setup of DevLeap AI

echo "🚀 DevLeap AI - Quick Setup Script"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ npm $(npm -v) detected"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your credentials:"
    echo "   - MONGO_URI"
    echo "   - GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET"
    echo "   - GEMINI_API_KEY"
    echo "   - EMAIL_USER & EMAIL_PASS"
fi

echo "Installing backend dependencies..."
npm install

echo ""
echo "✅ Backend setup complete!"
echo ""

# Setup Frontend
cd ../frontend

echo "📦 Setting up Frontend..."

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update frontend/.env.local with your credentials:"
    echo "   - REACT_APP_GOOGLE_CLIENT_ID"
    echo "   - REACT_APP_API_URL (usually http://localhost:5000)"
fi

echo "Installing frontend dependencies..."
npm install

echo ""
echo "✅ Frontend setup complete!"
echo ""

# Final instructions
echo "=================================="
echo "✨ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your credentials"
echo "2. Update frontend/.env.local with your credentials"
echo "3. Start backend: cd backend && npm start (or npm run dev)"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "📚 For detailed setup instructions, see README.md"
echo ""
echo "Happy coding! 🎉"
