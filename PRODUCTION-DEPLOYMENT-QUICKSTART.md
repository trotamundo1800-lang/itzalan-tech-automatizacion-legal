# ITZALAN TECH - Production Deployment Quick Start

## 📋 Overview

This guide provides the fastest path to deploy ITZALAN TECH to a production Ubuntu/Debian VPS.

**Tech Stack**: Node.js 22 | PostgreSQL 16 + pgvector | Nginx | PM2 | Certbot

**Time Required**: ~30 minutes for full setup

---

## 🚀 Step 1: Prepare VPS (5 minutes)

SSH into your VPS as root:
```bash
ssh root@your-vps-ip
```

Update system:
```bash
apt-get update && apt-get upgrade -y
```

---

## 🔧 Step 2: Automated System Setup (10 minutes)

Download and run setup script:
```bash
cd /tmp
wget https://raw.githubusercontent.com/yourorg/itzalan-tech/main/deploy/setup.sh
chmod +x setup.sh
sudo ./setup.sh
```

**What this installs**:
- ✓ Node.js 22
- ✓ PostgreSQL 16
- ✓ pgvector extension
- ✓ PM2 process manager
- ✓ Nginx web server
- ✓ Certbot for SSL

**Output**: Database credentials saved to `/tmp/db_credentials.txt`

---

## 📁 Step 3: Clone & Configure Application (5 minutes)

Clone repository:
```bash
sudo -u itzalan git clone https://github.com/yourorg/itzalan-tech.git /home/itzalan/app
cd /home/itzalan/app
```

Create environment configuration:
```bash
sudo -u itzalan cp .env.example .env
sudo -u itzalan nano .env
```

**Set these critical variables**:
```env
# Database (from setup.sh output)
DATABASE_URL=postgresql://itzalan:YOUR_PASSWORD@localhost:5432/itzalan_db

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-key-here

# Your domain
CORS_ORIGIN=https://yourdomain.com

# Generate secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)
```

---

## 🔨 Step 4: Build & Deploy (7 minutes)

Build application:
```bash
cd /home/itzalan/app
sudo -u itzalan npm install
sudo -u itzalan npm run build
```

Run database migrations:
```bash
sudo -u itzalan npm run db:migrate
```

Start application with PM2:
```bash
sudo -u itzalan pm2 start ecosystem.config.prod.js
sudo -u itzalan pm2 save
```

**Verify it's running**:
```bash
pm2 list
pm2 logs
```

---

## 🌐 Step 5: Setup Nginx & SSL (3 minutes)

Make SSL setup script executable:
```bash
chmod +x /home/itzalan/app/deploy/setup-ssl.sh
```

Run SSL setup:
```bash
sudo bash /home/itzalan/app/deploy/setup-ssl.sh yourdomain.com admin@yourdomain.com
```

**What happens**:
- ✓ Nginx configured for your domain
- ✓ SSL certificate obtained from Let's Encrypt
- ✓ Auto-renewal configured
- ✓ HTTP → HTTPS redirect enabled
- ✓ Security headers added

---

## ✅ Step 6: Verify Everything Works

Test API:
```bash
curl https://yourdomain.com/api/status
```

Test Web:
```bash
curl -I https://yourdomain.com
```

Check processes:
```bash
pm2 list
pm2 monit
```

View logs:
```bash
pm2 logs
```

---

## 🎯 Your Application is Live!

Access it at:
- **Web**: https://yourdomain.com
- **API**: https://yourdomain.com/api

---

## 📊 Common Operations

### Deploy Updates
```bash
cd /home/itzalan/app
sudo -u itzalan git pull
sudo -u itzalan npm install
sudo -u itzalan npm run build
sudo -u itzalan npm run db:migrate
sudo -u itzalan pm2 reload ecosystem.config.prod.js
```

### View Logs
```bash
# All logs
pm2 logs

# API logs
pm2 logs itzalan-api

# Last 100 lines
pm2 logs --lines 100
```

### Restart Services
```bash
# Restart app
pm2 restart ecosystem.config.prod.js

# Graceful reload (no downtime)
pm2 reload ecosystem.config.prod.js

# Stop app
pm2 stop ecosystem.config.prod.js
```

### Database Operations
```bash
# Connect to database
psql postgresql://itzalan:PASSWORD@localhost:5432/itzalan_db

# Backup database
sudo -u postgres pg_dump itzalan_db | gzip > backup_$(date +%s).sql.gz

# Check vector search is working
SELECT COUNT(*) FROM biblioteca_chunks WHERE embedding_vector IS NOT NULL;
```

### Monitor System
```bash
# Real-time monitoring
pm2 monit

# Process status
pm2 list

# System resources
free -h
df -h
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3001 already in use | `sudo lsof -i :3001` then `sudo kill -9 <PID>` |
| Database connection error | Check `.env` `DATABASE_URL` is correct |
| SSL certificate error | `sudo certbot certificates` to verify |
| Application won't start | `pm2 logs itzalan-api` to see error |
| Vector search not working | Verify pgvector: `psql itzalan_db -c "\dx vector"` |
| Out of disk space | `df -h` to check, then `sudo apt-get clean` |

---

## 📚 Full Documentation

For detailed information, see:
- **Full Setup Guide**: [docs/DEPLOYMENT-PRODUCTION.md](../docs/DEPLOYMENT-PRODUCTION.md)
- **Quick Reference**: [docs/PRODUCTION-QUICK-REFERENCE.md](../docs/PRODUCTION-QUICK-REFERENCE.md)
- **Readiness Checklist**: [docs/PRODUCTION-READINESS-CHECKLIST.md](../docs/PRODUCTION-READINESS-CHECKLIST.md)
- **API Documentation**: [docs/api.md](../docs/api.md)

---

## 🔐 Important Security Notes

1. **Never commit `.env`** - Keep API keys secret
2. **Use strong passwords** - PostgreSQL and JWT secrets
3. **Enable HTTPS** - SSL certificate required for production
4. **Backup regularly** - Automate daily database backups
5. **Monitor logs** - Watch for errors and security issues
6. **Keep updated** - Run `npm audit` and update dependencies
7. **Firewall** - Restrict SSH access, only expose ports 80/443

---

## 🆘 Getting Help

If you encounter issues:

1. **Check logs**: `pm2 logs` (application) or `sudo tail -f /var/log/nginx/error.log` (Nginx)
2. **Review status**: `pm2 list` and `systemctl status postgresql`
3. **Test connectivity**: `curl http://localhost:3001/health`
4. **See detailed guide**: [docs/DEPLOYMENT-PRODUCTION.md](../docs/DEPLOYMENT-PRODUCTION.md)
5. **Contact DevOps**: [your-contact-info]

---

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: Report via GitHub Issues
- **Security**: security@itzalan.com

---

**Deployment Version**: v1.0  
**Last Updated**: 2024-06-25  
**Status**: ✅ Production Ready
