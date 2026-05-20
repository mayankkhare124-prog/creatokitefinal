require('dotenv').config();
const express     = require('express');
const http        = require('http');
const { Server }  = require('socket.io');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const connectDB   = require('./config/db');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL||'http://localhost:5173', methods:['GET','POST'] }
});

app.set('io', io);

/* ── Middleware ─────────────────────────────────── */
app.use(helmet({ crossOriginEmbedderPolicy:false }));
app.use(cors({ origin: process.env.CLIENT_URL||'http://localhost:5173', credentials:true }));
app.use(compression());
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true }));
if (process.env.NODE_ENV!=='production') app.use(morgan('dev'));

const limiter = rateLimit({ windowMs:15*60*1000, max:200, standardHeaders:true, legacyHeaders:false });
app.use('/api/', limiter);

/* ── Routes ─────────────────────────────────────── */
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));

/* ── Health check ───────────────────────────────── */
app.get('/health', (_req, res) => res.json({ status:'ok', ts:new Date().toISOString() }));

/* ── 404 handler ────────────────────────────────── */
app.use((_req, res) => res.status(404).json({ success:false, message:'Route not found' }));

/* ── Error handler ──────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status||500).json({ success:false, message:err.message||'Server error' });
});

/* ── Socket.io ──────────────────────────────────── */
io.on('connection', socket => {
  socket.on('join:user', userId => socket.join(`user:${userId}`));
  socket.on('join:room', room   => socket.join(room));
  socket.on('disconnect', () => {});
});

/* ── Cron: recalculate scores daily ─────────────── */
try {
  const cron = require('node-cron');
  const { recalculateAllScores } = require('./services/scoring');
  cron.schedule('0 3 * * *', () => recalculateAllScores());
} catch(e){}

/* ── Start ──────────────────────────────────────── */
const PORT = process.env.PORT||5000;
connectDB().then(()=>{
  server.listen(PORT, ()=>console.log(`🚀 Creatokite server on port ${PORT}`));
});

module.exports = app;
