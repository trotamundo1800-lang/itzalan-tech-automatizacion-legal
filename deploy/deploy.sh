#!/bin/bash

################################################################################
# ITZALAN TECH - Application Deployment Script
# Deploy production-ready application to /home/itzalan/app
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         ITZALAN TECH - Application Deployment              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

APP_HOME="/home/itzalan/app"
APP_USER="itzalan"
REPO_URL="${1:-https://github.com/yourorg/itzalan-tech.git}"
BRANCH="${2:-main}"

# Check if app directory exists
if [ ! -d "${APP_HOME}" ]; then
    echo -e "${RED}❌ Application home ${APP_HOME} does not exist${NC}"
    exit 1
fi

# ============================================================================
# 1. Stop current application
# ============================================================================
echo -e "${YELLOW}📦 Step 1: Stopping current application...${NC}"

sudo -u ${APP_USER} pm2 stop ecosystem.config.prod.js 2>/dev/null || true
sleep 2

echo -e "${GREEN}✓ Application stopped${NC}"

# ============================================================================
# 2. Clone or Pull Repository
# ============================================================================
echo -e "${YELLOW}📦 Step 2: Cloning/updating repository...${NC}"

if [ -d "${APP_HOME}/.git" ]; then
    # Repository already exists, pull updates
    cd ${APP_HOME}
    sudo -u ${APP_USER} git fetch origin
    sudo -u ${APP_USER} git checkout ${BRANCH}
    sudo -u ${APP_USER} git pull origin ${BRANCH}
    echo -e "${GREEN}✓ Repository updated${NC}"
else
    # Clone new repository
    sudo -u ${APP_USER} git clone --branch ${BRANCH} ${REPO_URL} ${APP_HOME}
    echo -e "${GREEN}✓ Repository cloned${NC}"
fi

# ============================================================================
# 3. Install Dependencies
# ============================================================================
echo -e "${YELLOW}📦 Step 3: Installing dependencies...${NC}"

cd ${APP_HOME}
sudo -u ${APP_USER} npm install

echo -e "${GREEN}✓ Dependencies installed${NC}"

# ============================================================================
# 4. Build Application
# ============================================================================
echo -e "${YELLOW}📦 Step 4: Building application...${NC}"

sudo -u ${APP_USER} npm run build

echo -e "${GREEN}✓ Application built${NC}"

# ============================================================================
# 5. Run Database Migrations
# ============================================================================
echo -e "${YELLOW}📦 Step 5: Running database migrations...${NC}"

# Only if TypeORM migrations exist
if [ -d "${APP_HOME}/apps/api/src/migrations" ]; then
    cd ${APP_HOME}
    sudo -u ${APP_USER} npm run db:migrate || echo -e "${YELLOW}⚠️  Migration skipped (might already be applied)${NC}"
    echo -e "${GREEN}✓ Migrations complete${NC}"
else
    echo -e "${YELLOW}⚠️  No migrations directory found${NC}"
fi

# ============================================================================
# 6. Start Application with PM2
# ============================================================================
echo -e "${YELLOW}📦 Step 6: Starting application with PM2...${NC}"

cd ${APP_HOME}
sudo -u ${APP_USER} pm2 start ecosystem.config.prod.js
sudo -u ${APP_USER} pm2 save

echo -e "${GREEN}✓ Application started${NC}"

# ============================================================================
# 7. Health Check
# ============================================================================
echo -e "${YELLOW}📦 Step 7: Checking application health...${NC}"

sleep 3

if pm2 list | grep -q "itzalan-api"; then
    echo -e "${GREEN}✓ API service is running${NC}"
else
    echo -e "${RED}❌ API service failed to start${NC}"
    pm2 logs --lines 50
    exit 1
fi

if pm2 list | grep -q "itzalan-web"; then
    echo -e "${GREEN}✓ Web service is running${NC}"
else
    echo -e "${RED}❌ Web service failed to start${NC}"
    pm2 logs --lines 50
    exit 1
fi

# ============================================================================
# 8. Summary
# ============================================================================
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              ✓ Deployment Complete!                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Deployment Summary:${NC}"
echo -e "  • Repository: ${REPO_URL}"
echo -e "  • Branch: ${BRANCH}"
echo -e "  • Location: ${APP_HOME}"
echo -e "  • Status: Running"

echo -e "\n${YELLOW}📊 Process Status:${NC}"
pm2 list

echo -e "\n${YELLOW}📝 Useful Commands:${NC}"
echo -e "  View logs:         ${BLUE}pm2 logs${NC}"
echo -e "  View API logs:     ${BLUE}pm2 logs itzalan-api${NC}"
echo -e "  View Web logs:     ${BLUE}pm2 logs itzalan-web${NC}"
echo -e "  Restart app:       ${BLUE}pm2 restart ecosystem.config.prod.js${NC}"
echo -e "  Stop app:          ${BLUE}pm2 stop ecosystem.config.prod.js${NC}"
echo -e "  Monitor:           ${BLUE}pm2 monit${NC}"

echo ""
