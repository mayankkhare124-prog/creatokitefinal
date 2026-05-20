# ⚡ Creatokite

AI-powered creator campaign OS for brands, admins, and creators.

Brands submit campaign goals, AI ranks creators, and admins assign work in bulk. Brands never contact creators directly.

## What’s included

- `backend/` Node.js + Express + MongoDB API
- `frontend/` React 18 + Vite dashboard UI
- Seed data for admin, brands, and creators
- Role-based routes for creator, brand, and admin workflows

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB running locally or in Atlas

### Backend

```bash
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open the app at the local or network URL printed by Vite.

## Demo Accounts

After seeding:

| Role | Email | Password |
|---|---|---|
| Admin | admin@creatokite.com | Admin@12345 |
| Brand | brand@demo.com | Demo@12345 |
| Creator | creator1@demo.com | Demo@12345 |

## Environment Variables

### `backend/.env`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/creatokite
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@creatokite.com
ADMIN_PASSWORD=Admin@12345
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

## Production Notes

- Build the frontend with `npm run build`.
- Set `VITE_API_URL` to your deployed backend URL if the frontend and API are on different domains.
- Keep `node_modules/`, `dist/`, and local `.env` files out of git; `.gitignore` is included for that.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Recharts, Socket.io client |
| Backend | Node.js, Express, Socket.io |
| Database | MongoDB, Mongoose |
| Auth | JWT, refresh tokens, bcrypt |

## Support

Built for the Indian creator economy.
