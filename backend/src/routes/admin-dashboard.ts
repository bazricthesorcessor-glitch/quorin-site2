import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database.js';
import { verifyAdminToken } from './admin.js';

const router = express.Router();

interface AdminAuthRequest extends express.Request {
  admin?: { id: string; username: string; email: string };
}

// All routes require admin authentication
router.use(verifyAdminToken);

// GET /api/admin/products - List all products
router.get('/products', async (req: AdminAuthRequest, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { inquiries: true } } },
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/products - Create new product
router.post('/products', async (req: AdminAuthRequest, res, next) => {
  try {
    const { title, description, price, mrp, discount, stock, featured, category, tags, images } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ error: 'Missing required fields: title, price, category' });
    }

    const product = await prisma.product.create({
      data: {
        id: uuidv4(),
        title,
        description,
        price,
        mrp,
        discount,
        stock: stock || 0,
        featured: featured || false,
        category,
        tags: tags || [],
        images: images || [],
      },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/products/:id - Update product
router.put('/products/:id', async (req: AdminAuthRequest, res, next) => {
  try {
    const { title, description, price, mrp, discount, stock, featured, category, tags, images } = req.body;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price }),
        ...(mrp !== undefined && { mrp }),
        ...(discount !== undefined && { discount }),
        ...(stock !== undefined && { stock }),
        ...(featured !== undefined && { featured }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags }),
        ...(images !== undefined && { images }),
      },
    });

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', async (req: AdminAuthRequest, res, next) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/inquiries - List all inquiries
router.get('/inquiries', async (req: AdminAuthRequest, res, next) => {
  try {
    const status = req.query.status as string;

    const inquiries = await prisma.inquiry.findMany({
      where: status ? { status } : {},
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(inquiries);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/inquiries/:id - Update inquiry status
router.put('/inquiries/:id', async (req: AdminAuthRequest, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Missing status field' });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: req.params.id },
      data: { status },
      include: { product: true },
    });

    res.json(inquiry);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/dashboard - Dashboard analytics
router.get('/dashboard', async (req: AdminAuthRequest, res, next) => {
  try {
    const totalProducts = await prisma.product.count();
    const totalInquiries = await prisma.inquiry.count();
    const pendingInquiries = await prisma.inquiry.count({ where: { status: 'pending' } });

    const productsByCategory = await prisma.product.groupBy({
      by: ['category'],
      _count: true,
    });

    const inquiriesByStatus = await prisma.inquiry.groupBy({
      by: ['status'],
      _count: true,
    });

    const recentInquiries = await prisma.inquiry.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { title: true } } },
    });

    res.json({
      stats: {
        totalProducts,
        totalInquiries,
        pendingInquiries,
      },
      productsByCategory,
      inquiriesByStatus,
      recentInquiries,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
