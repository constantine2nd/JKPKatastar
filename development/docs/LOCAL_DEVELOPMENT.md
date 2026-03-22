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
   cd development
   ./dev.sh
   ```

3. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

That's it! All services (React, Node.js, MongoDB) are running with hot reload.

## Development Commands

```bash
./dev.sh              # Start all services
./dev.sh stop         # Stop all services
./dev.sh restart      # Stop then start
./dev.sh rebuild      # Rebuild images from scratch and start
./dev.sh status       # Show running containers and health
./dev.sh clean        # Clean reset (removes containers + data)
./dev.sh logs         # View logs (all services)
./dev.sh logs backend # View logs for a specific service
./dev.sh help         # Show all commands
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
├── .env                   # All environment variables (single source of truth, gitignored)
├── client/                # Frontend React app
│   ├── src/               # Edit these files for frontend changes
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Backend Node.js app
│   ├── routes/            # API endpoints
│   ├── models/            # Database models
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
└── development/           # Dev tooling
    ├── dev.sh             # Development startup script
    ├── docker-compose.dev.yml
    └── docs/
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
# Find what's using the port (use whichever tool is available)
lsof -i :3000
# or
ss -ltn sport = :3000

# Kill the process
kill <PID>
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
chmod +x development/dev.sh
```

### Docker Group (Linux)
If Docker requires `sudo`, add your user to the docker group:
```bash
sudo usermod -aG docker $(whoami) && newgrp docker
```

## Environment Variables

All variables live in a single `.env` file in the **root directory** (gitignored). Create it before first start:

```bash
# Database (local Docker)
MONGO_URI=mongodb://admin:password123@mongodb:27017/graves_dev?authSource=admin
MONGO_PASSWORD=password123

# Auth
JWT_SECRET=your_secret_key

# Email
EMAIL_SERVICE=Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_SECRET=your_app_password

# CORS
CLIENT_HOST_URI=http://localhost:3000

# Google Maps
REACT_APP_GOOGLE_KEY=your_google_maps_api_key
REACT_APP_GOOGLE_MAP_ID=your_google_map_id
```

`dev.sh` automatically sources this file before starting Docker Compose, so all variables reach both backend and frontend containers.

## Google Maps Cloud Setup

The map features require a Google Maps API key and a Map ID. Both are free to create but require a Google Cloud account with billing enabled.

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one

### 2. Enable Billing

Google Maps JavaScript API requires a billing account (free tier covers typical dev usage):

1. Cloud Console → **Billing** → link a billing account to the project

### 3. Enable the Maps JavaScript API

1. Cloud Console → **APIs & Services** → **Library**
2. Search for **Maps JavaScript API** → click **Enable**

### 4. Create an API Key

1. Cloud Console → **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API key**
3. Copy the key → paste into `.env` as `REACT_APP_GOOGLE_KEY`

**Restrict the key (recommended):**
- Under **Application restrictions**: add your domain (or set to *None* for local dev)
- Under **API restrictions**: restrict to *Maps JavaScript API*

### 5. Create a Map ID

Map ID is required for `AdvancedMarker` (the modern marker API):

1. Cloud Console → **Google Maps Platform** → **Map Management**
2. Click **Create Map ID**
3. Set type: **JavaScript** / **Raster**
4. Copy the ID → paste into `.env` as `REACT_APP_GOOGLE_MAP_ID`

### 6. Add GitHub Secrets (for CI/CD)

In the GitHub repository → **Settings** → **Secrets and variables** → **Actions**, add:
- `REACT_APP_GOOGLE_KEY`
- `REACT_APP_GOOGLE_MAP_ID`

### Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `InvalidKeyMapError` | API key and Map ID from different projects | Create both in the same GCP project |
| `InvalidKeyMapError` | Maps JavaScript API not enabled | Enable it in APIs & Services → Library |
| `InvalidKeyMapError` | No billing account linked | Link billing in Cloud Console → Billing |
| "Map initialized without valid Map ID" | `REACT_APP_GOOGLE_MAP_ID` is empty | Restart `dev.sh` after editing `.env` |

---

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
   ./dev.sh logs           # all services
   ./dev.sh logs backend   # specific service
   ```

4. **Test your changes:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000/api

5. **Check status:**
   ```bash
   ./dev.sh status
   ```

6. **Stop when done:**
   ```bash
   ./dev.sh stop
   ```

## Useful Development URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **API Documentation**: http://localhost:5000/api/docs (if available)

## Getting Help

- **View logs**: `./dev.sh logs` or `./dev.sh logs <service>`
- **Check container status**: `./dev.sh status`
- **Restart everything**: `./dev.sh restart`
- **Clean reset**: `./dev.sh clean && ./dev.sh`

## Ready to Code!

Once all containers show `(healthy)` in `./dev.sh status`, you're ready:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

Happy coding! 🚀