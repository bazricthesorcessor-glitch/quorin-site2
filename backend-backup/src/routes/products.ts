import express from 'express';
import prisma from '../config/database.js';

const router = express.Router();

// GET /api/products - List all products
router.get('/', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { inquiries: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/category/:category - List products by category
router.get('/category/:category', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { category: req.params.category },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

export default router;
