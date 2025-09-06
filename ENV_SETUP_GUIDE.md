# JKP Katastar - Environment Setup Guide

🏛️ **Cemetery Burial Plot Records Management System**
**Complete Setup Guide Using .env as Source of Truth**

## 🎯 Overview

This guide will help you set up the JKP Katastar application using your existing configuration in the `.env` file as the single source of truth. The system automatically detects your database type (Atlas, Local, Docker) and configures services accordingly.

## 📋 Prerequisites

- **Docker** (version 20.0+)
- **Docker Compose** (version 2.0+)
- **Git** (for repository management)
- **curl** (for health checks)

### Quick Prerequisites Check
```bash
docker --version
docker-compose --version
git --version
curl --version
```

## 🚀 Quick Start (Recommended)

### 1. Validate Your Configuration
First, check if your `.env` file is properly configured:

```bash
./validate-env.sh
```

This script will:
- ✅ Validate all environment variables
- 🔍 Detect your database configuration type
- ⚠️ Report any issues or recommendations
- 💡 Provide setup commands for missing configuration

### 2. Start Development Environment
Once validation passes:

```bash
./start-dev.sh
```

The smart startup script will:
- 🔍 Automatically detect your database type
- 📦 Start appropriate services (Cloud DB = Backend+Frontend only)
- ⏳ Wait for all services to be healthy
- 📊 Display comprehensive status information

## 📊 Database Configuration Options

Your current `.env` file supports multiple database configurations:

### Option 1: MongoDB Atlas (Cloud) - **Your Current Setup**
```env
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database_name?retryWrites=true&w=majority
```

**Detected automatically when URI contains:**
- `mongodb+srv://`
- `@cluster*.mongodb.net`

**Services started:** Backend + Frontend (no local MongoDB container)

### Option 2: Local MongoDB (Docker Container)
```env
MONGO_URI=mongodb://admin:password123@mongodb:27017/jkp_katastar?authSource=admin
MONGO_PASSWORD=password123
```

**Services started:** MongoDB Container + Backend + Frontend

### Option 3: External MongoDB Server
```env
MONGO_URI=mongodb://user:pass@your-mongodb-server.com:27017/database_name
```

**Services started:** Backend + Frontend (connects to external server)

## 🔧 Configuration Details

### Required Variables (in your .env)
```env
# Database - MongoDB Atlas connection
MONGO_URI=mongodb+srv://zeljko:Matija2007@cluster0.pyahrxp.mongodb.net/graves_test?retryWrites=true&w=majority

# Security - JWT for authentication
JWT_SECRET=1234

# Email - For notifications and communication
EMAIL_SERVICE=Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=marko.milic.srbija@gmail.com
EMAIL_SECRET=mywd jrfx wyuh wjmw

# Client - Frontend URL
CLIENT_HOST_URI=http://localhost:3000
```

### Optional Variables (will use defaults if not set)
```env
# Server Settings
NODE_ENV=development
PORT=5000

# Frontend API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Map Center (for Serbian coordinates)
REACT_APP_MAP_CENTER_LAT=45.2671
REACT_APP_MAP_CENTER_LON=19.8335

# Development Settings
CHOKIDAR_USEPOLLING=true
GENERATE_SOURCEMAP=false
```

## 🛠️ Development Workflow

### Starting Development
```bash
# Validate configuration first
./validate-env.sh

# Start all services
./start-dev.sh

# Or with rebuild
./start-dev.sh --rebuild
```

### Checking Service Health
```bash
# Backend API health
curl http://localhost:5000/api/health

# Frontend availability
curl http://localhost:3000
```

### Viewing Logs
```bash
# All services
docker-compose -f docker-compose.dev.yml logs -f

# Specific service
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f frontend
```

### Stopping Services
```bash
# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (fresh start)
docker-compose -f docker-compose.dev.yml down -v
```

## 🔍 Service Discovery & Health Monitoring

The system provides comprehensive health monitoring:

### Backend Health Endpoint
```json
GET http://localhost:5000/api/health

Response:
{
  "status": "OK",
  "message": "JKP Katastar API is running",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "environment": "development",
  "port": 5000,
  "database": "Connected",
  "email": "Configured"
}
```

### Container Health Checks
```bash
# Check container status
docker-compose -f docker-compose.dev.yml ps

# View health check logs
docker-compose -f docker-compose.dev.yml logs backend | grep health
```

## 🌐 Network Configuration

### Container Communication
- **Frontend** ↔ **Backend**: `http://backend:5000`
- **Backend** ↔ **Database**: Uses `MONGO_URI` from `.env`
- **External Access**: 
  - Frontend: `http://localhost:3000`
  - Backend: `http://localhost:5000`

### Proxy Configuration
The frontend automatically proxies API calls:
- Frontend requests to `/api/*` → Backend container
- Configured in `client/package.json`: `"proxy": "http://backend:5000"`

## 🔐 Security Configuration

### JWT Configuration
```env
# Current (development)
JWT_SECRET=1234

# Recommended for production
JWT_SECRET=your_32_character_random_string_here
```

Generate strong JWT secret:
```bash
# Generate 32-character base64 secret
openssl rand -base64 32

# Or use online generator
# https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

### Email Security (Gmail App Passwords)
For Gmail integration:
1. Enable 2FA on your Google account
2. Generate App Password at: https://myaccount.google.com/apppasswords
3. Use App Password as `EMAIL_SECRET` in `.env`

### Database Security
**For MongoDB Atlas:**
- ✅ Already secured with authentication
- ✅ Network restrictions via IP whitelist
- ✅ Encrypted connections (TLS/SSL)

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. "ECONNREFUSED" Proxy Errors
**Symptom:** Frontend can't connect to backend
**Solution:** 
```bash
# Check if backend is healthy
curl http://localhost:5000/api/health

# Restart services
docker-compose -f docker-compose.dev.yml down
./start-dev.sh
```

#### 2. Database Connection Issues
**Symptom:** Backend fails to start or connect to database
**Solutions:**
```bash
# For Atlas: Check IP whitelist and credentials
# For Local: Ensure MongoDB container is healthy

# Check backend logs
docker-compose -f docker-compose.dev.yml logs backend

# Test connection manually
docker-compose -f docker-compose.dev.yml exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ DB Connected'))
  .catch(err => console.error('❌ DB Error:', err.message));
"
```

#### 3. Service Won't Start
**Symptom:** Container exits immediately
**Solutions:**
```bash
# Check configuration
./validate-env.sh

# View container logs
docker-compose -f docker-compose.dev.yml logs [service-name]

# Rebuild containers
./start-dev.sh --rebuild
```

#### 4. Port Already in Use
**Symptom:** "Port 3000/5000 is already allocated"
**Solutions:**
```bash
# Find process using port
lsof -i :3000
lsof -i :5000

# Kill process or change port in .env
echo "PORT=5001" >> .env
```

### Environment Validation Issues

Run validation script for detailed diagnosis:
```bash
./validate-env.sh
```

Common validation issues:
- ❌ **Weak JWT_SECRET**: Use 32+ character random string
- ⚠️ **Incomplete email config**: Ensure all EMAIL_* variables are set
- ⚠️ **Invalid MongoDB URI**: Check connection string format

## 🎯 Environment-Specific Setup

### Development (Current)
```env
NODE_ENV=development
# Uses your Atlas database
# Hot reload enabled
# Source maps disabled for performance
```

### Production Deployment
```env
NODE_ENV=production
# Use production database
# Strong JWT secrets required
# HTTPS URLs for CLIENT_HOST_URI
```

For production deployment:
```bash
# Use production compose file
docker-compose up --build -d
```

## 📊 Monitoring & Maintenance

### Health Checks
The system includes comprehensive health monitoring:
- **MongoDB**: Connection and ping tests
- **Backend**: API endpoint health checks
- **Frontend**: HTTP response tests

### Performance Monitoring
```bash
# Container resource usage
docker stats

# Service response times
time curl http://localhost:5000/api/health
```

### Log Management
```bash
# Follow logs in real-time
docker-compose -f docker-compose.dev.yml logs -f

# Export logs for analysis
docker-compose -f docker-compose.dev.yml logs > app-logs.txt
```

## 🎉 Success Indicators

When everything is working correctly, you should see:

### ✅ Successful Startup
```
🎉 Development environment is ready!

📱 Application Access:
   🌐 Frontend: http://localhost:3000
   🔧 Backend API: http://localhost:5000
   ❤️  Health Check: http://localhost:5000/api/health

💾 Database Configuration:
   ☁️  MongoDB Atlas (Cloud)
   🌐 Host: cluster0.pyahrxp.mongodb.net
   📊 Database: graves_test

📧 Email Configuration:
   ✅ Configured for Gmail
   📮 Host: smtp.gmail.com:465
   👤 User: marko.milic.srbija@gmail.com
```

### ✅ Healthy Services
```bash
$ curl http://localhost:5000/api/health
{
  "status": "OK",
  "message": "JKP Katastar API is running",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "environment": "development",
  "port": 5000,
  "database": "Connected",
  "email": "Configured"
}
```

### ✅ Clean Logs
- No ECONNREFUSED errors
- No authentication failures
- Minimal ESLint warnings (non-critical)

## 🚀 Next Steps

Once your environment is running successfully:

1. **Access the Application**: http://localhost:3000
2. **Test API Endpoints**: http://localhost:5000/api/health
3. **Begin Development**: All issues resolved, ready for feature development
4. **Database Operations**: Your Atlas database is ready with cemetery data

## 💡 Pro Tips

### Configuration Management
- Keep `.env` as your single source of truth
- Use `validate-env.sh` before starting development
- Never commit `.env` to version control

### Development Workflow
- Use `./start-dev.sh` for consistent startup
- Monitor logs with `docker-compose logs -f`
- Use `--rebuild` flag after dependency changes

### Database Management
- Your Atlas database persists between container restarts
- Use MongoDB Compass for database visualization
- Connection string is automatically used by all services

---

## 🏛️ Ready for Cemetery Management!

Your JKP Katastar system is now configured to use your `.env` file as the authoritative source for all configuration. The system intelligently detects your MongoDB Atlas setup and configures services accordingly.

**Start developing your cemetery burial plot management features with confidence!** 🎯