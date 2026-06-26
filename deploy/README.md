# ITZALAN TECH Production Deployment Package

This directory contains all necessary files and scripts for deploying ITZALAN TECH to production on a Ubuntu/Debian VPS with Node.js 22, PostgreSQL 16 + pgvector, Nginx, PM2, and Certbot.

## 📦 Contents

### 🚀 Deployment Scripts

1. **`setup.sh`** - Automated system setup (MOST IMPORTANT)
   - Installs Node.js 22, PostgreSQL 16, pgvector, PM2, Nginx, Certbot
   - Creates application user and database
   - Estimated time: 10 minutes
   - Usage: `sudo bash deploy/setup.sh`

2. **`deploy.sh`** - Application deployment script
   - Pulls latest code, installs dependencies, builds, runs migrations
   - Deploys with zero-downtime reload
   - Usage: `sudo bash deploy/deploy.sh [repo-url] [branch]`

3. **`setup-ssl.sh`** - SSL certificate setup with Certbot
   - Obtains Let's Encrypt certificate
   - Configures Nginx for HTTPS
   - Sets up auto-renewal
   - Usage: `sudo bash deploy/setup-ssl.sh yourdomain.com`

### 📋 Configuration Files

1. **`ecosystem.config.prod.js`** - PM2 production configuration
   - Manages API (NestJS) and Web (Next.js) processes
   - Auto-restart, logging, cluster mode
   - Copy to app root: `cp ecosystem.config.prod.js /home/itzalan/app/`

2. **`docker-compose.yml`** - Optional Docker deployment
   - For containerized deployment alternative
   - Includes PostgreSQL with pgvector

### 📚 Documentation

1. **`PRODUCTION-DEPLOYMENT-QUICKSTART.md`** (in root)
   - **START HERE** - 5-step quick start guide
   - Expected time: 30 minutes
   - Best for first-time deployment

2. **`docs/DEPLOYMENT-PRODUCTION.md`** - Full deployment guide
   - Comprehensive step-by-step instructions
   - Manual setup alternatives
   - Troubleshooting section
   - Performance optimization tips

3. **`docs/PRODUCTION-QUICK-REFERENCE.md`** - Quick reference card
   - Common commands and operations
   - Monitoring and logging
   - Database management
   - Emergency procedures

4. **`docs/PRODUCTION-READINESS-CHECKLIST.md`** - Pre-deployment checklist
   - Pre-deployment validation
   - Code quality checks
   - Security verification
   - Post-deployment verification

## 🎯 Quick Start

1. **Read**: `PRODUCTION-DEPLOYMENT-QUICKSTART.md` (in workspace root)

2. **Execute Setup**:
   ```bash
   sudo bash deploy/setup.sh
   ```

3. **Deploy Application**:
   ```bash
   sudo bash deploy/deploy.sh https://github.com/yourorg/itzalan-tech.git main
   ```

4. **Setup SSL**:
   ```bash
   sudo bash deploy/setup-ssl.sh yourdomain.com admin@yourdomain.com
   ```

5. **Verify**:
   ```bash
   pm2 list
   curl https://yourdomain.com
   ```

## 📋 Pre-Deployment Checklist

Before running scripts:

- [ ] Ubuntu/Debian VPS with root access
- [ ] Domain name configured to point to VPS IP
- [ ] OpenAI API key ready (for embeddings)
- [ ] Sufficient storage (10GB+ recommended)
- [ ] Latest git clone of repository
- [ ] `.env.example` reviewed and understood

## 🔧 System Requirements

- **OS**: Ubuntu 20.04 LTS or newer / Debian 11+
- **RAM**: 2GB minimum (4GB+ recommended)
- **Storage**: 10GB+ free space
- **CPU**: 2+ cores
- **Network**: Public IP or domain access

## 📦 What Gets Installed

### Software
- Node.js 22 LTS
- npm 10.x
- PostgreSQL 16
- pgvector v0.7.4
- PM2 (process manager)
- Nginx
- Certbot
- Git

### Services
- PostgreSQL (port 5432)
- Nginx (ports 80, 443)
- Node.js API (port 3001, internal)
- Next.js Web (port 3000, internal)

### Users
- `itzalan` (application user)

### Directories
- `/home/itzalan/app` - application root
- `/home/itzalan/app/logs` - application logs
- `/home/itzalan/backups` - database backups (optional)

## 🚀 Deployment Flow

```
VPS Setup
    ↓
git clone repository
    ↓
npm install → build
    ↓
Database migrations
    ↓
PM2 start
    ↓
Nginx → Reverse proxy to ports 3000, 3001
    ↓
Certbot → SSL certificate
    ↓
HTTP → HTTPS redirect
    ↓
✅ Production Live
```

## 📊 Environment Variables

**Critical (Must Set)**:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - For vector embeddings
- `JWT_SECRET` - Authentication secret
- `CORS_ORIGIN` - Your domain

**Optional (Recommended)**:
- `LOG_LEVEL` - info, debug, warn, error
- `MAX_FILE_SIZE` - Upload limit
- `DATABASE_POOL_MIN/MAX` - Connection pool

See `.env.example` for complete list.

## 🔒 Security

Important:
- Keep `.env` secret (never commit to git)
- Use strong database passwords (25+ characters)
- Generate JWT secret with: `openssl rand -base64 32`
- Enable SSL/HTTPS (Certbot handles this)
- Configure firewall (allow only 80, 443, SSH)
- Restrict SSH access (keys only, no passwords)
- Regular backups (automated via cron)
- Monitor logs for errors

## 📝 Deployment Checklist

Use `PRODUCTION-READINESS-CHECKLIST.md` to verify:
- [ ] Code quality & tests
- [ ] Environment configuration
- [ ] Database setup
- [ ] Server infrastructure
- [ ] Nginx configuration
- [ ] SSL/HTTPS
- [ ] Security
- [ ] Monitoring & logging
- [ ] Backup & recovery

## 🔄 Common Operations

**Deploy Updates**:
```bash
cd /home/itzalan/app && git pull && npm install && npm run build && npm run db:migrate && pm2 reload ecosystem.config.prod.js
```

**View Logs**:
```bash
pm2 logs itzalan-api
```

**Restart Services**:
```bash
pm2 restart ecosystem.config.prod.js
```

**Database Backup**:
```bash
sudo -u postgres pg_dump itzalan_db | gzip > backup_$(date +%s).sql.gz
```

**Check Status**:
```bash
pm2 monit
```

See `PRODUCTION-QUICK-REFERENCE.md` for more commands.

## 🆘 Troubleshooting

**Application won't start**:
```bash
pm2 logs itzalan-api
```

**Database connection error**:
```bash
psql postgresql://itzalan:PASSWORD@localhost:5432/itzalan_db
```

**Vector search not working**:
```bash
psql itzalan_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

**Nginx not forwarding**:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Port already in use**:
```bash
sudo lsof -i :3001
sudo kill -9 <PID>
```

See `DEPLOYMENT-PRODUCTION.md` for comprehensive troubleshooting.

## 📞 File Usage Summary

| Need | File | Time | Command |
|------|------|------|---------|
| Quick start | `PRODUCTION-DEPLOYMENT-QUICKSTART.md` | 5 min read | Start here |
| Automated setup | `deploy/setup.sh` | 10 min run | `sudo bash deploy/setup.sh` |
| Deploy app | `deploy/deploy.sh` | 5 min run | `sudo bash deploy/deploy.sh` |
| SSL setup | `deploy/setup-ssl.sh` | 3 min run | `sudo bash setup-ssl.sh domain` |
| Full guide | `docs/DEPLOYMENT-PRODUCTION.md` | 20 min read | Reference |
| Quick commands | `docs/PRODUCTION-QUICK-REFERENCE.md` | 10 min read | Operations |
| Validation | `docs/PRODUCTION-READINESS-CHECKLIST.md` | 30 min check | Pre-deploy |

## ✅ Deployment Success Criteria

After deployment, verify:
- [ ] API responding: `curl https://yourdomain.com/api/status`
- [ ] Web loading: Visit https://yourdomain.com
- [ ] SSL valid: Green lock in browser
- [ ] Processes running: `pm2 list` shows green
- [ ] Database connected: `psql itzalan_db`
- [ ] Embeddings working: Vector search functional
- [ ] Logs clean: `pm2 logs` shows no errors

## 🔗 Related Resources

- **NestJS Docs**: https://docs.nestjs.com/
- **Next.js Docs**: https://nextjs.org/docs
- **TypeORM Docs**: https://typeorm.io/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **pgvector Docs**: https://github.com/pgvector/pgvector
- **PM2 Docs**: https://pm2.keymetrics.io/
- **Nginx Docs**: https://nginx.org/en/docs/
- **Certbot Docs**: https://certbot.eff.org/docs/

## 📞 Support

For issues:
1. Check logs: `pm2 logs`
2. Review guide: `docs/DEPLOYMENT-PRODUCTION.md`
3. Check checklist: `docs/PRODUCTION-READINESS-CHECKLIST.md`
4. See quick reference: `docs/PRODUCTION-QUICK-REFERENCE.md`

---

**Version**: 1.0  
**Last Updated**: 2024-06-25  
**Status**: ✅ Production Ready

**Next Step**: Read `PRODUCTION-DEPLOYMENT-QUICKSTART.md` in the workspace root
