import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, checkSubscriptionOrFreeTier, AuthRequest } from '../middleware/auth';
import {
  generateAgentConfiguration,
  getGroundedAdvice,
  AgentType,
  selectAIProvider,
} from '../services/aiProviders';
import { checkAndAlertHighUsage } from '../services/usageMonitor';

const router = express.Router();
const prisma = new PrismaClient();

// Generate custom agent configuration
router.post(
  '/generate',
  authenticateToken,
  checkSubscriptionOrFreeTier,
  async (req: AuthRequest, res: Response) => {
    try {
      const { description, agentType = 'custom' } = req.body;

      if (!description || description.length < 10) {
        return res.status(400).json({
          error: 'Description must be at least 10 characters',
        });
      }

      // Determine AI provider
      const provider = selectAIProvider(agentType as AgentType);

      // Generate agent configuration
      const agentConfig = await generateAgentConfiguration(
        description,
        agentType as AgentType
      );

      // Record the generation (without file content yet - will be saved when exported)
      await prisma.agentGeneration.create({
        data: {
          userId: req.userId!,
          agentName: agentConfig.name,
          agentType: agentType,
          aiProvider: provider,
          description: description,
          fileContent: '', // Will be updated when user exports
          fileSizeBytes: 0,
        },
      });

      // Check for high usage and send alert if needed
      await checkAndAlertHighUsage(req.userId!);

      res.json({
        agent: agentConfig,
        provider: provider,
      });
    } catch (error) {
      console.error('Generate agent error:', error);
      res.status(500).json({
        error: 'Failed to generate agent configuration',
      });
    }
  }
);

// Get grounded advice (for Architect agent)
router.post(
  '/advice',
  authenticateToken,
  checkSubscriptionOrFreeTier,
  async (req: AuthRequest, res: Response) => {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const advice = await getGroundedAdvice(prompt);

      // Record the generation (without file content yet - will be saved when exported)
      await prisma.agentGeneration.create({
        data: {
          userId: req.userId!,
          agentName: 'Architect Agent',
          agentType: 'architect',
          aiProvider: 'gemini',
          description: prompt,
          fileContent: '', // Will be updated when user exports
          fileSizeBytes: 0,
        },
      });

      // Check for high usage
      await checkAndAlertHighUsage(req.userId!);

      res.json({ advice });
    } catch (error) {
      console.error('Get advice error:', error);
      res.status(500).json({ error: 'Failed to get advice' });
    }
  }
);

// Save generated agent file content
router.post(
  '/save-agent',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { agentName, agentType, aiProvider, fileContent, description } = req.body;

      if (!agentName || !agentType || !fileContent) {
        return res.status(400).json({
          error: 'Agent name, type, and file content are required',
        });
      }

      const fileSizeBytes = Buffer.byteLength(fileContent, 'utf8');

      // Save the agent generation
      const savedAgent = await prisma.agentGeneration.create({
        data: {
          userId: req.userId!,
          agentName,
          agentType,
          aiProvider: aiProvider || 'manual',
          description: description || '',
          fileContent,
          fileSizeBytes,
        },
      });

      res.json({
        id: savedAgent.id,
        message: 'Agent saved successfully',
      });
    } catch (error) {
      console.error('Save agent error:', error);
      res.status(500).json({
        error: 'Failed to save agent',
      });
    }
  }
);

// Get user's generated agents
router.get(
  '/my-agents',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: {
          subscription: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Determine how many agents to return based on subscription
      let limit = 0;
      const isAnnualSubscriber = user.subscription?.plan === 'yearly' && user.subscription?.status === 'active';

      if (isAnnualSubscriber) {
        limit = 15; // Annual subscribers get 15 historical agents
      }

      // Fetch agents (all if annual, otherwise empty array)
      const agents = limit > 0
        ? await prisma.agentGeneration.findMany({
            where: {
              userId: req.userId,
              fileContent: {
                not: '', // Only return agents with saved content
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: limit,
            select: {
              id: true,
              agentName: true,
              agentType: true,
              aiProvider: true,
              description: true,
              createdAt: true,
              fileSizeBytes: true,
              // Don't return fileContent in list view for performance
            },
          })
        : [];

      res.json({
        agents,
        limit,
        total: agents.length,
        hasAccess: isAnnualSubscriber,
        requiresAnnualPlan: !isAnnualSubscriber,
      });
    } catch (error) {
      console.error('Get my agents error:', error);
      res.status(500).json({
        error: 'Failed to retrieve agents',
      });
    }
  }
);

// Download a specific agent file
router.get(
  '/agent/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const agent = await prisma.agentGeneration.findFirst({
        where: {
          id,
          userId: req.userId, // Ensure user owns this agent
        },
      });

      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Check if user has access
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { subscription: true },
      });

      const isAnnualSubscriber = user?.subscription?.plan === 'yearly' && user?.subscription?.status === 'active';

      if (!isAnnualSubscriber) {
        return res.status(403).json({
          error: 'Annual subscription required to access historical agents',
          requiresUpgrade: true,
        });
      }

      res.json({
        id: agent.id,
        agentName: agent.agentName,
        agentType: agent.agentType,
        fileContent: agent.fileContent,
        createdAt: agent.createdAt,
      });
    } catch (error) {
      console.error('Get agent error:', error);
      res.status(500).json({
        error: 'Failed to retrieve agent',
      });
    }
  }
);

export default router;
