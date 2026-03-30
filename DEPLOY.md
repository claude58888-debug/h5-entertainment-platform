# 大大娱乐 - 部署指南 (Deployment Guide)

## Quick Start

### Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/claude58888-debug/h5-entertainment-platform.git
cd h5-entertainment-platform

# 2. Create environment file
cp admin-server/.env.example .env

# 3. Update .env with production values
# IMPORTANT: Change JWT secrets and other sensitive values
nano .env

# 4. Start the application
docker-compose up -d

# 5. Seed the database (first run only)
docker exec dada-platform node admin-server/seed.js

# 6. Access the application
# H5 Frontend: http://localhost:3000
# Admin Panel: http://localhost:3000/admin/
# API Health:  http://localhost:3000/api/health
```

### Stop & Restart

```bash
# Stop all services
docker-compose down

# Restart
docker-compose up -d

# View logs
docker-compose logs -f app

# Rebuild after code changes
docker-compose up -d --build
```

---

## Manual Deployment (Without Docker)

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

### Steps

```bash
# 1. Install H5 frontend dependencies and build
npm install
npm run build

# 2. Install admin frontend dependencies and build
cd admin
npm install
npm run build
cd ..

# 3. Install admin-server dependencies
cd admin-server
npm install --omit=dev
cd ..

# 4. Create environment file
cp admin-server/.env.example admin-server/.env

# 5. Edit environment variables
nano admin-server/.env

# 6. Seed the database (first run only)
cd admin-server && node seed.js && cd ..

# 7. Start the server
NODE_ENV=production PORT=3000 node admin-server/server.js
```

### Process Manager (PM2)

For production, use PM2 to manage the Node.js process:

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
cd admin-server
pm2 start server.js --name dada-platform --env production

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup
```

---

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | Yes (set to `production`) |
| `PORT` | Server listen port | `3001` | No |
| `JWT_SECRET` | Admin JWT signing secret | `dev-only-admin-server-key` | **Yes** (change in production) |
| `H5_JWT_SECRET` | H5 user JWT signing secret | (none) | **Yes** (set in production) |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,http://localhost:3001` | No |
| `SEED_ADMIN_PWD` | Seed script admin password | `demo` | No |

### Production `.env` Example

```env
NODE_ENV=production
PORT=3000

# Generate strong secrets: openssl rand -hex 32
JWT_SECRET=your-strong-random-secret-here
H5_JWT_SECRET=your-other-strong-random-secret-here

# Set to your domain(s)
CORS_ORIGINS=https://your-domain.com,https://admin.your-domain.com

SEED_ADMIN_PWD=your-secure-admin-password
```

---

## Nginx Configuration

The project includes an Nginx configuration at `deploy/nginx.conf` for use as a reverse proxy.

### With Docker Compose

Nginx is included as an optional service in `docker-compose.yml`. It automatically proxies to the app container.

```bash
# Start with Nginx
docker-compose up -d

# H5 Frontend: http://localhost (port 80)
# Admin Panel: http://localhost/admin/
```

### Standalone Nginx

To use Nginx outside Docker:

```bash
# Copy the config
sudo cp deploy/nginx.conf /etc/nginx/nginx.conf

# Update the upstream to point to your app
# Change "server app:3000" to "server 127.0.0.1:3000"

# Test the configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### SSL/HTTPS Setup

1. Obtain SSL certificates (e.g., via Let's Encrypt):

```bash
# Install certbot
sudo apt install certbot

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com
```

2. Place certificates in `deploy/ssl/`:
   - `deploy/ssl/fullchain.pem`
   - `deploy/ssl/privkey.pem`

3. Uncomment the HTTPS server block in `deploy/nginx.conf`

4. Uncomment the HTTP-to-HTTPS redirect in the HTTP server block

5. Restart Nginx:

```bash
docker-compose restart nginx
# or
sudo systemctl restart nginx
```

### Nginx Features

- **Gzip compression**: Enabled for text, CSS, JS, JSON, SVG, and font files
- **Static asset caching**: 7-day cache for hashed assets (`/assets/*`), 30-day cache for images (`/img/*`)
- **Security headers**: X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, CSP, Referrer-Policy, Permissions-Policy
- **SPA routing**: Fallback to `index.html` for both H5 and admin frontends
- **API proxy**: All `/api/*` requests proxied to the Node.js backend
- **Hidden file protection**: Denies access to dotfiles (`.env`, `.git`, etc.)

---

## Architecture

```
                    ┌──────────────┐
                    │   Internet   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Nginx (:80) │  ← Reverse proxy, SSL, gzip, caching
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  App (:3000) │  ← Express.js (API + static files)
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   SQLite DB  │  ← Persistent volume
                    └──────────────┘
```

### Port Mapping

| Service | Container Port | Host Port | Description |
|---------|---------------|-----------|-------------|
| app | 3000 | 3000 | Node.js API + static files |
| nginx | 80 | 80 | HTTP reverse proxy |
| nginx | 443 | 443 | HTTPS reverse proxy (when configured) |

---

## Docker Commands Reference

```bash
# Build image only
docker build -t dada-platform .

# Run standalone (without compose)
docker run -d \
  --name dada-platform \
  -p 3000:3000 \
  -v dada-data:/app/data \
  --env-file .env \
  dada-platform

# View container logs
docker logs -f dada-platform

# Execute command in running container
docker exec -it dada-platform sh

# Check container health
docker inspect --format='{{.State.Health.Status}}' dada-platform

# Remove everything (including volumes)
docker-compose down -v
```

---

## Troubleshooting

### Container won't start
- Check logs: `docker-compose logs app`
- Verify `.env` file exists and has correct values
- Ensure port 3000 is not in use: `lsof -i :3000`

### Database issues
- Database file is stored in the Docker volume `app-data`
- To reset: `docker-compose down -v` then `docker-compose up -d`
- To seed: `docker exec dada-platform node admin-server/seed.js`

### Nginx 502 Bad Gateway
- App container may still be starting. Wait for health check to pass
- Check app logs: `docker-compose logs app`
- Verify app is healthy: `docker exec dada-platform wget -qO- http://localhost:3000/api/health`

### Build failures
- Clear Docker cache: `docker-compose build --no-cache`
- Check Node.js version matches (18-alpine)
- Ensure all dependencies are in package.json
