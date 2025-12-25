# JKP Katastar - Cemetery Management System 🏛️

Modern web application for managing cemetery burial plots.

## 🚀 Quick Start - ONE Command

```bash
git clone https://github.com/constantine2nd/JKPKatastar.git
cd JKPKatastar
./dev.sh
```

**Done!** Full stack running with MongoDB included:
- ✅ Local MongoDB database (no cloud setup needed)
- ✅ Node.js backend API with auto-restart  
- ✅ React frontend with hot reload
- ✅ All services monitored with health checks

## 📱 Access Your App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api  
- **Database**: mongodb://admin:password123@localhost:27017

## 🛠️ Commands

```bash
./dev.sh        # Start all services (MongoDB + Backend + Frontend)
./dev.sh stop   # Stop all services
./dev.sh clean  # Clean reset everything
./dev.sh logs   # View all logs
./dev.sh help   # Show help
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │◄──►│   Express API   │◄──►│   MongoDB       │
│   localhost:3000│    │   localhost:5000│    │   localhost:27017│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Tech Stack

**Frontend**: React 18 + TypeScript + Material-UI + Redux + Leaflet Maps  
**Backend**: Node.js + Express + Mongoose + JWT + Nodemailer  
**Database**: MongoDB 6.0  
**Development**: Docker Compose + Hot Reload

## 📁 Project Structure

```
JKPKatastar/
├── client/         # React frontend
├── server/         # Node.js backend  
├── docker-compose.yml  # All services
└── dev.sh         # Start script
```

## 🛠️ Development

1. **Start**: `./dev.sh`
2. **Edit**: Files in `client/src/` or `server/`
3. **See Changes**: Auto-reload in browser
4. **Debug**: `./dev.sh logs`

## 🚨 Troubleshooting

**Port conflicts:**
```bash
lsof -i :3000 :5000 :27017
```

**Clean restart:**
```bash
./dev.sh clean
./dev.sh
```

**View logs:**
```bash
./dev.sh logs
```

## ✅ What's Fixed

- **MongoDB Issue**: Now starts automatically with Docker (no external setup needed)
- **Documentation**: Simplified to one README (removed redundant docs)  
- **Scripts**: Single `./dev.sh` script (removed multiple competing scripts)
- **Configuration**: Uses your `.env` file for all settings (Docker reads environment variables)
- **Health Checks**: All services monitored and dependencies managed

## ⚙️ Configuration

Docker automatically reads your `.env` file:
- **MONGO_URI**: Database connection (uses your `graves_test` database)
- **JWT_SECRET**: Authentication security
- **EMAIL_***: Email notification settings
- **PORT**: Backend port (default: 5000)

**Note**: All Docker services now use values from your `.env` file!

## 🌐 Production Deployment (VPS)

Deploy to your VPS server automatically with GitHub Actions or manually.

### Configuration

All deployment settings are centralized in `deployment.config`. Key variables:

```bash
# Server Configuration
VPS_HOST=194.146.58.124          # Your VPS IP address
VPS_USER=root                    # SSH user
PROJECT_NAME=JKPKatastar         # Project name

# Service URLs (auto-generated from VPS_HOST)
FRONTEND_URL=http://194.146.58.124:3000
BACKEND_URL=http://194.146.58.124:5000
API_URL=http://194.146.58.124:5000/api
```

**Customize for your server:**
```bash
# Set your VPS IP address
export VPS_HOST=your.vps.ip.address
export VPS_USER=your-user
```

### Automatic Deployment (GitHub Actions)

**Setup once:**

1. **VPS Setup - Automated:**
   ```bash
   # SSH into your VPS
   ssh root@your.vps.ip.address
   
   # Download and run setup script
   curl -fsSL https://raw.githubusercontent.com/constantine2nd/JKPKatastar/main/setup-vps-server.sh -o setup.sh
   chmod +x setup.sh
   ./setup.sh
   ```

   **Or manual setup:**
   ```bash
   # Install Docker & Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
   
   # Setup SSH key for GitHub Actions
   ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions -N ""
   cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
   
   # Configure firewall
   ufw allow 22 && ufw allow 3000 && ufw allow 5000 && ufw --force enable
   ```

2. **GitHub Secrets:**
   Go to Repository → Settings → Secrets → Add these:
   - `VPS_HOST`: `your.vps.ip.address` (your actual VPS IP)
   - `VPS_USER`: `root`
   - `VPS_SSH_KEY`: (paste the private key from VPS setup)
   - `MONGO_PASSWORD`: Your secure MongoDB password
   - `JWT_SECRET`: Your secure JWT secret
   - `EMAIL_SERVICE`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_SECRET` (optional)

   *URLs are auto-generated from VPS_HOST (no need for separate CLIENT_HOST_URI and REACT_APP_API_URL secrets)*

**Deploy:**
- Push to `main` branch → Automatic deployment
- Or manually trigger in GitHub Actions tab

### Manual Deployment

```bash
# Configure your server (one-time)
export VPS_HOST=your.vps.ip.address
export VPS_USER=root

# Set environment variables
export MONGO_PASSWORD=your_secure_password
export JWT_SECRET=your_secure_jwt_secret

# Deploy
./deploy-vps.sh deploy

# Other commands
./deploy-vps.sh status   # Check status
./deploy-vps.sh logs     # View logs  
./deploy-vps.sh stop     # Stop services
./deploy-vps.sh clean    # Clean reset
```

### Configuration Management

```bash
# View current configuration
source deployment.config show

# Validate configuration
source deployment.config validate

# Test VPS readiness
./test-vps-ready.sh
```

### Production URLs
After deployment, your app will be available at:
- **Frontend**: http://your.vps.ip.address:3000
- **Backend API**: http://your.vps.ip.address:5000/api
- **Health Check**: http://your.vps.ip.address:5000/api/health

*Replace `your.vps.ip.address` with your actual VPS IP address*

### Troubleshooting
```bash
# Run comprehensive health check on VPS
./health-check.sh

# Quick status check
./deploy-vps.sh status

# View logs
./deploy-vps.sh logs

# Test VPS readiness
./test-vps-ready.sh
```

📖 See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed debugging guide.

---

**Ready to develop!** Just run `./dev.sh` and start coding! 🚀