#!/bin/bash

# GoBhutan Admin - Deployment Script
# This script builds the Vite application and deploys it to the VPS

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="gobhutan"
SERVER_HOST="gobhutan.site"
SERVER_PATH="/var/www/gobhutan-admin"
DOMAIN="gobhutan.site"

echo -e "${GREEN}=== GoBhutan Admin Deployment Script ===${NC}\n"

# Step 1: Create/verify .env.production BEFORE building
echo -e "${YELLOW}[1/5] Checking .env.production file...${NC}"
NEW_API_URL="https://gobhutan.site/boot"

if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Creating .env.production file...${NC}"
    cat > .env.production << EOF
# Production Environment Variables
VITE_API_BASE_URL=${NEW_API_URL}
VITE_APP_NAME=GoBhutan
VITE_APP_VERSION=1.0.0
VITE_DEBUG=false
VITE_LOG_LEVEL=error
EOF
    echo -e "${GREEN}✓ .env.production created${NC}\n"
else
    echo -e "${GREEN}✓ .env.production already exists${NC}"
    # Check if it has the correct API URL
    if grep -q "VITE_API_BASE_URL" .env.production; then
        CURRENT_URL=$(grep "VITE_API_BASE_URL" .env.production | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
        if [ "$CURRENT_URL" != "$NEW_API_URL" ]; then
            echo -e "${YELLOW}⚠ Updating VITE_API_BASE_URL from old URL to: ${NEW_API_URL}${NC}"
            # Update the URL in .env.production
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=${NEW_API_URL}|" .env.production
            else
                # Linux
                sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=${NEW_API_URL}|" .env.production
            fi
            echo -e "${GREEN}✓ .env.production updated${NC}"
        else
            echo -e "${GREEN}✓ .env.production already has the correct API URL${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Adding VITE_API_BASE_URL to .env.production${NC}"
        echo "VITE_API_BASE_URL=${NEW_API_URL}" >> .env.production
        echo -e "${GREEN}✓ .env.production updated${NC}"
    fi
    echo ""
fi

# Step 2: Build the application with production mode
echo -e "${YELLOW}[2/5] Building application (production mode)...${NC}"
npm run build -- --mode production

if [ ! -d "dist" ]; then
    echo -e "${RED}Error: Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully${NC}\n"

# Step 3: Transfer files to server
echo -e "${YELLOW}[3/5] Transferring files to server...${NC}"
echo -e "${YELLOW}You will be prompted for the server password${NC}"

# Create directory structure on server
ssh ${SERVER_USER}@${SERVER_HOST} "sudo mkdir -p ${SERVER_PATH} && sudo chown -R ${SERVER_USER}:${SERVER_USER} ${SERVER_PATH}"

# Transfer files
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env.local' \
    dist/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

echo -e "${GREEN}✓ Files transferred successfully${NC}\n"

# Step 4: Set proper permissions
echo -e "${YELLOW}[4/5] Setting file permissions...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} "sudo chmod -R 755 ${SERVER_PATH} && sudo chown -R ${SERVER_USER}:www-data ${SERVER_PATH}"
echo -e "${GREEN}✓ Permissions set${NC}\n"

# Step 5: Reload Nginx
echo -e "${YELLOW}[5/5] Reloading Nginx...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} "sudo nginx -t && sudo systemctl reload nginx"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx reloaded successfully${NC}\n"
else
    echo -e "${RED}⚠ Nginx reload failed. Please check the configuration manually.${NC}\n"
fi

echo -e "${GREEN}=== Deployment Complete! ===${NC}"
if [ -n "$DOMAIN" ]; then
    echo -e "${GREEN}Your application should be available at: https://${DOMAIN}${NC}"
else
    echo -e "${GREEN}Your application should be available at: http://${SERVER_HOST}${NC}"
    echo -e "${YELLOW}⚠ Consider setting up a domain and SSL certificate for production${NC}"
fi

