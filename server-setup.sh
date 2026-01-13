#!/bin/bash

# Server Setup Script for GoBhutan Admin
# Run this script ON THE SERVER after SSH connection

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== GoBhutan Admin Server Setup ===${NC}\n"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please do not run this script as root. Run as gobhutan user.${NC}"
    exit 1
fi

# Step 1: Update system
echo -e "${YELLOW}[1/6] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y
echo -e "${GREEN}✓ System updated${NC}\n"

# Step 2: Install Nginx
echo -e "${YELLOW}[2/6] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    echo -e "${GREEN}✓ Nginx installed${NC}\n"
else
    echo -e "${GREEN}✓ Nginx already installed${NC}\n"
fi

# Step 3: Install Certbot (for SSL)
echo -e "${YELLOW}[3/6] Installing Certbot...${NC}"
if ! command -v certbot &> /dev/null; then
    sudo apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}✓ Certbot installed${NC}\n"
else
    echo -e "${GREEN}✓ Certbot already installed${NC}\n"
fi

# Step 4: Create web directory
echo -e "${YELLOW}[4/6] Creating web directory...${NC}"
sudo mkdir -p /var/www/gobhutan-admin
sudo chown -R $USER:www-data /var/www/gobhutan-admin
sudo chmod -R 755 /var/www/gobhutan-admin
echo -e "${GREEN}✓ Directory created at /var/www/gobhutan-admin${NC}\n"

# Step 5: Configure firewall
echo -e "${YELLOW}[5/6] Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 'Nginx Full'
    echo -e "${GREEN}✓ Firewall configured${NC}\n"
else
    echo -e "${YELLOW}⚠ UFW not found, skipping firewall configuration${NC}\n"
fi

# Step 6: Start and enable Nginx
echo -e "${YELLOW}[6/6] Starting Nginx service...${NC}"
sudo systemctl start nginx
sudo systemctl enable nginx
echo -e "${GREEN}✓ Nginx started and enabled${NC}\n"

echo -e "${GREEN}=== Server Setup Complete! ===${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Copy nginx.conf to /etc/nginx/sites-available/gobhutan-admin"
echo -e "2. Create symlink: sudo ln -s /etc/nginx/sites-available/gobhutan-admin /etc/nginx/sites-enabled/"
echo -e "3. Test config: sudo nginx -t"
echo -e "4. Reload: sudo systemctl reload nginx"
echo -e "5. Run deploy.sh from your local machine to deploy the application"

