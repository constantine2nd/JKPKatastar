# JKP Katastar - Architecture Overview

## Table of Contents
- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Architecture Diagram](#architecture-diagram)
- [Component Details](#component-details)
- [Nginx Configuration](#nginx-configuration)
- [Development vs Production](#development-vs-production)
- [Data Flow](#data-flow)
- [Security](#security)
- [Deployment](#deployment)
- [Monitoring & Health Checks](#monitoring--health-checks)

## System Overview

JKP Katastar is a **Cemetery Management System** built for JKP Temerin (Public Utility Company) in Serbia. The system manages cemetery plots, deceased records, payers, and provides geospatial mapping capabilities for grave locations.

### Core Business Functions
- **Cemetery Management**: Multiple cemetery locations with GPS coordinates
- **Grave Management**: Plot allocation, status tracking, and geospatial mapping
- **Deceased Records**: Personal information, burial dates, and grave associations
- **Payer Management**: Contact information and payment tracking
- **User Management**: Role-based access (Administrator, Officer, Visitor)
- **Request Management**: Grave allocation and modification requests

## Technology Stack

### Frontend
- **Framework**: React 18.2 with TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Redux Toolkit + React Query (TanStack Query)
- **Routing**: React Router DOM v6
- **Maps**: React Leaflet for geospatial visualization
- **Forms**: Formik with Yup validation
- **Internationalization**: i18next
- **PDF Generation**: jsPDF and React-PDF
- **HTTP Client**: Axios
- **Build Tool**: Create React App

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: MongoDB 6.0 with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (Production)
- **Database**: MongoDB with persistent volumes
- **Networking**: Docker bridge networks
- **Health Checks**: Built-in container health monitoring

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────── │
│  │   React App     │    │   Nginx Proxy   │    │   Static      │
│  │   (Port 3000)   │◄───│   (Port 80)     │◄───│   Assets      │
│  │   - TypeScript  │    │   - Gzip        │    │   - Images    │
│  │   - Material-UI │    │   - Security    │    │   - Fonts     │
│  │   - Redux       │    │   - Caching     │    │   - CSS       │
│  │   - React Query │    │   - API Proxy   │    │               │
│  └─────────────────┘    └─────────────────┘    └─────────────── │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/HTTPS
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION TIER                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 Express.js API Server                      │ │
│  │                    (Port 5000)                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │   Routes    │ │Controllers  │ │ Middleware  │          │ │
│  │  │ - Graves    │ │ - Business  │ │ - Auth      │          │ │
│  │  │ - Users     │ │   Logic     │ │ - CORS      │          │ │
│  │  │ - Cemetery  │ │ - Error     │ │ - Logging   │          │ │
│  │  │ - Deceased  │ │   Handling  │ │ - Validation│          │ │
│  │  │ - Payers    │ │             │ │             │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ MongoDB Protocol
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DATA TIER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    MongoDB 6.0                             │ │
│  │                   (Port 27017)                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │ │
│  │  │Collections  │ │   Indexes   │ │ Replication │          │ │
│  │  │ - users     │ │ - Geospatial│ │ - Persistence│          │ │
│  │  │ - graves    │ │ - Text      │ │ - Backup     │          │ │
│  │  │ - deceased  │ │ - Compound  │ │ - Recovery   │          │ │
│  │  │ - cemeteries│ │             │ │              │          │ │
│  │  │ - payers    │ │             │ │              │          │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (React Application)

**Purpose**: User interface for cemetery management operations

**Key Features**:
- **Responsive Design**: Material-UI components adapt to desktop/mobile
- **Geospatial Mapping**: Interactive maps showing cemetery locations and grave plots
- **Multi-language Support**: Serbian/English internationalization
- **Role-based UI**: Different interfaces for Administrators, Officers, and Visitors
- **Real-time Updates**: React Query for efficient data synchronization
- **Offline Capabilities**: Progressive Web App features

**File Structure**:
```
client/src/
├── components/     # Reusable UI components
├── features/       # Feature-specific modules
├── screens/        # Page-level components
├── hooks/          # Custom React hooks
├── interfaces/     # TypeScript type definitions
├── utils/          # Utility functions
└── store.tsx       # Redux store configuration
```

### Backend (Express.js API)

**Purpose**: Business logic, data processing, and database operations

**API Endpoints**:
```
/api/graves         # Grave management operations
/api/deceased       # Deceased person records
/api/payer          # Payer information management
/api/users          # User authentication and management
/api/cemeteries     # Cemetery location data
/api/grave-types    # Grave type definitions
/api/grave-requests # Grave allocation requests
/api/health         # System health monitoring
```

**Architecture Pattern**: RESTful API with MVC pattern
- **Models**: Mongoose schemas for data validation
- **Controllers**: Business logic and request handling
- **Routes**: API endpoint definitions
- **Middleware**: Authentication, validation, error handling

### Database (MongoDB)

**Purpose**: Persistent data storage with geospatial capabilities

**Collections**:
```javascript
users         # User accounts and authentication
graves        # Grave plots with GPS coordinates
deceased      # Personal records of deceased individuals
cemeteries    # Cemetery locations and metadata
payers        # Payment and contact information
gravetypes    # Grave type definitions and capacities
graverequests # Requests for grave modifications
logs          # Audit trail and system logs
```

**Indexes**:
- **Geospatial**: 2dsphere indexes for location queries
- **Text**: Full-text search on names and descriptions
- **Compound**: Multi-field indexes for complex queries
- **Unique**: Email uniqueness for user accounts

## Nginx Configuration

Nginx serves as a **reverse proxy** and **static file server** in production, providing several critical functions. The configuration is deployed through Docker's multi-stage build process.

### Deployment Integration

The nginx.conf file at `/client/nginx.conf` is used in the **production Docker build** process:

```dockerfile
# Production stage with Nginx
FROM nginx:alpine

# Copy custom nginx config (THIS IS WHERE nginx.conf IS DEPLOYED)
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built React app from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Complete Configuration Analysis

Let's examine each section of the actual deployed `nginx.conf`:

### 1. Global Configuration
```nginx
events {
    worker_connections 1024;  # Handles up to 1024 concurrent connections
}

http {
    include /etc/nginx/mime.types;      # Proper MIME type handling
    default_type application/octet-stream;  # Fallback MIME type
}
```

**Purpose**: Sets up Nginx to handle concurrent connections efficiently and serve files with correct MIME types.

### 2. Gzip Compression (Performance)
```nginx
# Gzip compression
gzip on;
gzip_vary on;                    # Adds Vary: Accept-Encoding header
gzip_min_length 1024;           # Only compress files larger than 1KB
gzip_proxied expired no-cache no-store private auth;  # Compress proxied responses
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/xml+rss
    application/json;
```

**Deployment Impact**: 
- Reduces bandwidth usage by 60-80%
- Faster page load times for users
- Particularly effective for JavaScript bundles and CSS files

### 3. Server Block Configuration
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;  # Where React build files are located
    index index.html;            # Default file to serve
}
```

**Key Point**: The `root` directive points to where the React production build is copied during Docker image creation.

### 4. React Router Handling (Critical for SPA)
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Deployment Significance**: 
- **Without this**: Direct URL access (e.g., `yoursite.com/graves/123`) would return 404
- **With this**: All non-existing routes are served `index.html`, allowing React Router to handle routing
- **Result**: Enables deep linking and browser refresh on any route

### 5. API Proxying (Backend Integration)
```nginx
location /api/ {
    proxy_pass http://backend:5000;              # Routes to backend container
    proxy_set_header Host $host;                 # Preserves original host
    proxy_set_header X-Real-IP $remote_addr;    # Real client IP
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # IP chain
    proxy_set_header X-Forwarded-Proto $scheme; # HTTP/HTTPS protocol
}
```

**Deployment Benefits**:
- **Single Entry Point**: Frontend and API accessible from same domain
- **CORS Avoidance**: No cross-origin issues since everything comes from same domain
- **Load Balancing Ready**: Can easily add multiple backend instances
- **Docker Network**: Uses Docker service name `backend` for internal communication

### 6. Static Asset Optimization
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;                              # Cache for 1 year
    add_header Cache-Control "public, immutable";  # Browsers can cache aggressively
}
```

**Performance Impact**:
- **First Visit**: Assets downloaded and cached
- **Subsequent Visits**: Assets served from browser cache (0 network requests)
- **Build Optimization**: React's build process includes hashes in filenames, ensuring cache busting when files change

### 7. Security Headers
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;        # Prevents clickjacking
add_header X-XSS-Protection "1; mode=block" always;    # XSS protection
add_header X-Content-Type-Options "nosniff" always;    # MIME type sniffing protection
```

**Security Benefits**:
- **X-Frame-Options**: Prevents the site from being embedded in malicious iframes
- **X-XSS-Protection**: Enables browser's built-in XSS filtering
- **X-Content-Type-Options**: Prevents MIME type confusion attacks

### 8. Hidden File Protection
```nginx
location ~ /\. {
    deny all;  # Blocks access to .env, .git, etc.
}
```

**Security**: Prevents access to sensitive dotfiles that might accidentally be included in the build.

### Deployment Process Flow

1. **Build Stage**: React app is built (`npm run build`)
2. **Nginx Stage**: 
   - Nginx Alpine image is used as base
   - `nginx.conf` is copied to `/etc/nginx/nginx.conf` (replaces default config)
   - React build files are copied to `/usr/share/nginx/html`
3. **Container Startup**: Nginx starts with custom configuration
4. **Request Handling**:
   ```
   User Request → Nginx (Port 80) → Route Decision:
   ├── /api/* → Proxy to backend:5000
   ├── Static files → Serve from /usr/share/nginx/html
   └── SPA routes → Serve index.html (React Router takes over)
   ```

### Production Benefits

- **Single Container**: Both static files and reverse proxy in one container
- **Optimized Delivery**: Gzip, caching, and efficient static file serving
- **Security**: Multiple layers of protection
- **Scalability**: Can handle thousands of concurrent connections
- **Maintainability**: Configuration is version-controlled and containerized

## Development vs Production

### Development Environment (`docker-compose.dev.yml`)

**Characteristics**:
- **Hot Reload**: Source code changes trigger automatic rebuilds
- **Debug Mode**: Source maps and verbose logging enabled
- **Volume Mounting**: Live code editing without container rebuilds
- **Port Exposure**: Direct access to all services
- **Database**: `graves_dev` with sample data

**Ports**:
- Frontend: `http://localhost:3000` (React Dev Server)
- Backend: `http://localhost:5000` (Express API)
- MongoDB: `mongodb://localhost:27017`

### Production Environment (`docker-compose.prod.yml`)

**Characteristics**:
- **Optimized Builds**: Minified assets and production builds
- **Security**: Limited port exposure and authentication required
- **Performance**: Nginx caching and compression enabled
- **Monitoring**: Health checks and log rotation
- **Database**: `graves_prod` with production data

**Ports**:
- Frontend: `http://localhost:3000` (Nginx + React Build)
- Backend: `http://localhost:5000` (Express API)
- MongoDB: `127.0.0.1:27017` (localhost only)

### Key Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| Build Type | Development build with source maps | Optimized production build |
| Hot Reload | Enabled | Disabled |
| Database | graves_dev | graves_prod |
| Logging | Verbose | Structured with rotation |
| Security | Relaxed for debugging | Strict headers and access control |
| Performance | Prioritizes rebuild speed | Optimized for runtime performance |

## Data Flow

### 1. User Request Flow
```
User Action → React Component → Redux Action → Axios HTTP Request
    ↓
API Route → Controller → Model Validation → MongoDB Query
    ↓
Database Response → Controller Processing → JSON Response
    ↓
React Query Cache → Component Re-render → UI Update
```

### 2. Authentication Flow
```
Login Request → JWT Generation → Token Storage → Protected Route Access
    ↓
Token Validation → User Role Check → Permission Verification → Resource Access
```

### 3. Geospatial Query Flow
```
Map Interaction → Coordinate Extraction → Spatial Query → MongoDB GeoJSON
    ↓
Location Results → React Leaflet → Map Visualization → Marker Updates
```

## Security

### Frontend Security
- **XSS Protection**: React's built-in XSS prevention
- **CSRF Protection**: Token-based authentication
- **Content Security Policy**: Nginx security headers
- **Input Validation**: Formik + Yup validation schemas

### Backend Security
- **JWT Authentication**: Stateless token-based auth
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: Express middleware for API protection
- **Input Sanitization**: Mongoose schema validation

### Database Security
- **Authentication**: MongoDB user-based access control
- **Network Isolation**: Docker internal networks
- **Data Validation**: Schema-level constraints
- **Audit Logging**: Operation tracking and monitoring

### Infrastructure Security
- **Container Isolation**: Docker namespace separation
- **Network Segmentation**: Bridge networks with controlled access
- **Port Binding**: Selective service exposure
- **Health Monitoring**: Automated failure detection

## Deployment

### Local Development
```bash
# Start all services
./dev.sh

# Access points
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api
# MongoDB: mongodb://admin:password123@localhost:27017
```

### Production Deployment
```bash
# Production build and deployment
docker-compose -f docker-compose.prod.yml up -d

# Scaling (if needed)
docker-compose -f docker-compose.prod.yml up --scale backend=2
```

### Environment Variables
```bash
# Core Configuration
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://admin:password@mongodb:27017/graves_prod

# Security
JWT_SECRET=your_secure_jwt_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@domain.com
EMAIL_SECRET=your_app_password

# Frontend Configuration
REACT_APP_API_URL=http://your-domain.com/api
REACT_APP_MAP_CENTER_LAT=45.2671
REACT_APP_MAP_CENTER_LON=19.8335
```

## Monitoring & Health Checks

### Container Health Checks
Each service includes built-in health monitoring:

```yaml
# MongoDB Health Check
healthcheck:
  test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
  interval: 30s
  timeout: 10s
  retries: 5

# Backend Health Check
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:5000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3

# Frontend Health Check
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:80"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### API Health Endpoint
```javascript
GET /api/health
{
  "status": "OK",
  "message": "JKP Katastar API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "port": 5000,
  "database": "Connected",
  "email": "Configured"
}
```

### Log Management
```yaml
# Production logging configuration
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Resource Limits
```yaml
# Production resource constraints
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

---

## Summary

The JKP Katastar system follows a modern **three-tier architecture** with clear separation of concerns:

1. **Presentation Tier**: React SPA with Material-UI for user interactions
2. **Application Tier**: Express.js API with business logic and authentication  
3. **Data Tier**: MongoDB with geospatial capabilities and full-text search

**Nginx** plays a crucial role as the **frontend gateway**, handling static file serving, API proxying, performance optimization, and security headers. This architecture provides:

- **Scalability**: Containerized services can be scaled independently
- **Maintainability**: Clear separation of frontend/backend concerns
- **Performance**: Optimized static serving and API caching
- **Security**: Multi-layered protection from UI to database
- **Developer Experience**: Hot reload in development, optimized builds in production

The system is designed to efficiently manage cemetery operations for JKP Temerin while providing a modern, responsive user experience for administrators, officers, and visitors.

## Current Deployment vs Intended Nginx Usage

Based on the accessible URLs `http://185.237.15.242:3000` (frontend) and `http://185.237.15.242:5000/api/health` (backend), the system is currently running in **direct port exposure mode** rather than using the intended Nginx proxy configuration.

### Current Setup Analysis

**What's Actually Running**:
```
Frontend: http://185.237.15.242:3000 (React Dev Server or Direct Container)
Backend:  http://185.237.15.242:5000 (Express API Direct Access)
```

This indicates you're likely using:
- `docker-compose.yml` (development configuration) OR
- `docker-compose.prod.yml` with direct port bindings

### Nginx Configuration Status

Your `client/nginx.conf` is configured but **not currently active** as the primary entry point because:

1. **Frontend on Port 3000**: This suggests either:
   - Development mode (React dev server)
   - Production container running but not behind Nginx proxy

2. **Backend on Port 5000**: Direct access indicates no reverse proxy layer

### Intended Production Architecture

According to your `nginx.conf`, the **intended production setup** should be:

```
User Request → http://185.237.15.242 (Port 80)
                     ↓
                 Nginx Container
                     ↓
    ┌─────────────────┼─────────────────┐
    ↓                                   ↓
Static Files                    API Requests (/api/*)
(Served by Nginx)               (Proxied to backend:5000)
```

### How to Enable Nginx Proxy Mode

To use your nginx.conf as intended, you should:

1. **Modify docker-compose.prod.yml** to expose only port 80:
```yaml
frontend:
  ports:
    - "80:80"  # Only expose Nginx port
    
backend:
  # Remove port exposure or bind to localhost only
  ports:
    - "127.0.0.1:5000:5000"
```

2. **Access everything through port 80**:
```
Frontend: http://185.237.15.242 (Nginx serves React build)
API:      http://185.237.15.242/api/* (Nginx proxies to backend)
```

### Benefits of Using Nginx Proxy

**Current Setup Issues**:
- Two separate ports to manage
- Potential CORS issues between ports 3000 and 5000
- No static asset optimization
- Missing security headers
- No gzip compression

**With Nginx Proxy**:
- Single entry point on port 80
- Optimized static file serving
- Gzip compression active
- Security headers applied
- API and frontend unified under same domain

### Migration Steps

To activate your nginx.conf configuration:

1. **Ensure production build**: Frontend should build React app, not run dev server
2. **Single port exposure**: Only expose port 80 from the frontend container
3. **Internal networking**: Backend should only be accessible from within Docker network
4. **Update firewall**: Only allow port 80 (and 443 for HTTPS) externally

The nginx.conf you have is well-configured for production use - it just needs to be the primary entry point rather than having direct port access to both services.