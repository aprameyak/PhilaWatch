#!/bin/bash

# PhilaWatch Environment Setup Script
# This script helps you set up environment variables for the PhilaWatch application

echo "🚀 PhilaWatch Environment Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ] || [ ! -d "frontend" ] || [ ! -d "authapi" ] || [ ! -d "dbapi" ]; then
    echo "❌ Error: Please run this script from the PhilaWatch root directory"
    exit 1
fi

echo "📁 Setting up environment files..."
echo ""

# Frontend setup
if [ -f "frontend/env.example" ]; then
    if [ ! -f "frontend/.env" ]; then
        cp frontend/env.example frontend/.env
        echo "✅ Created frontend/.env from template"
    else
        echo "⚠️  frontend/.env already exists, skipping..."
    fi
else
    echo "❌ frontend/env.example not found"
fi

# Auth API setup
if [ -f "authapi/env.example" ]; then
    if [ ! -f "authapi/.env" ]; then
        cp authapi/env.example authapi/.env
        echo "✅ Created authapi/.env from template"
    else
        echo "⚠️  authapi/.env already exists, skipping..."
    fi
else
    echo "❌ authapi/env.example not found"
fi

# Database API setup
if [ -f "dbapi/env.example" ]; then
    if [ ! -f "dbapi/.env" ]; then
        cp dbapi/env.example dbapi/.env
        echo "✅ Created dbapi/.env from template"
    else
        echo "⚠️  dbapi/.env already exists, skipping..."
    fi
else
    echo "❌ dbapi/env.example not found"
fi

echo ""
echo "🔧 Next Steps:"
echo "=============="
echo ""
echo "1. Edit the .env files with your actual values:"
echo "   - frontend/.env (API keys, URLs)"
echo "   - authapi/.env (SECRET_KEY, database config)"
echo "   - dbapi/.env (database config)"
echo ""
echo "2. Install Python dependencies:"
echo "   cd authapi && pip install -r requirements.txt"
echo "   cd ../dbapi && pip install -r requirements.txt"
echo ""
echo "3. Install frontend dependencies:"
echo "   cd ../frontend && npm install"
echo ""
echo "4. Read ENVIRONMENT_SETUP.md for detailed configuration instructions"
echo ""
echo "⚠️  IMPORTANT: Never commit .env files to version control!"
echo ""
echo "🎉 Environment setup complete!"

