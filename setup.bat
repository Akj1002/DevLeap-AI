@echo off
REM DevLeap AI - Quick Setup Script for Windows
REM This script automates the initial setup of DevLeap AI

echo.
echo 🚀 DevLeap AI - Quick Setup Script (Windows)
echo =============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected: 
node --version

echo ✅ npm detected: 
npm --version

echo.

REM Setup Backend
echo 📦 Setting up Backend...
cd backend

if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo ⚠️  Please update backend\.env with your credentials:
    echo    - MONGO_URI
    echo    - GOOGLE_CLIENT_ID ^& GOOGLE_CLIENT_SECRET
    echo    - GEMINI_API_KEY
    echo    - EMAIL_USER ^& EMAIL_PASS
)

echo Installing backend dependencies...
call npm install

echo.
echo ✅ Backend setup complete!
echo.

REM Setup Frontend
cd ..\frontend

echo 📦 Setting up Frontend...

if not exist ".env.local" (
    echo Creating .env.local file from .env.example...
    copy .env.example .env.local
    echo ⚠️  Please update frontend\.env.local with your credentials:
    echo    - REACT_APP_GOOGLE_CLIENT_ID
    echo    - REACT_APP_API_URL (usually http://localhost:5000)
)

echo Installing frontend dependencies...
call npm install

echo.
echo ✅ Frontend setup complete!
echo.

REM Final instructions
echo =============================================
echo ✨ Setup Complete!
echo =============================================
echo.
echo Next steps:
echo 1. Update backend\.env with your credentials
echo 2. Update frontend\.env.local with your credentials
echo 3. Start backend: cd backend && npm start (or npm run dev)
echo 4. Start frontend: cd frontend && npm start
echo.
echo 📚 For detailed setup instructions, see README.md
echo.
echo Happy coding! 🎉
echo.
pause
