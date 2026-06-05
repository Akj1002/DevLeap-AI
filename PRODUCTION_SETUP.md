# 🚀 Production Deployment Guide

## Overview
This guide covers production deployment of DevLeap AI using Docker, environment configuration, and security best practices.

---

## 📋 Prerequisites

- **Docker** & **Docker Compose** (v1.29+)
- **Node.js** (v18+) - for development
- **MongoDB Atlas** account (or self-hosted MongoDB)
- **Redis** (for caching)
- **SSL Certificate** (for HTTPS in production)

---

## 🔧 Environment Setup

### 1. Configure Environment Variables

Create `.env` file in the root directory:

```bash
# Copy from example
cp backend/.env.example backend/.env

# Edit with your values
nano backend/.env
```

**Required Variables:**
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `GEMINI_API_KEY` - Google Generative AI key
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `EMAIL_USER` & `EMAIL_PASS` - Gmail with app password

### 2. MongoDB Setup

**Option A: MongoDB Atlas (Recommended)**
```
mongodb+srv://username:password@cluster.mongodb.net/devleap_db
```

**Option B: Self-Hosted**
```
mongodb://username:password@localhost:27017/devleap_db
```

### 3. Redis Configuration

For Docker Compose, Redis is auto-configured. For external Redis:

```bash
REDIS_URL=redis://host:port
```

---

## 🐳 Docker Deployment

### Build & Run with Docker Compose

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Verify Services

```bash
# Backend health
curl http://localhost:5000/health

# Frontend health
curl http://localhost/health
```

---

## 🔐 Security Checklist

- [x] HTTPS/SSL certificates configured
- [x] Environment variables secured (never commit .env)
- [x] JWT secret is strong and random
- [x] CORS whitelist configured for your domain
- [x] Rate limiting enabled
- [x] Input validation & sanitization
- [x] Security headers (Helmet) enabled
- [x] Database backups scheduled
- [x] Error logging configured
- [x] Non-root Docker users

### SSL Certificate Setup

Generate self-signed certificate for development:

```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -nodes -out ssl/cert.pem -keyout ssl/key.pem -days 365
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoints

```bash
# Backend health
GET /health

# Backend metrics
GET /metrics

# Frontend health
GET /health
```

### Log Locations

- Backend logs: `./backend/logs/`
- Docker logs: `docker-compose logs -f`

---

## 🔄 Database Migrations

### Seed Data

```bash
docker-compose exec backend npm run seed
```

### Database Backup

```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /backup

# Restore MongoDB
docker-compose exec mongodb mongorestore /backup
```

---

## 📈 Scaling & Performance

### Horizontal Scaling

```yaml
# In docker-compose.yml, increase replicas
services:
  backend:
    deploy:
      replicas: 3
```

### Caching Strategy

- Redis cache TTLs configured in `constants.js`
- Cache invalidation on data updates
- Session storage for authenticated users

---

## 🚨 Troubleshooting

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Verify MongoDB connection
docker-compose exec backend node -e "require('mongoose').connect(process.env.MONGO_URI)"

# Check environment variables
docker-compose exec backend env | grep MONGO
```

### Frontend Not Loading

```bash
# Rebuild images
docker-compose build --no-cache

# Check nginx configuration
docker-compose logs frontend
```

### Database Connection Issues

```bash
# Verify MongoDB is running
docker-compose ps

# Test connection
docker-compose exec backend npm run test:db
```

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and push Docker images
        run: docker-compose build && docker push ${{ secrets.REGISTRY }}/devleap
      - name: Deploy to server
        run: ssh ${{ secrets.SERVER }} "cd /app && docker-compose pull && docker-compose up -d"
```

---

## 📱 PWA Setup (Optional)

```bash
# Install serve for testing
npm install -g serve

# Test build locally
npm run build && serve -s build
```

---

## 🔄 Backup & Disaster Recovery

### Daily Backup Schedule

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mongodb \
  mongodump --uri="$MONGO_URI" --out=/backup/$DATE
```

### Restore from Backup

```bash
docker-compose exec mongodb mongorestore /backup/20240524_000000/
```

---

## 📞 Support & Resources

- **GitHub Issues**: Report bugs
- **Documentation**: Check README.md
- **API Docs**: Visit `/api/docs` (Swagger)
- **Logs**: Check `./backend/logs/`

---

## ✅ Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring & alerting setup
- [ ] Error tracking (Sentry/similar) configured
- [ ] Rate limiting tested
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

**Last Updated**: May 24, 2024
**Version**: 1.0.0
