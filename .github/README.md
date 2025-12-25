# JKP Katastar - Production Deployment (GitHub Actions)

This directory contains everything needed for automated production deployment of the JKP Katastar Cemetery Management System using GitHub Actions.

## 📁 Directory Structure

```
.github/
├── workflows/
│   └── deploy.yml                  # GitHub Actions deployment workflow
├── scripts/                        # Support scripts (used by GitHub Actions)
│   ├── debug-vps.sh               # VPS debugging tools
│   ├── health-check.sh            # Production health checks
│   ├── setup-vps-server.sh        # VPS server setup automation
│   └── test-vps-ready.sh          # VPS readiness validation
├── docs/
│   ├── VPS_DEPLOYMENT_STRATEGIES.md  # Deployment strategy comparison
│   ├── TROUBLESHOOTING.md         # Production troubleshooting guide
│   └── FRONTEND_FIX.md            # Frontend deployment fixes
└── README.md                      # This file
```

## 🚀 GitHub Actions Deployment

### Quick Setup

1. **Configure GitHub Secrets** (Repository → Settings → Secrets and variables → Actions):

   **Required Secrets:**
   ```
   VPS_HOST=your.vps.ip.address
   VPS_USER=root
   VPS_SSH_KEY=<your-private-ssh-key>
   MONGO_PASSWORD=your_secure_password
   JWT_SECRET=your_secure_jwt_secret
   ```

   **Optional Email Secrets (for notifications):**
   ```
   EMAIL_SERVICE=gmail
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_SECRET=your_app_password
   ```

2. **Deploy**: Push to `main` branch → Automatic deployment ✅

### Environment Variables with Default Values

The deployment automatically configures these environment variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `NODE_ENV` | `production` | Application environment |
| `PORT` | `5000` | Backend API port |
| `MONGO_USERNAME` | `admin` | MongoDB username |
| `MONGO_DATABASE` | `graves_prod` | Production database name |
| `MONGO_URI` | `mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/graves_prod?authSource=admin` | Database connection string |
| `CLIENT_HOST_URI` | `http://${VPS_HOST}:3000` | Frontend URL (auto-generated) |
| `REACT_APP_API_URL` | `http://${VPS_HOST}:5000/api` | API URL for frontend (auto-generated) |
| `REACT_APP_MAP_CENTER_LAT` | `45.2671` | Default map center latitude |
| `REACT_APP_MAP_CENTER_LON` | `19.8335` | Default map center longitude |
| `CHOKIDAR_USEPOLLING` | `false` | File watching in production |
| `GENERATE_SOURCEMAP` | `false` | Source maps disabled in production |

### Deployment Process

- **Trigger**: Push to main branch or manual trigger
- **Process**: Clone → Build → Deploy → Health Check → Verify
- **Target**: VPS with Docker support (2GB+ RAM recommended)
- **Duration**: ~5-15 minutes depending on VPS resources

## 🌐 VPS Requirements

### Minimum Specifications
- **OS**: Ubuntu 20.04+ (recommended)
- **RAM**: 2GB minimum (optimized for memory-constrained VPS)
- **CPU**: 1 core minimum
- **Storage**: 20GB minimum
- **Docker**: Latest version with Docker Compose

### Automatic VPS Setup
The workflow can automatically prepare your VPS. Just ensure:
1. SSH key-based authentication configured
2. User has sudo privileges
3. Firewall allows ports 22, 3000, 5000

## 📊 After Deployment

### Service URLs
- **Frontend**: `http://your-vps-ip:3000`
- **Backend API**: `http://your-vps-ip:5000/api`
- **Health Check**: `http://your-vps-ip:5000/api/health`
- **MongoDB**: Internal access only (not exposed publicly)

### Verification
The GitHub Actions workflow automatically:
1. ✅ Builds all Docker images with memory optimization
2. ✅ Starts all services (MongoDB, Backend, Frontend)
3. ✅ Performs health checks on all endpoints
4. ✅ Verifies frontend and API accessibility
5. ✅ Reports deployment status

### Monitoring
- GitHub Actions provides detailed deployment logs
- Health checks run automatically
- Failed deployments trigger clear error messages

## 🔧 Configuration

### GitHub Secrets Setup
Go to: Repository → Settings → Secrets and variables → Actions → New repository secret

**Core Secrets (Required):**
- `VPS_HOST`: Your VPS IP address (e.g., `194.146.58.124`)
- `VPS_USER`: SSH username (usually `root`)
- `VPS_SSH_KEY`: Private SSH key content for VPS access
- `MONGO_PASSWORD`: Secure MongoDB password (generate strong password)
- `JWT_SECRET`: Secure JWT signing key (generate strong secret)

**Email Secrets (Optional):**
- `EMAIL_SERVICE`: Email service provider (default: `gmail`)
- `EMAIL_HOST`: SMTP host (default: `smtp.gmail.com`)
- `EMAIL_PORT`: SMTP port (default: `587`)
- `EMAIL_USER`: Your email address
- `EMAIL_SECRET`: App password or email password

### Security Notes
- MongoDB authentication is enabled in production
- JWT secrets should be cryptographically strong
- SSH uses key-based authentication (no passwords)
- Email credentials are optional but recommended for notifications

## 📚 Documentation

### Deployment Guides
- **[VPS Deployment Strategies](docs/VPS_DEPLOYMENT_STRATEGIES.md)**: Comparison of deployment approaches
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)**: Common issues and solutions
- **[Frontend Fixes](docs/FRONTEND_FIX.md)**: Frontend-specific deployment fixes

### Quick Status Checks
After deployment, verify your application:
```bash
curl http://your-vps-ip:3000        # Frontend should return HTML
curl http://your-vps-ip:5000/api/health  # Backend should return JSON status
```

## 🚨 Troubleshooting

### Common Issues
1. **Build fails with memory errors**: VPS needs at least 2GB RAM
2. **SSH connection fails**: Check VPS_SSH_KEY secret format
3. **Services don't start**: Check VPS firewall and Docker installation
4. **Frontend/Backend not accessible**: Check VPS_HOST is correct IP

### Getting Help
1. **Check GitHub Actions logs**: Repository → Actions → Latest run
2. **Review deployment status**: Workflow shows detailed progress
3. **Consult documentation**: See [`docs/`](docs/) directory for detailed guides

## ✅ Success Indicators

Your deployment is successful when you see:
- ✅ GitHub Actions workflow completes without errors
- ✅ Frontend accessible at `http://your-vps-ip:3000`
- ✅ Backend API responds at `http://your-vps-ip:5000/api/health`
- ✅ All health checks pass in the workflow logs

---

**Automated production deployment made simple!** 🚀

For local development, see [`../development/`](../development/).