#!/bin/bash

# JKP Katastar - Simple Development Startup
# One command to start everything: ./dev.sh

echo "🏛️  JKP Katastar Cemetery Management System"
echo "=========================================="

# Load env vars from root .env so docker-compose can substitute them
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_ENV="$SCRIPT_DIR/../.env"
if [ -f "$ROOT_ENV" ]; then
    set -a
    # shellcheck disable=SC1090
    source "$ROOT_ENV"
    set +a
fi

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

cleanup_previous() {
    echo "🧹 Cleaning up previous run (containers, networks, dangling images)..."
    $COMPOSE_CMD -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
    docker image prune -f 2>/dev/null || true
}

# Handle command
case "${1:-start}" in
    "start"|"")
        cleanup_previous
        echo "🚀 Starting all services (MongoDB + Backend + Frontend)..."
        $COMPOSE_CMD -f docker-compose.dev.yml up --build --remove-orphans
        ;;
    "stop")
        echo "🛑 Stopping all services..."
        $COMPOSE_CMD -f docker-compose.dev.yml down --remove-orphans
        ;;
    "restart")
        cleanup_previous
        echo "🔄 Restarting all services..."
        $COMPOSE_CMD -f docker-compose.dev.yml up --build --remove-orphans
        ;;
    "rebuild")
        echo "🔨 Rebuilding images and restarting..."
        $COMPOSE_CMD -f docker-compose.dev.yml down --remove-orphans
        $COMPOSE_CMD -f docker-compose.dev.yml build --no-cache
        $COMPOSE_CMD -f docker-compose.dev.yml up --remove-orphans
        ;;
    "status")
        echo "📊 Service status:"
        $COMPOSE_CMD -f docker-compose.dev.yml ps
        ;;
    "clean")
        echo "🧹 Cleaning up everything (containers + volumes)..."
        $COMPOSE_CMD -f docker-compose.dev.yml down -v --remove-orphans
        docker system prune -f
        ;;
    "logs")
        # Allow: ./dev.sh logs [service]  e.g. ./dev.sh logs backend
        SERVICE="${2:-}"
        if [ -n "$SERVICE" ]; then
            echo "📋 Showing logs for: $SERVICE"
            $COMPOSE_CMD -f docker-compose.dev.yml logs -f "$SERVICE"
        else
            echo "📋 Showing logs (all services)..."
            $COMPOSE_CMD -f docker-compose.dev.yml logs -f
        fi
        ;;
    "help")
        echo ""
        echo "Commands:"
        echo "  ./dev.sh              - Start everything (attach)"
        echo "  ./dev.sh stop         - Stop all services"
        echo "  ./dev.sh restart      - Stop then start"
        echo "  ./dev.sh rebuild      - Rebuild images from scratch and start"
        echo "  ./dev.sh status       - Show running containers"
        echo "  ./dev.sh clean        - Remove containers + volumes (data lost)"
        echo "  ./dev.sh logs         - View logs (all services)"
        echo "  ./dev.sh logs backend - View logs for a specific service"
        echo ""
        echo "Access URLs (after starting):"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend:  http://localhost:5000/api"
        echo "  MongoDB:  mongodb://localhost:27017  (see .env for credentials)"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Run ./dev.sh help for available commands"
        exit 1
        ;;
esac
