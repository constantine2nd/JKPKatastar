# JKP Katastar - Cemetery Management System 🏛️

Modern web application for managing cemetery burial plots with React frontend, Node.js backend, and MongoDB database.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose installed
- Git

### One Command Setup
```bash
git clone https://github.com/constantine2nd/JKPKatastar.git
cd JKPKatastar
./dev.sh
```

**That's it!** Full stack running at:
- **Frontend**: http://localhost:3000 (React app with hot reload)
- **Backend**: http://localhost:5000/api (Node.js API)  
- **Database**: Automatically set up MongoDB

## 🛠️ Development Commands

```bash
./dev.sh         # Start all services (default)
./dev.sh stop    # Stop all services  
./dev.sh clean   # Clean reset everything
./dev.sh logs    # View logs
./dev.sh help    # Show all commands

# Validate your setup (optional)  
./development/scripts/check-dev-setup.sh  # Check environment
```

## 📁 Project Structure

```
JKPKatastar/
├── client/              # React frontend (TypeScript + Material-UI)
├── server/              # Node.js backend (Express + MongoDB)  
├── development/         # Local development tools & docs
│   ├── dev.sh          # Main development script
│   ├── docker-compose.dev.yml  # Development services
│   └── scripts/        # Development utilities
├── .github/            # Production deployment & CI/CD
│   ├── workflows/      # GitHub Actions
│   ├── scripts/        # Deployment scripts
│   └── docs/          # Production documentation
├── dev.sh             # Convenience wrapper → development/dev.sh
└── README.md          # This file
```

## 🔧 Tech Stack

- **Frontend**: React 18, TypeScript, Material-UI, Redux Toolkit, Leaflet Maps
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Nodemailer
- **Development**: Docker Compose, Hot Reload, Health Checks

## 💻 Development Workflow

1. **Start development**: `./dev.sh`
2. **Edit frontend**: Files in `client/src/` auto-reload
3. **Edit backend**: Files in `server/` auto-restart
4. **View logs**: `./dev.sh logs`
5. **Stop when done**: `./dev.sh stop`

**Pro tip**: Run `./check-dev-setup.sh` first to validate your environment is ready!

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find what's using the ports
lsof -i :3000 :5000 :27017

# Kill processes if needed
sudo kill -9 <PID>
```

### Clean Reset
```bash
./dev.sh clean    # Removes all containers and data
./dev.sh          # Start fresh
```

### Docker Issues
```bash
# Restart Docker service
sudo systemctl restart docker

# Clean Docker system
docker system prune -a
```

## ⚙️ Environment Configuration

Create `.env` file in the root directory for custom settings:

```bash
# Database
MONGO_USERNAME=admin
MONGO_PASSWORD=your_password
MONGO_DATABASE=graves_dev

# JWT
JWT_SECRET=your_jwt_secret_key

# Email (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_SECRET=your_app_password

# API Settings
PORT=5000
NODE_ENV=development
```

## 🏗️ Architecture

```
┌─────────────────┐    HTTP    ┌─────────────────┐    TCP     ┌─────────────────┐
│   React Client  │ ◄─────────► │  Express API    │ ◄─────────► │    MongoDB      │
│   Port 3000     │             │   Port 5000     │             │   Port 27017    │
│   (Frontend)    │             │   (Backend)     │             │   (Database)    │
└─────────────────┘             └─────────────────┘             └─────────────────┘
```

## 🌐 Production Deployment

For production deployment to VPS or cloud servers:

1. **Quick Deploy**: Push to `main` branch → GitHub Actions auto-deploys
2. **Manual Deploy**: Use `./deploy-vps.sh` script
3. **Configure**: Set up GitHub secrets for your VPS

See [deployment documentation](VPS_DEPLOYMENT_STRATEGIES.md) for detailed instructions.

## 📚 Additional Documentation

- [VPS_DEPLOYMENT_STRATEGIES.md](VPS_DEPLOYMENT_STRATEGIES.md) - Production deployment options
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [FRONTEND_FIX.md](FRONTEND_FIX.md) - Frontend-specific fixes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Start development: `./dev.sh`
4. Make changes and test locally
5. Commit: `git commit -m "Add new feature"`
6. Push: `git push origin feature/new-feature`
7. Create Pull Request

## 📝 License

This project is licensed under the MIT License.

---

**Ready to develop!** Run `./dev.sh` and start coding! 🚀