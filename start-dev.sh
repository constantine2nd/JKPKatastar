#!/bin/bash

# JKP Katastar - Enhanced Development Environment Startup Script
# This script provides intelligent error handling and user-friendly diagnostics

set -e

echo "🏛️  JKP Katastar Cemetery Management System - Enhanced Development Setup"
echo "========================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Global variables
STARTUP_TIMEOUT=120
HEALTH_CHECK_TIMEOUT=60
MAX_RETRIES=3
CURRENT_RETRY=0

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}$(printf '=%.0s' $(seq 1 ${#1}))${NC}"
}

# Function to print success message
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning message
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error message
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print info message
print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Function to check if Docker is running with helpful error messages
check_docker() {
    print_section "🐳 Docker Environment Check"

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        echo -e "${YELLOW}💡 Install Docker:${NC}"
        echo -e "   • Ubuntu/Debian: sudo apt-get install docker.io"
        echo -e "   • CentOS/RHEL: sudo yum install docker"
        echo -e "   • macOS: Download from https://docker.com/products/docker-desktop"
        exit 1
    fi

    if ! docker info > /dev/null 2>&1; then
        print_error "Docker daemon is not running!"
        echo -e "${YELLOW}💡 Start Docker:${NC}"
        echo -e "   • Linux: sudo systemctl start docker"
        echo -e "   • macOS/Windows: Start Docker Desktop"
        echo -e "   • Enable auto-start: sudo systemctl enable docker"
        exit 1
    fi

    print_success "Docker is running"

    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed!"
        echo -e "${YELLOW}💡 Install docker-compose:${NC}"
        echo -e "   • pip install docker-compose"
        echo -e "   • Or download from: https://docs.docker.com/compose/install/"
        exit 1
    fi

    print_success "docker-compose is available"
}

# Enhanced function to load and validate .env file
load_env_file() {
    print_section "📝 Environment Configuration"

    if [ ! -f .env ]; then
        print_error ".env file not found!"
        if [ -f .env.example ]; then
            print_warning "Creating .env from .env.example..."
            cp .env.example .env
            echo -e "${YELLOW}⚠️  Please edit .env with your configuration and run the script again.${NC}"
            echo -e "${BLUE}🔧 Key configurations needed:${NC}"
            echo -e "   • MONGO_URI: Your MongoDB connection string"
            echo -e "   • JWT_SECRET: Secure random string (44+ characters)"
            echo -e "   • EMAIL_* settings: For email notifications (optional)"
            echo -e "${CYAN}💡 Run: ./validate-env.sh to check your configuration${NC}"
            exit 1
        else
            print_error ".env.example file not found either!"
            echo -e "${YELLOW}💡 Create .env file manually with these required variables:${NC}"
            echo -e "   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database"
            echo -e "   JWT_SECRET=your-super-secure-jwt-secret-key-here"
            echo -e "   NODE_ENV=development"
            echo -e "   PORT=5000"
            exit 1
        fi
    fi

    # Enhanced env loading with validation
    local required_vars=("MONGO_URI" "JWT_SECRET")
    local missing_vars=()

    while IFS= read -r line; do
        if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*# ]]; then
            key=$(echo "$line" | cut -d'=' -f1 | tr -d ' ')
            value=$(echo "$line" | cut -d'=' -f2- | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
            if [[ -n "$key" && -n "$value" ]]; then
                export "$key"="$value"
            fi
        fi
    done < .env

    # Check required variables
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo -e "   • ${RED}$var${NC}"
        done
        echo -e "${CYAN}💡 Run: ./validate-env.sh for detailed configuration help${NC}"
        exit 1
    fi

    print_success "Environment configuration loaded"
    print_info "Database: $(echo $MONGO_URI | sed 's/.*@\([^/]*\).*/\1/' | sed 's/mongodb+srv:\/\///')"
    print_info "Environment: ${NODE_ENV:-development}"
}

# Function to detect and validate database configuration
detect_and_validate_database() {
    print_section "🗄️ Database Configuration Analysis"

    if [[ "${MONGO_URI}" == *"mongodb+srv://"* ]] || [[ "${MONGO_URI}" == *"@"*".mongodb.net"* ]]; then
        echo "atlas"
        print_info "MongoDB Atlas (Cloud Database) detected"

        # Test DNS resolution for Atlas
        local cluster_host=$(echo $MONGO_URI | sed 's/.*@\([^/]*\).*/\1/')
        print_info "Testing DNS resolution for: $cluster_host"

        if ! nslookup "$cluster_host" >/dev/null 2>&1; then
            print_error "Cannot resolve MongoDB Atlas hostname!"
            echo -e "${YELLOW}🚨 Common Atlas Connection Issues:${NC}"
            echo -e "${YELLOW}1. IP Address Not Whitelisted (Most Common!)${NC}"
            echo -e "   → Go to https://cloud.mongodb.com/"
            echo -e "   → Network Access → IP Access List → ADD IP ADDRESS"
            echo -e "   → Add your current IP: $(curl -s https://ifconfig.me 2>/dev/null || echo 'Unable to detect')"
            echo ""
            echo -e "${YELLOW}2. Cluster Paused/Suspended${NC}"
            echo -e "   → Check cluster status in Atlas dashboard"
            echo -e "   → Free M0 clusters pause after inactivity"
            echo ""
            echo -e "${YELLOW}3. DNS/Firewall Issues${NC}"
            echo -e "   → Try different DNS servers (8.8.8.8, 1.1.1.1)"
            echo -e "   → Check corporate firewall settings"
            echo ""
            echo -e "${CYAN}💡 Run: ./diagnose-startup-issues.sh for detailed diagnostics${NC}"
            exit 1
        fi

        print_success "DNS resolution successful"

    elif [[ "${MONGO_URI}" == *"mongodb://localhost:"* ]] || [[ "${MONGO_URI}" == *"mongodb://admin:"*"@localhost:"* ]]; then
        echo "local"
        print_info "Local MongoDB detected"
    elif [[ "${MONGO_URI}" == *"mongodb://mongodb:"* ]] || [[ "${MONGO_URI}" == *"mongodb://admin:"*"@mongodb:"* ]]; then
        echo "docker"
        print_info "Docker MongoDB container detected"
    else
        echo "custom"
        print_info "Custom MongoDB configuration detected"
    fi
}

# Enhanced function to start services with better error handling
start_services() {
    local db_type=$(detect_and_validate_database)
    local compose_cmd="docker-compose -f docker-compose.dev.yml"

    print_section "🚀 Starting Services"

    # Stop any existing containers first
    print_info "Stopping existing containers..."
    $compose_cmd down 2>/dev/null || true

    # Handle rebuild option
    if [[ "$1" == "--rebuild" ]]; then
        print_info "Rebuilding Docker images..."
        $compose_cmd build --no-cache
    fi

    case $db_type in
        "atlas")
            print_info "Starting Backend + Frontend (Atlas mode)"
            if ! $compose_cmd up -d --build backend frontend; then
                print_error "Failed to start services!"
                show_startup_logs
                exit 1
            fi
            ;;
        "docker"|"local")
            print_info "Starting MongoDB + Backend + Frontend (Local mode)"
            if ! $compose_cmd --profile local-db up -d --build; then
                print_error "Failed to start services!"
                show_startup_logs
                exit 1
            fi
            ;;
        *)
            print_info "Starting Backend + Frontend (Custom mode)"
            if ! $compose_cmd up -d --build backend frontend; then
                print_error "Failed to start services!"
                show_startup_logs
                exit 1
            fi
            ;;
    esac

    print_success "Services started successfully"
}

# Function to show startup logs for debugging
show_startup_logs() {
    echo -e "${YELLOW}📋 Recent startup logs:${NC}"
    echo -e "${YELLOW}=== Backend Logs ===${NC}"
    docker-compose -f docker-compose.dev.yml logs --tail=10 backend || echo "No backend logs available"
    echo -e "${YELLOW}=== Frontend Logs ===${NC}"
    docker-compose -f docker-compose.dev.yml logs --tail=10 frontend || echo "No frontend logs available"
}

# Enhanced service health monitoring
wait_for_services() {
    print_section "⏳ Service Health Monitoring"

    local db_type=$(detect_and_validate_database)
    local backend_port=${PORT:-5000}

    # Wait for database if using Docker
    if [[ "$db_type" == "docker" ]] || [[ "$db_type" == "local" ]]; then
        print_info "Waiting for MongoDB container..."
        if ! wait_for_service_health "mongodb" 60; then
            print_error "MongoDB container failed to start!"
            echo -e "${CYAN}💡 Check logs: docker-compose -f docker-compose.dev.yml logs mongodb${NC}"
            return 1
        fi
        print_success "MongoDB container is healthy"
    fi

    # Wait for backend with detailed error analysis
    print_info "Waiting for backend API on port $backend_port..."
    local backend_ready=false
    local attempt=0
    local max_attempts=30

    while [ $attempt -lt $max_attempts ]; do
        if curl -sf "http://localhost:$backend_port/api/health" > /dev/null 2>&1; then
            backend_ready=true
            break
        fi

        # Check container status
        local container_status=$(docker-compose -f docker-compose.dev.yml ps --format "table {{.Service}}\t{{.State}}" | grep backend | awk '{print $2}')

        if [[ "$container_status" == "Restarting" ]]; then
            print_warning "Backend container is restarting... (attempt $((attempt+1))/$max_attempts)"
            # Show recent logs for debugging
            if [ $((attempt % 5)) -eq 0 ]; then
                echo -e "${YELLOW}Recent backend logs:${NC}"
                docker-compose -f docker-compose.dev.yml logs --tail=5 backend
            fi
        elif [[ "$container_status" == "Exit" ]]; then
            print_error "Backend container has exited!"
            show_startup_logs
            return 1
        else
            printf "${CYAN}.${NC}"
        fi

        sleep 2
        attempt=$((attempt + 1))
    done

    if [ "$backend_ready" = true ]; then
        print_success "Backend API is responding"
    else
        print_error "Backend API failed to start within $((max_attempts * 2)) seconds!"

        # Analyze backend logs for specific errors
        local logs=$(docker-compose -f docker-compose.dev.yml logs --tail=20 backend 2>/dev/null)

        if echo "$logs" | grep -q "ENOTFOUND\|ESERVFAIL"; then
            echo -e "${YELLOW}🚨 DNS Resolution Error Detected${NC}"
            echo -e "${CYAN}💡 Run: ./diagnose-startup-issues.sh for MongoDB Atlas troubleshooting${NC}"
        elif echo "$logs" | grep -q "authentication failed\|unauthorized"; then
            echo -e "${YELLOW}🚨 MongoDB Authentication Error${NC}"
            echo -e "${CYAN}💡 Check your MongoDB username/password in .env file${NC}"
        elif echo "$logs" | grep -q "connection timed out\|timeout"; then
            echo -e "${YELLOW}🚨 Network Connectivity Issue${NC}"
            echo -e "${CYAN}💡 Check firewall settings and MongoDB Atlas IP whitelist${NC}"
        else
            echo -e "${CYAN}💡 Check logs: docker-compose -f docker-compose.dev.yml logs -f backend${NC}"
        fi

        return 1
    fi

    # Wait for frontend
    print_info "Waiting for frontend on port 3000..."
    if ! wait_for_service_health "frontend" 60; then
        print_error "Frontend failed to start!"
        echo -e "${CYAN}💡 Check logs: docker-compose -f docker-compose.dev.yml logs frontend${NC}"
        return 1
    fi
    print_success "Frontend is responding"
}

# Helper function to wait for service health
wait_for_service_health() {
    local service_name=$1
    local timeout=${2:-60}
    local counter=0

    while [ $counter -lt $timeout ]; do
        if docker-compose -f docker-compose.dev.yml ps "$service_name" | grep -q "healthy\|Up"; then
            return 0
        fi
        sleep 1
        counter=$((counter + 1))
    done
    return 1
}

# Enhanced service information display
display_service_info() {
    local db_type=$(detect_and_validate_database)
    local backend_port=${PORT:-5000}

    print_section "🎉 Development Environment Ready!"

    echo -e "${GREEN}📱 Application Access:${NC}"
    echo -e "   🌐 Frontend: ${CYAN}http://localhost:3000${NC}"
    echo -e "   🔧 Backend API: ${CYAN}http://localhost:$backend_port${NC}"
    echo -e "   ❤️  Health Check: ${CYAN}http://localhost:$backend_port/api/health${NC}"
    echo ""

    echo -e "${GREEN}💾 Database Configuration:${NC}"
    case $db_type in
        "atlas")
            local cluster_host=$(echo $MONGO_URI | sed 's/.*@\([^/]*\).*/\1/')
            local database_name=$(echo $MONGO_URI | sed 's/.*\/\([^?]*\).*/\1/')
            echo -e "   ☁️  MongoDB Atlas (Cloud)"
            echo -e "   🌐 Host: $cluster_host"
            echo -e "   📊 Database: $database_name"
            ;;
        "docker"|"local")
            echo -e "   🐳 Local MongoDB Container"
            echo -e "   🔌 Connection: mongodb://localhost:27017"
            echo -e "   👤 Admin: admin / ${MONGO_PASSWORD:-password123}"
            ;;
        *)
            echo -e "   🔧 Custom Configuration"
            ;;
    esac
    echo ""

    echo -e "${GREEN}📧 Email Configuration:${NC}"
    if [[ -n "$EMAIL_USER" && -n "$EMAIL_HOST" ]]; then
        echo -e "   ✅ Configured (${EMAIL_SERVICE:-SMTP})"
        echo -e "   📮 Host: ${EMAIL_HOST}:${EMAIL_PORT}"
    else
        echo -e "   ⚠️  Not configured (optional)"
    fi
    echo ""

    echo -e "${GREEN}🛠️  Development Commands:${NC}"
    echo -e "   📋 View logs: ${YELLOW}docker-compose -f docker-compose.dev.yml logs -f${NC}"
    echo -e "   📊 Container status: ${YELLOW}docker-compose -f docker-compose.dev.yml ps${NC}"
    echo -e "   🛑 Stop services: ${YELLOW}docker-compose -f docker-compose.dev.yml down${NC}"
    echo -e "   🔄 Restart: ${YELLOW}$0${NC}"
    echo -e "   🏗️  Rebuild: ${YELLOW}$0 --rebuild${NC}"
    echo -e "   🔍 Health check: ${YELLOW}curl http://localhost:$backend_port/api/health${NC}"
    echo -e "   🩺 Diagnostics: ${YELLOW}./diagnose-startup-issues.sh${NC}"
    echo ""
}

# Function to test API endpoint
test_api_endpoints() {
    print_section "🔍 API Endpoint Testing"
    local backend_port=${PORT:-5000}

    echo -e "${CYAN}Testing API endpoints...${NC}"

    # Test health endpoint
    if curl -sf "http://localhost:$backend_port/api/health" > /dev/null; then
        print_success "Health endpoint responding"
    else
        print_warning "Health endpoint not responding"
    fi

    # Display sample API calls
    echo -e "${BLUE}📡 Sample API Calls:${NC}"
    echo -e "   Health: ${CYAN}curl http://localhost:$backend_port/api/health${NC}"
    echo -e "   Graves: ${CYAN}curl http://localhost:$backend_port/api/graves${NC}"
    echo -e "   Users:  ${CYAN}curl http://localhost:$backend_port/api/users${NC}"
}

# Main execution flow with comprehensive error handling
main() {
    local start_time=$(date +%s)

    # Handle command line arguments
    local rebuild_flag=""
    if [[ "$1" == "--rebuild" ]]; then
        rebuild_flag="--rebuild"
        echo -e "${BLUE}🔨 Rebuild mode enabled${NC}"
    fi

    # Execute all startup phases
    if ! check_docker; then exit 1; fi
    if ! load_env_file; then exit 1; fi

    # Start services with retry logic
    local success=false
    for retry in $(seq 1 $MAX_RETRIES); do
        CURRENT_RETRY=$retry
        echo -e "${BLUE}🚀 Startup attempt $retry/$MAX_RETRIES${NC}"

        if start_services "$rebuild_flag"; then
            if wait_for_services; then
                success=true
                break
            fi
        fi

        if [ $retry -lt $MAX_RETRIES ]; then
            print_warning "Attempt $retry failed. Retrying in 10 seconds..."
            docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
            sleep 10
        fi
    done

    if [ "$success" = false ]; then
        print_error "Failed to start development environment after $MAX_RETRIES attempts!"
        echo ""
        echo -e "${YELLOW}🩺 Automated Diagnostics:${NC}"
        echo -e "${CYAN}Run: ./diagnose-startup-issues.sh${NC}"
        echo ""
        echo -e "${YELLOW}🔧 Manual Troubleshooting:${NC}"
        echo -e "1. Check logs: ${CYAN}docker-compose -f docker-compose.dev.yml logs${NC}"
        echo -e "2. Verify .env: ${CYAN}./validate-env.sh${NC}"
        echo -e "3. Clean restart: ${CYAN}docker-compose -f docker-compose.dev.yml down && docker system prune${NC}"
        exit 1
    fi

    # Display success information
    display_service_info
    test_api_endpoints

    # Show container status
    echo -e "${GREEN}📊 Final Container Status:${NC}"
    docker-compose -f docker-compose.dev.yml ps

    # Calculate and display startup time
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    echo ""
    print_success "🎯 Cemetery Management System ready for development!"
    echo -e "${CYAN}⏱️  Total startup time: ${duration} seconds${NC}"
    echo -e "${CYAN}🌐 Frontend: ${GREEN}http://localhost:3000${NC}"
    echo -e "${CYAN}⚡ API: ${GREEN}http://localhost:${PORT:-5000}/api/health${NC}"
    echo ""
    echo -e "${PURPLE}🏛️  Happy coding! Your cemetery management system is ready to serve the community. 🏛️${NC}"
}

# Trap cleanup on script exit
cleanup() {
    if [ $? -ne 0 ]; then
        echo ""
        print_error "Startup failed! Environment may be in inconsistent state."
        echo -e "${CYAN}💡 Run cleanup: docker-compose -f docker-compose.dev.yml down${NC}"
        echo -e "${CYAN}💡 Get help: ./diagnose-startup-issues.sh${NC}"
    fi
}
trap cleanup EXIT

# Check if we're in the right directory
if [ ! -f "docker-compose.dev.yml" ]; then
    print_error "docker-compose.dev.yml not found!"
    echo -e "${CYAN}💡 Please run this script from the JKPKatastar project root directory${NC}"
    exit 1
fi

# Run main function
main "$@"
