#!/bin/bash

# JKP Katastar - VPS Readiness Test
# Quick test to verify your VPS is ready for deployment

set -e

VPS_HOST="${VPS_HOST:-194.146.58.124}"
DEPLOY_DIR="/opt/jkp-katastar"

echo "🏛️  JKP Katastar - VPS Readiness Test"
echo "====================================="

# Check if running on the correct server
CURRENT_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")
echo "Current Server IP: $CURRENT_IP"
if [ "$CURRENT_IP" = "$VPS_HOST" ]; then
    echo "✅ Running on correct VPS server"
else
    echo "⚠️  IP mismatch - expected $VPS_HOST, got $CURRENT_IP"
fi

echo ""
echo "🔧 Checking Required Software..."

# Check Docker
if command -v docker > /dev/null 2>&1; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | sed 's/,//')
    echo "✅ Docker: $DOCKER_VERSION"

    if docker info > /dev/null 2>&1; then
        echo "✅ Docker daemon: Running"
    else
        echo "❌ Docker daemon: Not running"
        exit 1
    fi
else
    echo "❌ Docker: Not installed"
    exit 1
fi

# Check Docker Compose
if docker compose version > /dev/null 2>&1; then
    COMPOSE_VERSION=$(docker compose version | grep -o "v[0-9.]*" | head -1)
    echo "✅ Docker Compose (v2): $COMPOSE_VERSION"
    COMPOSE_CMD="docker compose"
elif command -v docker-compose > /dev/null 2>&1; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | sed 's/,//')
    echo "✅ Docker Compose (v1): $COMPOSE_VERSION"
    COMPOSE_CMD="docker-compose"
else
    echo "❌ Docker Compose: Not found"
    exit 1
fi

# Check other utilities
MISSING_UTILS=""
for util in curl wget git; do
    if command -v $util > /dev/null 2>&1; then
        echo "✅ $util: Available"
    else
        echo "❌ $util: Missing"
        MISSING_UTILS="$MISSING_UTILS $util"
    fi
done

if [ -n "$MISSING_UTILS" ]; then
    echo ""
    echo "Installing missing utilities..."
    apt update && apt install -y $MISSING_UTILS
fi

echo ""
echo "📁 Checking Directories..."

# Check deployment directory
if [ -d "$DEPLOY_DIR" ]; then
    echo "✅ Deployment directory exists: $DEPLOY_DIR"
else
    echo "⚙️  Creating deployment directory: $DEPLOY_DIR"
    mkdir -p $DEPLOY_DIR
    echo "✅ Deployment directory created"
fi

echo ""
echo "🌐 Checking Network..."

# Check if ports are available
check_port() {
    local port=$1
    local service=$2

    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        echo "⚠️  Port $port ($service): Already in use"
        netstat -tlnp | grep ":$port " | head -1
    else
        echo "✅ Port $port ($service): Available"
    fi
}

check_port 3000 "Frontend"
check_port 5000 "Backend"
check_port 27017 "MongoDB"

echo ""
echo "🛡️  Checking Firewall..."

if command -v ufw > /dev/null 2>&1; then
    UFW_STATUS=$(ufw status | head -1)
    echo "Firewall status: $UFW_STATUS"

    if ufw status | grep -q "3000\|5000"; then
        echo "✅ Required ports appear to be allowed"
    else
        echo "⚠️  Ports 3000 and 5000 might need to be allowed"
        echo "   Run: ufw allow 3000 && ufw allow 5000"
    fi
else
    echo "⚠️  UFW not installed - consider installing for security"
fi

echo ""
echo "🔑 Checking SSH Setup..."

if [ -f ~/.ssh/authorized_keys ]; then
    KEY_COUNT=$(wc -l < ~/.ssh/authorized_keys)
    echo "✅ SSH authorized_keys exists ($KEY_COUNT keys)"
else
    echo "⚠️  SSH authorized_keys not found"
fi

if [ -f ~/.ssh/github_actions ]; then
    echo "✅ GitHub Actions SSH key exists"
    echo "📋 Public key for GitHub (if needed):"
    cat ~/.ssh/github_actions.pub
else
    echo "⚠️  GitHub Actions SSH key not found"
    echo "   Generate with: ssh-keygen -t rsa -b 4096 -C 'github-actions' -f ~/.ssh/github_actions"
fi

echo ""
echo "🧪 Testing Docker..."

# Test Docker with a simple container
echo "Testing Docker with hello-world..."
if docker run --rm hello-world > /dev/null 2>&1; then
    echo "✅ Docker test: Passed"
else
    echo "❌ Docker test: Failed"
fi

# Test Docker Compose with a simple config
echo "Testing Docker Compose..."
cat > /tmp/test-compose.yml << 'EOF'
version: '3.8'
services:
  test:
    image: alpine:latest
    command: echo "Docker Compose test successful"
EOF

if $COMPOSE_CMD -f /tmp/test-compose.yml up --abort-on-container-exit > /dev/null 2>&1; then
    echo "✅ Docker Compose test: Passed"
else
    echo "❌ Docker Compose test: Failed"
fi

$COMPOSE_CMD -f /tmp/test-compose.yml down > /dev/null 2>&1 || true
rm -f /tmp/test-compose.yml

echo ""
echo "💾 System Resources..."

echo "Memory: $(free -h | grep '^Mem' | awk '{print $3 "/" $2}')"
echo "Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"
echo "CPU Load: $(uptime | cut -d',' -f3-5 | sed 's/^ *//')"

# Check if we have enough resources
AVAILABLE_MEMORY=$(free -m | grep '^Mem' | awk '{print $7}')
AVAILABLE_DISK=$(df / | tail -1 | awk '{print $4}')

if [ $AVAILABLE_MEMORY -lt 256 ]; then
    echo "⚠️  Low available memory: ${AVAILABLE_MEMORY}MB (recommend 256MB+)"
else
    echo "✅ Available memory: ${AVAILABLE_MEMORY}MB"
fi

if [ $AVAILABLE_DISK -lt 2097152 ]; then  # 2GB in KB
    echo "⚠️  Low available disk space: $(($AVAILABLE_DISK/1024))MB (recommend 2GB+)"
else
    echo "✅ Available disk space: $(($AVAILABLE_DISK/1024))MB"
fi

echo ""
echo "📋 Test Summary"
echo "==============="

# Count any issues
ISSUES=0

if ! docker info > /dev/null 2>&1; then
    ISSUES=$((ISSUES + 1))
fi

if ! (docker compose version > /dev/null 2>&1 || command -v docker-compose > /dev/null 2>&1); then
    ISSUES=$((ISSUES + 1))
fi

if [ ! -d "$DEPLOY_DIR" ]; then
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -eq 0 ]; then
    echo "🎉 VPS Status: READY FOR DEPLOYMENT"
    echo ""
    echo "✅ All checks passed! Your VPS is ready for JKP Katastar deployment."
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Make sure GitHub secrets are configured"
    echo "  2. Push to main branch to trigger deployment"
    echo "  3. Or run manual deployment: ./deploy-vps.sh deploy"
    echo ""
    echo "📖 For troubleshooting: ./health-check.sh"
else
    echo "⚠️  VPS Status: ISSUES FOUND ($ISSUES)"
    echo ""
    echo "Please fix the issues above before deploying."
fi

echo ""
echo "🌐 Expected URLs after deployment:"
echo "   Frontend: http://$VPS_HOST:3000"
echo "   Backend API: http://$VPS_HOST:5000/api"
echo "   Health Check: http://$VPS_HOST:5000/api/health"
