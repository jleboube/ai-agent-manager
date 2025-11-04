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

      // Record the generation
      await prisma.agentGeneration.create({
        data: {
          userId: req.userId!,
          agentType: agentType,
          aiProvider: provider,
          description: description,
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

      // Record the generation
      await prisma.agentGeneration.create({
        data: {
          userId: req.userId!,
          agentType: 'architect',
          aiProvider: 'gemini',
          description: prompt,
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

export default router;
