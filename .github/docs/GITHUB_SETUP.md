# GitHub Actions Setup Guide

Complete guide to set up automated deployment for JKP Katastar Cemetery Management System using GitHub Actions.

## 🎯 Overview

This guide will help you configure GitHub Actions to automatically deploy your application to a VPS every time you push to the `main` branch.

## 📋 Prerequisites

### VPS Requirements
- **OS**: Ubuntu 20.04+ (recommended)
- **RAM**: 2GB minimum 
- **CPU**: 1 core minimum
- **Storage**: 20GB minimum
- **Network**: SSH access enabled

### GitHub Repository
- Forked or cloned JKPKatastar repository
- Admin access to repository settings

## 🔧 Step 1: VPS Preparation

### 1.1 SSH Key Setup
Generate SSH key pair for GitHub Actions:

```bash
# On your VPS, generate a key pair
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions -N ""

# Add public key to authorized_keys
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Display private key (copy this for GitHub Secrets)
cat ~/.ssh/github_actions
```

### 1.2 Install Docker
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (optional, if not using root)
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

### 1.3 Configure Firewall
```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 3000  # Frontend
sudo ufw allow 5000  # Backend API

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

## 🔑 Step 2: GitHub Secrets Configuration

Go to your GitHub repository: **Settings → Secrets and variables → Actions**

### 2.1 Required Secrets (5)

Click **"New repository secret"** for each:

| Secret Name | Example Value | Description |
|-------------|---------------|-------------|
| `VPS_HOST` | `194.146.58.124` | Your VPS IP address |
| `VPS_USER` | `root` | SSH username for VPS |
| `VPS_SSH_KEY` | `-----BEGIN RSA PRIVATE KEY-----...` | Private SSH key content (from step 1.1) |
| `MONGO_PASSWORD` | `MySecur3P@ssw0rd!` | Strong MongoDB password |
| `JWT_SECRET` | `randomBase64String123...` | JWT signing secret (generate strong key) |

### 2.2 Optional Email Secrets (5)

For email notifications:

| Secret Name | Example Value | Description |
|-------------|---------------|-------------|
| `EMAIL_SERVICE` | `gmail` | Email service provider |
| `EMAIL_HOST` | `smtp.gmail.com` | SMTP host |
| `EMAIL_PORT` | `587` | SMTP port |
| `EMAIL_USER` | `your-email@gmail.com` | Your email address |
| `EMAIL_SECRET` | `your-app-password` | App password or email password |

### 2.3 Generate Strong Secrets

```bash
# Generate JWT secret
openssl rand -base64 64

# Generate MongoDB password
openssl rand -base64 32
```

## ⚙️ Step 3: Environment Variables (Auto-Generated)

The deployment automatically configures these variables using your secrets:

| Variable | Value | Source |
|----------|-------|--------|
| `NODE_ENV` | `production` | Fixed |
| `PORT` | `5000` | Fixed |
| `MONGO_USERNAME` | `admin` | Fixed |
| `MONGO_DATABASE` | `graves_prod` | Fixed |
| `MONGO_URI` | `mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/graves_prod?authSource=admin` | Generated |
| `CLIENT_HOST_URI` | `http://${VPS_HOST}:3000` | From VPS_HOST |
| `REACT_APP_API_URL` | `http://${VPS_HOST}:5000/api` | From VPS_HOST |
| `JWT_SECRET` | From GitHub Secret | From JWT_SECRET |

## 🚀 Step 4: Deploy Your Application

### 4.1 Automatic Deployment
Push any changes to the `main` branch:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### 4.2 Manual Deployment
Go to: **Repository → Actions → Deploy to VPS → Run workflow**

## ✅ Step 5: Verify Deployment

### 5.1 Check GitHub Actions
- Go to **Repository → Actions**
- Look for green checkmarks ✅
- Click on latest run to see detailed logs

### 5.2 Test Your Application
```bash
# Frontend (should return HTML)
curl http://YOUR_VPS_IP:3000

# Backend API (should return JSON)
curl http://YOUR_VPS_IP:5000/api/health

# Should return: {"message":"Server is running","status":"OK"}
```

### 5.3 Access Your Application
- **Frontend**: `http://YOUR_VPS_IP:3000`
- **Backend API**: `http://YOUR_VPS_IP:5000/api`
- **Health Check**: `http://YOUR_VPS_IP:5000/api/health`

## 🔍 Step 6: Monitoring & Maintenance

### 6.1 View Deployment Status
GitHub Actions provides real-time deployment logs:
- Build progress
- Docker image creation
- Service health checks
- Final verification results

### 6.2 Common Success Indicators
✅ **Workflow completes without errors**
✅ **All health checks pass**
✅ **Frontend returns HTML content**
✅ **Backend API returns JSON health status**
✅ **No container restart loops**

### 6.3 Automatic Updates
Every push to `main` branch will:
1. Trigger automatic deployment
2. Build fresh Docker images
3. Update running services
4. Verify everything is working
5. Report status back to GitHub

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. SSH Connection Failed
**Error**: `Permission denied (publickey)`
**Solution**: 
- Verify `VPS_SSH_KEY` secret contains the complete private key
- Ensure public key is in VPS `~/.ssh/authorized_keys`
- Check VPS SSH service is running: `sudo systemctl status ssh`

#### 2. Docker Build Out of Memory
**Error**: `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`
**Solution**:
- VPS needs at least 2GB RAM
- Current build is optimized for 2GB VPS
- Consider upgrading VPS if issue persists

#### 3. Services Not Starting
**Error**: Container exits immediately
**Solution**:
- Check GitHub Actions logs for specific error
- Verify all required secrets are set
- Ensure VPS has enough disk space: `df -h`

#### 4. Health Checks Failing
**Error**: `Health check failed`
**Solution**:
- Wait 2-3 minutes for services to fully start
- Check VPS firewall allows ports 3000, 5000
- Verify `VPS_HOST` secret is correct IP address

#### 5. Frontend/Backend Not Accessible
**Error**: Connection refused or timeout
**Solution**:
- Confirm VPS firewall settings: `sudo ufw status`
- Test from VPS itself: `curl localhost:3000`
- Check if services are running: SSH to VPS and run `docker ps`

### Getting Help
1. **GitHub Actions Logs**: Repository → Actions → Latest run → View logs
2. **VPS Logs**: SSH to VPS and run `docker logs container_name`
3. **Documentation**: See other files in [`docs/`](.) directory
4. **Support Scripts**: Use debugging scripts in [`scripts/`](../scripts/) directory

## 🔐 Security Best Practices

### GitHub Secrets Security
- ✅ Never commit secrets to code
- ✅ Use strong, unique passwords
- ✅ Regularly rotate SSH keys
- ✅ Limit SSH access to specific IPs (optional)

### VPS Security
- ✅ Keep system updated: `sudo apt update && sudo apt upgrade`
- ✅ Use SSH keys only (disable password login)
- ✅ Configure firewall properly
- ✅ Monitor system resources regularly

### Application Security
- ✅ MongoDB authentication enabled in production
- ✅ JWT secrets are cryptographically strong
- ✅ No sensitive data in environment variables
- ✅ HTTPS recommended for production (setup separately)

## 📚 Additional Resources

- **[VPS Deployment Strategies](VPS_DEPLOYMENT_STRATEGIES.md)**: Different deployment approaches
- **[Troubleshooting Guide](TROUBLESHOOTING.md)**: Detailed problem solving
- **[Frontend Fixes](FRONTEND_FIX.md)**: Frontend-specific issues

---

**Congratulations!** 🎉 Your automated deployment is now set up. Every push to `main` will deploy your changes to production automatically.