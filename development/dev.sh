#!/bin/bash

# JKP Katastar - Simple Development Startup
# One command to start everything: ./dev.sh

set -e

echo "🏛️  JKP Katastar Cemetery Management System"
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Detect Docker Compose command (v1 or v2)
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    echo "❌ Docker Compose not found. Please install Docker Compose."
    exit 1
fi

echo "🔧 Using: $COMPOSE_CMD"

# Handle command
case "${1:-start}" in
    "start"|"")
        echo "🚀 Starting all services (MongoDB + Backend + Frontend)..."
        $COMPOSE_CMD -f docker-compose.dev.yml up --build
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        $COMPOSE_CMD -f docker-compose.dev.yml down
        ;;
    "clean")
        echo "🧹 Cleaning up everything..."
        $COMPOSE_CMD -f docker-compose.dev.yml down -v
        docker system prune -f
        ;;
    "logs")
        echo "📋 Showing logs..."
        $COMPOSE_CMD -f docker-compose.dev.yml logs -f
        ;;
    "help")
        echo ""
        echo "Commands:"
        echo "  ./dev.sh        - Start everything"
        echo "  ./dev.sh stop   - Stop all services"
        echo "  ./dev.sh clean  - Clean reset"
        echo "  ./dev.sh logs   - View logs"
        echo ""
        echo "Access:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:5000/api"
        echo "  MongoDB:  mongodb://admin:password123@localhost:27017"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Run ./dev.sh help for available commands"
        exit 1
        ;;
esac
