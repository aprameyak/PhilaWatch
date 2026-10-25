#!/bin/bash

echo "Stopping PhilaWatch Backend..."

if lsof -i :8000 &> /dev/null; then
    echo "Found processes using port 8000..."
    PIDS=$(lsof -ti :8000)
    echo "Process IDs: $PIDS"
    
    echo "Stopping processes..."
    echo $PIDS | xargs kill -9 2>/dev/null || true
    
    sleep 2
    if lsof -i :8000 &> /dev/null; then
        echo "Some processes may still be running. Try running this script again."
    else
        echo "Backend server stopped successfully!"
    fi
else
    echo "No processes found using port 8000"
    echo "Backend server is not running"
fi
