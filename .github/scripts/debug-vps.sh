#!/bin/bash

# JKP Katastar - VPS Debug Script
# Quick diagnostic tool to check current VPS deployment status

set -e

VPS_HOST="${VPS_HOST:-194.146.58.124}"
DEPLOY_DIR="/opt/jkp-katastar"
PROJECT_NAME="JKPKatastar"

echo "🔍 JKP Katastar - VPS Debug Report"
echo "=================================="
echo "Time: $(date)"
echo "VPS Host: $VPS_HOST"
echo ""

# Function to run command and show result
run_check() {
    local desc="$1"
    local cmd="$2"
    echo -n "[$desc] "
    if eval "$cmd" >/dev/null 2>&1; then
        echo "✅ OK"
    else
        echo "❌ FAIL"
        echo "  Command: $cmd"
        eval "$cmd" 2>&1 | head -3 | sed 's/^/  /'
    fi
}

echo "🖥️  System Status"
echo "================"
run_check "Docker daemon" "docker info"
run_check "Docker Compose" "docker compose version"
run_check "Deployment dir" "[ -d $DEPLOY_DIR ]"
run_check "Project dir" "[ -d $DEPLOY_DIR/$PROJECT_NAME ]"

echo ""
echo "📁 Directory Contents"
echo "===================="
if [ -d "$DEPLOY_DIR" ]; then
    echo "Deploy directory ($DEPLOY_DIR):"
    ls -la "$DEPLOY_DIR" | head -10
    echo ""

    if [ -d "$DEPLOY_DIR/$PROJECT_NAME" ]; then
        echo "Project directory:"
        ls -la "$DEPLOY_DIR/$PROJECT_NAME" | head -10
        echo ""

        # Check if .env exists
        if [ -f "$DEPLOY_DIR/$PROJECT_NAME/.env" ]; then
            echo "Environment file exists ✅"
            echo "Environment variables (first 10):"
            head -10 "$DEPLOY_DIR/$PROJECT_NAME/.env" | grep -v PASSWORD | grep -v SECRET | grep -v URI
        else
            echo "Environment file missing ❌"
        fi
    else
        echo "Project directory missing ❌"
    fi
else
    echo "Deploy directory missing ❌"
fi

echo ""
echo "🐳 Docker Status"
echo "================"

# Check running containers
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -10

echo ""
echo "All project containers:"
docker ps -a --filter "name=jkp" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" || true

echo ""
echo "Docker system info:"
echo "  Images: $(docker images --format "table {{.Repository}}" | grep -c jkp || echo 0) JKP images"
echo "  Volumes: $(docker volume ls --filter "name=jkp" | wc -l || echo 0) JKP volumes"

echo ""
echo "🌐 Network Status"
echo "================"
echo "Listening ports:"
netstat -tlnp 2>/dev/null | grep -E ":3000|:5000|:27017" | head -5 || echo "No JKP ports listening"

echo ""
echo "External connectivity:"
for port in 3000 5000; do
    if curl -s --connect-timeout 5 --max-time 10 http://localhost:$port >/dev/null 2>&1; then
        echo "  Port $port: ✅ Responding"
    else
        echo "  Port $port: ❌ Not responding"
    fi
done

echo ""
echo "📊 Resources"
echo "============"
echo "Memory: $(free -h | grep '^Mem' | awk '{print $3 "/" $2 " (" int($3/$2*100) "%)"}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"
echo "Load: $(uptime | cut -d',' -f3-5 | sed 's/^ *//')"

echo ""
echo "🔍 Recent Logs"
echo "=============="
if [ -d "$DEPLOY_DIR/$PROJECT_NAME" ]; then
    cd "$DEPLOY_DIR/$PROJECT_NAME"

    if [ -f "docker-compose.yml" ]; then
        echo "Container status:"
        if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
            docker compose ps 2>/dev/null || echo "No compose services found"
        else
            echo "Docker Compose not available"
        fi

        echo ""
        echo "Last 20 lines from each service:"
        for service in mongodb backend frontend; do
            echo "--- $service logs ---"
            if docker compose logs --tail=20 "$service" 2>/dev/null | tail -5; then
                continue
            else
                echo "No logs for $service"
            fi
        done
    else
        echo "No docker-compose.yml found"
    fi
else
    echo "Cannot access project directory"
fi

echo ""
echo "🚨 Common Issues Check"
echo "====================="

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "❌ Disk space critical: ${DISK_USAGE}%"
elif [ "$DISK_USAGE" -gt 80 ]; then
    echo "⚠️  Disk space high: ${DISK_USAGE}%"
else
    echo "✅ Disk space OK: ${DISK_USAGE}%"
fi

# Check memory
MEMORY_USAGE=$(free | grep '^Mem' | awk '{print int($3/$2*100)}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
    echo "❌ Memory usage critical: ${MEMORY_USAGE}%"
elif [ "$MEMORY_USAGE" -gt 80 ]; then
    echo "⚠️  Memory usage high: ${MEMORY_USAGE}%"
else
    echo "✅ Memory usage OK: ${MEMORY_USAGE}%"
fi

# Check if ports are blocked
for port in 3000 5000; do
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        echo "✅ Port $port is listening"
    else
        echo "❌ Port $port is not listening"
    fi
done

echo ""
echo "📋 Quick Commands"
echo "================"
echo "View logs:     docker compose logs -f"
echo "Check status:  docker compose ps"
echo "Restart:       docker compose restart"
echo "Full restart:  docker compose down && docker compose up -d"
echo "Clean restart: docker compose down -v && docker compose up --build -d"
echo ""
echo "🎯 Recommendation"
echo "=================="

if [ -d "$DEPLOY_DIR/$PROJECT_NAME" ]; then
    cd "$DEPLOY_DIR/$PROJECT_NAME"
    if docker compose ps 2>/dev/null | grep -q "Up"; then
        echo "Some services are running. Check logs for specific issues:"
        echo "  docker compose logs"
    else
        echo "No services running. Try restarting:"
        echo "  docker compose up -d"
    fi
else
    echo "Project not deployed. Run deployment:"
    echo "  cd $DEPLOY_DIR && git clone https://github.com/constantine2nd/JKPKatastar.git"
fi

echo ""
echo "Debug report complete! 📋"
