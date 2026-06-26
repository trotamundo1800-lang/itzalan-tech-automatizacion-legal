# ITZALAN TECH - Production Readiness Checklist

## Pre-Deployment Validation

### Code Quality & Testing
- [ ] All TypeScript files compile without errors
  ```bash
  npm run build
  ```
- [ ] Unit tests pass
  ```bash
  npm run test
  ```
- [ ] E2E tests pass
  ```bash
  npm run test:e2e
  ```
- [ ] Linting passes
  ```bash
  npm run lint
  ```
- [ ] No critical dependencies missing
  ```bash
  npm audit
  ```

### Environment Configuration
- [ ] `.env` file created from `.env.example`
  ```bash
  cp .env.example .env
  ```
- [ ] `DATABASE_URL` correctly configured for PostgreSQL
  ```
  postgresql://itzalan:PASSWORD@localhost:5432/itzalan_db
  ```
- [ ] `OPENAI_API_KEY` obtained from OpenAI
  ```
  https://platform.openai.com/api-keys
  ```
- [ ] `JWT_SECRET` generated with secure random
  ```bash
  openssl rand -base64 32
  ```
- [ ] `CORS_ORIGIN` set to your domain
  ```
  https://yourdomain.com
  ```
- [ ] All required variables filled in (no empty/placeholder values)

### Database Preparation
- [ ] PostgreSQL 16 installed and running
  ```bash
  sudo systemctl status postgresql
  ```
- [ ] pgvector extension installed
  ```sql
  \dx vector
  ```
- [ ] Database created with correct encoding (UTF-8)
  ```sql
  \l itzalan_db
  ```
- [ ] Database user created with appropriate permissions
  ```sql
  \du itzalan
  ```
- [ ] Database connection tested
  ```bash
  psql postgresql://itzalan:PASSWORD@localhost:5432/itzalan_db
  ```
- [ ] All migrations executed successfully
  ```bash
  npm run db:migrate
  ```
- [ ] Schema verified (tables, indexes created)
  ```sql
  \d
  ```

### Vector Embedding System
- [ ] pgvector extension enabled
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```
- [ ] `biblioteca_chunks` table has `embedding_vector` column
  ```sql
  \d biblioteca_chunks
  ```
- [ ] IVFFlat index created on embedding column
  ```sql
  SELECT indexname FROM pg_indexes 
  WHERE tablename = 'biblioteca_chunks';
  ```
- [ ] OpenAI API key tested (valid and has credits)
  ```bash
  curl https://api.openai.com/v1/models \
    -H "Authorization: Bearer $OPENAI_API_KEY"
  ```
- [ ] Embedding service initializes without errors
  ```bash
  npm run build
  ```

### Application Build & Dependencies
- [ ] Dependencies installed
  ```bash
  npm install
  ```
- [ ] Production build created
  ```bash
  npm run build
  ```
- [ ] Build output verified (no missing files)
  ```bash
  ls -la dist/
  ```
- [ ] All required node modules present
  ```bash
  npm ls --depth=0
  ```

### Server Infrastructure
- [ ] Node.js 22 LTS installed
  ```bash
  node -v  # v22.x.x
  ```
- [ ] npm version compatible
  ```bash
  npm -v
  ```
- [ ] PM2 installed globally
  ```bash
  pm2 -v
  ```
- [ ] PM2 startup configured
  ```bash
  sudo pm2 startup
  sudo pm2 save
  ```
- [ ] Application user `itzalan` created
  ```bash
  id itzalan
  ```
- [ ] Application directories created with correct permissions
  ```bash
  ls -ld /home/itzalan/app
  ls -ld /home/itzalan/app/logs
  ```

### Nginx Configuration
- [ ] Nginx installed
  ```bash
  nginx -v
  ```
- [ ] Nginx site configuration created
  ```bash
  sudo nano /etc/nginx/sites-available/itzalan
  ```
- [ ] Site enabled (symlink created)
  ```bash
  ls -la /etc/nginx/sites-enabled/itzalan
  ```
- [ ] Configuration syntax valid
  ```bash
  sudo nginx -t
  ```
- [ ] Nginx running and enabled on boot
  ```bash
  sudo systemctl status nginx
  sudo systemctl is-enabled nginx
  ```
- [ ] Reverse proxy correctly configured for ports 3000 and 3001
- [ ] Client upload limit sufficient (50MB recommended)
- [ ] Security headers configured

### SSL/HTTPS
- [ ] Domain registered and pointing to server IP
- [ ] Certbot installed
  ```bash
  certbot --version
  ```
- [ ] SSL certificate obtained
  ```bash
  sudo certbot certificates
  ```
- [ ] Nginx HTTPS block configured
- [ ] HTTP to HTTPS redirect enabled
- [ ] SSL auto-renewal configured and tested
  ```bash
  sudo certbot renew --dry-run
  ```
- [ ] Certificate expiry monitored

### Security
- [ ] Firewall configured
  ```bash
  sudo ufw status
  ```
- [ ] SSH access locked down (keys only, no password)
- [ ] Sudo access restricted
- [ ] API rate limiting configured
- [ ] CORS restricted to your domain (not *)
- [ ] API keys not in version control (use .env)
- [ ] Database password secure (25+ characters recommended)
- [ ] JWT secret strong (256+ bit entropy)
- [ ] Secrets not logged or exposed in error messages

### Monitoring & Logging
- [ ] PM2 logrotate installed
  ```bash
  pm2 install pm2-logrotate
  ```
- [ ] Log rotation configured
  ```bash
  pm2 desc itzalan-api | grep logrotate
  ```
- [ ] Log directories writable
  ```bash
  ls -ld /home/itzalan/app/logs
  ```
- [ ] Nginx logs accessible
  ```bash
  sudo tail /var/log/nginx/access.log
  ```
- [ ] PostgreSQL logs accessible
  ```bash
  sudo tail -f /var/log/postgresql/postgresql.log
  ```
- [ ] Error notifications configured (email/Slack)

### Backup & Disaster Recovery
- [ ] Database backup script created
  ```bash
  cat /home/itzalan/backup.sh
  ```
- [ ] Backup cron job scheduled
  ```bash
  sudo crontab -l | grep backup
  ```
- [ ] Test backup/restore procedure
  ```bash
  sudo -u postgres pg_dump itzalan_db | gzip > test_backup.sql.gz
  ```
- [ ] Backup storage location verified
- [ ] Backup retention policy defined (e.g., keep 7 days)

### Performance Optimization
- [ ] PostgreSQL tuning applied
  ```bash
  grep "shared_buffers\|effective_cache_size" /etc/postgresql/16/main/postgresql.conf
  ```
- [ ] Connection pooling configured (min=5, max=20)
- [ ] API response times acceptable (<500ms target)
- [ ] Database query performance optimized
- [ ] Vector search index properly configured
- [ ] Nginx gzip compression enabled

### API Testing
- [ ] Health check endpoint responds
  ```bash
  curl http://localhost:3001/health
  ```
- [ ] API endpoints tested manually
  ```bash
  curl -X GET http://localhost:3001/api/status
  ```
- [ ] Authentication flow tested
  ```bash
  curl -X POST http://localhost:3001/auth/login
  ```
- [ ] Document upload works
  ```bash
  curl -X POST http://localhost:3001/api/biblioteca/upload -F "file=@test.pdf"
  ```
- [ ] Vector search functional
  ```bash
  curl -X POST http://localhost:3001/api/biblioteca/search \
    -H "Content-Type: application/json" \
    -d '{"query":"test"}'
  ```
- [ ] All API endpoints return proper error messages

### Web Application Testing
- [ ] Next.js build succeeds
  ```bash
  cd apps/web && npm run build
  ```
- [ ] Web application responds on port 3000
  ```bash
  curl http://localhost:3000
  ```
- [ ] Frontend connects to API correctly
- [ ] Auth flow works (login/logout)
- [ ] Document upload from frontend works
- [ ] Search functionality works
- [ ] Responsive design verified on mobile

### Production Deployment
- [ ] Deployment script tested in staging
  ```bash
  bash deploy/deploy.sh
  ```
- [ ] Zero-downtime deployment verified
- [ ] Rollback procedure documented and tested
- [ ] Database migration rollback tested

### Documentation
- [ ] Deployment guide updated
  ```bash
  ls docs/DEPLOYMENT-PRODUCTION.md
  ```
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide created
- [ ] Runbooks for common tasks created

### Compliance & Security Review
- [ ] Data privacy policy reviewed
- [ ] Terms of service reviewed
- [ ] GDPR compliance verified (if EU users)
- [ ] Data retention policy defined
- [ ] Security audit completed
- [ ] Dependencies checked for known vulnerabilities
  ```bash
  npm audit
  ```

## Post-Deployment Verification

### Immediate (First 30 minutes)
- [ ] API responding to requests
  ```bash
  pm2 logs itzalan-api
  ```
- [ ] Web frontend loading
- [ ] Database connections stable
- [ ] No errors in application logs
- [ ] SSL certificate working
- [ ] API rate limiting working

### Short-term (First 24 hours)
- [ ] Monitor CPU/memory usage
  ```bash
  pm2 monit
  ```
- [ ] Check error logs for any issues
- [ ] Verify backups are running
- [ ] Test API with real users
- [ ] Monitor database performance
- [ ] Verify vector embeddings being generated

### Ongoing (Weekly)
- [ ] Review error logs
- [ ] Check certificate expiry status
- [ ] Monitor disk space usage
- [ ] Review application performance metrics
- [ ] Verify backups are completing
- [ ] Update dependencies for security patches
- [ ] Test disaster recovery procedure

## Deployment Environment Variables

```bash
# Required for Production
NODE_ENV=production
DATABASE_URL=postgresql://itzalan:PASSWORD@localhost:5432/itzalan_db
OPENAI_API_KEY=sk-...
JWT_SECRET=$(openssl rand -base64 32)
CORS_ORIGIN=https://yourdomain.com
API_PORT=3001

# Recommended
LOG_LEVEL=info
MAX_FILE_SIZE=52428800
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
```

## Rollback Procedure

If issues occur after deployment:

```bash
# 1. Stop current version
pm2 stop all

# 2. Restore from Git
cd /home/itzalan/app
git checkout main  # or previous tag
git reset --hard <previous-commit-hash>

# 3. Reinstall dependencies
npm install

# 4. Rebuild
npm run build

# 5. Restore database if needed
gunzip -c itzalan_backup_YYYYMMDD.sql.gz | sudo -u postgres psql itzalan_db

# 6. Run migrations
npm run db:migrate

# 7. Restart
pm2 start ecosystem.config.prod.js
```

## Support Contacts

- **DevOps Team**: [contact info]
- **Security Issues**: [contact info]
- **Database Issues**: [contact info]
- **OpenAI Support**: https://help.openai.com/
- **NestJS Support**: https://docs.nestjs.com/

## Sign-Off

- [ ] Project Manager Approval
- [ ] Security Review Complete
- [ ] DevOps Lead Approval
- [ ] CTO Approval

**Deployment Date**: _______________
**Deployed By**: _______________
**Verified By**: _______________

---

**Notes**:
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```
