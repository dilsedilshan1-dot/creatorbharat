// 🇮🇳 CreatorBharat SaaS Message Service
import prisma from '../prisma.js';

export class MessageService {
  /**
   * Retrieves user chat histories grouped by conversation partner.
   */
  static async getConversations(user) {
    if (user.role !== 'BRAND' && user.role !== 'CREATOR') {
      const error = new Error('Messaging is available for registered creators and brands only.');
      error.statusCode = 403;
      throw error;
    }

    const isBrand = user.role === 'BRAND';
    let brandId = '';
    let creatorId = '';

    if (isBrand) {
      const brand = await prisma.brand.findUnique({ where: { userId: user.id } });
      if (!brand) {
        const error = new Error('Brand details not found.');
        error.statusCode = 404;
        throw error;
      }
      brandId = brand.id;
    } else {
      const creator = await prisma.creator.findUnique({ where: { userId: user.id } });
      if (!creator) {
        const error = new Error('Creator details not found.');
        error.statusCode = 404;
        throw error;
      }
      creatorId = creator.id;
    }

    const messages = await prisma.message.findMany({
      where: isBrand ? { brandId } : { creatorId },
      orderBy: { createdAt: 'desc' }
    });

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
    return conversations;
  }

  /**
   * Retrieves message log history with a specific partner or support.
   */
  static async getHistory(user, otherId) {
    if (user.role !== 'BRAND' && user.role !== 'CREATOR') {
      const error = new Error('Access restricted to creators and brands.');
      error.statusCode = 403;
      throw error;
    }

    const isBrand = user.role === 'BRAND';
    let brandId = '';
    let creatorId = '';

    if (isBrand) {
      const brand = await prisma.brand.findUnique({ where: { userId: user.id } });
      if (!brand) {
        const error = new Error('Brand details not found.');
        error.statusCode = 404;
        throw error;
      }
      brandId = brand.id;
      creatorId = otherId;
    } else {
      const creator = await prisma.creator.findUnique({ where: { userId: user.id } });
      if (!creator) {
        const error = new Error('Creator details not found.');
        error.statusCode = 404;
        throw error;
      }
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

    return mapped;
  }

  /**
   * Marks messages from the other participant as read.
   */
  static async markAsRead(user, otherId) {
    if (user.role !== 'BRAND' && user.role !== 'CREATOR') {
      const error = new Error('Access restricted to creators and brands.');
      error.statusCode = 403;
      throw error;
    }

    const isBrand = user.role === 'BRAND';
    let brandId = '';
    let creatorId = '';

    if (isBrand) {
      const brand = await prisma.brand.findUnique({ where: { userId: user.id } });
      if (!brand) {
        const error = new Error('Brand details not found.');
        error.statusCode = 404;
        throw error;
      }
      brandId = brand.id;
      creatorId = otherId;
    } else {
      const creator = await prisma.creator.findUnique({ where: { userId: user.id } });
      if (!creator) {
        const error = new Error('Creator details not found.');
        error.statusCode = 404;
        throw error;
      }
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

    return { success: true };
  }
}
