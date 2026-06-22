import express from 'express';
import prisma from '../config/database.js';
import { hashPassword, verifyPassword } from '../utils/auth.js';

const router = express.Router();

// Types
interface AdminAuthRequest extends express.Request {
  admin?: { id: string; username: string; email: string };
}

// Middleware: Verify admin token (stored in Authorization header)
export const verifyAdminToken = async (req: AdminAuthRequest, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const admin = await prisma.admin.findFirst({
      where: {
        id: token,
      },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.admin = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// POST /api/admin/login - Admin login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing username or password' });
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      token: admin.id,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/register - Create first admin (for setup only)
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      return res.status(403).json({ error: 'Admin already exists' });
    }

    const admin = await prisma.admin.create({
      data: {
        username,
        email,
        passwordHash: hashPassword(password),
      },
    });

    res.status(201).json({
      token: admin.id,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
