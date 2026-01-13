# Nginx Deployment Notes for gobhutan.site

## Current Configuration

The application is configured to be served at: `https://gobhutan.site/go-bhutan-admin/`

## Important Steps to Deploy

### 1. Verify SSL Certificates

The nginx configuration expects SSL certificates at:
- Certificate: `/etc/letsencrypt/live/gobhutan.site/fullchain.pem`
- Key: `/etc/letsencrypt/live/gobhutan.site/privkey.pem`

If certificates are at a different location or domain, update `nginx.conf` accordingly.

### 2. Build the Application

**IMPORTANT:** The application must be rebuilt after configuring the base path:

```bash
npm run build
```

This ensures all asset paths are correctly prefixed with `/go-bhutan-admin/`.

### 3. Deploy Nginx Configuration

```bash
# Copy nginx config to server
scp nginx.conf gobhutan@gobhutan.site:/tmp/gobhutan-admin.conf

# SSH to server
ssh gobhutan@gobhutan.site

# On the server:
sudo mv /tmp/gobhutan-admin.conf /etc/nginx/sites-available/gobhutan-admin
sudo ln -sf /etc/nginx/sites-available/gobhutan-admin /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
```

### 4. Verify Deployment

After deployment, check:
1. **Browser Console:** Open DevTools and check for 404 errors on JS/CSS files
2. **Network Tab:** Verify all assets are loading from `/go-bhutan-admin/assets/...`
3. **Nginx Logs:** Check for errors: `sudo tail -f /var/log/nginx/error.log`

## Common Issues

### Empty Page / White Screen

If you see an empty page:

1. **Check Browser Console (F12):**
   - Look for 404 errors on JavaScript files
   - Check for CORS errors
   - Verify React is loading

2. **Verify Asset Paths:**
   - Assets should load from: `https://gobhutan.site/go-bhutan-admin/assets/...`
   - If you see `/assets/...` (without prefix), the build didn't use the base path

3. **Check Nginx Configuration:**
   ```bash
   sudo nginx -t
   sudo tail -50 /var/log/nginx/error.log
   ```

4. **Verify Files Exist:**
   ```bash
   ls -la /var/www/gobhutan-admin/
   # Should see index.html and assets/ directory
   ```

### SSL Certificate Issues

If SSL certificates aren't set up yet, you can temporarily comment out the HTTPS server block and use HTTP only, or set up SSL with:

```bash
sudo certbot --nginx -d gobhutan.site
```

### Assets Not Loading

If assets return 404:
- Ensure the application was rebuilt after adding `base: '/go-bhutan-admin/'` to vite.config.js
- Check that nginx alias path is correct: `/var/www/gobhutan-admin/`
- Verify file permissions: `sudo chown -R gobhutan:www-data /var/www/gobhutan-admin`

## Testing Locally Before Deploy

You can test the production build locally:

```bash
npm run build
npm run preview
# Visit http://localhost:4173/go-bhutan-admin/
```

