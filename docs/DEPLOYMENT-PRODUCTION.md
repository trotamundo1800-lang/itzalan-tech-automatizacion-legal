# ITZALAN TECH - Production Deployment Guide

## Overview

This guide covers deploying ITZALAN TECH to a production Ubuntu/Debian VPS with:
- **Node.js 22** (LTS)
- **PostgreSQL 16** with pgvector extension
- **Nginx** reverse proxy
- **PM2** process manager
- **Certbot** for SSL/TLS (Let's Encrypt)

## Prerequisites

- ✅ Ubuntu 20.04 LTS or newer (or Debian 11+)
- ✅ Root or sudo access
- ✅ Minimum 2GB RAM, 10GB storage recommended
- ✅ Domain name (for SSL setup)
- ✅ OpenAI API key (for vector embeddings)

## Quick Start (Automated Setup)

### 1. Initial Server Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Download setup script
curl -O https://raw.githubusercontent.com/yourorg/itzalan-tech/main/deploy/setup.sh
chmod +x setup.sh

# Run automated setup
./setup.sh
```

This script will:
- ✓ Update system packages
- ✓ Install Node.js 22
- ✓ Install PostgreSQL 16
- ✓ Build and install pgvector
- ✓ Create application user (`itzalan`)
- ✓ Install PM2
- ✓ Install Nginx
- ✓ Create templates for configuration

**Output:** Database credentials saved to `/tmp/db_credentials.txt`

### 2. Clone Repository

```bash
# As root or sudo user
sudo -u itzalan git clone https://github.com/yourorg/itzalan-tech.git /home/itzalan/app
cd /home/itzalan/app
```

### 3. Configure Environment Variables

```bash
# Copy example and edit
sudo -u itzalan cp .env.example .env
sudo -u itzalan nano .env
```

**Essential variables to set:**
```bash
# Database (from setup script output)
DATABASE_URL=postgresql://itzalan:PASSWORD@localhost:5432/itzalan_db

# OpenAI API
OPENAI_API_KEY=sk-...

# JWT Secret (generate new)
JWT_SECRET=$(openssl rand -base64 32)

# Your domain
CORS_ORIGIN=https://yourdomain.com
```

### 4. Build and Deploy Application

```bash
# Install dependencies
sudo -u itzalan npm install

# Build production bundle
sudo -u itzalan npm run build

# Run database migrations
sudo -u itzalan npm run db:migrate

# Copy PM2 configuration
cp deploy/ecosystem.config.prod.js ecosystem.config.prod.js

# Start with PM2
sudo -u itzalan pm2 start ecosystem.config.prod.js
sudo -u itzalan pm2 save
```

### 5. Configure Nginx

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/itzalan

# Paste the following (replace YOURDOMAIN.COM):
```

```nginx
upstream itzalan_api {
    server 127.0.0.1:3001;
    keepalive 64;
}

upstream itzalan_web {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name YOURDOMAIN.COM;
    
    client_max_body_size 50M;

    # API Proxy
    location /api/ {
        proxy_pass http://itzalan_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # Health check
    location /health {
        proxy_pass http://itzalan_api/health;
        access_log off;
    }

    # Web Proxy
    location / {
        proxy_pass http://itzalan_web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/itzalan /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Setup SSL with Certbot

```bash
# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal check
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Manual Setup (Step by Step)

If you prefer to manually configure instead of using the automated script:

### Install Node.js 22

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify
node -v  # v22.x.x
npm -v   # 10.x.x
```

### Install PostgreSQL with pgvector

```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Update and install
sudo apt-get update
sudo apt-get install -y postgresql-16 postgresql-contrib-16 postgresql-16-dev

# Start PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Build pgvector
cd /tmp
git clone --branch v0.7.4 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Create database and user
sudo -u postgres psql << EOF
CREATE USER itzalan WITH PASSWORD 'YOUR_SECURE_PASSWORD';
ALTER ROLE itzalan CREATEDB;
CREATE DATABASE itzalan_db OWNER itzalan;
\c itzalan_db
CREATE EXTENSION vector;
EOF
```

### Create Application User

```bash
# Create user
sudo useradd -m -s /bin/bash itzalan

# Create directories
sudo mkdir -p /home/itzalan/app /home/itzalan/app/logs /home/itzalan/app/uploads
sudo chown -R itzalan:itzalan /home/itzalan/app
```

### Install PM2

```bash
sudo npm install -g pm2

# Setup PM2 startup
sudo pm2 startup systemd -u itzalan --hp /home/itzalan

# Install logrotate
sudo pm2 install pm2-logrotate
```

## Application Deployment

### First Deployment

```bash
# Clone repository
sudo -u itzalan git clone https://github.com/yourorg/itzalan-tech.git /home/itzalan/app
cd /home/itzalan/app

# Configure environment
sudo -u itzalan cp .env.example .env
sudo -u itzalan nano .env  # Edit with your values

# Install and build
sudo -u itzalan npm install
sudo -u itzalan npm run build

# Run migrations
sudo -u itzalan npm run db:migrate

# Start with PM2
sudo -u itzalan pm2 start ecosystem.config.prod.js
sudo -u itzalan pm2 save
```

### Subsequent Deployments

Use the automated deploy script:

```bash
# Deploy latest version from main branch
sudo bash /home/itzalan/app/deploy/deploy.sh https://github.com/yourorg/itzalan-tech.git main

# Or specify a different branch/tag
sudo bash /home/itzalan/app/deploy/deploy.sh https://github.com/yourorg/itzalan-tech.git v1.0.0
```

This script will:
- ✓ Stop current application
- ✓ Pull latest code
- ✓ Install dependencies
- ✓ Build application
- ✓ Run migrations
- ✓ Start with PM2
- ✓ Health check

## Database Initialization

### First Time Setup

```bash
# Run all pending migrations
npm run db:migrate

# Or if using TypeORM CLI
npx typeorm migration:run -d dist/database.config.js
```

### Verify pgvector Extension

```bash
# Connect to database
sudo -u postgres psql itzalan_db

# Check vector extension
\dx vector

# Should show: vector | public | extension

# Check schema
\d biblioteca_chunks

# Should have embedding_vector column
```

## Monitoring & Maintenance

### View Application Status

```bash
# Real-time monitoring
pm2 monit

# Process list
pm2 list

# Detailed info
pm2 info itzalan-api
pm2 info itzalan-web
```

### View Logs

```bash
# Combined logs
pm2 logs

# API logs only
pm2 logs itzalan-api

# Last 100 lines
pm2 logs --lines 100

# Real-time watch
pm2 logs --lines 0

# Save logs to file
pm2 logs > logs_backup.txt
```

### Common Commands

```bash
# Stop application
pm2 stop ecosystem.config.prod.js

# Restart application
pm2 restart ecosystem.config.prod.js

# Reload without downtime (graceful)
pm2 reload ecosystem.config.prod.js

# Delete from PM2 list
pm2 delete ecosystem.config.prod.js

# View metrics
pm2 monit
```

### Backup Database

```bash
#!/bin/bash
# Save as backup.sh

BACKUP_DIR="/home/itzalan/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="itzalan_db"

mkdir -p $BACKUP_DIR

# Backup database
sudo -u postgres pg_dump $DB_NAME | gzip > $BACKUP_DIR/itzalan_$DATE.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "itzalan_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/itzalan_$DATE.sql.gz"
```

```bash
# Add to crontab for daily backups
sudo crontab -e

# Add line:
# 2 3 * * * /home/itzalan/backup.sh
```

## Troubleshooting

### Port 3001 Already in Use

```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill the process
sudo kill -9 <PID>

# Or use PM2 to stop gracefully
pm2 stop all
```

### Database Connection Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string in .env
# Format: postgresql://user:password@host:port/database

# Test connection
psql postgresql://itzalan:PASSWORD@localhost:5432/itzalan_db

# Check pgvector extension
\dx vector
```

### Nginx Configuration Error

```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Check if port 80/443 is in use
sudo lsof -i :80
sudo lsof -i :443
```

### Memory Usage Too High

```bash
# Check PM2 instances
pm2 monit

# Reduce cluster instances (edit ecosystem.config.prod.js)
instances: 2  # Change from 'max'

# Reload
pm2 reload ecosystem.config.prod.js
```

### pgvector Extension Not Found

```bash
# Reinstall pgvector
cd /tmp
git clone --branch v0.7.4 https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install

# Create extension in database
sudo -u postgres psql itzalan_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

## Performance Optimization

### PostgreSQL Tuning

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/16/main/postgresql.conf

# Recommendations for 2GB RAM server:
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 256MB
work_mem = 32MB
random_page_cost = 1.1
```

### Nginx Caching

```nginx
# Add to nginx config for static files
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/biblioteca/search {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_pass http://itzalan_api;
}
```

### Vector Search Optimization

```sql
-- Analyze query plans
EXPLAIN ANALYZE 
SELECT * FROM biblioteca_chunks 
WHERE embedding_vector <-> '[...]' LIMIT 10;

-- Reindex if needed
REINDEX INDEX idx_embedding_vector;
```

## Production Checklist

- [ ] SSL certificate installed (HTTPS)
- [ ] Database backups configured (daily)
- [ ] Nginx properly configured with security headers
- [ ] PM2 set to auto-start on reboot
- [ ] Environment variables securely configured
- [ ] API key rate limiting configured
- [ ] CORS properly restricted to your domain
- [ ] Log rotation enabled
- [ ] Monitoring alerts configured
- [ ] Database connection pooling optimized
- [ ] Firewall configured to allow only necessary ports
- [ ] SSH key authentication enabled, password disabled

## Support & Resources

- **Docs**: [DEPLOYMENT.md](../docs/DEPLOYMENT.md)
- **Logs**: `pm2 logs`
- **Status**: `pm2 list`
- **PostgreSQL**: `psql -U itzalan -d itzalan_db`
- **Node.js**: https://nodejs.org/en/docs/
- **TypeORM**: https://typeorm.io/
- **NestJS**: https://docs.nestjs.com/

## Version Information

- Node.js: 22 LTS
- PostgreSQL: 16
- pgvector: 0.7.4
- PM2: Latest
- Nginx: Latest
- TypeORM: Latest (from package.json)
- NestJS: Latest (from package.json)
