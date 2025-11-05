# AI Agent Manager

<div align="center">

**A powerful full-stack application for building AI agents with advanced reasoning capabilities. Create configurations for planning, development, testing, and deployment agents - all powered by cutting-edge AI from Google Gemini, Anthropic Claude, and OpenAI.**


  [![Docker](https://img.shields.io/badge/Docker-Compose-blue.svg)](https://docs.docker.com/compose/)
  [![Docker](https://img.shields.io/badge/Docker-Friendly-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-Styled-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)

  [![GitHub stars](https://img.shields.io/github/stars/jleboube/ai-agent-manager?style=social)](https://github.com/jleboube/ai-agent-manager/stargazers)
  [![GitHub forks](https://img.shields.io/github/forks/jleboube/ai-agent-manager?style=social)](https://github.com/jleboube/ai-agent-manager/network/members)
  [![GitHub issues](https://img.shields.io/github/issues/jleboube/ai-agent-manager)](https://github.com/jleboube/ai-agent-manager/issues)
  [![GitHub pull requests](https://img.shields.io/github/issues-pr/jleboube/ai-agent-manager)](https://github.com/jleboube/ai-agent-manager/pulls)
  [![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CCBY--NC--SA4.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)


[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/muscl3n3rd)

</div>


**AI Agent Manager**

## Features

- ✨ **Smart AI Routing** - Automatically selects the best AI model (Gemini, Claude, or OpenAI) based on task type
- 🔐 **Google OAuth Authentication** - Secure user authentication
- 💳 **Stripe Integration** - Monthly ($4.99) and yearly ($99.99) subscription plans
- 🎯 **Pre-built Agent Templates** - Planning, Architect, Frontend, Backend, Testing, Deployment, and Orchestration agents
- 🎨 **Custom Agent Creation** - Describe any agent in plain English
- 📊 **Usage Tracking** - Monitor agent generation and enforce limits
- 📧 **Email Notifications** - Automated alerts for high usage (>100 generations/week)
- 🚀 **Docker Deployment** - Complete containerized setup

### Screenshots

![Alt text](/aam-sc2.png "AI Agent Manager Landing Page")
![Alt text](/aam-sc1.png "AI Agent Manager Landing Page")

![Alt text](/aam-sc3.png "AI Agent Manager Dashboard")

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma ORM
- Google OAuth
- Stripe Payments
- Nodemailer

### AI Providers
- Google Gemini API
- Anthropic Claude API
- OpenAI API

## Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- PostgreSQL 16 (or use Docker)
- API keys for:
  - Google Cloud (for OAuth and Gemini)
  - Anthropic Claude
  - OpenAI
  - Stripe

## Setup Instructions

### 1. Clone and Configure

```bash
git clone <your-repo-url>
cd ai-agent-manager
```

### 2. Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

- **Database**: Set a secure `POSTGRES_PASSWORD`
- **JWT Secrets**: Generate random strings for `JWT_SECRET` and `SESSION_SECRET`
- **Google OAuth**:
  - Create OAuth credentials at https://console.cloud.google.com/apis/credentials
  - Set authorized redirect URIs to include your callback URL
- **AI API Keys**:
  - Gemini: https://makersuite.google.com/app/apikey
  - Claude: https://console.anthropic.com/
  - OpenAI: https://platform.openai.com/api-keys
- **Stripe**:
  - Create products and prices at https://dashboard.stripe.com/
  - Set up webhook endpoint for subscription events
  - Copy webhook signing secret
- **Email**: Configure SMTP settings (Gmail example provided)

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Database Setup

The database will be automatically created and migrated when using Docker Compose. For local development:

```bash
cd backend
npm run prisma:migrate
```

### 5. Run with Docker (Recommended)

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (internal only - no port conflicts!)
- Backend API on port 3001
- Frontend on port 8039

Access the application at: http://localhost:8039

**🚀 Deploying on a host with other apps?** See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Avoiding PostgreSQL port conflicts
- Using shared/external database
- Custom port configuration
- Multi-app hosting best practices

### 6. Run Locally (Development)

Terminal 1 - Database:
```bash
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_agent_manager \
  -p 5432:5432 \
  postgres:16-alpine
```

Terminal 2 - Backend:
```bash
cd backend
npm run dev
```

Terminal 3 - Frontend:
```bash
cd frontend
npm run dev
```

Access the application at: http://localhost:5173

## Configuration

### Stripe Products Setup

1. Go to https://dashboard.stripe.com/products
2. Create two products:
   - **Monthly Plan**: $4.99/month recurring
   - **Yearly Plan**: $99.99/year recurring
3. Copy the Price IDs to your `.env` file as `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_YEARLY_PRICE_ID`

### Stripe Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://yourdomain.com/api/subscription/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the webhook signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

### Google OAuth Setup

1. Go to https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)
4. Copy Client ID and Secret to `.env`

## Usage

### Free Tier
- Sign in with Google
- Create **1 free** AI agent

### Paid Subscription
- Unlimited agent generations
- Access to all AI models
- Smart AI routing
- Priority support

### Usage Monitoring
- System automatically tracks generations per user
- Email alert sent to admin when user exceeds 100 generations/week
- Alerts sent to: joeleboube@yahoo.com

## Architecture

### Smart AI Routing

The system automatically selects the best AI provider:

- **Claude**: Planning, Orchestration, Testing, Deployment (reasoning tasks)
- **OpenAI**: Frontend, Backend development (code generation)
- **Gemini**: Architect (Google Search integration), Custom agents

### Database Schema

- **Users**: OAuth info, email, profile
- **Subscriptions**: Stripe integration, plan details
- **AgentGenerations**: Usage tracking
- **UsageAlerts**: High usage monitoring

## API Endpoints

### Authentication
- `GET /api/auth/google/url` - Get Google OAuth URL
- `POST /api/auth/google/callback` - Handle OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### AI Generation
- `POST /api/ai/generate` - Generate agent configuration
- `POST /api/ai/advice` - Get grounded architectural advice

### Subscription
- `POST /api/subscription/create-checkout` - Create Stripe checkout
- `GET /api/subscription/status` - Get subscription status
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/reactivate` - Reactivate subscription
- `POST /api/subscription/webhook` - Stripe webhook handler

### User
- `GET /api/user/profile` - Get user profile and stats
- `GET /api/user/generations` - Get generation history

## Development

### Backend Development

```bash
cd backend
npm run dev  # Watch mode with tsx
```

### Frontend Development

```bash
cd frontend
npm run dev  # Vite dev server
```

### Database Migrations

```bash
cd backend
npm run prisma:migrate     # Create and apply migration
npm run prisma:generate    # Generate Prisma Client
npm run prisma:studio      # Open Prisma Studio GUI
```

## Production Deployment

1. Update environment variables for production URLs
2. Set `NODE_ENV=production`
3. Use production Stripe keys
4. Configure proper domain and SSL
5. Set secure cookie settings
6. Build and deploy with Docker Compose:

```bash
docker-compose up -d --build
```

## Monitoring

### Usage Alerts
- Automated email sent when user generates >100 agents in 7 days
- Alert includes user details and subscription status
- Sent to: joeleboube@yahoo.com

### Health Check
- Backend: `GET /health`

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs ai-agent-manager-db
```

### Backend Issues
```bash
# Check backend logs
docker logs ai-agent-manager-backend

# Restart backend
docker-compose restart backend
```

### Frontend Build Issues
```bash
# Rebuild frontend
docker-compose up -d --build frontend
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or contact joeleboube@yahoo.com
