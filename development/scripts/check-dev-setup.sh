#!/bin/bash

# JKP Katastar - Development Environment Check
# Validates that everything is set up correctly for local development

echo "🔍 JKP Katastar Development Environment Check"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check functions
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✅ $1 is installed${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    fi
}

check_docker_running() {
    if docker info > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker is running${NC}"
        return 0
    else
        echo -e "${RED}❌ Docker is not running${NC}"
        return 1
    fi
}

check_ports() {
    local port=$1
    local service=$2
    if lsof -i :$port > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is in use ($service)${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $port is available ($service)${NC}"
        return 0
    fi
}

# Start checks
echo ""
echo -e "${BLUE}📋 Checking Prerequisites...${NC}"

# Check required commands
check_command "git" || MISSING_DEPS=true
check_command "docker" || MISSING_DEPS=true

# Check Docker Compose (v1 or v2)
echo ""
echo -e "${BLUE}📋 Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ docker-compose (v1) is available${NC}"
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    echo -e "${GREEN}✅ docker compose (v2) is available${NC}"
    COMPOSE_CMD="docker compose"
else
    echo -e "${RED}❌ Docker Compose not found${NC}"
    MISSING_DEPS=true
fi

# Check if Docker is running
echo ""
echo -e "${BLUE}📋 Checking Docker Status...${NC}"
check_docker_running || DOCKER_ISSUE=true

# Check required ports
echo ""
echo -e "${BLUE}📋 Checking Port Availability...${NC}"
check_ports 3000 "Frontend" || PORT_CONFLICTS=true
check_ports 5000 "Backend" || PORT_CONFLICTS=true
check_ports 27017 "MongoDB" || PORT_CONFLICTS=true

# Check project files
echo ""
echo -e "${BLUE}📋 Checking Project Files...${NC}"

files_to_check=(
    "development/dev.sh"
    "development/docker-compose.dev.yml"
    "client/package.json"
    "client/Dockerfile.dev"
    "server/package.json"
    "server/Dockerfile"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file is missing${NC}"
        MISSING_FILES=true
    fi
done

# Check dev.sh permissions
if [ -x "development/dev.sh" ]; then
    echo -e "${GREEN}✅ development/dev.sh is executable${NC}"
else
    echo -e "${YELLOW}⚠️  development/dev.sh is not executable${NC}"
    echo "   Fix with: chmod +x development/dev.sh"
fi

# Summary
echo ""
echo -e "${BLUE}📊 Environment Check Summary${NC}"
echo "=============================="

if [ "$MISSING_DEPS" = true ]; then
    echo -e "${RED}❌ Missing Dependencies${NC}"
    echo "   Install: Docker, Git"
    echo "   https://docs.docker.com/get-docker/"
    ISSUES=true
fi

if [ "$DOCKER_ISSUE" = true ]; then
    echo -e "${RED}❌ Docker Issues${NC}"
    echo "   Start Docker Desktop or Docker daemon"
    ISSUES=true
fi

if [ "$PORT_CONFLICTS" = true ]; then
    echo -e "${YELLOW}⚠️  Port Conflicts${NC}"
    echo "   Stop services using ports 3000, 5000, or 27017"
    echo "   Or use: ./dev.sh clean to stop any running containers"
fi

if [ "$MISSING_FILES" = true ]; then
    echo -e "${RED}❌ Missing Project Files${NC}"
    echo "   Re-clone the repository"
    ISSUES=true
fi

if [ "$ISSUES" = true ]; then
    echo ""
    echo -e "${RED}🚨 Issues Found - Please fix the above issues before starting development${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 Environment Check Passed!${NC}"
    echo ""
    echo -e "${BLUE}✨ Ready to start development:${NC}"
    echo "   ./dev.sh        # Start all services (wrapper)"
    echo "   ./dev.sh help   # View all commands"
    echo "   cd development && ./dev.sh  # Direct access"
    echo ""
    echo -e "${BLUE}📱 Access URLs after starting:${NC}"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:5000/api"
    echo "   Database:  mongodb://admin:password123@localhost:27017"
    exit 0
fi
