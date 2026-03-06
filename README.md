# H5 Entertainment Platform

A mobile-first H5 entertainment platform built with Vue 3 + Vite.

## Tech Stack

- **Vue 3** + Composition API
- **Vite** - Build tool
- **Vue Router 4** - Hash mode routing
- **Pinia** - State management
- **Vant 4** - Mobile UI components
- **Axios** - HTTP client
- **vue-i18n** - Internationalization (zh-CN / en)
- **Swiper** - Banner carousel
- **SCSS** - Styling
- **postcss-px-to-viewport** - Responsive design (375px base)

## Features

- Dark theme design
- Mobile-first responsive layout (max-width: 480px)
- Multi-language support (Chinese / English)
- Auth guard with login modal popup
- Pull-to-refresh & infinite scroll
- Lazy image loading
- Page transitions
- Skeleton loading states
- PWA support
- Back to top button

## Pages

| Route | Description | Auth |
|-------|-------------|------|
| `/#/home` | Homepage | No |
| `/#/login` | Login | No |
| `/#/register` | Register | No |
| `/#/games/:category` | Game list by category | No |
| `/#/game/:id` | Game detail | Yes |
| `/#/deposit` | Deposit | Yes |
| `/#/withdraw` | Withdraw | Yes |
| `/#/tasks` | Task center | Yes |
| `/#/income` | Income center | Yes |
| `/#/invite` | Invite friends | Yes |
| `/#/promotions` | Promotions | Yes |
| `/#/profile` | User profile | Yes |
| `/#/video` | Video zone | No |
| `/#/download` | App download | No |
| `/#/support` | Customer support | No |

## Project Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Project Structure

```
src/
├── api/          # API modules (auth, game, wallet, user, promo, app)
├── components/
│   ├── common/   # Global components (Header, TabBar, LoginModal, etc.)
│   └── home/     # Homepage sections
├── i18n/         # Internationalization (zh-CN, en)
├── mock/         # Mock data
├── router/       # Vue Router configuration
├── stores/       # Pinia stores (user, wallet, app, game)
├── styles/       # SCSS variables and global styles
├── utils/        # Axios instance and utilities
└── views/        # Page components
```

## Design Tokens

- Background: `#1a1a2e`
- Card: `#1e2a4a`
- Header: `#0f0f23`
- Accent Purple: `#7c3aed` / `#a78bfa`
- Gold: `#f59e0b`
- Max Width: `480px`
