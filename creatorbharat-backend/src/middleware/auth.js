// 🇮🇳 CreatorBharat SaaS Auth Middleware
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('[authMiddleware] Fatal: JWT_SECRET environment variable is missing.');
    return res.status(500).json({ error: 'Internal server configuration error.' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload.' });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { creator: true, brand: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Session expired. User not found.' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ error: 'Account is suspended. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authorization token.' });
  }
};

// Middleware to restrict access based on User Role
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Access restricted.' });
    }
    next();
  };
};

// Middleware to verify Admin Team Members and check Role-Based Access Control (RBAC)
export const requireTeamRoles = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
      }
      const member = await prisma.teamMember.findUnique({
        where: { userId: req.user.id }
      });
      if (!member || !allowedRoles.includes(member.role) || member.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Forbidden. Insufficient permissions for this operation.' });
      }
      req.teamMember = member;
      next();
    } catch (err) {
      console.error('[requireTeamRoles] Error:', err.message);
      res.status(500).json({ error: 'RBAC verification failed.' });
    }
  };
};

