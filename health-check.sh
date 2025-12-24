#!/bin/bash

# JKP Katastar - Health Check Script
# Comprehensive health check for VPS deployment

set -e

VPS_HOST="194.146.58.124"
DEPLOY_DIR="/opt/jkp-katastar"
PROJECT_NAME="JKPKatastar"

echo "🩺 JKP Katastar - Health Check"
echo "=============================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check HTTP endpoint
check_http() {
    local url=$1
    local name=$2
    local status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$url" 2>/dev/null || echo "000")

    if [ "$status" = "200" ]; then
        echo "  ✅ $name: HTTP $status (OK)"
        return 0
    elif [ "$status" = "301" ] || [ "$status" = "302" ]; then
        echo "  ⚠️  $name: HTTP $status (Redirect - might be OK)"
        return 0
    else
        echo "  ❌ $name: HTTP $status (Error)"
        return 1
    fi
}

echo ""
echo "🔧 System Check"
echo "==============="

# Check if running on the correct server
CURRENT_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")
echo "Current Server IP: $CURRENT_IP"
if [ "$CURRENT_IP" = "$VPS_HOST" ]; then
    echo "  ✅ Running on correct VPS server"
else
    echo "  ⚠️  IP mismatch - expected $VPS_HOST"
fi

# Check system resources
echo ""
echo "💾 System Resources:"
echo "  CPU Load: $(uptime | cut -d',' -f3-5)"
echo "  Memory: $(free -h | grep '^Mem' | awk '{print $3 "/" $2 " (" $3/$2*100 "%)"}')"
echo "  Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"

# Check required commands
echo ""
echo "🛠️  Required Software"
echo "===================="

if command_exists docker; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | sed 's/,//')
    echo "  ✅ Docker: $DOCKER_VERSION"

    if docker info > /dev/null 2>&1; then
        echo "  ✅ Docker daemon: Running"
    else
        echo "  ❌ Docker daemon: Not running"
    fi
else
    echo "  ❌ Docker: Not installed"
fi

if command_exists docker-compose; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | sed 's/,//')
    echo "  ✅ Docker Compose: $COMPOSE_VERSION"
else
    echo "  ❌ Docker Compose: Not installed"
fi

if command_exists git; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    echo "  ✅ Git: $GIT_VERSION"
else
    echo "  ❌ Git: Not installed"
fi

if command_exists curl; then
    echo "  ✅ Curl: Available"
else
    echo "  ❌ Curl: Not available"
fi

# Check deployment directory
echo ""
echo "📁 Deployment Check"
echo "==================="

if [ -d "$DEPLOY_DIR" ]; then
    echo "  ✅ Deployment directory exists: $DEPLOY_DIR"

    if [ -d "$DEPLOY_DIR/$PROJECT_NAME" ]; then
        echo "  ✅ Project directory exists"
        cd "$DEPLOY_DIR/$PROJECT_NAME"

        if [ -f "docker-compose.yml" ]; then
            echo "  ✅ Docker Compose file exists"
        else
            echo "  ❌ Docker Compose file missing"
        fi

        if [ -f ".env" ]; then
            echo "  ✅ Environment file exists"
            echo "  📋 Environment variables:"
            grep -E "^(NODE_ENV|PORT|MONGO_DATABASE)=" .env | sed 's/^/    /'
        else
            echo "  ❌ Environment file missing"
        fi

        # Check Git status
        if [ -d ".git" ]; then
            CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
            LAST_COMMIT=$(git log -1 --format="%h - %s (%cr)" 2>/dev/null || echo "unknown")
            echo "  📋 Git status:"
            echo "    Branch: $CURRENT_BRANCH"
            echo "    Last commit: $LAST_COMMIT"
        fi
    else
        echo "  ❌ Project directory missing: $DEPLOY_DIR/$PROJECT_NAME"
    fi
else
    echo "  ❌ Deployment directory missing: $DEPLOY_DIR"
fi

# Check Docker containers
echo ""
echo "🐳 Docker Services"
echo "=================="

if [ -d "$DEPLOY_DIR/$PROJECT_NAME" ] && [ -f "$DEPLOY_DIR/$PROJECT_NAME/docker-compose.yml" ]; then
    cd "$DEPLOY_DIR/$PROJECT_NAME"

    echo "  📊 Container Status:"
    docker-compose ps | while read line; do
        if [ -n "$line" ]; then
            echo "    $line"
        fi
    done

    # Check individual services
    echo ""
    echo "  🔍 Service Details:"

    # MongoDB
    if docker-compose ps mongodb | grep -q "Up"; then
        echo "    ✅ MongoDB: Running"

        # Test MongoDB connection
        if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
            echo "    ✅ MongoDB: Connection OK"
        else
            echo "    ⚠️  MongoDB: Connection issues"
        fi
    else
        echo "    ❌ MongoDB: Not running"
    fi

    # Backend
    if docker-compose ps backend | grep -q "Up"; then
        echo "    ✅ Backend: Running"

        # Test backend health
        if docker-compose exec -T backend wget --spider --quiet --timeout=5 --tries=1 http://localhost:5000/api/health >/dev/null 2>&1; then
            echo "    ✅ Backend: Health check OK"
        else
            echo "    ⚠️  Backend: Health check failed"
        fi
    else
        echo "    ❌ Backend: Not running"
    fi

    # Frontend
    if docker-compose ps frontend | grep -q "Up"; then
        echo "    ✅ Frontend: Running"

        # Test frontend
        if docker-compose exec -T frontend wget --spider --quiet --timeout=5 --tries=1 http://localhost:3000 >/dev/null 2>&1; then
            echo "    ✅ Frontend: Health check OK"
        else
            echo "    ⚠️  Frontend: Health check failed"
        fi
    else
        echo "    ❌ Frontend: Not running"
    fi

else
    echo "  ⚠️  No Docker Compose configuration found"
fi

# Check network connectivity
echo ""
echo "🌐 Network Check"
echo "================"

# Check if ports are listening
check_port() {
    local port=$1
    local service=$2

    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        echo "  ✅ Port $port ($service): Listening"
    else
        echo "  ❌ Port $port ($service): Not listening"
    fi
}

check_port 3000 "Frontend"
check_port 5000 "Backend"
check_port 27017 "MongoDB"

# Check external HTTP endpoints
echo ""
echo "🔗 HTTP Endpoints"
echo "================="

check_http "http://localhost:3000" "Frontend (local)"
check_http "http://localhost:5000/api/health" "Backend API (local)"

if [ "$CURRENT_IP" = "$VPS_HOST" ]; then
    check_http "http://$VPS_HOST:3000" "Frontend (external)"
    check_http "http://$VPS_HOST:5000/api/health" "Backend API (external)"
fi

# Check Docker logs for errors
echo ""
echo "📋 Recent Logs"
echo "=============="

if [ -d "$DEPLOY_DIR/$PROJECT_NAME" ] && [ -f "$DEPLOY_DIR/$PROJECT_NAME/docker-compose.yml" ]; then
    cd "$DEPLOY_DIR/$PROJECT_NAME"

    echo "  🔍 Last 10 lines from each service:"
    echo ""

    for service in mongodb backend frontend; do
        echo "  📄 $service logs:"
        docker-compose logs --tail=10 $service 2>/dev/null | sed 's/^/    /' || echo "    (no logs available)"
        echo ""
    done
fi

# Check firewall status
echo ""
echo "🛡️  Firewall Check"
echo "=================="

if command_exists ufw; then
    UFW_STATUS=$(ufw status | head -1)
    echo "  $UFW_STATUS"

    if ufw status | grep -q "3000\|5000"; then
        echo "  ✅ Required ports appear to be allowed"
    else
        echo "  ⚠️  Check if ports 3000 and 5000 are allowed"
    fi
else
    echo "  ℹ️  UFW not installed"
fi

# Summary
echo ""
echo "📈 Health Check Summary"
echo "======================"

ISSUES=0

# Count issues based on key checks
if ! docker info > /dev/null 2>&1; then
    ISSUES=$((ISSUES + 1))
fi

if [ ! -d "$DEPLOY_DIR/$PROJECT_NAME" ]; then
    ISSUES=$((ISSUES + 1))
fi

if [ -d "$DEPLOY_DIR/$PROJECT_NAME" ]; then
    cd "$DEPLOY_DIR/$PROJECT_NAME"
    if ! docker-compose ps | grep -q "Up"; then
        ISSUES=$((ISSUES + 1))
    fi
fi

if [ $ISSUES -eq 0 ]; then
    echo "🎉 Overall Status: HEALTHY"
    echo "   All key components appear to be working correctly."
else
    echo "⚠️  Overall Status: ISSUES DETECTED ($ISSUES)"
    echo "   Please review the checks above for specific problems."
fi

echo ""
echo "ℹ️  Useful Commands:"
echo "   Restart services: cd $DEPLOY_DIR/$PROJECT_NAME && docker-compose restart"
echo "   View logs: cd $DEPLOY_DIR/$PROJECT_NAME && docker-compose logs -f"
echo "   Stop services: cd $DEPLOY_DIR/$PROJECT_NAME && docker-compose down"
echo "   Start services: cd $DEPLOY_DIR/$PROJECT_NAME && docker-compose up -d"
echo ""
echo "🌐 Access URLs (if healthy):"
echo "   Frontend: http://$VPS_HOST:3000"
echo "   Backend API: http://$VPS_HOST:5000/api"
echo "   Health Check: http://$VPS_HOST:5000/api/health"
