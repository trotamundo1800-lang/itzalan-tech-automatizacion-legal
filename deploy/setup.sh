#!/bin/bash

################################################################################
# ITZALAN TECH - Production Deployment Setup Script
# Target: Ubuntu/Debian VPS
# Installs: Node.js 22, PostgreSQL 16, pgvector, PM2, Nginx
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
NODEJS_VERSION="22"
POSTGRESQL_VERSION="16"
APP_USER="itzalan"
APP_HOME="/home/itzalan/app"
DB_NAME="itzalan_db"
DB_USER="itzalan"
DOMAIN="${DOMAIN:-localhost}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     ITZALAN TECH - Production Environment Setup            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# ============================================================================
# 1. Update System
# ============================================================================
echo -e "${YELLOW}📦 Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y
apt-get install -y curl wget git build-essential openssl libssl-dev

# ============================================================================
# 2. Install Node.js 22
# ============================================================================
echo -e "${YELLOW}📦 Step 2: Installing Node.js ${NODEJS_VERSION}...${NC}"
curl -fsSL https://deb.nodesource.com/setup_${NODEJS_VERSION}.x | bash -
apt-get install -y nodejs

# Verify installation
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ Node.js installed: ${NODE_VERSION}${NC}"
echo -e "${GREEN}✓ npm installed: ${NPM_VERSION}${NC}"

# ============================================================================
# 3. Install PostgreSQL 16 with pgvector
# ============================================================================
echo -e "${YELLOW}📦 Step 3: Installing PostgreSQL ${POSTGRESQL_VERSION}...${NC}"

# Add PostgreSQL repository
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt-get update
apt-get install -y postgresql-${POSTGRESQL_VERSION} postgresql-contrib-${POSTGRESQL_VERSION}

# Start PostgreSQL
systemctl enable postgresql
systemctl start postgresql

echo -e "${GREEN}✓ PostgreSQL ${POSTGRESQL_VERSION} installed${NC}"

# ============================================================================
# 4. Build and Install pgvector
# ============================================================================
echo -e "${YELLOW}📦 Step 4: Building and installing pgvector...${NC}"

# Install pgvector build dependencies
apt-get install -y postgresql-${POSTGRESQL_VERSION}-dev

# Clone and build pgvector
cd /tmp
git clone --branch v0.7.4 https://github.com/pgvector/pgvector.git pgvector-build
cd pgvector-build
make
make install

echo -e "${GREEN}✓ pgvector installed${NC}"

# ============================================================================
# 5. Create Application User and Database
# ============================================================================
echo -e "${YELLOW}📦 Step 5: Setting up PostgreSQL user and database...${NC}"

# Generate secure password
DB_PASSWORD=$(openssl rand -base64 32)

# Create PostgreSQL user and database
sudo -u postgres psql << EOF
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
ALTER ROLE ${DB_USER} CREATEDB;
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
\c ${DB_NAME}
CREATE EXTENSION vector;
EOF

echo -e "${GREEN}✓ PostgreSQL user created: ${DB_USER}${NC}"
echo -e "${GREEN}✓ Database created: ${DB_NAME}${NC}"
echo -e "${GREEN}✓ pgvector extension enabled${NC}"

# Save credentials
cat > /tmp/db_credentials.txt << EOF
Database: ${DB_NAME}
User: ${DB_USER}
Password: ${DB_PASSWORD}
Host: localhost
Port: 5432
EOF

echo -e "${YELLOW}⚠️  Database credentials saved to: /tmp/db_credentials.txt${NC}"

# ============================================================================
# 6. Create Application User and Directory
# ============================================================================
echo -e "${YELLOW}📦 Step 6: Creating application user and directories...${NC}"

# Create app user if it doesn't exist
if ! id "${APP_USER}" &>/dev/null; then
    useradd -m -s /bin/bash ${APP_USER}
    echo -e "${GREEN}✓ Application user created: ${APP_USER}${NC}"
else
    echo -e "${GREEN}✓ Application user already exists: ${APP_USER}${NC}"
fi

# Create application directories
mkdir -p ${APP_HOME}
mkdir -p ${APP_HOME}/logs
mkdir -p ${APP_HOME}/public
chown -R ${APP_USER}:${APP_USER} ${APP_HOME}

echo -e "${GREEN}✓ Application directories created${NC}"

# ============================================================================
# 7. Install PM2 Globally
# ============================================================================
echo -e "${YELLOW}📦 Step 7: Installing PM2 for process management...${NC}"

npm install -g pm2
pm2 install pm2-logrotate

# Enable PM2 startup
pm2 startup systemd -u ${APP_USER} --hp ${APP_HOME}

echo -e "${GREEN}✓ PM2 installed and configured${NC}"

# ============================================================================
# 8. Install and Configure Nginx
# ============================================================================
echo -e "${YELLOW}📦 Step 8: Installing Nginx...${NC}"

apt-get install -y nginx

# Enable Nginx
systemctl enable nginx
systemctl start nginx

echo -e "${GREEN}✓ Nginx installed${NC}"

# ============================================================================
# 9. Create Nginx Configuration Template
# ============================================================================
echo -e "${YELLOW}📦 Step 9: Creating Nginx configuration template...${NC}"

cat > /etc/nginx/sites-available/itzalan-template << 'NGINX_CONFIG'
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
    server_name DOMAIN_PLACEHOLDER;

    # Redirect all HTTP to HTTPS (uncomment after SSL setup)
    # return 301 https://$server_name$request_uri;

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

    # Health check endpoint
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

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_cache_valid 200 30d;
        expires 30d;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
NGINX_CONFIG

echo -e "${GREEN}✓ Nginx template created at /etc/nginx/sites-available/itzalan-template${NC}"

# ============================================================================
# 10. Install Certbot for SSL (Optional)
# ============================================================================
echo -e "${YELLOW}📦 Step 10: Installing Certbot for SSL certificates...${NC}"

apt-get install -y certbot python3-certbot-nginx

echo -e "${GREEN}✓ Certbot installed${NC}"

# ============================================================================
# 11. Summary and Next Steps
# ============================================================================
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   ✓ Setup Complete!                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}System Configuration:${NC}"
echo -e "  • Node.js: $(node -v)"
echo -e "  • npm: $(npm -v)"
echo -e "  • PostgreSQL: ${POSTGRESQL_VERSION}"
echo -e "  • pgvector: v0.7.4"
echo -e "  • PM2: $(pm2 -v)"
echo -e "  • Nginx: Installed"
echo -e "  • Application User: ${APP_USER}"
echo -e "  • Application Home: ${APP_HOME}"

echo -e "\n${YELLOW}📋 Next Steps:${NC}"
echo -e "  1. Clone your repository:"
echo -e "     ${BLUE}sudo -u ${APP_USER} git clone <YOUR_REPO> ${APP_HOME}${NC}"
echo -e ""
echo -e "  2. Install dependencies:"
echo -e "     ${BLUE}cd ${APP_HOME} && sudo -u ${APP_USER} npm install${NC}"
echo -e ""
echo -e "  3. Create .env file with database credentials:"
echo -e "     ${BLUE}Database: ${DB_NAME}${NC}"
echo -e "     ${BLUE}User: ${DB_USER}${NC}"
echo -e "     ${BLUE}Password: [saved in /tmp/db_credentials.txt]${NC}"
echo -e ""
echo -e "  4. Run database migrations:"
echo -e "     ${BLUE}npm run db:migrate${NC}"
echo -e ""
echo -e "  5. Configure Nginx:"
echo -e "     ${BLUE}cp /etc/nginx/sites-available/itzalan-template /etc/nginx/sites-available/itzalan${NC}"
echo -e "     ${BLUE}sed -i 's/DOMAIN_PLACEHOLDER/${DOMAIN}/g' /etc/nginx/sites-available/itzalan${NC}"
echo -e "     ${BLUE}ln -s /etc/nginx/sites-available/itzalan /etc/nginx/sites-enabled/${NC}"
echo -e "     ${BLUE}nginx -t && systemctl reload nginx${NC}"
echo -e ""
echo -e "  6. Setup SSL with Certbot (optional):"
echo -e "     ${BLUE}certbot --nginx -d ${DOMAIN}${NC}"
echo -e ""
echo -e "  7. Start application with PM2:"
echo -e "     ${BLUE}pm2 start ecosystem.config.js${NC}"
echo -e "     ${BLUE}pm2 save${NC}"

echo -e "\n${YELLOW}📁 Database Credentials:${NC}"
cat /tmp/db_credentials.txt

echo -e "\n${YELLOW}⚠️  Important:${NC}"
echo -e "  • Save the database credentials securely"
echo -e "  • Update .env with the connection string"
echo -e "  • Review Nginx config before enabling"
echo -e "  • Enable SSL certificate for production\n"
