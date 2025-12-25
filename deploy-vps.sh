#!/bin/bash

# JKP Katastar - VPS Deployment Script
# Manual deployment script for VPS server

set -e

VPS_HOST="${VPS_HOST:-194.146.58.124}"
VPS_USER="root"
DEPLOY_DIR="/opt/jkp-katastar"
PROJECT_NAME="JKPKatastar"

echo "🏛️  JKP Katastar - VPS Deployment"
echo "=================================="

# Check if required environment variables are set
if [ -z "$MONGO_PASSWORD" ]; then
    echo "❌ MONGO_PASSWORD environment variable is required"
    echo "Set it with: export MONGO_PASSWORD=your_password"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET environment variable is required"
    echo "Set it with: export JWT_SECRET=your_jwt_secret"
    exit 1
fi

# Function to show usage
show_usage() {
    echo ""
    echo "Usage: $0 [deploy|stop|logs|clean|status]"
    echo ""
    echo "Commands:"
    echo "  deploy  - Deploy application to VPS"
    echo "  stop    - Stop all services on VPS"
    echo "  logs    - Show logs from VPS services"
    echo "  clean   - Clean deployment and Docker images"
    echo "  status  - Check status of services"
    echo ""
    echo "Required environment variables:"
    echo "  MONGO_PASSWORD - MongoDB root password"
    echo "  JWT_SECRET     - JWT secret key"
    echo ""
    echo "Optional environment variables:"
    echo "  EMAIL_SERVICE  - Email service provider"
    echo "  EMAIL_HOST     - Email server host"
    echo "  EMAIL_PORT     - Email server port"
    echo "  EMAIL_USER     - Email username"
    echo "  EMAIL_SECRET   - Email password"
    echo ""
    echo "Example:"
    echo "  export MONGO_PASSWORD=mypassword123"
    echo "  export JWT_SECRET=mysecretkey456"
    echo "  ./deploy-vps.sh deploy"
}

# Function to deploy to VPS
deploy_to_vps() {
    echo "🚀 Starting deployment to VPS..."

    ssh $VPS_USER@$VPS_HOST << EOF
        set -e

        echo "🏛️  JKP Katastar - Remote Deployment"
        echo "===================================="

        # Navigate to deployment directory
        mkdir -p $DEPLOY_DIR
        cd $DEPLOY_DIR

        # Stop existing services
        if [ -d "$PROJECT_NAME" ] && [ -f "$PROJECT_NAME/docker-compose.yml" ]; then
            echo "🛑 Stopping existing services..."
            cd $PROJECT_NAME
            (docker compose -f docker-compose.yml -f docker-compose.prod.yml down || docker-compose -f docker-compose.yml -f docker-compose.prod.yml down) || true
            cd ..
        fi

        # Backup existing deployment
        if [ -d "$PROJECT_NAME" ]; then
            echo "📦 Backing up existing deployment..."
            mv $PROJECT_NAME ${PROJECT_NAME}-backup-\$(date +%Y%m%d-%H%M%S) || true
        fi

        # Clone fresh repository
        echo "📥 Cloning repository..."
        git clone https://github.com/${GITHUB_REPOSITORY:-constantine2nd/JKPKatastar}.git JKPKatastar
        cd $PROJECT_NAME

        # Create production environment file
        echo "⚙️  Setting up environment..."
        cat > .env << 'ENV_EOF'
NODE_ENV=production
PORT=5000
MONGO_USERNAME=admin
MONGO_PASSWORD=$MONGO_PASSWORD
MONGO_DATABASE=graves_prod
MONGO_URI=mongodb://admin:$MONGO_PASSWORD@mongodb:27017/graves_prod?authSource=admin
JWT_SECRET=$JWT_SECRET
EMAIL_SERVICE=${EMAIL_SERVICE:-}
EMAIL_HOST=${EMAIL_HOST:-}
EMAIL_PORT=${EMAIL_PORT:-587}
EMAIL_USER=${EMAIL_USER:-}
EMAIL_SECRET=${EMAIL_SECRET:-}
CLIENT_HOST_URI=${CLIENT_HOST_URI:-http://$VPS_HOST:3000}
REACT_APP_API_URL=${REACT_APP_API_URL:-http://$VPS_HOST:5000/api}
REACT_APP_MAP_CENTER_LAT=45.2671
REACT_APP_MAP_CENTER_LON=19.8335
CHOKIDAR_USEPOLLING=false
GENERATE_SOURCEMAP=false
ENV_EOF

        # Create data directories
        mkdir -p $DEPLOY_DIR/data/mongodb
        mkdir -p $DEPLOY_DIR/logs

        # Determine compose command
        if docker compose version > /dev/null 2>&1; then
            COMPOSE_CMD="docker compose"
        else
            COMPOSE_CMD="docker-compose"
        fi

        # Pull latest images and build
        echo "🔨 Building and starting services..."
        $COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml pull || true
        $COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml up --build -d

        # Wait for containers to start
        echo "⏳ Waiting for containers to start..."
        sleep 30

        # Check container status
        echo "📊 Container Status:"
        $COMPOSE_CMD ps

        # Show logs for debugging
        echo "📋 Recent logs:"
        $COMPOSE_CMD logs --tail=50

        # Wait for services to be ready
        echo "🩺 Waiting for services to be ready..."

        # Wait for MongoDB
        for i in {1..30}; do
            if $COMPOSE_CMD exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
                echo "✅ MongoDB is ready"
                break
            fi
            echo "Waiting for MongoDB... (\$i/30)"
            sleep 5
        done

        # Wait for Backend
        for i in {1..30}; do
            if $COMPOSE_CMD exec -T backend wget --spider --quiet --timeout=5 --tries=1 http://localhost:5000/api/health > /dev/null 2>&1; then
                echo "✅ Backend is ready"
                break
            fi
            echo "Waiting for Backend... (\$i/30)"
            sleep 5
        done

        # Wait for Frontend
        for i in {1..30}; do
            if $COMPOSE_CMD exec -T frontend wget --spider --quiet --timeout=5 --tries=1 http://localhost:80 > /dev/null 2>&1; then
                echo "✅ Frontend is ready"
                break
            fi
            echo "Waiting for Frontend... (\$i/30)"
            sleep 5
        done

        # Final status check
        echo "📊 Final Service Status:"
        $COMPOSE_CMD ps

        # Clean up old images
        echo "🧹 Cleaning up old Docker images..."
        docker image prune -f || true

        # Remove old backups (keep only last 3)
        echo "🗂️  Cleaning up old backups..."
        cd $DEPLOY_DIR
        ls -dt ${PROJECT_NAME}-backup-* 2>/dev/null | tail -n +4 | xargs rm -rf 2>/dev/null || true

        echo "🎉 Deployment completed successfully!"
        echo ""
        echo "🌐 Access URLs:"
        echo "   Frontend: http://$VPS_HOST:3000"
        echo "   Backend:  http://$VPS_HOST:5000/api"
        echo ""
EOF

    echo "🔍 Verifying deployment..."
    sleep 30

    # Check if services are responding
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 http://$VPS_HOST:3000 || echo "000")
    BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 --max-time 30 http://$VPS_HOST:5000/api/health || echo "000")

    echo "Frontend Status: HTTP $FRONTEND_STATUS"
    echo "Backend Status: HTTP $BACKEND_STATUS"

    if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "301" ] || [ "$FRONTEND_STATUS" = "302" ]; then
        echo "✅ Frontend is responding"
    else
        echo "⚠️  Frontend not responding properly"
    fi

    if [ "$BACKEND_STATUS" = "200" ]; then
        echo "✅ Backend API is responding"
    else
        echo "⚠️  Backend API not responding properly"
    fi

    echo ""
    echo "🎉 Deployment to VPS completed!"
    echo "Frontend: http://$VPS_HOST:3000"
    echo "Backend: http://$VPS_HOST:5000/api"
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping services on VPS..."

    ssh $VPS_USER@$VPS_HOST << EOF
        cd $DEPLOY_DIR/$PROJECT_NAME
        if [ -f docker-compose.yml ]; then
            if docker compose version > /dev/null 2>&1; then
                docker compose down --timeout 30
            else
                docker-compose down --timeout 30
            fi
            echo "✅ Services stopped"
        else
            echo "⚠️  No deployment found"
        fi
EOF
}

# Function to show logs
show_logs() {
    echo "📋 Showing logs from VPS services..."

    ssh $VPS_USER@$VPS_HOST << EOF
        cd $DEPLOY_DIR/$PROJECT_NAME
        if [ -f docker-compose.yml ]; then
            if docker compose version > /dev/null 2>&1; then
                docker compose logs -f --tail=100
            else
                docker-compose logs -f --tail=100
            fi
        else
            echo "⚠️  No deployment found"
        fi
EOF
}

# Function to clean deployment
clean_deployment() {
    echo "🧹 Cleaning deployment on VPS..."

    ssh $VPS_USER@$VPS_HOST << EOF
        cd $DEPLOY_DIR
        if [ -d "$PROJECT_NAME" ]; then
            cd $PROJECT_NAME
            if docker compose version > /dev/null 2>&1; then
                docker compose down -v --timeout 30 || true
            else
                docker-compose down -v --timeout 30 || true
            fi
            cd ..
            rm -rf $PROJECT_NAME
        fi

        # Clean Docker system
        docker system prune -af
        docker volume prune -f

        # Remove all backups
        rm -rf ${PROJECT_NAME}-backup-* 2>/dev/null || true

        echo "✅ Cleanup completed"
EOF
}

# Function to check status
check_status() {
    echo "📊 Checking status of services on VPS..."

    ssh $VPS_USER@$VPS_HOST << EOF
        cd $DEPLOY_DIR/$PROJECT_NAME 2>/dev/null || { echo "⚠️  No deployment found"; exit 0; }

        # Determine compose command
        if docker compose version > /dev/null 2>&1; then
            COMPOSE_CMD="docker compose"
        else
            COMPOSE_CMD="docker-compose"
        fi

        echo "Service Status:"
        $COMPOSE_CMD ps

        echo ""
        echo "Service Health:"
        # Check if services are responding internally
        if $COMPOSE_CMD exec -T mongodb mongosh --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
            echo "  ✅ MongoDB: Healthy"
        else
            echo "  ❌ MongoDB: Unhealthy"
        fi

        if $COMPOSE_CMD exec -T backend wget --spider --quiet --timeout=5 --tries=1 http://localhost:5000/api/health >/dev/null 2>&1; then
            echo "  ✅ Backend: Healthy"
        else
            echo "  ❌ Backend: Unhealthy"
        fi

        if $COMPOSE_CMD exec -T frontend wget --spider --quiet --timeout=5 --tries=1 http://localhost:80 >/dev/null 2>&1; then
            echo "  ✅ Frontend: Healthy"
        else
            echo "  ❌ Frontend: Unhealthy"
        fi

        echo ""
        echo "Docker System Info:"
        docker system df

        echo ""
        echo "Disk Usage:"
        df -h $DEPLOY_DIR

        echo ""
        echo "Recent Logs (last 10 lines per service):"
        for service in mongodb backend frontend; do
            echo "--- \$service ---"
            $COMPOSE_CMD logs --tail=10 \$service 2>/dev/null || echo "No logs available"
        done
EOF
}

# Main script logic
case "${1:-deploy}" in
    "deploy")
        deploy_to_vps
        ;;
    "stop")
        stop_services
        ;;
    "logs")
        show_logs
        ;;
    "clean")
        clean_deployment
        ;;
    "status")
        check_status
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_usage
        exit 1
        ;;
esac
