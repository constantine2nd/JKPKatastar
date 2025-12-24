# JKP Katastar - Troubleshooting Guide

This guide helps you diagnose and fix common deployment issues on your VPS server.

## Quick Diagnostics

### 1. Run Health Check Script
```bash
# On VPS server
cd /opt/jkp-katastar/JKPKatastar
./health-check.sh
```

### 2. Check Service Status
```bash
# On VPS server
cd /opt/jkp-katastar/JKPKatastar
docker-compose ps
```

### 3. View Logs
```bash
# On VPS server
cd /opt/jkp-katastar/JKPKatastar
docker-compose logs -f
```

## Common Issues and Solutions

### Issue 1: Services Not Starting

**Symptoms:**
- Containers exit immediately
- "Exited (1)" status in `docker-compose ps`

**Solutions:**
```bash
# Check logs for specific errors
docker-compose logs [service_name]

# Check if ports are already in use
netstat -tlnp | grep -E "3000|5000|27017"

# Kill processes using the ports
sudo fuser -k 3000/tcp
sudo fuser -k 5000/tcp
sudo fuser -k 27017/tcp

# Restart services
docker-compose down --timeout 30
docker-compose up -d
```

### Issue 2: Frontend Not Accessible (Port 3000)

**Symptoms:**
- "Connection refused" when accessing http://194.146.58.124:3000
- Frontend container running but not responding

**Solutions:**
```bash
# Check if port is listening
netstat -tlnp | grep 3000

# Check firewall settings
sudo ufw status
sudo ufw allow 3000

# Check container port mapping
docker-compose ps frontend

# Restart frontend service
docker-compose restart frontend
```

### Issue 3: Backend API Not Responding (Port 5000)

**Symptoms:**
- Health check endpoint not responding
- Backend logs show errors

**Solutions:**
```bash
# Check backend logs
docker-compose logs backend

# Test health endpoint internally
docker-compose exec backend wget --spider http://localhost:5000/api/health

# Check environment variables
docker-compose exec backend printenv | grep -E "MONGO|JWT|PORT"

# Restart backend
docker-compose restart backend
```

### Issue 4: MongoDB Connection Issues

**Symptoms:**
- Backend logs show "MongoNetworkError"
- Cannot connect to database

**Solutions:**
```bash
# Check MongoDB status
docker-compose logs mongodb

# Test MongoDB connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check MongoDB authentication
docker-compose exec mongodb mongosh -u admin -p [password] --authenticationDatabase admin

# Recreate MongoDB with fresh data (CAUTION: This deletes data)
docker-compose down
docker volume prune -f
docker-compose up -d
```

### Issue 5: Docker Compose Not Found

**Symptoms:**
- "command not found: docker-compose"

**Solutions:**
```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### Issue 6: Out of Disk Space

**Symptoms:**
- "No space left on device" errors
- Containers failing to start

**Solutions:**
```bash
# Check disk usage
df -h

# Clean Docker system
docker system prune -af
docker volume prune -f

# Remove old deployment backups
cd /opt/jkp-katastar
ls -la | grep backup
rm -rf JKPKatastar-backup-* # Remove old backups

# Check largest files
du -sh /opt/jkp-katastar/* | sort -hr
```

### Issue 7: GitHub Actions Deployment Fails

**Symptoms:**
- Deployment workflow fails
- SSH connection issues

**Solutions:**

1. **Check SSH Key:**
```bash
# On VPS, verify SSH key
cat /root/.ssh/authorized_keys
```

2. **Check GitHub Secrets:**
- Go to Repository Settings → Secrets
- Verify all required secrets are set:
  - `VPS_HOST`
  - `VPS_USER`
  - `VPS_SSH_KEY`
  - `MONGO_PASSWORD`
  - `JWT_SECRET`

3. **Manual Deployment:**
```bash
# Use manual deployment script
export MONGO_PASSWORD=your_password
export JWT_SECRET=your_jwt_secret
./deploy-vps.sh deploy
```

### Issue 8: Environment Variables Not Loading

**Symptoms:**
- Services start but don't work correctly
- Default values being used instead of custom ones

**Solutions:**
```bash
# Check .env file exists
ls -la /opt/jkp-katastar/JKPKatastar/.env

# Verify .env file content
cat /opt/jkp-katastar/JKPKatastar/.env

# Check if containers are using the variables
docker-compose exec backend printenv | grep MONGO
docker-compose exec backend printenv | grep JWT

# Restart services to reload environment
docker-compose down
docker-compose up -d
```

## Performance Issues

### Issue 9: Slow Response Times

**Solutions:**
```bash
# Check system resources
htop  # or top
free -h
iostat 1 5

# Check container resource usage
docker stats

# Optimize Docker Compose for low memory
# Add to docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 512M
```

### Issue 10: High Memory Usage

**Solutions:**
```bash
# Restart services to free memory
docker-compose restart

# Limit memory usage in docker-compose.yml
# Add under each service:
# deploy:
#   resources:
#     limits:
#       memory: 256M

# Check for memory leaks in logs
docker-compose logs | grep -i "memory\|leak\|oom"
```

## Step-by-Step Recovery Process

### Full System Recovery
If everything is broken, follow these steps:

1. **Stop all services:**
```bash
cd /opt/jkp-katastar/JKPKatastar
docker-compose down --timeout 30
```

2. **Clean Docker system:**
```bash
docker system prune -af
docker volume prune -f
```

3. **Backup current deployment:**
```bash
cd /opt/jkp-katastar
mv JKPKatastar JKPKatastar-broken-$(date +%Y%m%d-%H%M%S)
```

4. **Fresh deployment:**
```bash
export MONGO_PASSWORD=your_password
export JWT_SECRET=your_jwt_secret
./deploy-vps.sh deploy
```

5. **Verify deployment:**
```bash
./health-check.sh
```

## Monitoring Commands

### Real-time Monitoring
```bash
# Watch container status
watch -n 2 'docker-compose ps'

# Follow all logs
docker-compose logs -f

# Monitor system resources
htop

# Monitor network connections
watch -n 2 'netstat -tlnp | grep -E "3000|5000|27017"'
```

### Service URLs for Testing
- **Frontend:** http://194.146.58.124:3000
- **Backend API:** http://194.146.58.124:5000/api
- **Health Check:** http://194.146.58.124:5000/api/health

### Useful curl Commands
```bash
# Test frontend
curl -I http://194.146.58.124:3000

# Test backend health
curl -s http://194.146.58.124:5000/api/health | jq

# Test with timeout
curl --connect-timeout 10 --max-time 30 http://194.146.58.124:3000
```

## Getting Help

### Log Collection
When asking for help, provide these logs:
```bash
# System info
uname -a
docker --version
docker-compose --version

# Service status
docker-compose ps

# Recent logs
docker-compose logs --tail=100

# System resources
free -h && df -h

# Network status
netstat -tlnp | grep -E "3000|5000|27017"
```

### Contact Information
- Check GitHub Issues: https://github.com/constantine2nd/JKPKatastar/issues
- Create new issue with logs and error details

## Prevention

### Regular Maintenance
```bash
# Weekly cleanup (add to cron)
docker system prune -f
docker image prune -f

# Monthly backup
cd /opt/jkp-katastar
tar -czf backup-$(date +%Y%m%d).tar.gz JKPKatastar/

# Monitor disk space
df -h / | awk 'NR==2 {if ($5 > 80) print "WARNING: Disk usage over 80%"}'
```

### Monitoring Script
Create `/opt/monitor.sh`:
```bash
#!/bin/bash
cd /opt/jkp-katastar/JKPKatastar
if ! docker-compose ps | grep -q "Up"; then
    echo "$(date): Services not running, attempting restart" >> /var/log/jkp-monitor.log
    docker-compose up -d
fi
```

Add to cron: `*/5 * * * * /opt/monitor.sh`
