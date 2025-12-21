# JKP Katastar - Cemetery Management System 🏛️

Modern web application for managing cemetery burial plots.

## 🚀 Quick Start - ONE Command

```bash
git clone <your-repo>
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

---

**Ready to develop!** Just run `./dev.sh` and start coding! 🚀