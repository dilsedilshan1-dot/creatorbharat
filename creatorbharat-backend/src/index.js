const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: '*'
}));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 200 }));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/creators',     require('./routes/creators'));
app.use('/api/brands',       require('./routes/brands'));
app.use('/api/campaigns',    require('./routes/campaigns'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/reviews',      require('./routes/reviews'));
app.use('/api/messages',     require('./routes/messages'));
app.use('/api/blog',         require('./routes/blog'));
app.use('/api/payments',     require('./routes/payments'));
app.use('/api/admin',        require('./routes/admin'));

// ── Health check & Root ─────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'CreatorBharat API is running 🚀', status: 'ok' }));
app.get('/health', (req, res) => res.json({ status: 'ok', platform: 'CreatorBharat' }));

// ── Error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => console.log(`CreatorBharat API running on port ${PORT}`));
