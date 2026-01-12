import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Validation schemas
const updateBudgetSchema = z.object({
  budgetAmount: z.number().positive(),
  currency: z.string().length(3).optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  budgetAmount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
});

// GET /api/me
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        budgetAmount: true,
        currency: true,
        createdAt: true,
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      budgetAmount: user.budgetAmount,
      currency: user.currency,
      createdAt: user.createdAt,
      interests: user.interests.map((ui: any) => ui.interest),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/me
router.put('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        budgetAmount: true,
        currency: true,
      },
    });

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/me/budget
router.put('/budget', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { budgetAmount, currency } = updateBudgetSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        budgetAmount,
        ...(currency && { currency }),
      },
      select: {
        id: true,
        budgetAmount: true,
        currency: true,
      },
    });

    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
