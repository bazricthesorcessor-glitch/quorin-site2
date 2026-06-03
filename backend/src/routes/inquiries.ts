import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database.js';

const router = express.Router();

// POST /api/inquiries - Create new inquiry
router.post('/', async (req, res, next) => {
  try {
    const { customerName, customerEmail, customerPhone, customerMessage, productId } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !customerMessage) {
      return res.status(400).json({
        error: 'Missing required fields: customerName, customerEmail, customerPhone, customerMessage',
      });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        id: uuidv4(),
        customerName,
        customerEmail,
        customerPhone,
        customerMessage,
        productId: productId || null,
        status: 'pending',
      },
    });

    res.status(201).json(inquiry);
  } catch (error) {
    next(error);
  }
});

// GET /api/inquiries - List all inquiries
router.get('/', async (req, res, next) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(inquiries);
  } catch (error) {
    next(error);
  }
});

// GET /api/inquiries/:id - Get single inquiry
router.get('/:id', async (req, res, next) => {
  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: req.params.id },
      include: { product: true },
    });

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json(inquiry);
  } catch (error) {
    next(error);
  }
});

export default router;
