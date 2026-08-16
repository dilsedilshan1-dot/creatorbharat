import express from 'express';
import prisma from '../prisma.js';
import { authMiddleware, requireRole, requireTeamRoles } from '../middleware/auth.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = express.Router();

const inviteSchema = z.object({
  email: z.string().email('Invalid email address.'),
  role: z.enum(['SUPERADMIN', 'MODERATOR', 'SUPPORT', 'FINANCE'])
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  name: z.string().min(1, 'Name is required.'),
  token: z.string().min(1, 'Invite token is required.')
});

// GET /api/admin/team — List team members and pending invites
router.get('/', authMiddleware, requireRole(['ADMIN']), async (req, res) => {
  try {
    const members = await prisma.teamMember.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const invites = await prisma.inviteToken.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      members: members.map(m => ({
        id: m.id,
        userId: m.userId,
        email: m.user?.email || '',
        name: m.role === 'SUPERADMIN' ? 'Owner / Developer' : m.role + ' Agent', // Fallback display name
        role: m.role,
        status: m.status,
        createdAt: m.createdAt
      })),
      invites
    });
  } catch (err) {
    console.error('[GET /api/admin/team] Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve team members.' });
  }
});

// POST /api/admin/team/invite — Invite a new team member
router.post('/invite', authMiddleware, requireRole(['ADMIN']), requireTeamRoles(['SUPERADMIN']), async (req, res) => {
  try {
    const parse = inviteSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    const { email, role } = parse.data;

    // Check if user already exists as ADMIN
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.role === 'ADMIN') {
      return res.status(400).json({ error: 'User is already an Administrator.' });
    }

    // Generate unique secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

    // Upsert invite token
    const invite = await prisma.inviteToken.upsert({
      where: { email },
      update: { role, token, expiresAt, createdAt: new Date() },
      create: { email, role, token, expiresAt }
    });

    // Generate registration link
    const registrationLink = `http://localhost:5174/register-team?token=${token}&email=${encodeURIComponent(email)}`;

    res.status(201).json({
      success: true,
      message: 'Invitation generated successfully.',
      invite,
      registrationLink
    });
  } catch (err) {
    console.error('[POST /api/admin/team/invite] Error:', err.message);
    res.status(500).json({ error: 'Failed to create team invitation.' });
  }
});

// DELETE /api/admin/team/invite/:id — Revoke a pending invitation
router.delete('/invite/:id', authMiddleware, requireRole(['ADMIN']), requireTeamRoles(['SUPERADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.inviteToken.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Invitation revoked successfully.' });
  } catch (err) {
    console.error('[DELETE /api/admin/team/invite/:id] Error:', err.message);
    res.status(500).json({ error: 'Failed to revoke invitation.' });
  }
});

// PUT /api/admin/team/:id/role — Update role of a team member
router.put('/:id/role', authMiddleware, requireRole(['ADMIN']), requireTeamRoles(['SUPERADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['SUPERADMIN', 'MODERATOR', 'SUPPORT', 'FINANCE'].includes(role)) {
      return res.status(400).json({ error: 'Invalid team role.' });
    }

    const updated = await prisma.teamMember.update({
      where: { id },
      data: { role }
    });

    res.json({
      success: true,
      message: 'Team member role updated.',
      member: updated
    });
  } catch (err) {
    console.error('[PUT /api/admin/team/:id/role] Error:', err.message);
    res.status(500).json({ error: 'Failed to update role.' });
  }
});

// DELETE /api/admin/team/:id — Revoke team member admin privileges
router.delete('/:id', authMiddleware, requireRole(['ADMIN']), requireTeamRoles(['SUPERADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.teamMember.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!member) {
      return res.status(404).json({ error: 'Team member not found.' });
    }

    // Demote user role back to CREATOR
    await prisma.user.update({
      where: { id: member.userId },
      data: { role: 'CREATOR' }
    });

    // Invalidate active sessions / refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId: member.userId }
    }).catch(() => {});

    // Delete TeamMember profile
    await prisma.teamMember.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: `Admin privileges revoked for ${member.user?.email || 'user'}. Role set to CREATOR.`
    });
  } catch (err) {
    console.error('[DELETE /api/admin/team/:id] Error:', err.message);
    res.status(500).json({ error: 'Failed to revoke team member.' });
  }
});

// POST /api/auth/register-team — Register new admin from invitation (Public Route)
router.post('/register-team', async (req, res) => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.errors[0].message });
    }

    const { email, password, name, token } = parse.data;

    // Verify token
    const invite = await prisma.inviteToken.findFirst({
      where: { token, email }
    });

    if (!invite) {
      return res.status(400).json({ error: 'Invalid invitation token or email mismatch.' });
    }

    if (new Date() > invite.expiresAt) {
      return res.status(400).json({ error: 'Invitation link has expired.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User & TeamMember profile within transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'ADMIN'
        }
      });

      const member = await tx.teamMember.create({
        data: {
          userId: user.id,
          role: invite.role,
          status: 'ACTIVE'
        }
      });

      // Delete the used token
      await tx.inviteToken.delete({
        where: { id: invite.id }
      });

      return { user, member };
    });

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is missing.');
    }

    const jwtToken = jwt.sign(
      { userId: result.user.id, role: 'ADMIN' },
      jwtSecret,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Admin account registered successfully.',
      token: jwtToken,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role
      }
    });
  } catch (err) {
    console.error('[POST /api/auth/register-team] Error:', err.message);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

export default router;
