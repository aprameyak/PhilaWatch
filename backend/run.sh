#!/bin/bash

# PhillySafe Backend Startup Script
echo "🚀 Starting PhillySafe Backend..."

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: main.py not found. Please run this script from the backend directory."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file. You may want to edit it with your MongoDB connection details."
fi

# Check if MongoDB is running (optional)
echo "🔍 Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" --quiet &> /dev/null; then
        echo "✅ MongoDB is running and accessible"
    else
        echo "⚠️  MongoDB is not running. The API will use fallback sample data."
        echo "   To start MongoDB: brew services start mongodb-community"
    fi
else
    echo "⚠️  MongoDB client not found. The API will use fallback sample data."
fi

# Start the FastAPI server
echo "🌟 Starting FastAPI server on http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

python main.py
