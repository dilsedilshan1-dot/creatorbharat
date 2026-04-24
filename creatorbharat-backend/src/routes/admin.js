const router = require('express').Router();
const prisma = require('../prisma');
const { auth, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(auth, adminOnly);

// GET /api/admin/stats — dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [creators, brands, campaigns, applications, payments, blogs] = await Promise.all([
      prisma.creator.count(),
      prisma.brand.count(),
      prisma.campaign.count({ where: { status: 'LIVE' } }),
      prisma.application.count(),
      prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.blog.count({ where: { published: true } }),
    ]);

    const pending = await prisma.creator.count({ where: { status: 'PENDING' } });
    const revenue = (payments._sum?.amount || 0) / 100;

    res.json({ creators, brands, campaigns, applications, pending, revenue, blogs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/creators — all creators with filters
router.get('/creators', async (req, res) => {
  try {
    const { status, page=1, limit=25 } = req.query;
    const where = status ? { status } : {};
    const creators = await prisma.creator.findMany({
      where, orderBy: { createdAt: 'desc' },
      skip: (page-1)*limit, take: parseInt(limit),
      include: { user: { select: { email: true } }, _count: { select: { reviews: true } } }
    });
    const total = await prisma.creator.count({ where });
    res.json({ creators, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/creators/:id — verify, feature, suspend
router.patch('/creators/:id', async (req, res) => {
  try {
    const { verified, featured, trending, pro, status } = req.body;
    const creator = await prisma.creator.update({
      where: { id: req.params.id },
      data: { verified, featured, trending, pro, status }
    });
    res.json(creator);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/blog — create blog post
router.post('/blog', async (req, res) => {
  try {
    const blog = await prisma.blog.create({ data: { ...req.body, published: true } });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/blog — list all blog posts
router.get('/blog', async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/blog/:id
router.delete('/blog/:id', async (req, res) => {
  try {
    await prisma.blog.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/payments — revenue report
router.get('/payments', async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: 'PAID' },
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { name: true, handle: true } },
        brand: { select: { companyName: true } }
      }
    });
    const total = payments.reduce((s, p) => s + p.amount, 0);
    res.json({ payments, totalRevenue: total / 100 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/contacts — contact form submissions
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/brands — list all brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } }, _count: { select: { campaigns: true } } }
    });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/campaigns — list all campaigns
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: { brand: { select: { companyName: true } } }
    });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/campaigns/:id
router.delete('/campaigns/:id', async (req, res) => {
  try {
    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
