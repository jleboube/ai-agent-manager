import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function checkAndAlertHighUsage(userId: string) {
  try {
    // Get date 7 days ago
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Count generations in the last 7 days
    const generationCount = await prisma.agentGeneration.count({
      where: {
        userId: userId,
        createdAt: {
          gte: weekAgo,
        },
      },
    });

    // Check if user has exceeded 100 generations in a week
    if (generationCount > 100) {
      // Check if we've already sent an alert for this week
      const existingAlert = await prisma.usageAlert.findFirst({
        where: {
          userId: userId,
          weekStart: {
            gte: weekAgo,
          },
          emailSent: true,
        },
      });

      if (!existingAlert) {
        // Get user info
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            subscription: true,
          },
        });

        if (!user) {
          console.error('User not found for alert:', userId);
          return;
        }

        // Create alert record
        const alert = await prisma.usageAlert.create({
          data: {
            userId: userId,
            generationCount: generationCount,
            weekStart: weekAgo,
            weekEnd: new Date(),
          },
        });

        // Send email alert
        await sendUsageAlert(user, generationCount);

        // Mark alert as sent
        await prisma.usageAlert.update({
          where: { id: alert.id },
          data: {
            emailSent: true,
            emailSentAt: new Date(),
          },
        });

        console.log(`Usage alert sent for user ${user.email} (${generationCount} generations)`);
      }
    }
  } catch (error) {
    console.error('Error checking usage:', error);
    // Don't throw error - this is a background check
  }
}

async function sendUsageAlert(user: any, generationCount: number) {
  const adminEmail = process.env.ADMIN_EMAIL || 'joeleboube@yahoo.com';

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: adminEmail,
    subject: `High Usage Alert: ${user.email} - ${generationCount} generations`,
    html: `
      <h2>High Usage Alert</h2>
      <p>A user has generated more than 100 AI agents in the past week.</p>

      <h3>User Details:</h3>
      <ul>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Name:</strong> ${user.name || 'N/A'}</li>
        <li><strong>User ID:</strong> ${user.id}</li>
        <li><strong>Generations (7 days):</strong> ${generationCount}</li>
      </ul>

      <h3>Subscription Status:</h3>
      <ul>
        <li><strong>Has Subscription:</strong> ${user.subscription ? 'Yes' : 'No'}</li>
        ${user.subscription ? `
          <li><strong>Plan:</strong> ${user.subscription.plan}</li>
          <li><strong>Status:</strong> ${user.subscription.status}</li>
          <li><strong>Period End:</strong> ${user.subscription.stripeCurrentPeriodEnd}</li>
        ` : ''}
      </ul>

      <p><em>This is an automated alert from AI Agent Manager.</em></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Usage alert email sent successfully');
  } catch (error) {
    console.error('Error sending usage alert email:', error);
    throw error;
  }
}

// Function to manually check all users (can be run as a cron job)
export async function checkAllUsersForHighUsage() {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get all users who have generated agents in the last week
    const recentGenerations = await prisma.agentGeneration.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: weekAgo,
        },
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 100,
          },
        },
      },
    });

    console.log(`Found ${recentGenerations.length} users with high usage`);

    for (const generation of recentGenerations) {
      await checkAndAlertHighUsage(generation.userId);
    }
  } catch (error) {
    console.error('Error checking all users for high usage:', error);
  }
}
