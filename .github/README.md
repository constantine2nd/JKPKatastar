# JKP Katastar - Production Deployment & CI/CD

This directory contains everything needed for production deployment and continuous integration/continuous deployment (CI/CD) of the JKP Katastar Cemetery Management System.

## 📁 Directory Structure

```
.github/
├── workflows/
│   └── deploy.yml                  # GitHub Actions deployment workflow
├── scripts/
│   ├── deploy-vps.sh              # Manual VPS deployment script
│   ├── debug-vps.sh               # VPS debugging tools
│   ├── health-check.sh            # Production health checks
│   ├── setup-vps-server.sh        # VPS server setup automation
│   ├── test-vps-ready.sh          # VPS readiness validation
│   └── migrate-config.sh          # Configuration migration helper
├── docs/
│   ├── VPS_DEPLOYMENT_STRATEGIES.md  # Deployment strategy comparison
│   ├── TROUBLESHOOTING.md         # Production troubleshooting guide
│   └── FRONTEND_FIX.md            # Frontend deployment fixes
├── deployment.config              # Main deployment configuration
├── deployment.config.example      # Template for custom deployments
└── README.md                      # This file
```

## 🚀 Automated Deployment (GitHub Actions)

### Quick Setup
1. **Configure GitHub Secrets** (Repository → Settings → Secrets):
   ```
   VPS_HOST=your.vps.ip.address
   VPS_USER=root
   VPS_SSH_KEY=<your-private-ssh-key>
   MONGO_PASSWORD=your_secure_password
   JWT_SECRET=your_secure_jwt_secret
   ```

2. **Deploy**: Push to `main` branch → Automatic deployment

### Workflow Details
- **File**: [`workflows/deploy.yml`](workflows/deploy.yml)
- **Trigger**: Push to main branch or manual trigger
- **Process**: Build → Deploy → Health Check → Verify
- **Target**: VPS with Docker support

## 🛠️ Manual Deployment Scripts

### Primary Scripts
```bash
# Deploy to VPS manually
./scripts/deploy-vps.sh deploy

# Check deployment status
./scripts/deploy-vps.sh status

# View deployment logs
./scripts/deploy-vps.sh logs

# Debug deployment issues
./scripts/debug-vps.sh

# Run health checks
./scripts/health-check.sh
```

### Setup Scripts
```bash
# Setup a new VPS server (one-time)
./scripts/setup-vps-server.sh

# Test VPS readiness
./scripts/test-vps-ready.sh

# Migrate configuration
./scripts/migrate-config.sh
```

## ⚙️ Configuration Management

### Main Configuration
- **File**: [`deployment.config`](deployment.config)
- **Template**: [`deployment.config.example`](deployment.config.example)
- **Purpose**: Centralized deployment settings

### Key Variables
```bash
VPS_HOST=194.146.58.124          # Your VPS IP address
VPS_USER=root                    # SSH user
PROJECT_NAME=JKPKatastar         # Project name
MONGO_PASSWORD=secure_password   # MongoDB password
JWT_SECRET=secure_jwt_secret     # JWT secret key
```

### Usage
```bash
# Load configuration
source deployment.config

# View current configuration
source deployment.config show

# Validate configuration
source deployment.config validate
```

## 📊 Deployment Strategies

### Current Strategy: Build on VPS
- **File**: [`workflows/deploy.yml`](workflows/deploy.yml)
- **Process**: Clone → Build → Deploy on VPS
- **Memory**: Optimized for 2GB VPS with 1.5GB heap limit

### Alternative Strategy: Pre-built Images
- **File**: [`workflows-backup/deploy-prebuilt.yml`](workflows-backup/deploy-prebuilt.yml)
- **Process**: Build on GitHub → Push to registry → Pull on VPS
- **Memory**: More efficient for resource-constrained VPS

See [`docs/VPS_DEPLOYMENT_STRATEGIES.md`](docs/VPS_DEPLOYMENT_STRATEGIES.md) for detailed comparison.

## 📚 Documentation

### Deployment Guides
- **[VPS Deployment Strategies](docs/VPS_DEPLOYMENT_STRATEGIES.md)**: Comparison of deployment approaches
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)**: Common issues and solutions
- **[Frontend Fixes](docs/FRONTEND_FIX.md)**: Frontend-specific deployment fixes

### Quick References
- **Health Check**: `./scripts/health-check.sh`
- **Debug Issues**: `./scripts/debug-vps.sh`
- **View Logs**: `./scripts/deploy-vps.sh logs`
- **Clean Deploy**: `./scripts/deploy-vps.sh clean && ./scripts/deploy-vps.sh deploy`

## 🔧 Production Environment

### VPS Requirements
- **OS**: Ubuntu 20.04+ (recommended)
- **RAM**: 2GB minimum (4GB recommended)
- **CPU**: 1 core minimum (2+ cores recommended)
- **Storage**: 20GB minimum
- **Docker**: Latest version with Docker Compose

### Service URLs (After Deployment)
- **Frontend**: http://your-vps-ip:3000
- **Backend API**: http://your-vps-ip:5000/api
- **Health Check**: http://your-vps-ip:5000/api/health
- **MongoDB**: mongodb://your-vps-ip:27017 (internal access)

## 🚨 Production Monitoring

### Health Checks
```bash
# Automated health check
./scripts/health-check.sh

# Manual service verification
curl http://your-vps-ip:3000        # Frontend
curl http://your-vps-ip:5000/api/health  # Backend
```

### Debugging
```bash
# Real-time debugging
./scripts/debug-vps.sh

# View container logs
ssh user@vps "cd /opt/jkp-katastar/JKPKatastar && docker compose logs"

# Check container status
ssh user@vps "cd /opt/jkp-katastar/JKPKatastar && docker compose ps"
```

## 🔐 Security Considerations

### GitHub Secrets (Required)
- `VPS_HOST`: VPS IP address
- `VPS_USER`: SSH username
- `VPS_SSH_KEY`: Private SSH key for VPS access
- `MONGO_PASSWORD`: Secure MongoDB password
- `JWT_SECRET`: Secure JWT signing key

### Optional Secrets
- `EMAIL_SERVICE`: Email service provider
- `EMAIL_HOST`: SMTP host
- `EMAIL_PORT`: SMTP port
- `EMAIL_USER`: Email username
- `EMAIL_SECRET`: Email password/token

### VPS Security
- SSH key-based authentication (no password login)
- Firewall configured (ports 22, 3000, 5000 only)
- MongoDB authentication enabled
- SSL/TLS recommended for production

## 🔄 CI/CD Pipeline

### Automated Flow
1. **Trigger**: Push to main branch
2. **Setup**: Checkout code, setup SSH
3. **Deploy**: Run deployment script on VPS
4. **Build**: Docker build with memory optimization
5. **Start**: Launch services with health checks
6. **Verify**: Test frontend and API endpoints
7. **Cleanup**: Remove temporary files

### Manual Override
```bash
# Trigger manual deployment
# Go to GitHub → Actions → Deploy to VPS → Run workflow

# Or deploy manually
./scripts/deploy-vps.sh deploy
```

## ⚡ Quick Commands

### Deploy
```bash
# Automatic (GitHub Actions)
git push origin main

# Manual
./scripts/deploy-vps.sh deploy
```

### Monitor
```bash
./scripts/health-check.sh         # Full health check
./scripts/deploy-vps.sh status    # Quick status
./scripts/debug-vps.sh            # Real-time debugging
```

### Troubleshoot
```bash
./scripts/deploy-vps.sh logs      # View logs
./scripts/test-vps-ready.sh       # Test VPS setup
# See docs/TROUBLESHOOTING.md for detailed guide
```

---

**Production deployment made simple!** 🚀

For detailed guides, see the [`docs/`](docs/) directory.
For local development, see [`../development/`](../development/).