#!/bin/bash

# JKP Katastar - Development Wrapper Script
# This is a convenience wrapper that redirects to the actual dev script

echo "🏛️  JKP Katastar Cemetery Management System"
echo "=========================================="

# Check if development directory exists
if [ ! -d "development" ]; then
    echo "❌ Development directory not found!"
    echo "   Make sure you're in the project root directory."
    exit 1
fi

# Check if dev script exists
if [ ! -f "development/dev.sh" ]; then
    echo "❌ Development script not found at development/dev.sh"
    exit 1
fi

# Make sure it's executable
chmod +x development/dev.sh

# Pass all arguments to the actual dev script
echo "🔄 Redirecting to development/dev.sh..."
echo ""

# Change to development directory and run the script
cd development && ./dev.sh "$@"
