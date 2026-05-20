## ⚡ Creatokite — AI-Powered Creator Campaign OS

Fast, privacy-first platform for brands, admins and creators. Creatokite helps brands submit campaign briefs, AI matches creators at scale, and admins assign creators — brands never contact creators directly.

---

## Table of Contents

- **About:** Quick project summary
- **Process:** Campaign lifecycle and AI scoring explanation
- **Project Structure:** Where code lives
- **Local Development:** Setup and run steps (backend + frontend)
- **Environment:** Required env vars
- **Deployment:** Options (Render, Railway, VPS)
- **Contributing:** How to contribute
- **License & Contact**

---

## About

Creatokite is an end-to-end platform that automates creator discovery, assignment, tracking and payout for brand campaigns. It combines an Express + MongoDB backend with a React + Vite frontend and real-time updates via Socket.io.

## Process (how it works)

1. Brand creates a campaign brief including goals, required niche, platforms, min follower count and budget.
2. Admin reviews the brief and clicks "Run AI Analysis".
   - The AI scoring service evaluates creators across multiple signals (see AI Scoring below) and returns a ranked list with match scores.
3. Admin selects creators, adjusts allocations and clicks "Assign Creators".
   - Creators receive instant notifications via Socket.io and can accept or decline assignments.
4. Creators submit content URLs once they complete work.
5. Admin reviews submissions and either approves (releases payment) or requests revisions.
6. Brand monitors campaign progress and receives aggregated analytics and status updates.

### AI Scoring Overview

The scoring service ranks creators by combining signals such as niche match, follower reach, engagement rate, history with similar campaigns, content quality estimates, fraud indicators, and platform fit. Scores are normalized to produce an ordered suggestion list and explainable match metrics for admin review.

---

## Project Structure

Top-level layout (short):

```
creatokite_final/
├── backend/    # Node.js + Express API, seeding, Socket.io
├── frontend/   # React + Vite web client
└── README.md
```

Backend highlights: `src/config`, `src/middleware`, `src/models`, `src/routes`, `src/services/scoring.js`, `seed.js`, `server.js`.

Frontend highlights: `src/api`, `src/components`, `src/contexts/AuthContext.jsx`, `src/pages/*`, `src/router/ProtectedRoute.jsx`, `vite.config.js`.

See the code for detailed structure.

---

## Local Development

Prerequisites:
- Node.js 18+
- MongoDB (local or Atlas)

1) Backend

```bash
cd backend
copy .env.example .env
# Edit .env: set MONGODB_URI and secrets
npm install
npm run seed      # creates admin + demo data
npm run dev       # starts API at http://localhost:5000
```

2) Frontend

```bash
cd frontend
npm install
npm run dev       # starts frontend at http://localhost:5173
```

Open the app at `http://localhost:5173` after both services are running.

### Demo accounts (seed creates):

| Role    | Email                   | Password     |
|--------:|:------------------------|:-------------|
| Admin   | admin@creatokite.com    | Admin@12345  |
| Brand   | brand@demo.com          | Demo@12345   |
| Creator | creator1@demo.com       | Demo@12345   |

---

## Environment Variables

Backend `.env` (required keys)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=ask owner
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@creatokite.com
ADMIN_PASSWORD=Admin@12345
```

Frontend `.env` (Vite)

```env
VITE_API_URL=http://localhost:5000
```

---

## Deployment

Recommended: Render (free tier) — quick and stable for both frontend and backend.

Backend on Render:
1. Create a new Web Service pointing to the `backend/` folder.
2. Build command: `npm install`.
3. Start command: `npm start` (or `node src/server.js`).
4. Add environment variables from `.env.example`.

Frontend on Render (Static site):
1. New Static Site pointing at `frontend/`.
2. Build command: `npm install && npm run build`.
3. Publish directory: `dist`.
4. Set `VITE_API_URL` to your backend URL.

Alternative hosts: Railway, Vercel, Netlify, or VPS with PM2 + Nginx. For VPS, build the frontend, serve `dist` via Nginx and proxy `/api` and `/socket.io` to the backend.

---

## Contributing

- Open an issue to discuss large changes.
- Fork → branch → PR; keep changes focused and include tests for non-trivial logic.
- For frontend style changes, follow the existing CSS variables and component patterns.

If you want help improving tests, CI, or adding GH Actions, open an issue or ask in a PR.

---

## Troubleshooting

- If seeding fails, confirm `MONGODB_URI` and that MongoDB is reachable.
- If frontend can't call API in dev, confirm `VITE_API_URL` or proxy settings in `vite.config.js`.

---

## License & Contact

Built with ❤️ 

Questions or help? Open an issue or reach out to the repo owner.

---

