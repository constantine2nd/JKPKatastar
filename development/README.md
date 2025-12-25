# JKP Katastar - Development Environment

This directory contains everything needed for local development of the JKP Katastar Cemetery Management System.

## 🚀 Quick Start

From the **project root directory**:
```bash
./dev.sh              # Start all services
./dev.sh stop          # Stop all services
./dev.sh clean         # Clean reset everything
./dev.sh logs          # View logs
```

Or directly from the development directory:
```bash
cd development
./dev.sh               # Start all services
```

## 📁 Directory Structure

```
development/
├── dev.sh                          # Main development script
├── docker-compose.dev.yml          # Development services configuration
├── scripts/
│   └── check-dev-setup.sh          # Environment validation
└── docs/
    └── LOCAL_DEVELOPMENT.md        # Comprehensive setup guide
```

## 🛠️ Development Scripts

### `dev.sh` - Main Development Script
```bash
./dev.sh         # Start all services (default)
./dev.sh stop    # Stop all services  
./dev.sh clean   # Clean reset (removes data)
./dev.sh logs    # View logs
./dev.sh help    # Show all commands
```

### `scripts/check-dev-setup.sh` - Environment Validator
```bash
./scripts/check-dev-setup.sh   # Validate your development environment
```

## ⚙️ Configuration Files

### `docker-compose.dev.yml`
Development Docker Compose configuration with:
- MongoDB with persistent development data
- Node.js backend with hot reload
- React frontend with hot reload
- Health checks for all services
- Development-specific environment variables

## 🔧 What Gets Started

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| MongoDB | 27017 | mongodb://admin:password123@localhost:27017 | Database |
| Backend | 5000 | http://localhost:5000/api | Express API |
| Frontend | 3000 | http://localhost:3000 | React App |

## 📚 Documentation

### Quick Reference
- **Start developing**: Run `./dev.sh` from project root
- **Validate setup**: Run `./scripts/check-dev-setup.sh`
- **View logs**: Run `./dev.sh logs`

### Detailed Guide
See [`docs/LOCAL_DEVELOPMENT.md`](docs/LOCAL_DEVELOPMENT.md) for:
- Prerequisites installation
- Detailed setup instructions
- Development workflow
- Troubleshooting common issues
- Environment configuration

## 🐛 Common Issues

### Port Conflicts
```bash
# Check what's using the ports
lsof -i :3000 :5000 :27017

# Kill conflicting processes
sudo kill -9 <PID>
```

### Clean Reset
```bash
./dev.sh clean     # Remove all containers and data
./dev.sh           # Start fresh
```

### Docker Issues
```bash
# Restart Docker
sudo systemctl restart docker

# Clean Docker system
docker system prune -a
```

## 🔄 Development Workflow

1. **Start**: `./dev.sh` (from project root or development directory)
2. **Code**: Edit files in `client/src/` or `server/`
3. **Test**: Changes auto-reload in browser
4. **Debug**: `./dev.sh logs` to view container logs
5. **Stop**: `./dev.sh stop` when done

## ⚡ Hot Reload

- **Frontend**: Files in `client/src/` trigger browser reload
- **Backend**: Files in `server/` trigger server restart
- **Database**: MongoDB data persists between restarts

## 🎯 Tips

- Use `./dev.sh logs` to debug issues
- Run `./scripts/check-dev-setup.sh` if you encounter problems
- Database data persists - use `./dev.sh clean` to reset
- All services start together with proper dependency ordering

## 🆘 Getting Help

1. **Check setup**: `./scripts/check-dev-setup.sh`
2. **View logs**: `./dev.sh logs`
3. **Clean reset**: `./dev.sh clean && ./dev.sh`
4. **Read detailed docs**: [`docs/LOCAL_DEVELOPMENT.md`](docs/LOCAL_DEVELOPMENT.md)

---

Ready to start developing! 🚀