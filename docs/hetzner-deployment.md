# Hetzner Cloud Deployment Guide

**JKP Katastar — Production Deployment**

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Create the Hetzner Server](#3-create-the-hetzner-server)
4. [Generate SSH Keys](#4-generate-ssh-keys)
5. [Configure the Firewall](#5-configure-the-firewall)
6. [Prepare the Server](#6-prepare-the-server)
7. [Configure GitHub Secrets](#7-configure-github-secrets)
8. [First Deployment](#8-first-deployment)
9. [Verify the Deployment](#9-verify-the-deployment)
10. [Point a Domain](#10-point-a-domain)
11. [Enable HTTPS with Let's Encrypt](#11-enable-https-with-lets-encrypt)
12. [Ongoing Operations](#12-ongoing-operations)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Architecture Overview

The application runs as three Docker containers orchestrated by Docker Compose:

```
Internet
    │
    ▼ port 80 (HTTP) / 443 (HTTPS)
┌─────────────────────────────────┐
│  nginx  (frontend container)    │
│  • serves React SPA             │
│  • proxies /api/* → backend     │
└────────────────┬────────────────┘
                 │ internal network (172.20.0.0/16)
    ┌────────────▼────────────┐
    │  Node.js backend        │
    │  port 5000 (internal)   │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────┐
    │  MongoDB 6.0            │
    │  port 27017             │
    └─────────────────────────┘
```

- **Only port 80/443** is exposed to the internet. MongoDB and the backend are reachable only inside Docker's private network.
- **Port 27017** is bound on the host for MongoDB Compass access during development. On a production server with a strict firewall this port is blocked externally (see section 5).
- All deployments are fully automated via **GitHub Actions** — push to `main` and the server updates itself.

---

## 2. Prerequisites

- A GitHub account with the repository forked or cloned
- A local machine with `ssh-keygen` available (Linux, macOS, or WSL on Windows)
- A Hetzner Cloud account (register at **cloud.hetzner.com**)
- Optionally: a domain name pointing to the server

---

## 3. Create the Hetzner Server

1. Log in at **console.hetzner.cloud**
2. Create a new **Project** (e.g. "JKPKatastar")
3. Click **Add Server** and select:

| Setting | Recommended value |
|---|---|
| **Location** | Nuremberg (`nbg1`) or Helsinki (`hel1`) — closest to Serbia |
| **Image** | Ubuntu 22.04 |
| **Type** | Shared CPU → **CX22** (2 vCPU, 4 GB RAM, 40 GB NVMe, ~€4/month) |
| **SSH Keys** | Add your public key — see section 4 |
| **Firewall** | Create a new firewall — see section 5 |
| **Backups** | Enable (optional, +20% cost, recommended for production) |
| **Name** | `jkp-katastar-prod` |

> **Why CX22?** The React build requires ~1.5 GB RAM. The running app uses ~300 MB. CX22's 4 GB provides comfortable headroom with room for MongoDB and OS overhead.

After creation, Hetzner shows the server's **public IPv4 address**. Save it — you will need it in several places.

---

## 4. Generate SSH Keys

On your **local machine**, create a dedicated deploy key pair:

```bash
ssh-keygen -t ed25519 -C "jkp-deploy" -f ~/.ssh/jkp_deploy -N ""
```

This produces:
- `~/.ssh/jkp_deploy` — **private key** (stays on your machine and in GitHub Secrets)
- `~/.ssh/jkp_deploy.pub` — **public key** (goes to Hetzner and to the server)

**Add the public key to Hetzner:**

In the "Add Server" wizard → SSH Keys → click **Add SSH Key**, paste the contents of `~/.ssh/jkp_deploy.pub`, and name it `jkp-deploy`.

**Test the connection** after the server starts:

```bash
ssh -i ~/.ssh/jkp_deploy root@YOUR_SERVER_IP
```

You should get a shell prompt immediately, without a password.

---

## 5. Configure the Firewall

In Hetzner Console → **Firewalls → Create Firewall**.

### Inbound rules

| Protocol | Port | Source | Purpose |
|---|---|---|---|
| TCP | 22 | Any | SSH access |
| TCP | 80 | Any | HTTP |
| TCP | 443 | Any | HTTPS (needed later) |

> **MongoDB port 27017 is intentionally absent.** The database is only reachable from inside Docker's private network. If you need to connect MongoDB Compass from your office, add a rule for TCP 27017 restricted to your specific IP only — never open it to the world.

Attach the firewall to the server under **Applied to → Add Server**.

---

## 6. Prepare the Server

SSH into the server:

```bash
ssh -i ~/.ssh/jkp_deploy root@YOUR_SERVER_IP
```

### Install Docker

```bash
# Add Docker's official GPG key
apt update && apt install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.asc] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  > /etc/apt/sources.list.d/docker.list

# Install Docker Engine + Compose plugin
apt update
apt install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

# Start Docker and enable it on boot
systemctl enable --now docker
```

Verify:

```bash
docker --version
docker compose version
```

### Create the deployment directory

```bash
mkdir -p /opt/jkp-katastar/logs
```

### (Optional) Enable automatic OS security updates

```bash
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 7. Configure GitHub Secrets

Open your GitHub repository → **Settings → Secrets and variables → Actions → New repository secret** and add the following:

| Secret name | How to get the value |
|---|---|
| `VPS_HOST` | The server's public IPv4 from Hetzner console |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Full contents of `~/.ssh/jkp_deploy` (the **private** key, including the `-----BEGIN...` lines) |
| `MONGO_PASSWORD` | Run `openssl rand -hex 16` and copy the output |
| `JWT_SECRET` | Run `openssl rand -hex 32` and copy the output |
| `EMAIL_SERVICE` | Your email provider, e.g. `gmail` |
| `EMAIL_HOST` | SMTP host, e.g. `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port, e.g. `587` |
| `EMAIL_USER` | Your email address |
| `EMAIL_SECRET` | Email app password (see note below) |
| `MAINTAINER_NAME` | Full name of the initial maintainer user, e.g. `Admin Prezime` |
| `MAINTAINER_EMAIL` | Email address the maintainer will use to log in |
| `MAINTAINER_PASSWORD` | A strong password for the maintainer account |

> **Gmail App Password:** Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail" and use that as `EMAIL_SECRET`. Your regular Google password will not work.

> **Maintainer user:** The deployment script automatically creates the MAINTAINER account on first deploy. If the account already exists (e.g. on a re-deploy), it is silently skipped — the existing account and its password are never overwritten.

---

## 8. First Deployment

Trigger the deployment by pushing to `main`:

```bash
git push origin main
```

Or go to **Actions → Deploy to VPS → Run workflow** to start it manually.

### What the pipeline does

```
GitHub Actions (ubuntu-latest runner)
  │
  ├── 1. Checks out the repository
  ├── 2. Configures SSH with VPS_SSH_KEY
  ├── 3. Builds a deploy.sh script with all secrets injected
  ├── 4. Copies deploy.sh to the server via SCP
  ├── 5. Executes deploy.sh on the server:
  │       • stops existing containers (if any)
  │       • backs up the previous deployment
  │       • clones the repository fresh
  │       • writes the .env file
  │       • pulls base images (mongo:6.0, node:18-alpine, nginx:alpine)
  │       • builds Docker images for frontend and backend
  │       • starts all three containers
  │       • waits for MongoDB, backend, and frontend to be healthy
  │       • prunes old Docker images
  │       • removes old backups (keeps last 3)
  ├── 6. Waits 60 seconds then verifies HTTP responses
  └── 7. Prints the access URLs
```

### Expected duration

| Run | Duration |
|---|---|
| First run (no cache) | 8–12 minutes |
| Subsequent runs | 4–6 minutes |

The React production build is the slowest step (~5 minutes). All other steps are fast.

### Watch the progress

In your browser: **GitHub → Actions → Deploy to VPS → (latest run)**.

Each step expands to show live output. A green checkmark on all steps means the app is live.

---

## 9. Verify the Deployment

Once the workflow finishes, open a browser:

```
http://YOUR_SERVER_IP          → React application (login page)
http://YOUR_SERVER_IP/api/health → JSON health check response
```

The health endpoint returns something like:

```json
{
  "status": "OK",
  "message": "JKP Katastar API is running",
  "timestamp": "2025-03-20T10:00:00.000Z",
  "environment": "production",
  "database": "Connected"
}
```

If you see the React app and the health check returns `"status": "OK"`, the deployment is successful.

**Check container status on the server:**

```bash
ssh -i ~/.ssh/jkp_deploy root@YOUR_SERVER_IP
cd /opt/jkp-katastar/JKPKatastar
docker compose -f docker-compose.prod.yml ps
```

All three services (`jkp-mongodb`, the backend, and the frontend) should show `running`.

---

## 10. Point a Domain

If you own a domain (e.g. `katastar.yourtown.rs`), add an **A record** in your domain registrar's DNS panel:

| Record | Type | Value | TTL |
|---|---|---|---|
| `@` | A | `YOUR_SERVER_IP` | 300 |
| `www` | A | `YOUR_SERVER_IP` | 300 |

DNS propagation typically takes 5–30 minutes. After that the app is reachable at `http://katastar.yourtown.rs`.

Update the `CLIENT_HOST_URI` secret in GitHub to match the domain, then redeploy so the backend knows the correct origin:

```
CLIENT_HOST_URI = http://katastar.yourtown.rs
```

---

## 11. Enable HTTPS with Let's Encrypt

HTTPS requires a domain name (IP addresses cannot get a certificate). Complete section 10 first and confirm the domain resolves to the server.

### Step 1 — Install Certbot on the server

```bash
ssh -i ~/.ssh/jkp_deploy root@YOUR_SERVER_IP
apt install -y certbot
```

### Step 2 — Obtain the certificate

Stop the nginx container temporarily so Certbot can use port 80:

```bash
cd /opt/jkp-katastar/JKPKatastar
docker compose -f docker-compose.prod.yml stop frontend
```

Get the certificate:

```bash
certbot certonly --standalone \
  -d katastar.yourtown.rs \
  -d www.katastar.yourtown.rs \
  --email admin@yourtown.rs \
  --agree-tos --non-interactive
```

Certificates are saved to:
```
/etc/letsencrypt/live/katastar.yourtown.rs/fullchain.pem
/etc/letsencrypt/live/katastar.yourtown.rs/privkey.pem
```

### Step 3 — Update nginx.conf in the repository

Replace the contents of `nginx.conf` in the repository root with:

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/xml+rss application/json;

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name katastar.yourtown.rs www.katastar.yourtown.rs;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        server_name katastar.yourtown.rs www.katastar.yourtown.rs;
        root /usr/share/nginx/html;
        index index.html;

        ssl_certificate     /etc/letsencrypt/live/katastar.yourtown.rs/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/katastar.yourtown.rs/privkey.pem;
        ssl_protocols       TLSv1.2 TLSv1.3;
        ssl_ciphers         HIGH:!aNULL:!MD5;

        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Strict-Transport-Security "max-age=63072000" always;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://backend:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location ~ /\. {
            deny all;
        }
    }
}
```

### Step 4 — Update docker-compose.prod.yml to expose port 443 and mount certificates

In `docker-compose.prod.yml`, update the `frontend` service:

```yaml
  frontend:
    # ... existing config ...
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

### Step 5 — Commit and redeploy

```bash
git add nginx.conf docker-compose.prod.yml
git commit -m "Enable HTTPS"
git push origin main
```

The GitHub Actions pipeline redeploys with HTTPS active. After deployment, update the GitHub secret:

```
CLIENT_HOST_URI = https://katastar.yourtown.rs
```

And redeploy once more so the backend uses the HTTPS origin.

### Step 6 — Set up automatic certificate renewal

On the server, add a cron job to renew the certificate automatically:

```bash
crontab -e
```

Add this line:

```
0 3 * * * certbot renew --quiet --deploy-hook "docker compose -f /opt/jkp-katastar/JKPKatastar/docker-compose.prod.yml restart frontend"
```

Certbot renews certificates that are within 30 days of expiry. The deploy hook restarts nginx so the new certificate is loaded.

---

## 12. Ongoing Operations

### Redeploy after a code change

```bash
git push origin main
```

GitHub Actions handles everything automatically.

### SSH into the server

```bash
ssh -i ~/.ssh/jkp_deploy root@YOUR_SERVER_IP
cd /opt/jkp-katastar/JKPKatastar
```

### Check container status

```bash
docker compose -f docker-compose.prod.yml ps
```

### Follow live logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# One service only
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f mongodb
```

### Restart a service

```bash
docker compose -f docker-compose.prod.yml restart backend
```

### Connect to MongoDB shell

```bash
docker compose -f docker-compose.prod.yml exec mongodb \
  mongosh -u admin -p YOUR_MONGO_PASSWORD --authenticationDatabase admin
```

### Connect with MongoDB Compass (remote)

Use this connection string in Compass (requires port 27017 temporarily opened in Hetzner firewall for your IP):

```
mongodb://admin:YOUR_MONGO_PASSWORD@YOUR_SERVER_IP:27017/graves_prod?authSource=admin
```

### Check disk and memory usage

```bash
df -h                          # disk
free -h                        # RAM
docker stats --no-stream       # per-container memory
docker system df               # Docker image/container space
```

### Clean up old Docker images

```bash
docker image prune -f
```

### View deployment backups

```bash
ls -la /opt/jkp-katastar/JKPKatastar-backup-*/
```

The pipeline keeps the last 3 backups automatically.

---

## 13. Troubleshooting

### Containers not starting

```bash
docker compose -f docker-compose.prod.yml logs --tail=100
```

Look for `Error` lines. Common causes:

| Symptom | Cause | Fix |
|---|---|---|
| MongoDB fails to start | Wrong `MONGO_PASSWORD` in `.env` | Check `.env` file: `cat .env` |
| Backend crashes on start | MongoDB not ready yet | Wait 30 seconds, then `docker compose ... restart backend` |
| Frontend shows blank page | React build failed | Check build logs: `docker compose ... logs frontend` |
| `port is already allocated` | Something else is on port 80 | `ss -tlnp \| grep :80` then stop the conflicting service |

### Manually inspect the .env file on the server

```bash
cat /opt/jkp-katastar/JKPKatastar/.env
```

All secrets should be filled in (no `REPLACE_` placeholders remaining).

### GitHub Actions fails at "Deploy to VPS"

Check that all 13 GitHub secrets are set correctly. The most common mistake is pasting the public key instead of the private key for `VPS_SSH_KEY`.

The private key starts with:
```
-----BEGIN OPENSSH PRIVATE KEY-----
```

### React app loads but API calls fail (network errors)

The nginx proxy forwards `/api/*` to the backend container at `http://backend:5000`. Verify the backend container is running:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml exec backend \
  wget -qO- http://localhost:5000/api/health
```

### Server runs out of memory during deployment

The React build needs ~1.5 GB RAM. On a server with only 2 GB RAM (CX11), the build may be killed by the OOM killer. The recommended CX22 with 4 GB RAM avoids this entirely.

Check if builds are being killed:

```bash
dmesg | grep -i "killed process"
```

If you are on CX11 and cannot upgrade, add a swap file:

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

*This guide covers HTTP and HTTPS deployment on Hetzner Cloud using Docker Compose and automated GitHub Actions CI/CD.*
