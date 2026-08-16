// 🇮🇳 CreatorBharat SaaS Messages Router
import express from 'express';
import prisma from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/messages/conversations — fetch user chat histories grouped by conversation partner
router.get('/conversations', async (req, res) => {
  try {
    if (req.user.role !== 'BRAND' && req.user.role !== 'CREATOR') {
      return res.status(403).json({ error: 'Messaging is available for registered creators and brands only.' });
    }

    const isBrand = req.user.role === 'BRAND';
    let brandId = '';
    let creatorId = '';

    if (isBrand) {
      const brand = await prisma.brand.findUnique({ where: { userId: req.user.id } });
      if (!brand) return res.status(404).json({ error: 'Brand details not found.' });
      brandId = brand.id;
    } else {
      const creator = await prisma.creator.findUnique({ where: { userId: req.user.id } });
      if (!creator) return res.status(404).json({ error: 'Creator details not found.' });
      creatorId = creator.id;
    }

    // Fetch all messages for the current entity
    const messages = await prisma.message.findMany({
      where: isBrand ? { brandId } : { creatorId },
      orderBy: { createdAt: 'desc' }
    });

    // Group by the "other" participant ID
    const conversationsMap = new Map();

    for (const msg of messages) {
      const otherId = isBrand ? msg.creatorId : msg.brandId;
      if (!conversationsMap.has(otherId)) {
        conversationsMap.set(otherId, {
          lastMessage: msg,
          unreadCount: (!msg.read && ((isBrand && !msg.fromBrand) || (!isBrand && msg.fromBrand))) ? 1 : 0
        });
      } else {
        if (!msg.read && ((isBrand && !msg.fromBrand) || (!isBrand && msg.fromBrand))) {
          conversationsMap.get(otherId).unreadCount += 1;
        }
      }
    }

    const otherIds = Array.from(conversationsMap.keys());
    const conversations = [];

    if (isBrand) {
      const creators = await prisma.creator.findMany({
        where: { id: { in: otherIds } },
        select: { id: true, name: true, photo: true, handle: true }
      });

      creators.forEach(c => {
        const chatInfo = conversationsMap.get(c.id);
        conversations.push({
          id: c.id,
          name: c.name,
          photo: c.photo,
          handle: c.handle,
          lastMsg: chatInfo.lastMessage.text,
          time: new Date(chatInfo.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: chatInfo.unreadCount,
          timestamp: chatInfo.lastMessage.createdAt
        });
      });

      if (conversationsMap.has('cb-official-support') && !conversations.some(c => c.id === 'cb-official-support')) {
        const chatInfo = conversationsMap.get('cb-official-support');
        conversations.push({
          id: 'cb-official-support',
          name: 'CreatorBharat Official Support',
          photo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
          handle: 'support',
          lastMsg: chatInfo.lastMessage.text,
          time: new Date(chatInfo.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: chatInfo.unreadCount,
          timestamp: chatInfo.lastMessage.createdAt
        });
      }

      if (!conversations.some(c => c.id === 'cb-official-support')) {
        conversations.push({
          id: 'cb-official-support',
          name: 'CreatorBharat Official Support',
          photo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
          handle: 'support',
          lastMsg: 'Welcome to CreatorBharat Support! 🇮🇳 How can we assist you today?',
          time: 'Just Now',
          unread: 0,
          timestamp: new Date()
        });
      }
    } else {
      const brands = await prisma.brand.findMany({
        where: { id: { in: otherIds } },
        select: { id: true, companyName: true }
      });

      brands.forEach(b => {
        const chatInfo = conversationsMap.get(b.id);
        conversations.push({
          id: b.id,
          name: b.companyName || 'Brand Partner',
          photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(b.companyName || 'B')}&background=0f172a&color=fff`,
          handle: b.companyName ? b.companyName.toLowerCase().replace(/\s+/g, '') : 'brand',
          lastMsg: chatInfo.lastMessage.text,
          time: new Date(chatInfo.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: chatInfo.unreadCount,
          timestamp: chatInfo.lastMessage.createdAt
        });
      });

      if (conversationsMap.has('cb-official-support') && !conversations.some(c => c.id === 'cb-official-support')) {
        const chatInfo = conversationsMap.get('cb-official-support');
        conversations.push({
          id: 'cb-official-support',
          name: 'CreatorBharat Official Support',
          photo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
          handle: 'support',
          lastMsg: chatInfo.lastMessage.text,
          time: new Date(chatInfo.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: chatInfo.unreadCount,
          timestamp: chatInfo.lastMessage.createdAt
        });
      }

      if (!conversations.some(c => c.id === 'cb-official-support')) {
        conversations.push({
          id: 'cb-official-support',
          name: 'CreatorBharat Official Support',
          photo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
          handle: 'support',
          lastMsg: 'Welcome to CreatorBharat Support! 🇮🇳 How can we assist you today?',
          time: 'Just Now',
          unread: 0,
          timestamp: new Date()
        });
      }
    }

    conversations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(conversations);
  } catch (err) {
    console.error('[GET /api/messages/conversations] Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve conversations.' });
  }
});

// GET /api/messages/history/:otherId — fetch history with specific creator or brand
router.get('/history/:otherId', async (req, res) => {
  try {
    if (req.user.role !== 'BRAND' && req.user.role !== 'CREATOR') {
      return res.status(403).json({ error: 'Access restricted to creators and brands.' });
    }

    const { otherId } = req.params;
    const isBrand = req.user.role === 'BRAND';
    let brandId = '';
    let creatorId = '';

    if (isBrand) {
      const brand = await prisma.brand.findUnique({ where: { userId: req.user.id } });
      if (!brand) return res.status(404).json({ error: 'Brand details not found.' });
      brandId = brand.id;
      creatorId = otherId;
    } else {
      const creator = await prisma.creator.findUnique({ where: { userId: req.user.id } });
      if (!creator) return res.status(404).json({ error: 'Creator details not found.' });
      creatorId = creator.id;
      brandId = otherId;
    }

    const history = await prisma.message.findMany({
      where: { brandId, creatorId },
      orderBy: { createdAt: 'asc' }
    });

    const mapped = history.map(msg => ({
      id: msg.id,
      text: msg.text,
      time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: isBrand ? msg.fromBrand : !msg.fromBrand,
      createdAt: msg.createdAt,
      read: msg.read
    }));

    if (otherId === 'cb-official-support' && mapped.length === 0) {
      mapped.push({
        id: 'welcome-support-msg',
        text: 'Welcome to CreatorBharat Support! 🇮🇳 If you have any questions about gig milestones, wallet withdrawals, or brand partnerships, reply here. Our team is online to help you.',
        time: 'Just Now',
        isMe: false,
        createdAt: new Date(),
        read: true
      });
    }

    res.json(mapped);
  } catch (err) {
    console.error('[GET /api/messages/history] Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve message logs.' });
  }
});

// POST /api/messages/read/:otherId — mark messages from other participant as read
router.post('/read/:otherId', async (req, res) => {
  try {
    if (req.user.role !== 'BRAND' && req.user.role !== 'CREATOR') {
      return res.status(403).json({ error: 'Access restricted to creators and brands.' });
    }

    const { otherId } = req.params;
    const isBrand = req.user.role === 'BRAND';
    let brandId = '';
    let creatorId = '';

    if (isBrand) {
      const brand = await prisma.brand.findUnique({ where: { userId: req.user.id } });
      if (!brand) return res.status(404).json({ error: 'Brand details not found.' });
      brandId = brand.id;
      creatorId = otherId;
    } else {
      const creator = await prisma.creator.findUnique({ where: { userId: req.user.id } });
      if (!creator) return res.status(404).json({ error: 'Creator details not found.' });
      creatorId = creator.id;
      brandId = otherId;
    }

    await prisma.message.updateMany({
      where: {
        brandId,
        creatorId,
        fromBrand: !isBrand,
        read: false
      },
      data: { read: true }
    });

    res.json({ success: true });
  } catch (err) {
    console.error('[POST /api/messages/read] Error:', err.message);
    res.status(500).json({ error: 'Failed to mark messages as read.' });
  }
});

export default router;
