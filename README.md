# H5 Entertainment Platform (人人娱乐 RR.TOP Clone)

## Project Overview
Mobile-first H5 entertainment platform cloning rr86.online (人人娱乐). Built with Vue 3 + FastAPI.

## Live Deployments
- **Frontend**: https://entertainment-h-app-mlgw0o0d.devinapps.com
- **Backend API**: https://app-muwgjjkq.fly.dev (Swagger docs at /docs)
- **Reference Site**: https://rr86.online/index.html#/home
- **PRD Document**: https://docs.google.com/document/d/1q71aNDZaNV2RlPMUCKvjaUtCtuT4UpwQ1tuOtXloX8Y/edit

## Tech Stack
### Frontend
- Vue 3 + Composition API
- Vite
- Vue Router 4 (hash mode)
- Pinia (state management)
- Vant 4 (UI components)
- Axios
- vue-i18n
- Swiper
- SCSS

### Backend
- FastAPI (Python)
- SQLite with aiosqlite
- JWT authentication
- Deployed on Fly.io with persistent volume

## Frontend Pages (28 total)
1. HomePage (#/home) - Main landing with banners, games, providers
2. LoginPage (#/login)
3. RegisterPage (#/register)
4. GamesPage (#/games/:category)
5. GameDetailPage (#/game/:id)
6. DepositPage (#/deposit)
7. WithdrawPage (#/withdraw)
8. TasksPage (#/tasks)
9. IncomePage (#/income)
10. InvitePage (#/invite)
11. PromotionsPage (#/promotions)
12. ProfilePage (#/profile)
13. VideoPage (#/video)
14. DownloadPage (#/download)
15. SupportPage (#/support)
16. RechargePage (#/recharge) - USDT TRC-20 with QR
17. VipPage (#/vip)
18. SecurityCenterPage (#/safeCenter)
19. ActivityDetailPage (#/monthka)
20. RedPacketPage (#/redbag)
21. PasswordRedPacketPage (#/pwdRedbag)
22. ReportPage (#/report)
23. TransactionRecordPage (#/transRecord)
24. BetRecordPage (#/orderRecordSummary)
25. PrizeRecordPage (#/prizeRecord)
26. BuyCryptoPage (#/buyBit)
27. SoftwareDownloadPage (#/softwareDownload)
28. AgentCooperationPage

## Backend API Endpoints
- Auth: JWT login/register, Telegram login
- User: Profile CRUD, VIP info, avatar upload
- Wallet: USDT TRC-20 deposit, withdrawal, balance, transaction history
- Games: 20 seeded games, provider stubs (PG/PP/CQ9/JDB/FC/JILI/Crown/IM)
- Promotions: Activity CRUD, daily first deposit bonus, loss rebate, weekly bet bonus
- VIP: 6 levels (0-5), deposit/turnover requirements
- Referral: 0.6% commission, invite links
- Red Packets: Send/claim regular and password red packets
- Admin: User management, deposit/withdrawal approval, reports
- Security: Withdrawal PIN, email binding, wallet address
- i18n: zh-CN, en, vi

## Project Structure
```
h5-entertainment-platform/          # Frontend (Vue 3)
├── index.html
├── package.json
├── vite.config.js
├── postcss.config.js
├── public/
│   ├── favicon.svg
│   └── manifest.json
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── api/              # API service files
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── game.js
│   │   ├── promo.js
│   │   ├── user.js
│   │   └── wallet.js
│   ├── components/
│   │   ├── common/       # Shared components
│   │   │   ├── AppHeader.vue
│   │   │   ├── AppNotice.vue
│   │   │   ├── BackToTop.vue
│   │   │   ├── BottomTabBar.vue
│   │   │   └── LoginModal.vue
│   │   └── home/         # Homepage components
│   │       ├── BannerSwiper.vue
│   │       ├── ComingSoonCard.vue
│   │       ├── GameCard.vue
│   │       ├── GameCategoryTabs.vue
│   │       ├── ProviderCard.vue
│   │       ├── QuickActions.vue
│   │       └── SectionHeader.vue
│   ├── i18n/
│   │   ├── index.js
│   │   ├── en.js
│   │   └── zh-CN.js
│   ├── mock/
│   │   └── index.js
│   ├── router/
│   │   └── index.js
│   ├── stores/
│   │   ├── app.js
│   │   ├── game.js
│   │   ├── user.js
│   │   └── wallet.js
│   ├── styles/
│   │   ├── _variables.scss
│   │   └── global.scss
│   ├── utils/
│   │   └── request.js
│   └── views/            # 28 page components
│       ├── HomePage.vue
│       ├── LoginPage.vue
│       ├── RegisterPage.vue
│       └── ... (25 more)
└── .env.example

h5-backend/                         # Backend (FastAPI)
├── app/
│   ├── main.py
│   ├── database.py        # SQLite schema + seed data
│   ├── models/
│   │   └── __init__.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── app_config.py
│   │   ├── auth.py
│   │   ├── games.py
│   │   ├── promotions.py
│   │   ├── redpacket.py
│   │   ├── referral.py
│   │   ├── security.py
│   │   ├── user.py
│   │   ├── vip.py
│   │   └── wallet.py
│   └── utils/
│       ├── __init__.py
│       └── auth.py        # JWT utilities
```

## Design Specs
- Dark theme: bg #1a1a2e, card #1e2a4a, header #0f0f23
- Accent: purple #7c3aed/#a78bfa, gold #f59e0b
- Max-width: 450px centered (mobile-first)
- Header: 50px, Bottom tab: 60px, Banner: 180px
- Chinese default language

## Current State & What's Done
- All 28 frontend pages built and styled
- Branding matches 人人娱乐 (logo, colors, layout)
- Full backend API with all endpoints
- Mobile adaptation (max-width 450px container)
- Header with 登录/注册 buttons
- Announcement marquee with Chinese text
- Banner carousel (5 gradient banners)
- Game category tabs (9 categories)
- Hot games horizontal scroll
- Provider cards for all categories
- Bottom tab bar with line-style icons
- Back-to-top button

## What Remains (Next Steps)
1. **Replace placeholder images with real assets** from rr86.online:
   - Banner images: banner-allbonus.webp, banner-yessc2.webp, banner-slotrekeback2.webp, banner-actThroughtDZ.webp, banner-actThroughtQP.webp
   - Quick action icons: 充值/提现/任务/我的收入/邀请好友
   - Game card thumbnails (currently CSS gradients)
   - Provider card images
   - Bottom tab bar icons
   - Logo image
2. **Use Gemini AI** to generate custom-sized images for each element
3. **Push all source code** to this repo (code currently only exists on Devin's VM)

## Original Devin Session
- Session ID: 83ee0006442e443b9f55b81e29262ea0
- Organization: claude58888-debug
- Total ACUs used: ~13
- Session paused due to ACU usage limits

## How to Continue in New Org
1. Create a new Devin session in the new organization
2. Provide this README + PRD doc link + reference site URL
3. Instruct Devin to:
   a. Build the same project from scratch using the specs above
   b. Reference the deployed frontend at https://entertainment-h-app-mlgw0o0d.devinapps.com for visual reference
   c. Reference rr86.online for image assets and exact styling
   d. Focus on replacing placeholder images with real ones from rr86.online
4. Connect to this GitHub repo for code storage
