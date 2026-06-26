#!/bin/bash

################################################################################
# ITZALAN TECH - SSL Certificate Setup with Certbot
# Install Let's Encrypt SSL certificates for production HTTPS
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     ITZALAN TECH - SSL Certificate Setup (Certbot)        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Check if domain provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Domain name required${NC}"
    echo -e "Usage: ${BLUE}./setup-ssl.sh yourdomain.com${NC}"
    exit 1
fi

DOMAIN="$1"
EMAIL="${2:-admin@$DOMAIN}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root${NC}"
   exit 1
fi

# ============================================================================
# 1. Check Prerequisites
# ============================================================================
echo -e "${YELLOW}📦 Step 1: Checking prerequisites...${NC}"

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${RED}❌ Certbot not found. Install with: apt-get install -y certbot python3-certbot-nginx${NC}"
    exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx not found${NC}"
    exit 1
fi

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo -e "${YELLOW}⚠️  Starting Nginx...${NC}"
    systemctl start nginx
fi

echo -e "${GREEN}✓ Prerequisites verified${NC}"

# ============================================================================
# 2. Configure Nginx for Certbot
# ============================================================================
echo -e "${YELLOW}📦 Step 2: Configuring Nginx for certificate validation...${NC}"

# Update Nginx config with the domain
sed -i "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" /etc/nginx/sites-available/itzalan

# Enable site if not already
if [ ! -L /etc/nginx/sites-enabled/itzalan ]; then
    ln -s /etc/nginx/sites-available/itzalan /etc/nginx/sites-enabled/
fi

# Test and reload Nginx
nginx -t
systemctl reload nginx

echo -e "${GREEN}✓ Nginx configured${NC}"

# ============================================================================
# 3. Obtain SSL Certificate
# ============================================================================
echo -e "${YELLOW}📦 Step 3: Obtaining SSL certificate from Let's Encrypt...${NC}"
echo -e "${YELLOW}   Domain: ${DOMAIN}${NC}"
echo -e "${YELLOW}   Email: ${EMAIL}${NC}\n"

# Obtain certificate with Nginx plugin
certbot --nginx \
    -d ${DOMAIN} \
    -d www.${DOMAIN} \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    --redirect

echo -e "${GREEN}✓ SSL certificate obtained${NC}"

# ============================================================================
# 4. Enable Auto-Renewal
# ============================================================================
echo -e "${YELLOW}📦 Step 4: Setting up auto-renewal...${NC}"

# Enable certbot timer
systemctl enable certbot.timer
systemctl start certbot.timer

# Test renewal process
certbot renew --dry-run

echo -e "${GREEN}✓ Auto-renewal configured${NC}"

# ============================================================================
# 5. Update Nginx for HTTPS
# ============================================================================
echo -e "${YELLOW}📦 Step 5: Verifying Nginx HTTPS configuration...${NC}"

# Nginx should have been automatically updated by Certbot
# But let's verify and add some security headers

NGINX_CONFIG="/etc/nginx/sites-available/itzalan"

# Check if SSL config is present
if grep -q "ssl_certificate" "$NGINX_CONFIG"; then
    echo -e "${GREEN}✓ Nginx HTTPS configuration applied${NC}"
else
    echo -e "${YELLOW}⚠️  Manual Nginx update may be needed${NC}"
fi

# ============================================================================
# 6. Security Headers
# ============================================================================
echo -e "${YELLOW}📦 Step 6: Adding security headers...${NC}"

# Add security headers to HTTPS block if not already present
if ! grep -q "Strict-Transport-Security" "$NGINX_CONFIG"; then
    cat >> "$NGINX_CONFIG" << 'EOF'

# Security Headers (add inside server block for HTTPS)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
EOF
fi

# Test and reload
nginx -t
systemctl reload nginx

echo -e "${GREEN}✓ Security headers added${NC}"

# ============================================================================
# 7. Verification
# ============================================================================
echo -e "${YELLOW}📦 Step 7: Verifying SSL configuration...${NC}"

echo -e "\n${BLUE}Certificate Information:${NC}"
certbot certificates

echo -e "\n${BLUE}Testing HTTPS:${NC}"
curl -I https://${DOMAIN} 2>/dev/null | head -n 5 || echo "Testing connection..."

# ============================================================================
# 8. Summary
# ============================================================================
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              ✓ SSL Setup Complete!                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}SSL Configuration Summary:${NC}"
echo -e "  • Domain: ${DOMAIN}"
echo -e "  • Certificate: /etc/letsencrypt/live/${DOMAIN}"
echo -e "  • Auto-renewal: Enabled"
echo -e "  • HTTP → HTTPS: Redirected"
echo -e "  • Security headers: Added"

echo -e "\n${YELLOW}📋 Useful Commands:${NC}"
echo -e "  View certificates:    ${BLUE}certbot certificates${NC}"
echo -e "  Test renewal:         ${BLUE}certbot renew --dry-run${NC}"
echo -e "  Force renewal:        ${BLUE}certbot renew --force-renewal${NC}"
echo -e "  View certificate:     ${BLUE}openssl x509 -in /etc/letsencrypt/live/${DOMAIN}/cert.pem -text -noout${NC}"
echo -e "  Check expiry:         ${BLUE}certbot certificates | grep Expiry${NC}"

echo -e "\n${YELLOW}🔗 Access Application:${NC}"
echo -e "  https://${DOMAIN}"
echo -e "  https://www.${DOMAIN}"

echo -e "\n${YELLOW}⚠️  Renewal Automatic:${NC}"
echo -e "  Certificates renew automatically 30 days before expiry"
echo -e "  Logs: /var/log/letsencrypt/letsencrypt.log"

echo ""
