import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile and statistics
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        subscription: true,
        generations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate usage statistics
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyGenerations = user.generations.filter(g => g.createdAt >= weekAgo);
    const monthlyGenerations = user.generations.filter(g => g.createdAt >= monthAgo);

    // Group by AI provider
    const providerStats = user.generations.reduce((acc, gen) => {
      acc[gen.aiProvider] = (acc[gen.aiProvider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by agent type
    const agentTypeStats = user.generations.reduce((acc, gen) => {
      acc[gen.agentType] = (acc[gen.agentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        createdAt: user.createdAt,
      },
      subscription: user.subscription ? {
        plan: user.subscription.plan,
        status: user.subscription.status,
        currentPeriodEnd: user.subscription.stripeCurrentPeriodEnd,
        cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
      } : null,
      usage: {
        total: user.generations.length,
        weekly: weeklyGenerations.length,
        monthly: monthlyGenerations.length,
        byProvider: providerStats,
        byAgentType: agentTypeStats,
      },
      canGenerate: user.generations.length === 0 ||
                   (user.subscription && user.subscription.status === 'active'),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Get generation history
router.get('/generations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [generations, total] = await Promise.all([
      prisma.agentGeneration.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.agentGeneration.count({
        where: { userId: req.userId },
      }),
    ]);

    res.json({
      generations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get generations error:', error);
    res.status(500).json({ error: 'Failed to get generations' });
  }
});

export default router;
