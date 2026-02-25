# Installation Guide

Complete setup instructions for Kair0s AI Gateway with Unified Interface.

## 🚀 Quick Start

### Prerequisites

Before installing Kair0s, ensure you have the following:

#### Required Software
- **Node.js** 22.12.0 or higher
- **pnpm** 10.23.0 or higher  
- **Git** for version control
- **Rust** 1.70+ (for desktop app only)

#### System Requirements
- **RAM**: Minimum 4GB, recommended 8GB+
- **Storage**: Minimum 10GB free space
- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 20.04+

#### Optional Dependencies
- **Docker** 20.10+ (for containerized deployment)
- **PostgreSQL** 15+ (for local database)
- **Redis** 7+ (for caching)

### Installation Methods

Choose one of the following installation methods:

## 📦 Method 1: Standard Installation

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/adam-guerin/kair0s.git
cd kair0s

# Verify the repository
ls -la
```

### 2. Install Dependencies

```bash
# Install all dependencies
pnpm install

# Verify installation
pnpm --version
node --version
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
```

#### Environment Variables

```bash
# Application Configuration
NODE_ENV=development
PORT=5173
HOST=localhost

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/kair0s
REDIS_URL=redis://localhost:6379

# OpenClaw Configuration
OPENCLAW_API_URL=http://localhost:8080
OPENCLAW_API_KEY=your_openclaw_api_key

# Pluely Configuration  
PLUELY_API_URL=http://localhost:3000
PLUELY_API_KEY=your_pluely_api_key

# AI Provider Keys
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Security
JWT_SECRET=your-jwt-secret-key
API_SECRET=your-api-secret-key

# Optional: External Services
SENTRY_DSN=your-sentry-dsn
ANALYTICS_ID=your-analytics-id
```

### 4. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE kair0s;
CREATE USER kair0s_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE kair0s TO kair0s_user;
\q

# Run migrations
pnpm db:migrate
```

#### Option B: Docker Database
```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d db redis

# Wait for services to start
sleep 10

# Run migrations
pnpm db:migrate
```

### 5. Start Development Server

```bash
# Start the application
pnpm dev

# Or start specific services
pnpm dev:ui      # Web interface only
pnpm dev:api     # API server only
pnpm dev:gateway # OpenClaw gateway
```

### 6. Verify Installation

Open your browser and navigate to:
- **Web Interface**: http://localhost:5173
- **API Documentation**: http://localhost:5173/api/docs
- **Health Check**: http://localhost:5173/health

## 🐳 Method 2: Docker Installation

### 1. Using Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/adam-guerin/kair0s.git
cd kair0s

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Docker Compose Services

The default `docker-compose.yml` includes:

```yaml
version: '3.8'

services:
  # Main application
  kair0s:
    build: .
    ports:
      - "5173:5173"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://kair0s:password@db:5432/kair0s
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./uploads:/app/uploads

  # PostgreSQL database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=kair0s
      - POSTGRES_USER=kair0s
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  # Redis cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # OpenClaw Gateway (optional)
  openclaw:
    image: openclaw/gateway:latest
    ports:
      - "8080:8080"
    environment:
      - OPENCLAW_CONFIG=/app/config.json

  # Pluely Transcription (optional)
  pluely:
    image: pluely/transcription:latest
    ports:
      - "3000:3000"
    environment:
      - PLUELY_CONFIG=/app/config.json

volumes:
  postgres_data:
  redis_data:
```

## 🖥️ Method 3: Desktop Application

### 1. Install Rust

```bash
# Install Rust (macOS/Linux)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Install Rust (Windows)
# Download and run rustup-init.exe from https://rustup.rs/

# Verify installation
rustc --version
cargo --version
```

### 2. Install Tauri Dependencies

```bash
# Install Tauri CLI
cargo install tauri-cli

# Install frontend dependencies
pnpm install
```

### 3. Build Desktop App

```bash
# Development mode
pnpm tauri dev

# Build for production
pnpm tauri build

# Build for specific platform
pnpm tauri build --target x86_64-pc-windows-msvc  # Windows
pnpm tauri build --target x86_64-apple-darwin       # macOS
pnpm tauri build --target x86_64-unknown-linux-gnu # Linux
```

### 4. Desktop App Configuration

Edit `src-tauri/tauri.conf.json`:

```json
{
  "build": {
    "beforeBuildCommand": "pnpm build",
    "beforeDevCommand": "pnpm dev:ui",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Kair0s",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "all": true
      },
      "shell": {
        "all": false,
        "open": true
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.kair0s.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    }
  }
}
```

## 🌐 Method 4: Cloud Deployment

### 1. Vercel (Web UI)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
```

### 2. AWS ECS (Full Stack)

```bash
# Build and push Docker image
docker build -t kair0s:latest .
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag kair0s:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/kair0s:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/kair0s:latest

# Deploy with ECS
aws ecs create-cluster --cluster-name kair0s
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster kair0s --service-name kair0s-service --task-definition kair0s:1 --desired-count 2
```

### 3. Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/kair0s
gcloud run deploy kair0s --image gcr.io/PROJECT-ID/kair0s --platform managed

# Configure environment variables
gcloud run services update kair0s --set-env-vars NODE_ENV=production
```

## ✅ Verification Steps

After installation, verify everything is working:

### 1. Health Checks

```bash
# Check API health
curl http://localhost:5173/health

# Expected response
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "redis": "connected",
    "openclaw": "connected",
    "pluely": "connected"
  },
  "timestamp": "2024-02-25T12:00:00Z"
}
```

### 2. API Tests

```bash
# Test chat endpoint
curl -X POST http://localhost:5173/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"message": "Hello, world!", "provider": "openai"}'

# Test transcription endpoint
curl -X POST http://localhost:5173/api/transcription \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "audio=@test.wav"
```

### 3. Frontend Tests

```bash
# Run UI tests
pnpm test:ui

# Run E2E tests
pnpm test:e2e

# Check browser console for errors
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port 5173
lsof -i :5173

# Kill process
kill -9 <PID>

# Or use different port
PORT=5174 pnpm dev
```

#### 2. Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -h localhost -U kair0s_user -d kair0s
```

#### 3. Redis Connection Failed
```bash
# Check Redis status
redis-cli ping

# Restart Redis
sudo systemctl restart redis

# Check Redis logs
sudo journalctl -u redis
```

#### 4. API Key Issues
```bash
# Verify API keys
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# Test API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

#### 5. Build Errors
```bash
# Clear cache
pnpm clean

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check TypeScript errors
pnpm type-check
```

### Performance Issues

#### 1. Slow Startup
```bash
# Check system resources
top
htop

# Optimize startup
pnpm dev:fast  # Skip some checks
```

#### 2. Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm dev

# Monitor memory usage
node --inspect src/main.tsx
```

### Network Issues

#### 1. CORS Errors
```bash
# Check CORS configuration
# Add your frontend URL to CORS origins
```

#### 2. SSL/TLS Issues
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Use HTTPS in development
HTTPS=true pnpm dev
```

## 📚 Next Steps

After successful installation:

1. **[Quick Start Guide](./quick-start.md)** - Get familiar with basic features
2. **[User Guide](./user-guide/ui.md)** - Learn the interface
3. **[API Documentation](./api.md)** - Explore API capabilities
4. **[Development Guide](./development/setup.md)** - Start contributing

## 🆘 Getting Help

If you encounter issues during installation:

- **GitHub Issues**: [Report problems](https://github.com/adam-guerin/kair0s/issues)
- **Discord Community**: [Join our server](https://discord.gg/kair0s)
- **Email Support**: support@kair0s.com
- **Documentation**: [docs.kair0s.com](https://docs.kair0s.com)

---

**Last updated: February 25, 2024**
