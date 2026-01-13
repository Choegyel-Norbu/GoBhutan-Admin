# GoBhutan Admin - VPS Deployment Guide

This guide will help you deploy the GoBhutan Admin Vite application to your Ubuntu VPS.

## Prerequisites

- Ubuntu 22.04.5 LTS VPS (already connected)
- SSH access to the server
- Domain name (optional, but recommended for production)
- Node.js and npm installed locally (for building)

## Step-by-Step Deployment

### 1. Initial Server Setup

First, connect to your server and install necessary packages:

```bash
ssh gobhutan@gobhutan.site
```

Once connected, run:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL (optional, for HTTPS)
sudo apt install certbot python3-certbot-nginx -y

# Create web directory
sudo mkdir -p /var/www/gobhutan-admin
sudo chown -R gobhutan:www-data /var/www/gobhutan-admin
```

### 2. Configure Nginx

**From your local machine** (in the project directory):

```bash
# Make sure you're in the project directory
cd /Users/mac/Documents/Projects/JigmeCholing/GoBhutan/GoBhutan-Admin

# Copy nginx.conf to the server
scp nginx.conf gobhutan@gobhutan.site:/tmp/gobhutan-admin.conf
```

**Then SSH to your server** and run:

```bash
ssh gobhutan@gobhutan.site
```

**On the server:**

```bash
# Move the config file
sudo mv /tmp/gobhutan-admin.conf /etc/nginx/sites-available/gobhutan-admin

# Create symlink to enable the site
sudo ln -s /etc/nginx/sites-available/gobhutan-admin /etc/nginx/sites-enabled/

# Remove default Nginx site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

**Important:** If you have a domain name, edit the configuration:

```bash
sudo nano /etc/nginx/sites-available/gobhutan-admin
```

The domain name `gobhutan.site` is already configured in the nginx configuration.

### 3. Configure Environment Variables

Create a `.env.production` file in your project root:

```bash
# From your local machine, in the project directory
cat > .env.production << EOF
VITE_API_BASE_URL=https://gobhutan.site/boot
VITE_APP_NAME=GoBhutan
VITE_APP_VERSION=1.0.0
VITE_DEBUG=false
VITE_LOG_LEVEL=error
EOF
```

**Note:** The `deploy.sh` script will automatically create this file with the correct API URL if it doesn't exist.

### 4. Build and Deploy

**IMPORTANT: Run this from your LOCAL MACHINE, in the project directory.**

The `deploy.sh` script will:
- Build your application locally (requires Node.js and npm)
- Transfer the built files to the server
- Configure permissions on the server
- Reload Nginx on the server

```bash
# Make sure you're on your LOCAL MACHINE (not SSH'd into the server)
# Navigate to the project directory
cd /Users/mac/Documents/Projects/JigmeCholing/GoBhutan/GoBhutan-Admin

# Make the script executable (only needed once)
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

**Note:** You'll be prompted for your server password during the transfer process.

### 5. Set Up SSL Certificate (Optional but Recommended)

If you have a domain name, set up HTTPS:

```bash
# On the server
sudo certbot --nginx -d gobhutan.site
```

Follow the prompts. Certbot will automatically:
- Obtain an SSL certificate
- Configure Nginx for HTTPS
- Set up automatic renewal

After SSL setup, edit the Nginx config to enable HTTPS:

```bash
sudo nano /etc/nginx/sites-available/gobhutan-admin
```

Uncomment the HTTPS server block and comment out or remove the HTTP redirect. Then:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Verify Deployment

- Visit `https://gobhutan.site/go-bhutan-admin/`

## Updating the Application

To update the application after making changes:

```bash
# From your local machine
./deploy.sh
```

The script will rebuild and redeploy automatically.

## Troubleshooting

### Check Nginx Status

```bash
sudo systemctl status nginx
```

### Check Nginx Error Logs

```bash
sudo tail -f /var/log/nginx/error.log
```

### Check Nginx Access Logs

```bash
sudo tail -f /var/log/nginx/access.log
```

### Verify File Permissions

```bash
ls -la /var/www/gobhutan-admin
```

Files should be owned by `gobhutan:www-data` with `755` permissions.

### Test Nginx Configuration

```bash
sudo nginx -t
```

### Common Issues

1. **Apache Default Page Showing Instead of Your App:**
   - Apache is running on port 80 instead of Nginx
   - **Quick Fix:** Run the fix script on your server:
     ```bash
     # Transfer the fix script from your local machine
     scp fix-apache-nginx.sh gobhutan@gobhutan.site:~/
     
     # Then on the server
     ssh gobhutan@gobhutan.site
     chmod +x ~/fix-apache-nginx.sh
     ./fix-apache-nginx.sh
     ```
   - **Manual Fix:**
     ```bash
     # On the server
     sudo systemctl stop apache2
     sudo systemctl disable apache2
     sudo systemctl start nginx
     sudo systemctl enable nginx
     ```

2. **403 Forbidden:** Check file permissions and ownership
3. **502 Bad Gateway:** Ensure Nginx is running and configuration is correct
4. **404 on routes:** Ensure the `try_files` directive includes `/index.html` for SPA routing
5. **API calls failing:** Verify `VITE_API_BASE_URL` in `.env.production` is correct

## Firewall Configuration

If you have a firewall enabled, allow HTTP and HTTPS:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw status
```

## Maintenance

### Automatic SSL Renewal

Certbot sets up automatic renewal. Test it:

```bash
sudo certbot renew --dry-run
```

### Backup

Regularly backup your deployment:

```bash
# On the server
sudo tar -czf /home/gobhutan/gobhutan-admin-backup-$(date +%Y%m%d).tar.gz /var/www/gobhutan-admin
```

## Production Checklist

- [ ] Domain name configured
- [ ] SSL certificate installed
- [ ] Environment variables set correctly
- [ ] API base URL points to production backend
- [ ] Nginx security headers configured
- [ ] Firewall rules configured
- [ ] Automatic SSL renewal tested
- [ ] Backup strategy in place
- [ ] Monitoring set up (optional)

## Additional Security Recommendations

1. **Rate Limiting:** Add rate limiting to Nginx to prevent abuse
2. **Fail2Ban:** Install Fail2Ban to protect against brute force attacks
3. **Regular Updates:** Keep the system updated: `sudo apt update && sudo apt upgrade`
4. **SSH Key Authentication:** Use SSH keys instead of passwords
5. **Disable Root Login:** Ensure root login is disabled in SSH config

## Support

For issues or questions, check:
- Nginx logs: `/var/log/nginx/`
- System logs: `journalctl -u nginx`
- Application console errors in browser DevTools

