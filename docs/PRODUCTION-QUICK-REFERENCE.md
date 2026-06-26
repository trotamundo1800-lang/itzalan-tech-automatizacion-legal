# ITZALAN TECH - Production Quick Reference

## 🚀 Initial Setup (First Time Only)

```bash
# 1. Automated system setup (Node.js, PostgreSQL, pgvector, PM2, Nginx)
sudo bash /path/to/deploy/setup.sh

# 2. Clone repository
sudo -u itzalan git clone https://github.com/yourorg/itzalan-tech.git /home/itzalan/app

# 3. Setup environment
cd /home/itzalan/app
sudo -u itzalan cp .env.example .env
sudo -u itzalan nano .env  # Edit with your values

# 4. Build and start
sudo -u itzalan npm install
sudo -u itzalan npm run build
sudo -u itzalan npm run db:migrate
sudo -u itzalan pm2 start ecosystem.config.prod.js
sudo -u itzalan pm2 save

# 5. Configure Nginx and SSL
sudo bash /path/to/deploy/setup-ssl.sh yourdomain.com
```

## 📦 Deployment

### Quick Deploy (Pull Latest Code)
```bash
# Using deployment script
sudo bash /home/itzalan/app/deploy/deploy.sh

# Or manual steps
cd /home/itzalan/app
sudo -u itzalan git pull origin main
sudo -u itzalan npm install
sudo -u itzalan npm run build
sudo -u itzalan npm run db:migrate
sudo -u itzalan pm2 reload ecosystem.config.prod.js
```

### Deploy Specific Branch/Tag
```bash
sudo bash /home/itzalan/app/deploy/deploy.sh https://github.com/yourorg/itzalan-tech.git v1.0.0
```

## 🔍 Monitoring & Logs

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
# Combined logs (real-time)
pm2 logs

# API logs only
pm2 logs itzalan-api

# Web logs only
pm2 logs itzalan-web

# Last 100 lines
pm2 logs --lines 100

# Save to file
pm2 logs > logs_$(date +%s).txt
```

### Check Services
```bash
# PostgreSQL
sudo systemctl status postgresql

# Nginx
sudo systemctl status nginx

# PM2
pm2 list

# Ports in use
sudo lsof -i :80
sudo lsof -i :443
sudo lsof -i :3000
sudo lsof -i :3001
```

## ⚙️ Process Management (PM2)

### Start/Stop/Restart
```bash
# Start
pm2 start ecosystem.config.prod.js

# Stop
pm2 stop ecosystem.config.prod.js

# Restart (with downtime)
pm2 restart ecosystem.config.prod.js

# Reload (graceful, no downtime)
pm2 reload ecosystem.config.prod.js

# Delete
pm2 delete ecosystem.config.prod.js
```

### Specific Service
```bash
# Stop API only
pm2 stop itzalan-api

# Restart Web only
pm2 restart itzalan-web

# View API status
pm2 info itzalan-api
```

## 🗄️ Database Management

### Connect to Database
```bash
# As itzalan user
psql postgresql://itzalan:PASSWORD@localhost:5432/itzalan_db

# As postgres user
sudo -u postgres psql itzalan_db
```

### Common Database Commands
```bash
# List tables
\dt

# View biblioteca_chunks schema
\d biblioteca_chunks

# View pgvector extension
\dx vector

# Run SQL query
SELECT COUNT(*) FROM biblioteca_chunks;

# Check vector column
SELECT id, content, embedding_vector FROM biblioteca_chunks LIMIT 5;

# Verify embeddings were created
SELECT COUNT(*) FROM biblioteca_chunks WHERE embedding_vector IS NOT NULL;
```

### Backup Database
```bash
# Backup to file
sudo -u postgres pg_dump itzalan_db | gzip > itzalan_backup_$(date +%Y%m%d).sql.gz

# Backup with custom format
sudo -u postgres pg_dump -Fc itzalan_db > itzalan_backup_$(date +%Y%m%d).dump

# List backups
ls -lh /home/itzalan/backups/

# Restore from backup
gunzip -c itzalan_backup_20240625.sql.gz | sudo -u postgres psql itzalan_db
```

### Run Migrations
```bash
# Run pending migrations
npm run db:migrate

# or
npx typeorm migration:run -d dist/database.config.js

# View applied migrations
SELECT * FROM typeorm_metadata WHERE type = 'migration';
```

## 🌐 Nginx Management

### View Configuration
```bash
# Main config
sudo nano /etc/nginx/sites-available/itzalan

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx (with brief downtime)
sudo systemctl restart nginx
```

### View Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Combined
sudo tail -f /var/log/nginx/*.log
```

### Common Nginx Operations
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Stop Nginx
sudo systemctl stop nginx

# Start Nginx
sudo systemctl start nginx

# Enable on boot
sudo systemctl enable nginx
```

## 🔒 SSL/Certificate Management

### Check Certificate Status
```bash
# View all certificates
sudo certbot certificates

# Check expiry date
sudo certbot certificates | grep Expiry

# Check certificate details
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout
```

### Renew Certificate
```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# View renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Certificate Auto-Renewal
```bash
# Check if enabled
sudo systemctl status certbot.timer

# Enable
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Disable (not recommended)
sudo systemctl disable certbot.timer
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
sudo lsof -i :3001
sudo lsof -i :3000
sudo lsof -i :80
sudo lsof -i :443

# Kill process
sudo kill -9 <PID>

# Or stop via PM2
pm2 stop all
```

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql postgresql://itzalan:PASSWORD@localhost:5432/itzalan_db

# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### API Not Responding
```bash
# Check PM2 status
pm2 list

# View API logs
pm2 logs itzalan-api

# Restart API
pm2 restart itzalan-api

# Check if port 3001 is open
curl http://localhost:3001/health
```

### Nginx Not Forwarding
```bash
# Test Nginx config
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Verify upstream is working
curl http://localhost:3001/health
curl http://localhost:3000

# Check Nginx is listening
sudo netstat -tlnp | grep nginx
```

### Memory/CPU Issues
```bash
# Check process usage
pm2 monit

# View detailed metrics
pm2 info itzalan-api

# Check system resources
free -h
df -h
top

# Reduce cluster instances (edit ecosystem.config.prod.js)
# Change: instances: 'max' → instances: 2
# Then reload: pm2 reload ecosystem.config.prod.js
```

### Vector Search Issues
```bash
# Check if pgvector extension is installed
sudo -u postgres psql itzalan_db -c "\dx vector"

# Check if chunks have embeddings
SELECT COUNT(*) as total_chunks, 
       COUNT(embedding_vector) as chunks_with_embedding 
FROM biblioteca_chunks;

# Check embedding dimension
SELECT dimension FROM pgvector_info('public'."biblioteca_chunks", 'embedding_vector');

# Verify vector search is working
SELECT similarity_score FROM (
  SELECT id, content, 
         embedding_vector <-> '[0.1,0.2,0.3...(1536 values)]'::vector AS similarity_score
  FROM biblioteca_chunks
  ORDER BY similarity_score
  LIMIT 10
) AS results;
```

## 📊 Performance Optimization

### Check Database Performance
```bash
# Analyze query performance
EXPLAIN ANALYZE 
SELECT * FROM biblioteca_chunks 
WHERE embedding_vector <-> '[...]'::vector LIMIT 10;

# Vacuum and analyze
VACUUM ANALYZE biblioteca_chunks;

# Check index usage
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename = 'biblioteca_chunks';

# Reindex if needed
REINDEX TABLE biblioteca_chunks;
```

### View Slow Queries
```bash
# PostgreSQL slow query log
sudo tail -f /var/log/postgresql/postgresql.log | grep -i "duration"

# Application logs
pm2 logs itzalan-api | grep -i "duration\|slow"
```

### Database Tuning
```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/16/main/postgresql.conf

# Key parameters for 2GB RAM:
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 256MB
work_mem = 32MB
random_page_cost = 1.1

# Reload config
sudo systemctl reload postgresql
```

## 📝 Log Locations

```
API Logs:              /home/itzalan/app/logs/api-*.log
Web Logs:              /home/itzalan/app/logs/web-*.log
PostgreSQL Logs:       /var/log/postgresql/
Nginx Access:          /var/log/nginx/access.log
Nginx Error:           /var/log/nginx/error.log
PM2 Logs:              ~/.pm2/logs/
Certbot Logs:          /var/log/letsencrypt/
System Logs:           /var/log/syslog
```

## 🚨 Emergency Recovery

### Restart Everything
```bash
# Stop all services
pm2 stop all
sudo systemctl stop nginx
sudo systemctl stop postgresql

# Wait 5 seconds
sleep 5

# Start all services
sudo systemctl start postgresql
sudo systemctl start nginx
pm2 start ecosystem.config.prod.js
```

### Restore from Backup
```bash
# Stop application
pm2 stop all

# Restore database
gunzip -c itzalan_backup_20240625.sql.gz | sudo -u postgres psql itzalan_db

# Start application
pm2 start ecosystem.config.prod.js
```

### Clear PM2 Logs
```bash
# Clear all logs
pm2 delete all

# Restart application
pm2 start ecosystem.config.prod.js
```

## 📞 Useful Commands Summary

```bash
# System Health
pm2 status
pm2 monit
free -h
df -h

# Deploy Update
cd /home/itzalan/app && git pull && npm install && npm run build && npm run db:migrate && pm2 reload ecosystem.config.prod.js

# View Logs
pm2 logs | head -100

# Database Check
sudo -u postgres psql -d itzalan_db -c "SELECT COUNT(*) FROM biblioteca_chunks;"

# Certificate Check
sudo certbot certificates

# All Services Status
systemctl status postgresql nginx && pm2 list
```

## 🔗 Related Documentation

- Full Deployment Guide: [docs/DEPLOYMENT-PRODUCTION.md](../docs/DEPLOYMENT-PRODUCTION.md)
- Architecture: [docs/arquitectura.md](../docs/arquitectura.md)
- API Documentation: [docs/api.md](../docs/api.md)
- Database: [docs/base-datos.md](../docs/base-datos.md)
