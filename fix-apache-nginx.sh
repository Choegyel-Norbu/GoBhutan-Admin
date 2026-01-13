#!/bin/bash

# Fix Apache/Nginx Conflict Script
# Run this ON THE SERVER via SSH

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Fixing Apache/Nginx Conflict ===${NC}\n"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run this script as root. Run as gobhutan user.${NC}"
    exit 1
fi

# Step 1: Check what's running on port 80
echo -e "${YELLOW}[1/5] Checking what's running on port 80...${NC}"
sudo netstat -tlnp | grep :80 || echo "Nothing found on port 80"

# Step 2: Stop Apache
echo -e "${YELLOW}[2/5] Stopping Apache...${NC}"
if systemctl is-active --quiet apache2; then
    sudo systemctl stop apache2
    echo -e "${GREEN}✓ Apache stopped${NC}\n"
else
    echo -e "${YELLOW}⚠ Apache is not running${NC}\n"
fi

# Step 3: Disable Apache from starting on boot
echo -e "${YELLOW}[3/5] Disabling Apache from auto-start...${NC}"
sudo systemctl disable apache2
echo -e "${GREEN}✓ Apache disabled${NC}\n"

# Step 4: Ensure Nginx is installed and running
echo -e "${YELLOW}[4/5] Ensuring Nginx is running...${NC}"
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Installing Nginx...${NC}"
    sudo apt update
    sudo apt install nginx -y
fi

sudo systemctl start nginx
sudo systemctl enable nginx
echo -e "${GREEN}✓ Nginx is running${NC}\n"

# Step 5: Verify Nginx is listening on port 80
echo -e "${YELLOW}[5/5] Verifying Nginx is listening on port 80...${NC}"
sleep 2
if sudo netstat -tlnp | grep :80 | grep nginx; then
    echo -e "${GREEN}✓ Nginx is now listening on port 80${NC}\n"
else
    echo -e "${RED}⚠ Warning: Nginx may not be listening on port 80. Check configuration.${NC}\n"
fi

# Check if application files exist
echo -e "${YELLOW}Checking application files...${NC}"
if [ -d "/var/www/gobhutan-admin" ] && [ -f "/var/www/gobhutan-admin/index.html" ]; then
    echo -e "${GREEN}✓ Application files found at /var/www/gobhutan-admin${NC}\n"
    echo -e "${YELLOW}File count: $(ls -1 /var/www/gobhutan-admin | wc -l) files${NC}\n"
else
    echo -e "${RED}⚠ Application files not found. You need to run deploy.sh from your local machine.${NC}\n"
fi

# Check Nginx configuration
echo -e "${YELLOW}Checking Nginx configuration...${NC}"
if [ -f "/etc/nginx/sites-enabled/gobhutan-admin" ]; then
    echo -e "${GREEN}✓ Nginx configuration found${NC}\n"
    sudo nginx -t
else
    echo -e "${YELLOW}⚠ Nginx configuration not found. You need to configure Nginx.${NC}\n"
fi

echo -e "${GREEN}=== Fix Complete! ===${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. If application files are missing, run ./deploy.sh from your local machine"
echo -e "2. If Nginx config is missing, follow step 2 in DEPLOYMENT.md"
echo -e "3. Visit https://gobhutan.site/go-bhutan-admin/ to verify"


