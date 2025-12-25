# VPS Deployment Strategies

This document outlines different deployment approaches for the JKP Katastar application based on VPS resource constraints.

## 🖥️ VPS Specifications

- **CPU**: 1 Core
- **RAM**: 2048MB (2GB)
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04

## 📊 Deployment Strategy Comparison

### Current Strategy: Build on VPS
**File**: `.github/workflows/deploy.yml`

#### ✅ Advantages
- Simple setup - single workflow file
- No external registry dependencies
- Direct deployment from source code

#### ❌ Disadvantages
- **Memory intensive**: React build requires ~1.5-2GB RAM
- **CPU intensive**: Single core struggles with compilation
- **Slow builds**: Limited resources = longer deployment times
- **Risk of failure**: Memory exhaustion during npm build
- **VPS resource consumption**: Build artifacts use disk space

#### 🎯 Best For
- VPS with 4GB+ RAM and 2+ CPU cores
- Small applications with minimal dependencies
- Development/testing environments

---

### Alternative Strategy: Pre-built Images
**File**: `.github/workflows-backup/deploy-prebuilt.yml`

#### ✅ Advantages
- **Resource efficient**: Uses GitHub's build infrastructure (7GB RAM, 2 cores)
- **Fast deployment**: Only pulls pre-built images (~2-3 minutes)
- **Reliable**: GitHub Actions has consistent resources
- **VPS friendly**: Minimal CPU/RAM usage during deployment
- **Caching**: Docker layer caching speeds up builds
- **Version control**: Tagged images for rollbacks

#### ❌ Disadvantages
- More complex setup (requires container registry)
- Dependency on GitHub Container Registry
- Additional step in deployment pipeline

#### 🎯 Best For
- **Resource-constrained VPS** (1-2GB RAM, 1 CPU)
- Production environments requiring reliability
- Teams needing fast, consistent deployments

---

## 🚀 Implementation Guide

### Option 1: Continue with Current Strategy

If you want to stick with building on VPS, monitor the deployment and ensure:

```bash
# Check memory usage during build
htop
# or
watch -n 1 'free -m'

# Monitor Docker build progress
docker compose logs -f frontend
```

**Memory optimizations applied**:
- Node.js heap limit: 1536MB (75% of VPS RAM)
- Source maps disabled: `GENERATE_SOURCEMAP=false`
- CI optimizations: `CI=false`

### Option 2: Switch to Pre-built Images

To use the more VPS-friendly approach:

1. **Replace the current workflow**:
   ```bash
   mv .github/workflows/deploy.yml .github/workflows/deploy-build-on-vps.yml.bak
   mv .github/workflows-backup/deploy-prebuilt.yml .github/workflows/deploy.yml
   ```

2. **No additional secrets required** - uses existing GitHub secrets:
   - `VPS_HOST`
   - `VPS_USER`
   - `VPS_SSH_KEY`
   - `MONGO_USERNAME`
   - `MONGO_PASSWORD`
   - Plus standard GitHub token for registry

3. **Benefits for your VPS**:
   - Deployment time: ~3-5 minutes (vs 10-15 minutes)
   - VPS RAM usage during deployment: ~200-300MB (vs 1.5GB+)
   - More reliable deployments
   - Easier rollbacks

---

## 🔍 Monitoring & Troubleshooting

### Check Current Deployment Status
```bash
# SSH to VPS
ssh root@your-vps-ip

# Check running containers
docker compose ps

# Monitor resource usage
htop

# View deployment logs
docker compose logs
```

### If Build Fails with Memory Issues
```bash
# Check available memory
free -m

# Check Docker memory usage
docker system df

# Clean up unused images/containers
docker system prune -a
```

### Switch Strategies Mid-Deployment
```bash
# If current build fails, you can manually deploy with pre-built images
cd /opt/jkp-katastar/JKPKatastar
wget -O deploy-prebuilt.sh https://raw.githubusercontent.com/constantine2nd/JKPKatastar/main/.github/workflows-backup/deploy-prebuilt.sh
chmod +x deploy-prebuilt.sh
./deploy-prebuilt.sh
```

---

## 🎯 Recommendation

For your **1 CPU, 2GB RAM VPS**, I recommend:

1. **Try current approach first** - Let the current deployment complete with memory optimizations
2. **Monitor resource usage** - Watch for memory exhaustion
3. **Switch to pre-built strategy if needed** - Use the backup workflow for reliable deployments

The pre-built image strategy is specifically designed for resource-constrained environments like yours and will provide much more reliable deployments.

---

## 📈 Performance Comparison

| Metric | Build on VPS | Pre-built Images |
|--------|--------------|------------------|
| **Build Time** | 10-15 minutes | 5-8 minutes |
| **VPS RAM Usage** | 1.5-2GB | 200-300MB |
| **VPS CPU Usage** | 90-100% | 10-20% |
| **Failure Rate** | Higher (memory) | Lower (GitHub resources) |
| **Deployment Time** | 15-20 minutes | 3-5 minutes |
| **Disk Usage** | Higher (build artifacts) | Lower (only images) |

---

## 🔄 Migration Path

If you decide to switch strategies later:

1. Current builds store everything in containers
2. Pre-built approach uses same environment variables
3. Data (MongoDB) is preserved across strategy changes
4. Zero downtime migration possible

The choice is yours - both approaches will work, but pre-built images are optimized for your VPS constraints.