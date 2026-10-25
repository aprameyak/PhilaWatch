#!/bin/bash

echo "Starting PhilaWatch Backend..."

if [ ! -f "main.py" ]; then
    echo "Error: main.py not found. Please run this script from the backend directory."
    exit 1
fi

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
./venv/bin/pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp env.example .env
    echo "Created .env file. You may want to edit it with your MongoDB connection details."
fi

echo "Checking if port 8000 is available..."
if lsof -i :8000 &> /dev/null; then
    echo "Port 8000 is already in use. Stopping existing processes..."
    lsof -ti :8000 | xargs kill -9 2>/dev/null || true
    sleep 2
    echo "Port 8000 is now available"
else
    echo "Port 8000 is available"
fi

echo "Checking MongoDB connection..."
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.runCommand('ping')" --quiet &> /dev/null; then
        echo "MongoDB is running and accessible"
    else
        echo "MongoDB is not running. The API will use fallback sample data."
        echo "   To start MongoDB: brew services start mongodb-community"
    fi
else
    echo "MongoDB client not found. The API will use fallback sample data."
fi

echo "Starting FastAPI server on http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "Press Ctrl+C to stop the server"
echo ""

./venv/bin/python3 main.py
