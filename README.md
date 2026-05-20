# ⚡ Creatokite — AI-Powered Creator Campaign OS

> India's first AI-powered platform where brands submit campaign goals, AI matches creators, and admin assigns them in bulk. Brands **never contact creators directly**.

---

## 🗂️ Project Structure

```
creatokite/
├── backend/          # Node.js + Express + MongoDB API
│   ├── src/
│   │   ├── config/       db.js
│   │   ├── middleware/   auth.js
│   │   ├── models/       index.js (all schemas)
│   │   ├── routes/       auth, campaigns, admin, users, analytics
│   │   ├── services/     scoring.js (AI creator scoring)
│   │   ├── seed.js       demo data seeder
│   │   └── server.js     Express + Socket.io entrypoint
│   ├── .env.example
│   └── package.json
│
└── frontend/         # React 18 + Vite
    ├── src/
    │   ├── api/           all API calls
    │   ├── components/    ui/ + layout/
    │   ├── contexts/      AuthContext
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── auth/      Login, Register
    │   │   ├── creator/   Dashboard, AssignedCampaigns, Analytics, Earnings, Leaderboard, Profile
    │   │   ├── brand/     BrandDashboard, CreateCampaign, BrandCampaigns, CampaignDetail, BrandAnalytics
    │   │   └── admin/     AdminDashboard, AdminCampaigns, AdminUsers, AdminAnalytics
    │   ├── router/        ProtectedRoute
    │   ├── styles/        global.css (complete design system)
    │   └── App.jsx
    ├── index.html
    └── package.json
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and other values

npm install
npm run seed      # Creates admin + demo data
npm run dev       # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev       # Starts on http://localhost:5173
```

### 3. Open in browser

```
http://localhost:5173
```

**Demo accounts (after seeding):**
| Role    | Email                   | Password     |
|---------|-------------------------|--------------|
| Admin   | admin@creatokite.com    | Admin@12345  |
| Brand   | brand@demo.com          | Demo@12345   |
| Creator | creator1@demo.com       | Demo@12345   |

---

## 🌐 Deploy to Production

### Option A — Render.com (Recommended, Free)

**Backend:**
1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo → select `backend/` as root
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `.env.example`

**Frontend:**
1. New Static Site → select `frontend/` as root
2. Build command: `npm install && npm run build`
3. Publish directory: `dist`
4. Add env var: `VITE_API_URL=https://your-backend.onrender.com`

**Update vite.config.js proxy for production:**
In frontend `vite.config.js`, the proxy handles local dev.
For production, update `frontend/src/api/index.js`:
```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});
```

---

### Option B — Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Deploy backend
cd backend
railway init
railway up

# Deploy frontend
cd ../frontend
railway init
railway up
```

---

### Option C — VPS (Ubuntu) with PM2 + Nginx

```bash
# On your server:

# 1. Clone & install
git clone <your-repo>

# 2. Backend
cd creatokite/backend
npm install
cp .env.example .env  # fill in production values
npm run seed

# 3. Start with PM2
npm install -g pm2
pm2 start src/server.js --name creatokite-api
pm2 save && pm2 startup

# 4. Frontend build
cd ../frontend
npm install && npm run build

# 5. Nginx config
sudo nano /etc/nginx/sites-available/creatokite
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/creatokite/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/creatokite /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

---

## 🔑 Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/creatokite
JWT_SECRET=<random 64 char string>
JWT_REFRESH_SECRET=<different random 64 char string>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=https://yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123
```

### Frontend `.env` (Vite)

```env
VITE_API_URL=https://api.yourdomain.com
```

---

## 🏗️ Core Workflow

```
Brand submits campaign brief
        ↓
Admin reviews (admin panel)
        ↓
Admin clicks "Run AI Analysis"
  → AI scores 12,000+ creators on 12 parameters
  → Returns ranked suggestions with match scores
        ↓
Admin selects creators + sets payment allocation
Admin clicks "Assign Creators"
  → Creators notified instantly via Socket.io
        ↓
Creators accept / decline in their dashboard
        ↓
Creators submit content URL through platform
        ↓
Admin reviews submission
  → Approve → payment released
  → Request revision → creator resubmits
        ↓
Brand sees real-time progress (never contacts creators)
```

---

## 🤖 AI Scoring Parameters

The creator matching engine scores on:
1. Niche match (exact + sub-niche)
2. Follower reach vs campaign minimum
3. Creator Score (0–1000)
4. Average engagement rate
5. Platform match
6. Trust score & authenticity
7. Delivery / success rate
8. Audience growth rate
9. Content quality DNA
10. Campaign history
11. Response time
12. Fake follower estimate

---

## 📦 Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | React 18, Vite, Recharts, Socket.io    |
| Backend     | Node.js, Express, Socket.io            |
| Database    | MongoDB + Mongoose                     |
| Auth        | JWT + Refresh Tokens + bcrypt          |
| Realtime    | Socket.io                              |
| Scheduling  | node-cron (daily score recalculation)  |
| Deployment  | Render / Railway / VPS + PM2 + Nginx   |

---

## 📞 Support

Built with ❤️ for the Indian Creator Economy.
