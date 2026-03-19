#!/bin/bash

# JKP Katastar - Development Wrapper Script
# Convenience wrapper that delegates to development/dev.sh

# Check if development directory and script exist
if [ ! -d "development" ]; then
    echo "❌ Development directory not found! Run this from the project root."
    exit 1
fi

if [ ! -f "development/dev.sh" ]; then
    echo "❌ development/dev.sh not found."
    exit 1
fi

# Make executable if needed (only when necessary)
if [ ! -x "development/dev.sh" ]; then
    chmod +x development/dev.sh
fi

cd development || { echo "❌ Failed to enter development directory."; exit 1; }
exec ./dev.sh "$@"
