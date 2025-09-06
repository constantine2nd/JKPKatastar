#!/bin/bash

# JKP Katastar - Environment Configuration Validator
# This script validates .env file configuration and provides recommendations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}🏛️  JKP Katastar - Environment Configuration Validator${NC}"
echo -e "${BOLD}====================================================${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    if [ -f .env.example ]; then
        echo -e "${YELLOW}💡 Creating .env from .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo -e "${YELLOW}⚠️  Please edit .env with your configuration and run this script again.${NC}"
    fi
    exit 1
fi

# Load .env file
echo -e "${BLUE}📝 Loading .env file...${NC}"
# Handle .env format with spaces around equals signs
while IFS= read -r line; do
    # Skip empty lines and comments
    if [[ -n "$line" && ! "$line" =~ ^[[:space:]]*# ]]; then
        # Remove spaces around equals sign and export
        key=$(echo "$line" | cut -d'=' -f1 | tr -d ' ')
        value=$(echo "$line" | cut -d'=' -f2- | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
        if [[ -n "$key" && -n "$value" ]]; then
            export "$key"="$value"
        fi
    fi
done < .env

# Validation results
ERRORS=0
WARNINGS=0
RECOMMENDATIONS=()

# Function to report error
report_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Function to report warning
report_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

# Function to add recommendation
add_recommendation() {
    RECOMMENDATIONS+=("$1")
}

echo -e "${BLUE}🔍 Validating configuration...${NC}"
echo

# 1. Database Configuration Validation
echo -e "${CYAN}📊 Database Configuration:${NC}"
if [ -z "$MONGO_URI" ]; then
    report_error "MONGO_URI is required but not set"
else
    echo -e "${GREEN}✅ MONGO_URI is configured${NC}"

    # Detect database type
    if [[ "$MONGO_URI" == *"mongodb+srv://"* ]] || [[ "$MONGO_URI" == *"@"*".mongodb.net"* ]]; then
        echo -e "${CYAN}   🌐 Type: MongoDB Atlas (Cloud)${NC}"
        DB_TYPE="atlas"

        # Validate Atlas URI format
        if [[ ! "$MONGO_URI" =~ mongodb\+srv://[^:]+:[^@]+@[^/]+/[^?]+(\?.*)?$ ]]; then
            report_warning "MongoDB Atlas URI format might be incorrect"
            add_recommendation "Ensure Atlas URI follows: mongodb+srv://username:password@cluster.mongodb.net/database?options"
        fi

    elif [[ "$MONGO_URI" == *"mongodb://localhost:"* ]] || [[ "$MONGO_URI" == *"mongodb://127.0.0.1:"* ]]; then
        echo -e "${CYAN}   🏠 Type: Local MongoDB${NC}"
        DB_TYPE="local"
        add_recommendation "For Docker development, consider using 'mongodb://mongodb:27017' in MONGO_URI"

    elif [[ "$MONGO_URI" == *"mongodb://mongodb:"* ]]; then
        echo -e "${CYAN}   🐳 Type: Docker MongoDB${NC}"
        DB_TYPE="docker"

    else
        echo -e "${CYAN}   🔧 Type: Custom MongoDB${NC}"
        DB_TYPE="custom"
    fi

    # Extract database name for validation
    DB_NAME=$(echo "$MONGO_URI" | sed -n 's|.*/\([^?]*\).*|\1|p')
    if [ -n "$DB_NAME" ]; then
        echo -e "${CYAN}   📁 Database: ${DB_NAME}${NC}"
    fi
fi

# 2. JWT Configuration Validation
echo
echo -e "${CYAN}🔐 JWT Security:${NC}"
if [ -z "$JWT_SECRET" ]; then
    report_error "JWT_SECRET is required but not set"
else
    JWT_LENGTH=${#JWT_SECRET}
    if [ $JWT_LENGTH -lt 8 ]; then
        report_error "JWT_SECRET is too short ($JWT_LENGTH chars). Minimum 8 characters required."
    elif [ $JWT_LENGTH -lt 32 ]; then
        report_warning "JWT_SECRET is weak ($JWT_LENGTH chars). Recommend 32+ characters for production."
        add_recommendation "Generate a strong JWT secret: openssl rand -base64 32"
    else
        echo -e "${GREEN}✅ JWT_SECRET is properly configured ($JWT_LENGTH chars)${NC}"
    fi

    # Check for common weak secrets
    WEAK_SECRETS=("123" "1234" "12345" "secret" "password" "admin" "test")
    for weak in "${WEAK_SECRETS[@]}"; do
        if [ "$JWT_SECRET" = "$weak" ]; then
            report_error "JWT_SECRET is using a common weak value: '$weak'"
            break
        fi
    done
fi

# 3. Email Configuration Validation
echo
echo -e "${CYAN}📧 Email Configuration:${NC}"
if [ -n "$EMAIL_USER" ] && [ -n "$EMAIL_HOST" ] && [ -n "$EMAIL_SECRET" ]; then
    echo -e "${GREEN}✅ Email is configured${NC}"
    echo -e "${CYAN}   📮 Service: ${EMAIL_SERVICE:-SMTP}${NC}"
    echo -e "${CYAN}   🌐 Host: ${EMAIL_HOST}:${EMAIL_PORT:-587}${NC}"
    echo -e "${CYAN}   👤 User: ${EMAIL_USER}${NC}"

    # Validate Gmail configuration
    if [[ "$EMAIL_HOST" == *"gmail"* ]]; then
        if [ "$EMAIL_PORT" != "465" ] && [ "$EMAIL_PORT" != "587" ]; then
            report_warning "Gmail typically uses port 465 (SSL) or 587 (TLS), you have: $EMAIL_PORT"
        fi
        if [ -z "$EMAIL_SECRET" ] || [ ${#EMAIL_SECRET} -lt 16 ]; then
            report_warning "Gmail requires App Password (16 chars), consider enabling 2FA and generating App Password"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Email is not fully configured (optional)${NC}"
    if [ -n "$EMAIL_USER" ] || [ -n "$EMAIL_HOST" ]; then
        report_warning "Partial email configuration detected. Ensure all EMAIL_* variables are set."
    fi
fi

# 4. Client Configuration Validation
echo
echo -e "${CYAN}🌐 Client Configuration:${NC}"
if [ -z "$CLIENT_HOST_URI" ]; then
    report_warning "CLIENT_HOST_URI not set, using default: http://localhost:3000"
    export CLIENT_HOST_URI="http://localhost:3000"
else
    echo -e "${GREEN}✅ CLIENT_HOST_URI: ${CLIENT_HOST_URI}${NC}"
fi

# 5. Development Settings Validation
echo
echo -e "${CYAN}⚙️  Development Settings:${NC}"
echo -e "${CYAN}   🌍 NODE_ENV: ${NODE_ENV:-development}${NC}"
echo -e "${CYAN}   🚪 PORT: ${PORT:-5000}${NC}"

# Validate PORT
if [ -n "$PORT" ]; then
    if ! [[ "$PORT" =~ ^[0-9]+$ ]] || [ "$PORT" -lt 1 ] || [ "$PORT" -gt 65535 ]; then
        report_error "PORT must be a valid number between 1 and 65535"
    fi
fi

# Check for port conflicts
COMMON_PORTS=(80 443 22 21 25 53 110 143 993 995)
for port in "${COMMON_PORTS[@]}"; do
    if [ "$PORT" = "$port" ]; then
        report_warning "PORT $PORT is commonly used by system services, consider using a different port"
        break
    fi
done

# 6. Optional Configuration Check
echo
echo -e "${CYAN}📍 Optional Configuration:${NC}"
if [ -n "$REACT_APP_MAP_CENTER_LAT" ] && [ -n "$REACT_APP_MAP_CENTER_LON" ]; then
    echo -e "${GREEN}✅ Map center coordinates configured${NC}"
    echo -e "${CYAN}   🗺️  Location: ${REACT_APP_MAP_CENTER_LAT}, ${REACT_APP_MAP_CENTER_LON}${NC}"
else
    echo -e "${YELLOW}⚠️  Map center coordinates not set (will use defaults)${NC}"
fi

# 7. Security Recommendations
echo
echo -e "${CYAN}🛡️  Security Analysis:${NC}"

# Production environment checks
if [ "$NODE_ENV" = "production" ]; then
    echo -e "${YELLOW}🚨 Production environment detected!${NC}"

    if [[ "$MONGO_URI" == *"password123"* ]] || [[ "$MONGO_URI" == *"admin:admin"* ]]; then
        report_error "Production environment is using default/weak database credentials"
    fi

    if [ ${#JWT_SECRET} -lt 32 ]; then
        report_error "Production environment requires strong JWT_SECRET (32+ chars)"
    fi

    if [[ "$CLIENT_HOST_URI" == *"localhost"* ]]; then
        report_warning "Production environment should not use localhost URLs"
    fi
else
    echo -e "${GREEN}✅ Development environment detected${NC}"
fi

# 8. Final Results Summary
echo
echo -e "${BOLD}📋 Validation Summary:${NC}"
echo -e "${BOLD}=====================${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Perfect! No issues found in your configuration.${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}✅ Configuration is valid with ${WARNINGS} warnings.${NC}"
else
    echo -e "${RED}❌ Configuration has ${ERRORS} errors and ${WARNINGS} warnings.${NC}"
fi

echo -e "${CYAN}📊 Database Type: ${DB_TYPE:-unknown}${NC}"
echo -e "${CYAN}🔐 JWT Security: $([ ${#JWT_SECRET} -ge 32 ] && echo "Strong" || echo "Weak")${NC}"
echo -e "${CYAN}📧 Email: $([ -n "$EMAIL_USER" ] && [ -n "$EMAIL_HOST" ] && echo "Configured" || echo "Not configured")${NC}"

# Display recommendations
if [ ${#RECOMMENDATIONS[@]} -gt 0 ]; then
    echo
    echo -e "${BLUE}💡 Recommendations:${NC}"
    for i in "${!RECOMMENDATIONS[@]}"; do
        echo -e "${BLUE}   $((i+1)). ${RECOMMENDATIONS[i]}${NC}"
    done
fi

# Configuration template for missing variables
echo
echo -e "${BLUE}🔧 Quick Setup Commands:${NC}"
echo -e "${BLUE}========================${NC}"

if [ "$DB_TYPE" = "atlas" ]; then
    echo -e "${CYAN}# For MongoDB Atlas:${NC}"
    echo -e "# 1. Create cluster at https://cloud.mongodb.com/"
    echo -e "# 2. Get connection string and update MONGO_URI in .env"
    echo -e "# 3. Whitelist your IP address in Atlas"
fi

if [ ${#JWT_SECRET} -lt 32 ]; then
    echo -e "${CYAN}# Generate strong JWT secret:${NC}"
    echo -e "echo 'JWT_SECRET='$(openssl rand -base64 32) >> .env"
fi

if [ -z "$EMAIL_SECRET" ] && [[ "$EMAIL_HOST" == *"gmail"* ]]; then
    echo -e "${CYAN}# For Gmail configuration:${NC}"
    echo -e "# 1. Enable 2FA on your Google account"
    echo -e "# 2. Generate App Password at https://myaccount.google.com/apppasswords"
    echo -e "# 3. Use App Password as EMAIL_SECRET in .env"
fi

echo
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✨ Configuration validation completed successfully!${NC}"
    echo -e "${GREEN}🚀 You can now run: ./start-dev.sh${NC}"
    exit 0
else
    echo -e "${RED}🚫 Please fix the errors above before starting the application.${NC}"
    exit 1
fi
