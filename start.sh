#!/bin/bash

# Al Habib Bakery - Startup Script
echo "🚀 Starting Al Habib Bakery Application..."
echo ""

# Set environment variable to handle SSL certificate issues
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Navigate to project directory
cd "$(dirname "$0")"

# Start Expo development server
echo "📱 Starting Expo development server..."
echo "   - Web: http://localhost:8081"
echo "   - Press 'w' for web browser"
echo "   - Press 'i' for iOS simulator"
echo "   - Press 'a' for Android emulator"
echo ""
echo "⏳ Please wait while the server starts..."
echo ""

npx expo start --web

