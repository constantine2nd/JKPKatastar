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

# Handle command
case "${1:-start}" in
    "start"|"")
        echo "🚀 Starting all services (MongoDB + Backend + Frontend)..."
        docker-compose -f docker-compose.dev.yml up --build
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        docker-compose -f docker-compose.dev.yml down
        ;;
    "clean")
        echo "🧹 Cleaning up everything..."
        docker-compose -f docker-compose.dev.yml down -v
        docker system prune -f
        ;;
    "logs")
        echo "📋 Showing logs..."
        docker-compose -f docker-compose.dev.yml logs -f
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
