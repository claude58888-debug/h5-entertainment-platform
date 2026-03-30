# 大大娱乐 (DaDa Entertainment Platform)

[![CI](https://github.com/claude58888-debug/h5-entertainment-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/claude58888-debug/h5-entertainment-platform/actions/workflows/ci.yml)

Mobile-first H5 entertainment platform with admin backend.

## Tech Stack
- **Backend**: Express.js + SQLite (better-sqlite3) + JWT + bcrypt
- **Admin Frontend**: Vue 3 + Element Plus + SCSS
- **H5 Frontend**: Vue 3 + Vant 4 + SCSS  
- **Build Tool**: Vite
- **Security**: Helmet.js, express-rate-limit, CORS, express-validator

## Project Structure
```
admin-server/    # Express.js API server (port 3001)
  server.js      # Main server with all admin API routes
  h5-routes.js   # H5 frontend API routes  
  db.js          # SQLite database (27+ tables)
  validation.js  # Input validation rules
admin/           # Vue 3 + Element Plus admin dashboard
  src/views/     # 15+ admin pages
  src/api/       # 15 API service modules
src/             # Vue 3 + Vant 4 H5 mobile frontend
  views/         # 20+ H5 pages
  stores/        # Pinia state management
  api/           # 6 API service modules
```

## Features
- **Admin Backend** (12 modules): Dashboard, Agents, Members, Finance, Games, VIP, Rakeback, Promotions, Messages, Risk, System Settings, Compliance
- **H5 Frontend**: Registration, Login, Games, Promotions, VIP, Deposit/Withdraw, Profile, Responsible Gaming
- **Security**: Helmet.js headers, rate limiting, bcrypt password hashing, JWT auth, input validation, audit logging
- **Compliance**: KYC/AML, self-exclusion, age verification, responsible gambling
- **Performance**: DB indexes, API caching, gzip/brotli compression, lazy loading, PWA support

## Getting Started
```bash
# Backend
cd admin-server && npm install && node server.js

# Admin Frontend  
cd admin && npm install && npm run dev

# H5 Frontend
npm install && npm run dev
```

## Environment Variables
See `admin-server/.env.example` for required configuration.

## 109 Commits | 17 PRs (#25-#41) | All Merged
