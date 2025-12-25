# Local Development Setup Guide

Quick guide to get the JKP Katastar Cemetery Management System running locally.

## Prerequisites

Make sure you have these installed:
- **Docker** (latest version)
- **Docker Compose** (comes with Docker Desktop)
- **Git**

### Check Prerequisites
```bash
docker --version          # Should show Docker version
docker compose --version  # Should show compose version
git --version             # Should show Git version
```

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/constantine2nd/JKPKatastar.git
   cd JKPKatastar
   ```

2. **Start everything:**
   ```bash
   ./dev.sh
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

That's it! All services (React, Node.js, MongoDB) are running with hot reload.

## Development Commands

```bash
./dev.sh        # Start all services
./dev.sh stop   # Stop all services  
./dev.sh clean  # Clean reset (removes data)
./dev.sh logs   # View logs
./dev.sh help   # Show all commands
```

## What's Running

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Frontend | 3000 | http://localhost:3000 | React app with hot reload |
| Backend | 5000 | http://localhost:5000/api | Express API server |
| MongoDB | 27017 | mongodb://localhost:27017 | Database |

## File Structure for Development

```
JKPKatastar/
├── client/                 # Frontend React app
│   ├── src/               # Edit these files for frontend changes
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Backend Node.js app  
│   ├── routes/            # API endpoints
│   ├── models/            # Database models
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
└── dev.sh                 # Development startup script
```

## Making Changes

### Frontend Changes
1. Edit files in `client/src/`
2. Browser automatically reloads
3. Check console for errors

### Backend Changes  
1. Edit files in `server/`
2. Server automatically restarts
3. Check `./dev.sh logs` for errors

### Database Changes
- MongoDB data persists between restarts
- Use `./dev.sh clean` to reset database

## Common Issues & Solutions

### Port Already in Use
```bash
# Find what's using the port
lsof -i :3000
lsof -i :5000  
lsof -i :27017

# Kill the process
kill -9 <PID>
```

### Docker Issues
```bash
# Restart Docker
sudo systemctl restart docker

# Clean Docker system
docker system prune -a
```

### Clean Reset
```bash
./dev.sh clean  # Removes all containers and data
./dev.sh        # Start fresh
```

### Permission Issues (Linux)
```bash
sudo chmod +x dev.sh
sudo chown -R $USER:$USER .
```

## Environment Variables

Create `.env` file in root directory for custom settings:

```bash
# Database
MONGO_USERNAME=admin
MONGO_PASSWORD=your_password
MONGO_DATABASE=graves_dev

# JWT
JWT_SECRET=your_secret_key

# Email (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com  
EMAIL_SECRET=your_app_password

# Development
NODE_ENV=development
PORT=5000
```

## Development Workflow

1. **Start development:**
   ```bash
   ./dev.sh
   ```

2. **Make changes:**
   - Frontend: Edit `client/src/` files
   - Backend: Edit `server/` files
   - Changes auto-reload/restart

3. **View logs:**
   ```bash
   ./dev.sh logs
   ```

4. **Test your changes:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/api

5. **Stop when done:**
   ```bash
   ./dev.sh stop
   ```

## Useful Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **API Documentation**: http://localhost:5000/api/docs (if available)

## Getting Help

- **View logs**: `./dev.sh logs`
- **Check container status**: `docker compose -f docker-compose.dev.yml ps`
- **Restart everything**: `./dev.sh stop && ./dev.sh`
- **Clean reset**: `./dev.sh clean && ./dev.sh`

## Ready to Code!

Once you see:
```
✅ Frontend ready at http://localhost:3000
✅ Backend ready at http://localhost:5000/api  
✅ MongoDB connected
```

You're ready to start developing! Happy coding! 🚀