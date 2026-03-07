# Continuation Prompt for New Devin Session

Copy-paste this entire prompt into a new Devin session to continue the work.

---

Please continue building this mobile-first H5 entertainment platform. A previous Devin session built most of it but ran out of ACUs. Here's everything you need:

## REFERENCE SITES
- Previous build (LIVE): https://entertainment-h-app-mlgw0o0d.devinapps.com (view this to see what was already built)
- Target reference: https://rr86.online/index.html#/home (this is what we're cloning)
- PRD document: https://docs.google.com/document/d/1q71aNDZaNV2RlPMUCKvjaUtCtuT4UpwQ1tuOtXloX8Y/edit
- GitHub repo: https://github.com/claude58888-debug/h5-entertainment-platform

## WHAT'S ALREADY DONE
- Full Vue 3 frontend with 28 pages
- Full FastAPI backend with SQLite
- Mobile-first layout (max-width 450px)
- Dark theme matching rr86.online
- All branding as 人人娱乐 RR.TOP
- Header with 登录/注册 buttons
- Announcement marquee
- Banner carousel (5 gradient banners)
- Game category tabs (9 categories)
- Hot games horizontal scroll
- Provider cards
- Bottom tab bar

## WHAT NEEDS TO BE DONE (PRIORITY ORDER)

### 1. Replace ALL placeholder images with REAL images from rr86.online
The current site uses CSS gradients as placeholders. Replace with actual images:

**Banner images** - scrape from rr86.online/assets/:
- banner-allbonus.webp
- banner-yessc2.webp  
- banner-slotrekeback2.webp
- banner-actThroughtDZ.webp
- banner-actThroughtQP.webp

**Quick action icons** (5 icons: 充值/提现/任务/我的收入/邀请好友):
- 金刚区_充值.webp, recharge.png, renwu.png, shouru.png, inviteFriends.png

**Game thumbnails** for hot games:
- 极速糖果1000, 麻将胡了2, 麻将胡了, 奥林匹斯之门, 甜入蜜境, 招财猫, 幸运尼柯, 淘金热

**Provider card images** (PG电子, PP电子, CQ9电子, etc.)

**Bottom tab icons** and **Logo**

APPROACH: Write a script to fetch rr86.online/index.html, parse JS bundles to find all asset URLs, then use those URLs directly as img src in your code.

### 2. Push all code to GitHub repo
Push to: https://github.com/claude58888-debug/h5-entertainment-platform
You'll need a GitHub token - ask for it as a secret.

### 3. Deploy both frontend and backend

## TECHNICAL SPECS

### Frontend Tech Stack
- Vue 3 + Composition API + Vite
- Vue Router 4 (hash mode)
- Pinia state management
- Vant 4 UI components
- Axios, vue-i18n, Swiper, SCSS
- NO postcss-px-to-viewport (was removed - caused layout issues)

### Backend Tech Stack  
- FastAPI (Python) + SQLite with aiosqlite
- JWT authentication
- Deploy on Fly.io

### Design
- Dark theme: bg #1a1a2e, card #1e2a4a, header #0f0f23
- Accent: purple #7c3aed/#a78bfa, gold #f59e0b
- Max-width: 450px centered, dark #0a0a1a sides
- Inline critical CSS in index.html for max-width constraint
- Header 50px, bottom tab 60px, banner 180px
- Chinese default language

### Key Implementation Notes
- isLoggedIn defaults to false (no auto-login from localStorage)
- Announcement text pre-initialized (not async)
- Back-to-top: position fixed, left: calc(50% + 179px), z-index 9999
- Vant popups constrained to 450px with left:50% + translateX(-50%)
- Game cards use CSS gradients with game name overlay (until real images added)

### 28 Frontend Pages
HomePage, LoginPage, RegisterPage, GamesPage, GameDetailPage, DepositPage, WithdrawPage, TasksPage, IncomePage, InvitePage, PromotionsPage, ProfilePage, VideoPage, DownloadPage, SupportPage, RechargePage (USDT TRC-20), VipPage, SecurityCenterPage, ActivityDetailPage, RedPacketPage, PasswordRedPacketPage, ReportPage, TransactionRecordPage, BetRecordPage, PrizeRecordPage, BuyCryptoPage, SoftwareDownloadPage, AgentCooperationPage

### Backend Endpoints
Auth, User, Wallet, Games, Promotions, VIP (6 levels), Referral (0.6% commission), Red Packets, Admin panel, Security, i18n (zh-CN/en/vi)

See the README.md in the GitHub repo for full project structure and details.
