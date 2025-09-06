#!/bin/bash

# JKP Katastar - Intelligent Startup Issue Diagnostic Tool
# This script provides user-friendly error analysis and solutions

set -e

echo "🔍 JKP Katastar Cemetery Management System - Startup Issue Diagnostics"
echo "======================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to analyze DNS resolution issues
analyze_dns_issues() {
    local mongo_uri="$1"
    local cluster_host=$(echo "$mongo_uri" | sed 's/.*@\([^/]*\).*/\1/')

    echo -e "${YELLOW}🔍 Analyzing DNS Resolution for MongoDB Atlas...${NC}"
    echo -e "   🌐 Cluster Host: ${cluster_host}"

    # Test DNS resolution from host
    if nslookup "$cluster_host" >/dev/null 2>&1; then
        echo -e "   ✅ DNS resolution works from host system"
    else
        echo -e "   ❌ DNS resolution FAILS from host system"
        echo -e "${RED}💡 SOLUTION: Check your internet connection and DNS settings${NC}"
        echo -e "   • Try switching DNS servers (8.8.8.8, 1.1.1.1, or 208.67.222.222)"
        echo -e "   • Check if your firewall blocks DNS queries"
        echo -e "   • Verify internet connectivity: ping google.com"
        return 1
    fi

    # Check if Docker containers can resolve DNS
    echo -e "   🐳 Testing DNS from within Docker container..."
    if docker run --rm alpine nslookup "$cluster_host" >/dev/null 2>&1; then
        echo -e "   ✅ Docker container DNS resolution works"
    else
        echo -e "   ❌ Docker container DNS resolution FAILS"
        echo -e "${RED}💡 SOLUTION: Docker DNS configuration issue${NC}"
        echo -e "   • Restart Docker daemon: sudo systemctl restart docker"
        echo -e "   • Check Docker DNS settings in /etc/docker/daemon.json"
        echo -e "   • Try Docker network reset: docker network prune"
        return 1
    fi

    return 0
}

# Function to analyze MongoDB Atlas connectivity
analyze_atlas_connectivity() {
    local mongo_uri="$1"

    echo -e "${YELLOW}🔍 Analyzing MongoDB Atlas Connection...${NC}"

    # Extract cluster details
    local cluster_host=$(echo "$mongo_uri" | sed 's/.*@\([^/]*\).*/\1/')
    local database_name=$(echo "$mongo_uri" | sed 's/.*\/\([^?]*\).*/\1/')
    local username=$(echo "$mongo_uri" | sed 's/.*:\/\/\([^:]*\):.*/\1/')

    echo -e "   👤 Username: ${username}"
    echo -e "   🌐 Cluster: ${cluster_host}"
    echo -e "   📊 Database: ${database_name}"

    # Common MongoDB Atlas issues
    echo -e "${PURPLE}🚨 Common MongoDB Atlas Issues:${NC}"
    echo -e "${YELLOW}1. IP Whitelist Issue (Most Common)${NC}"
    echo -e "   • Your IP address is not whitelisted in Atlas"
    echo -e "   • Atlas only allows connections from authorized IPs"
    echo -e "   ${GREEN}✅ SOLUTION:${NC}"
    echo -e "     → Go to https://cloud.mongodb.com/"
    echo -e "     → Navigate to: Network Access → IP Whitelist"
    echo -e "     → Add your current IP or use 0.0.0.0/0 (for testing only!)"
    echo ""

    echo -e "${YELLOW}2. Incorrect Username/Password${NC}"
    echo -e "   • Database user credentials are wrong"
    echo -e "   • User might not exist or password changed"
    echo -e "   ${GREEN}✅ SOLUTION:${NC}"
    echo -e "     → Go to: Database Access → Database Users"
    echo -e "     → Verify username '${username}' exists"
    echo -e "     → Reset password if needed"
    echo ""

    echo -e "${YELLOW}3. Database User Permissions${NC}"
    echo -e "   • User lacks permissions for database '${database_name}'"
    echo -e "   ${GREEN}✅ SOLUTION:${NC}"
    echo -e "     → Ensure user has 'readWrite' role for '${database_name}'"
    echo -e "     → Or use 'Atlas admin' role for full access"
    echo ""

    echo -e "${YELLOW}4. Cluster Paused/Suspended${NC}"
    echo -e "   • M0 clusters pause after inactivity"
    echo -e "   • Billing issues can suspend clusters"
    echo -e "   ${GREEN}✅ SOLUTION:${NC}"
    echo -e "     → Check cluster status in Atlas dashboard"
    echo -e "     → Resume cluster if paused"
    echo -e "     → Verify billing information"
    echo ""

    # Get current public IP for IP whitelist check
    echo -e "${YELLOW}🌐 Your Current Public IP:${NC}"
    local current_ip=$(curl -s https://ifconfig.me 2>/dev/null || curl -s https://ipinfo.io/ip 2>/dev/null || echo "Unable to detect")
    echo -e "   📍 Public IP: ${GREEN}${current_ip}${NC}"
    echo -e "   💡 Add this IP to your Atlas IP whitelist"
}

# Function to analyze Docker health check issues
analyze_docker_health() {
    echo -e "${YELLOW}🔍 Analyzing Docker Container Health Issues...${NC}"

    # Check if curl is available in the backend container
    echo -e "   🔧 Checking health check dependencies..."

    local has_curl=false
    if docker-compose -f docker-compose.dev.yml exec -T backend which curl >/dev/null 2>&1; then
        has_curl=true
        echo -e "   ✅ curl is available in backend container"
    else
        echo -e "   ❌ curl is NOT available in backend container"
    fi

    if [ "$has_curl" = false ]; then
        echo -e "${RED}🚨 CRITICAL ISSUE: Missing Health Check Tool${NC}"
        echo -e "${YELLOW}The Docker health check cannot work because 'curl' is missing from the Node.js Alpine image.${NC}"
        echo ""
        echo -e "${GREEN}💡 IMMEDIATE SOLUTIONS:${NC}"
        echo -e "${YELLOW}Option 1 - Install curl in Dockerfile:${NC}"
        echo -e "   Add this line to server/Dockerfile after 'FROM node:18-alpine':"
        echo -e "   ${CYAN}RUN apk add --no-cache curl${NC}"
        echo ""
        echo -e "${YELLOW}Option 2 - Use wget instead (already available):${NC}"
        echo -e "   Change health check in docker-compose.dev.yml:"
        echo -e "   ${CYAN}test: [\"CMD\", \"wget\", \"--no-verbose\", \"--tries=1\", \"--spider\", \"http://localhost:5000/api/health\"]${NC}"
        echo ""
        echo -e "${YELLOW}Option 3 - Use nc (netcat) for port check:${NC}"
        echo -e "   ${CYAN}test: [\"CMD\", \"nc\", \"-z\", \"localhost\", \"5000\"]${NC}"
        return 1
    fi

    return 0
}

# Function to analyze backend startup issues
analyze_backend_startup() {
    echo -e "${YELLOW}🔍 Analyzing Backend Application Issues...${NC}"

    # Get recent logs
    local logs=$(docker-compose -f docker-compose.dev.yml logs --tail=20 backend 2>/dev/null)

    if echo "$logs" | grep -q "ENOTFOUND\|ESERVFAIL"; then
        echo -e "   ❌ DNS Resolution Error detected"
        echo -e "${RED}🚨 PRIMARY ISSUE: Cannot resolve MongoDB Atlas hostname${NC}"
        return 1
    fi

    if echo "$logs" | grep -q "authentication failed\|unauthorized"; then
        echo -e "   ❌ Authentication Error detected"
        echo -e "${RED}🚨 PRIMARY ISSUE: MongoDB authentication failed${NC}"
        return 1
    fi

    if echo "$logs" | grep -q "connection timed out\|timeout"; then
        echo -e "   ❌ Connection Timeout detected"
        echo -e "${RED}🚨 PRIMARY ISSUE: Network connectivity problem${NC}"
        return 1
    fi

    if echo "$logs" | grep -q "Error.*exit"; then
        echo -e "   ❌ Application crash detected"
        echo -e "${RED}🚨 PRIMARY ISSUE: Backend application is crashing${NC}"
        return 1
    fi

    return 0
}

# Function to provide step-by-step solutions
provide_solutions() {
    local issue_type="$1"

    echo -e "${GREEN}🎯 STEP-BY-STEP SOLUTION GUIDE${NC}"
    echo -e "=================================="

    case "$issue_type" in
        "dns"|"atlas")
            echo -e "${YELLOW}🔧 For MongoDB Atlas DNS/Connection Issues:${NC}"
            echo ""
            echo -e "${BLUE}Step 1: Check Atlas IP Whitelist${NC}"
            echo -e "   → Open https://cloud.mongodb.com/"
            echo -e "   → Go to: Network Access → IP Access List"
            echo -e "   → Click 'ADD IP ADDRESS'"
            echo -e "   → Add your current IP or 0.0.0.0/0 (temporary)"
            echo ""
            echo -e "${BLUE}Step 2: Verify Cluster Status${NC}"
            echo -e "   → Check if cluster is running (not paused)"
            echo -e "   → M0 clusters auto-pause after inactivity"
            echo -e "   → Click 'Resume' if paused"
            echo ""
            echo -e "${BLUE}Step 3: Test Connection String${NC}"
            echo -e "   → Go to: Clusters → Connect → Connect your application"
            echo -e "   → Copy the new connection string"
            echo -e "   → Update MONGO_URI in your .env file"
            echo ""
            echo -e "${BLUE}Step 4: Check Database User${NC}"
            echo -e "   → Go to: Database Access → Database Users"
            echo -e "   → Ensure user exists and has proper permissions"
            echo -e "   → Use 'readWrite' role for your database"
            ;;
        "health")
            echo -e "${YELLOW}🔧 For Docker Health Check Issues:${NC}"
            echo ""
            echo -e "${BLUE}Step 1: Fix Missing curl in Dockerfile${NC}"
            echo -e "   → Edit server/Dockerfile"
            echo -e "   → Add after 'FROM node:18-alpine':"
            echo -e "     ${CYAN}RUN apk add --no-cache curl${NC}"
            echo ""
            echo -e "${BLUE}Step 2: Alternative - Update Health Check${NC}"
            echo -e "   → Edit docker-compose.dev.yml"
            echo -e "   → Replace curl health check with:"
            echo -e "     ${CYAN}test: [\"CMD\", \"wget\", \"--no-verbose\", \"--tries=1\", \"--spider\", \"http://localhost:5000/api/health\"]${NC}"
            echo ""
            echo -e "${BLUE}Step 3: Rebuild and Restart${NC}"
            echo -e "   → Run: ${CYAN}./start-dev.sh --rebuild${NC}"
            ;;
        "general")
            echo -e "${YELLOW}🔧 General Troubleshooting Steps:${NC}"
            echo ""
            echo -e "${BLUE}Step 1: Stop Everything${NC}"
            echo -e "   → ${CYAN}docker-compose -f docker-compose.dev.yml down${NC}"
            echo ""
            echo -e "${BLUE}Step 2: Clean Docker System${NC}"
            echo -e "   → ${CYAN}docker system prune${NC}"
            echo ""
            echo -e "${BLUE}Step 3: Restart Docker${NC}"
            echo -e "   → ${CYAN}sudo systemctl restart docker${NC}"
            echo ""
            echo -e "${BLUE}Step 4: Rebuild Everything${NC}"
            echo -e "   → ${CYAN}./start-dev.sh --rebuild${NC}"
            ;;
    esac
}

# Function to generate quick fix scripts
generate_quick_fixes() {
    echo -e "${GREEN}🚀 QUICK FIX SCRIPTS${NC}"
    echo -e "==================="

    echo -e "${YELLOW}Fix 1: Add curl to backend container${NC}"
    echo -e "Execute: ${CYAN}echo 'RUN apk add --no-cache curl' | sed -i '2i\\RUN apk add --no-cache curl' server/Dockerfile${NC}"
    echo ""

    echo -e "${YELLOW}Fix 2: Alternative health check (no rebuild needed)${NC}"
    echo -e "Execute: ${CYAN}sed -i 's/curl.*health/wget --no-verbose --tries=1 --spider http:\\/\\/localhost:5000\\/api\\/health/' docker-compose.dev.yml${NC}"
    echo ""

    echo -e "${YELLOW}Fix 3: Complete reset${NC}"
    echo -e "Execute: ${CYAN}docker-compose -f docker-compose.dev.yml down && docker system prune -f && ./start-dev.sh --rebuild${NC}"
}

# Main diagnostic function
main() {
    # Load environment variables
    if [ -f .env ]; then
        while IFS= read -r line; do
            if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*# ]]; then
                key=$(echo "$line" | cut -d'=' -f1 | tr -d ' ')
                value=$(echo "$line" | cut -d'=' -f2- | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
                if [[ -n "$key" && -n "$value" ]]; then
                    export "$key"="$value"
                fi
            fi
        done < .env
    else
        echo -e "${RED}❌ .env file not found!${NC}"
        exit 1
    fi

    local issues_found=0
    local primary_issue=""

    # Check backend logs for specific errors
    echo -e "${BLUE}📋 Container Status Analysis:${NC}"
    docker-compose -f docker-compose.dev.yml ps
    echo ""

    # Analyze the main issues
    if docker-compose -f docker-compose.dev.yml logs backend 2>/dev/null | grep -q "ENOTFOUND\|ESERVFAIL"; then
        echo -e "${RED}🚨 PRIMARY ISSUE IDENTIFIED: MongoDB Atlas DNS Resolution Failed${NC}"
        primary_issue="dns"
        issues_found=$((issues_found + 1))

        if [[ "$MONGO_URI" == *"mongodb+srv://"* ]]; then
            analyze_dns_issues "$MONGO_URI"
            analyze_atlas_connectivity "$MONGO_URI"
        fi
    fi

    # Check for health check issues
    if ! analyze_docker_health; then
        if [ -z "$primary_issue" ]; then
            primary_issue="health"
        fi
        issues_found=$((issues_found + 1))
    fi

    # Check backend startup
    if ! analyze_backend_startup; then
        if [ -z "$primary_issue" ]; then
            primary_issue="general"
        fi
        issues_found=$((issues_found + 1))
    fi

    echo ""
    echo -e "${PURPLE}📊 DIAGNOSTIC SUMMARY${NC}"
    echo -e "====================="
    echo -e "Issues Found: ${RED}${issues_found}${NC}"
    echo -e "Primary Issue: ${YELLOW}${primary_issue}${NC}"

    echo ""
    if [ $issues_found -gt 0 ]; then
        provide_solutions "$primary_issue"
        echo ""
        generate_quick_fixes

        echo ""
        echo -e "${GREEN}🎯 RECOMMENDED IMMEDIATE ACTION:${NC}"
        case "$primary_issue" in
            "dns"|"atlas")
                echo -e "1. ${YELLOW}Check MongoDB Atlas IP whitelist${NC}"
                echo -e "2. ${YELLOW}Verify cluster is not paused${NC}"
                echo -e "3. ${YELLOW}Test connection string${NC}"
                ;;
            "health")
                echo -e "1. ${YELLOW}Add curl to Dockerfile: RUN apk add --no-cache curl${NC}"
                echo -e "2. ${YELLOW}Rebuild: ./start-dev.sh --rebuild${NC}"
                ;;
            *)
                echo -e "1. ${YELLOW}Stop containers: docker-compose -f docker-compose.dev.yml down${NC}"
                echo -e "2. ${YELLOW}Clean system: docker system prune${NC}"
                echo -e "3. ${YELLOW}Restart: ./start-dev.sh --rebuild${NC}"
                ;;
        esac
    else
        echo -e "${GREEN}✅ No critical issues detected. System should be working normally.${NC}"
    fi

    echo ""
    echo -e "${CYAN}📞 Need more help?${NC}"
    echo -e "   • Check logs: ${YELLOW}docker-compose -f docker-compose.dev.yml logs -f backend${NC}"
    echo -e "   • Monitor health: ${YELLOW}watch 'docker-compose -f docker-compose.dev.yml ps'${NC}"
    echo -e "   • Test API: ${YELLOW}curl http://localhost:5000/api/health${NC}"
    echo ""
}

# Check if docker-compose.dev.yml exists
if [ ! -f "docker-compose.dev.yml" ]; then
    echo -e "${RED}❌ docker-compose.dev.yml not found! Please run this script from the project root directory.${NC}"
    exit 1
fi

# Run main diagnostic
main "$@"
