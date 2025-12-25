#!/bin/bash

# JKP Katastar - VPS Server Setup Script
# Run this script on your VPS server to install all required dependencies

set -e

VPS_HOST="${VPS_HOST:-194.146.58.124}"
DEPLOY_DIR="/opt/jkp-katastar"

echo "🏛️  JKP Katastar - VPS Server Setup"
echo "==================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run this script as root (use sudo)"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install basic utilities
echo "🔧 Installing basic utilities..."
apt install -y curl wget git ufw htop nano

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker > /dev/null 2>&1; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh

    # Start and enable Docker
    systemctl start docker
    systemctl enable docker

    echo "✅ Docker installed successfully"
else
    echo "✅ Docker already installed: $(docker --version)"
fi

# Install Docker Compose
echo "🔨 Installing Docker Compose..."
if ! command -v docker-compose > /dev/null 2>&1; then
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -Po '"tag_name": "\K.*?(?=")')
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # Create symlink for easier access
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

    echo "✅ Docker Compose installed successfully: $(docker-compose --version)"
else
    echo "✅ Docker Compose already installed: $(docker-compose --version)"
fi

# Verify Docker is running
echo "🩺 Verifying Docker installation..."
if docker info > /dev/null 2>&1; then
    echo "✅ Docker daemon is running"
else
    echo "❌ Docker daemon is not running, attempting to start..."
    systemctl start docker
    sleep 5
    if docker info > /dev/null 2>&1; then
        echo "✅ Docker daemon started successfully"
    else
        echo "❌ Failed to start Docker daemon"
        exit 1
    fi
fi

# Create deployment directory
echo "📁 Creating deployment directory..."
mkdir -p $DEPLOY_DIR
chown -R root:root $DEPLOY_DIR
echo "✅ Created deployment directory: $DEPLOY_DIR"

# Setup firewall
echo "🛡️  Configuring firewall..."
ufw --force reset > /dev/null 2>&1
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (current connection)
ufw allow 22/tcp
echo "✅ SSH access allowed (port 22)"

# Allow application ports
ufw allow 3000/tcp
echo "✅ Frontend access allowed (port 3000)"

ufw allow 5000/tcp
echo "✅ Backend API access allowed (port 5000)"

# Enable firewall
ufw --force enable
echo "✅ Firewall configured and enabled"

# Setup SSH directory
echo "🔑 Setting up SSH configuration..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Generate SSH key for GitHub Actions if it doesn't exist
if [ ! -f ~/.ssh/github_actions ]; then
    echo "🔐 Generating SSH key for GitHub Actions..."
    ssh-keygen -t rsa -b 4096 -C "github-actions@jkp-katastar" -f ~/.ssh/github_actions -N ""

    # Add public key to authorized_keys
    cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

    echo "✅ SSH key generated for GitHub Actions"
    echo ""
    echo "📋 IMPORTANT: Copy this PRIVATE KEY to your GitHub secrets as 'VPS_SSH_KEY':"
    echo "============================================================================="
    cat ~/.ssh/github_actions
    echo "============================================================================="
    echo ""
    echo "📝 GitHub Secrets Setup:"
    echo "  1. Go to your GitHub repository"
    echo "  2. Settings → Secrets and variables → Actions"
    echo "  3. Add these secrets:"
    echo "     - VPS_HOST: $VPS_HOST"
    echo "     - VPS_USER: root"
    echo "     - VPS_SSH_KEY: (paste the private key above)"
    echo "     - MONGO_PASSWORD: (your secure MongoDB password)"
    echo "     - JWT_SECRET: (your secure JWT secret)"
    echo "     - EMAIL_SERVICE: (your email service, e.g., gmail)"
    echo "     - EMAIL_HOST: (your email host, e.g., smtp.gmail.com)"
    echo "     - EMAIL_PORT: (your email port, e.g., 587)"
    echo "     - EMAIL_USER: (your email username)"
    echo "     - EMAIL_SECRET: (your email password)"
    echo ""
else
    echo "✅ SSH key for GitHub Actions already exists"
fi

# Create basic monitoring script
echo "📊 Creating basic monitoring script..."
cat > /opt/monitor-jkp.sh << 'MONITOR_EOF'
#!/bin/bash
# Basic monitoring script for JKP Katastar

DEPLOY_DIR="/opt/jkp-katastar"
LOG_FILE="/var/log/jkp-monitor.log"

if [ -d "$DEPLOY_DIR/JKPKatastar" ]; then
    cd "$DEPLOY_DIR/JKPKatastar"

    # Check if services are running
    if ! docker-compose ps | grep -q "Up"; then
        echo "$(date): Services not running, attempting restart" >> $LOG_FILE
        docker-compose up -d >> $LOG_FILE 2>&1
    fi

    # Check disk space
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ $DISK_USAGE -gt 85 ]; then
        echo "$(date): WARNING: Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
        docker system prune -f >> $LOG_FILE 2>&1
    fi
else
    echo "$(date): Deployment directory not found" >> $LOG_FILE
fi
MONITOR_EOF

chmod +x /opt/monitor-jkp.sh
echo "✅ Monitoring script created at /opt/monitor-jkp.sh"

# Setup logrotate for monitoring logs
echo "📋 Setting up log rotation..."
cat > /etc/logrotate.d/jkp-katastar << 'LOGROTATE_EOF'
/var/log/jkp-monitor.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
LOGROTATE_EOF

echo "✅ Log rotation configured"

# Optimize system for Docker
echo "⚙️  Optimizing system for Docker..."

# Increase file limits
cat >> /etc/security/limits.conf << 'LIMITS_EOF'
* soft nofile 65536
* hard nofile 65536
root soft nofile 65536
root hard nofile 65536
LIMITS_EOF

# Optimize Docker daemon
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << 'DOCKER_DAEMON_EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2"
}
DOCKER_DAEMON_EOF

systemctl restart docker
echo "✅ System optimized for Docker"

# Create useful aliases
echo "🔗 Creating useful aliases..."
cat >> ~/.bashrc << 'ALIASES_EOF'

# JKP Katastar aliases
alias jkp-status='cd /opt/jkp-katastar/JKPKatastar && docker-compose ps'
alias jkp-logs='cd /opt/jkp-katastar/JKPKatastar && docker-compose logs -f'
alias jkp-restart='cd /opt/jkp-katastar/JKPKatastar && docker-compose restart'
alias jkp-update='cd /opt/jkp-katastar/JKPKatastar && git pull && docker-compose up --build -d'
alias jkp-health='/opt/jkp-katastar/JKPKatastar/health-check.sh'
ALIASES_EOF

echo "✅ Aliases added to ~/.bashrc"

# System information
echo ""
echo "📊 System Information"
echo "===================="
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Memory: $(free -h | grep '^Mem' | awk '{print $2}')"
echo "Disk Space: $(df -h / | tail -1 | awk '{print $2}')"
echo "CPU: $(nproc) cores"
echo "Docker: $(docker --version | cut -d' ' -f3 | sed 's/,//')"
echo "Docker Compose: $(docker-compose --version | cut -d' ' -f3 | sed 's/,//')"

echo ""
echo "🎉 VPS Server Setup Complete!"
echo "============================="
echo ""
echo "✅ What's been installed:"
echo "  - Docker & Docker Compose"
echo "  - Firewall (UFW) with required ports"
echo "  - SSH key for GitHub Actions"
echo "  - Basic monitoring script"
echo "  - System optimizations"
echo "  - Useful aliases"
echo ""
echo "📋 Next Steps:"
echo "  1. Copy the SSH private key above to GitHub secrets"
echo "  2. Add all required environment variables to GitHub secrets"
echo "  3. Push to your main branch to trigger deployment"
echo ""
echo "🌐 Once deployed, your app will be available at:"
echo "  - Frontend: http://$VPS_HOST:3000"
echo "  - Backend API: http://$VPS_HOST:5000/api"
echo "  - Health Check: http://$VPS_HOST:5000/api/health"
echo ""
echo "🔧 Useful commands:"
echo "  - Check status: jkp-status"
echo "  - View logs: jkp-logs"
echo "  - Restart services: jkp-restart"
echo "  - Health check: jkp-health"
echo "  - Manual deploy: /opt/jkp-katastar/JKPKatastar/deploy-vps.sh deploy"
echo ""
echo "🆘 If you need help, check:"
echo "  - /opt/jkp-katastar/JKPKatastar/TROUBLESHOOTING.md"
echo "  - GitHub Issues: https://github.com/constantine2nd/JKPKatastar/issues"
echo ""

# Optional: Add cron job for monitoring
read -p "Do you want to enable automatic monitoring (checks every 5 minutes)? [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    (crontab -l 2>/dev/null; echo "*/5 * * * * /opt/monitor-jkp.sh") | crontab -
    echo "✅ Automatic monitoring enabled (runs every 5 minutes)"
else
    echo "⏸️  Automatic monitoring skipped (you can run /opt/monitor-jkp.sh manually)"
fi

echo ""
echo "🚀 Your VPS server is ready for deployment!"
