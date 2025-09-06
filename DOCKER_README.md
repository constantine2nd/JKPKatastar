# JKP Katastar - Docker Setup Guide

🏛️ **Cemetery Burial Plot Records Management System**

This guide will help you set up the JKP Katastar application using Docker for local development and production deployment.

## 📋 Prerequisites

- **Docker** (version 20.0+ recommended)
- **Docker Compose** (version 2.0+ recommended)
- **Git** (for cloning the repository)
- **8GB+ RAM** (recommended for smooth development)

### Quick Prerequisites Check
```bash
docker --version
docker-compose --version
git --version
```

## 🏗️ Application Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │   Node.js API   │    │   MongoDB       │
│   (TypeScript)  │◄──►│   (Express)     │◄──►│   Database      │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tech Stack
- **Frontend**: React 18, TypeScript, Material-UI, React Query, Leaflet Maps
- **Backend**: Node.js, Express, Mongoose ODM, JWT Authentication
- **Database**: MongoDB 6.0
- **Development**: Hot-reload, file watching, development proxy

## 🚀 Quick Start (Recommended)

### Option 1: Automated Development Setup

1. **Clone and navigate to the project:**
   ```bash
   git clone <your-repo-url>
   cd JKPKatastar
   ```

2. **Run the automated setup script:**
   ```bash
   ./start-dev.sh
   ```
   
   This script will:
   - ✅ Check Docker installation
   - ✅ Create `.env` file from template
   - ✅ Build and start all containers
   - ✅ Wait for services to be ready
   - ✅ Display application URLs and logs

3. **Access the application:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **API Health**: http://localhost:5000/api/health

### Option 2: Manual Development Setup

1. **Create environment file:**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

2. **Start development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

## 🏭 Production Deployment

For production deployment with Nginx and optimized builds:

```bash
# Build and start production environment
docker-compose up --build -d

# Check container health
docker-compose ps
```

**Production URLs:**
- **Application**: http://localhost (port 80)
- **Backend API**: http://localhost/api/

## 📁 Docker Configuration Files

### Development Setup (`docker-compose.dev.yml`)
- **MongoDB**: Standard MongoDB 6.0 with persistent storage
- **Backend**: Node.js with nodemon for auto-restart
- **Frontend**: React dev server with hot-reload
- **Volumes**: Source code mounted for live editing

### Production Setup (`docker-compose.yml`)
- **MongoDB**: Production MongoDB with health checks
- **Backend**: Optimized Node.js production build
- **Frontend**: Nginx serving built React app with proxy
- **Features**: Health checks, security headers, gzip compression

## 🔧 Development Workflow

### Starting Development
```bash
# Start all services
./start-dev.sh

# Or manually
docker-compose -f docker-compose.dev.yml up
```

### Viewing Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f mongodb
```

### Stopping Services
```bash
# Stop and remove containers
docker-compose -f docker-compose.dev.yml down

# Stop, remove containers and volumes
docker-compose -f docker-compose.dev.yml down -v
```

### Rebuilding After Changes
```bash
# Rebuild and restart
./start-dev.sh --rebuild

# Or manually
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

## 🛠️ Useful Commands

### Database Management
```bash
# Connect to MongoDB shell
docker-compose -f docker-compose.dev.yml exec mongodb mongosh -u admin -p password123

# Backup database
docker-compose -f docker-compose.dev.yml exec mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/jkp_katastar?authSource=admin"

# View database logs
docker-compose -f docker-compose.dev.yml logs -f mongodb
```

### Backend Development
```bash
# Access backend container shell
docker-compose -f docker-compose.dev.yml exec backend sh

# Install new backend dependencies
docker-compose -f docker-compose.dev.yml exec backend npm install <package-name>

# Run backend tests (if available)
docker-compose -f docker-compose.dev.yml exec backend npm test
```

### Frontend Development
```bash
# Access frontend container shell
docker-compose -f docker-compose.dev.yml exec frontend sh

# Install new frontend dependencies
docker-compose -f docker-compose.dev.yml exec frontend npm install <package-name>

# Build production frontend
docker-compose -f docker-compose.dev.yml exec frontend npm run build
```

## 🔐 Environment Variables

### Essential Environment Variables
```bash
# Database
MONGO_URI=mongodb://admin:password123@mongodb:27017/jkp_katastar?authSource=admin
MONGO_PASSWORD=password123

# Security
JWT_SECRET=your_super_secure_jwt_secret_key

# Server
NODE_ENV=development
PORT=5000

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

### Production Security Notes
- ⚠️ **Change default passwords** in production
- ⚠️ **Use strong JWT secrets** (32+ characters)
- ⚠️ **Enable SSL/TLS** for production deployment
- ⚠️ **Configure firewall rules** for database access

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5000
lsof -i :27017

# Stop conflicting services or change ports in docker-compose
```

#### Database Connection Issues
```bash
# Check MongoDB container logs
docker-compose -f docker-compose.dev.yml logs mongodb

# Verify database is accessible
docker-compose -f docker-compose.dev.yml exec mongodb mongosh --eval "db.adminCommand('ping')"
```

#### Frontend Not Loading
```bash
# Check React development server logs
docker-compose -f docker-compose.dev.yml logs frontend

# Verify environment variables
docker-compose -f docker-compose.dev.yml exec frontend env | grep REACT_APP
```

#### Backend API Issues
```bash
# Check backend logs
docker-compose -f docker-compose.dev.yml logs backend

# Test API health endpoint
curl http://localhost:5000/api/health
```

### Clean Reset
If you need to completely reset the environment:
```bash
# Stop all containers and remove volumes
docker-compose -f docker-compose.dev.yml down -v

# Remove all related images
docker rmi $(docker images "jkpkatastar*" -q)

# Start fresh
./start-dev.sh --rebuild
```

## 📊 Container Resources

### Development Resource Usage
- **MongoDB**: ~200-500MB RAM
- **Backend**: ~100-200MB RAM
- **Frontend**: ~300-500MB RAM
- **Total**: ~1-1.5GB RAM

### Production Resource Usage
- **MongoDB**: ~200-500MB RAM
- **Backend**: ~50-150MB RAM
- **Frontend/Nginx**: ~50-100MB RAM
- **Total**: ~500MB-1GB RAM

## 🔍 Monitoring and Health Checks

### Health Check Endpoints
- **Backend**: `GET /api/health`
- **Frontend**: `GET /` (main application)
- **Database**: Built-in MongoDB ping

### Monitoring Commands
```bash
# Check container health
docker-compose ps

# Monitor resource usage
docker stats

# Check specific service health
curl http://localhost:5000/api/health
curl http://localhost:3000
```

## 🎯 Next Steps

After successful setup:

1. **Configure Authentication**: Set up user accounts and permissions
2. **Import Data**: Load cemetery and burial plot data
3. **Customize Maps**: Configure Leaflet maps for your cemetery locations
4. **Set up Email**: Configure nodemailer for notifications
5. **Add SSL**: Set up HTTPS for production deployment

## 💡 Tips for New Developers

- **File Changes**: Development setup supports hot-reload - your changes appear immediately
- **Database GUI**: Consider using MongoDB Compass to visualize data
- **API Testing**: Use tools like Postman or curl to test API endpoints
- **React DevTools**: Install React Developer Tools browser extension
- **TypeScript**: The frontend uses TypeScript - leverage IDE support for better development experience

---

**Need Help?** Check the logs first, then review this README. Most issues are related to environment variables or port conflicts.

**Happy Coding!** 🎉 The cemetery management system is ready for development.