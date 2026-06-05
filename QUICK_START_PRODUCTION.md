# 🚀 Quick Start Guide - Production Deployment

## 5-Minute Setup

### Prerequisites
```bash
✓ Docker & Docker Compose installed
✓ Git repository cloned
✓ MongoDB Atlas account (or self-hosted)
✓ Basic environment variables
```

### Step 1: Configure Environment (2 minutes)

```bash
cd backend
cp .env.example .env
nano .env  # Edit with your credentials
```

**Required Variables:**
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/devleap_db
JWT_SECRET=your-generated-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-secret
GEMINI_API_KEY=your-gemini-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Step 2: Start Services (2 minutes)

```bash
cd ..  # Go to root directory
docker-compose up -d
```

### Step 3: Verify Deployment (1 minute)

```bash
# Check services
docker-compose ps

# Check health
curl http://localhost:5000/health
curl http://localhost/health

# View logs
docker-compose logs backend
```

### ✅ You're Done!
- **Frontend**: http://localhost
- **API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/docs

---

## 🌱 Initialize Database

```bash
# Seed initial data
docker-compose exec backend npm run seed

# Check MongoDB
docker-compose exec mongodb mongosh -u devleap -p
```

---

## 📊 Common Commands

### Start/Stop
```bash
docker-compose up -d      # Start
docker-compose down        # Stop
docker-compose restart     # Restart
docker-compose pull        # Update images
```

### Logs
```bash
docker-compose logs backend         # Backend logs
docker-compose logs frontend        # Frontend logs
docker-compose logs -f backend      # Follow logs
docker-compose logs --tail=100      # Last 100 lines
```

### Database
```bash
docker-compose exec backend npm run seed              # Seed data
docker-compose exec mongodb mongodump --out /backup  # Backup
docker-compose exec mongodb mongorestore /backup     # Restore
```

### Troubleshooting
```bash
docker-compose down -v          # Remove all volumes
docker-compose build --no-cache # Rebuild images
docker-compose up --force-recreate  # Force recreate
```

---

## 🔐 Security Checklist

Before going to production:

- [ ] Update `.env` with production values
- [ ] Generate new JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Configure SSL certificates in `ssl/` directory
- [ ] Update CORS origins for your domain
- [ ] Set `NODE_ENV=production`
- [ ] Configure database backups
- [ ] Set up monitoring/logging

---

## 📈 Performance Tips

### Optimize Database Queries
```bash
# Monitor slow queries
docker-compose exec mongodb mongosh
> db.setProfilingLevel(1, { slowms: 100 })
```

### Check Cache
```bash
# Monitor Redis
docker-compose exec redis redis-cli
> MONITOR
> INFO stats
```

### View Metrics
```bash
curl http://localhost:5000/metrics
```

---

## 🆘 Troubleshooting

### Backend Won't Start
```bash
# Check logs
docker-compose logs backend

# Verify MongoDB
docker-compose exec backend curl http://mongodb:27017

# Restart
docker-compose restart backend
```

### Frontend Not Loading
```bash
# Check nginx
docker-compose logs frontend

# Rebuild
docker-compose build frontend --no-cache
docker-compose up frontend
```

### Database Connection Failed
```bash
# Verify MongoDB is running
docker-compose ps mongodb

# Check credentials
docker-compose exec mongodb mongosh -u devleap -p

# Reset database
docker-compose down -v
docker-compose up -d mongodb
```

---

## 📚 Further Reading

- [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) - Detailed production guide
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - All enhancements made
- [README.md](./README.md) - Project overview
- [API Docs](http://localhost:5000/api/docs) - Interactive API documentation

---

## 💡 Pro Tips

1. **Use environment variables** - Never hardcode secrets
2. **Monitor logs** - Set up log aggregation for production
3. **Regular backups** - Automate daily database backups
4. **Health checks** - Monitor `/health` endpoint
5. **Rate limiting** - Configured per endpoint
6. **Caching** - Redis enabled for performance
7. **Error tracking** - Ready for Sentry integration
8. **Scaling** - Ready for horizontal scaling

---

## 📞 Need Help?

Check the troubleshooting section in PRODUCTION_SETUP.md or review the logs:

```bash
# Real-time logs
docker-compose logs -f backend

# Search logs
docker-compose logs backend | grep ERROR
```

---

**Ready to deploy? You're all set!** 🎉
