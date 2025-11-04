import React from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Build AI Agents in <span className="text-indigo-400">Seconds</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Create powerful AI agents with advanced reasoning capabilities. No coding required.
          Generate configurations for planning, development, testing, and deployment - all powered by
          cutting-edge AI from Google Gemini, Anthropic Claude, and OpenAI.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onGetStarted}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 text-lg"
          >
            Get Started Free
          </button>
          <button
            onClick={onSignIn}
            className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200 text-lg border border-gray-600"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Why Choose AI Agent Manager?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon="🚀"
            title="Lightning Fast"
            description="Generate complete AI agent configurations in seconds. No manual setup, no complicated forms."
          />
          <FeatureCard
            icon="🎯"
            title="Smart AI Routing"
            description="Our intelligent system automatically selects the best AI (Gemini, Claude, or OpenAI) for your specific task."
          />
          <FeatureCard
            icon="🔧"
            title="Pre-built Templates"
            description="Start with battle-tested agent templates for planning, architecture, frontend, backend, testing, and deployment."
          />
          <FeatureCard
            icon="🎨"
            title="Custom Agents"
            description="Describe any agent you need in plain English, and watch as AI generates a complete configuration."
          />
          <FeatureCard
            icon="💡"
            title="Context-Aware"
            description="Agents understand your project context and provide relevant, actionable configurations."
          />
          <FeatureCard
            icon="📦"
            title="Export Ready"
            description="Download your agent configurations and integrate them into your workflow immediately."
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-800 rounded-lg p-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <StatCard number="3" label="AI Models" description="Gemini, Claude & OpenAI" />
          <StatCard number="7+" label="Pre-built Agents" description="Ready to use templates" />
          <StatCard number="∞" label="Custom Agents" description="Create unlimited agents" />
        </div>
      </div>

      {/* Popularity Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-4 text-center">
          The Future is Agent-Based
        </h2>
        <p className="text-lg text-gray-300 mb-8 text-center max-w-3xl mx-auto">
          AI agents are revolutionizing software development. From autonomous coding assistants to
          intelligent testing frameworks, agents are becoming essential tools for modern development teams.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UseCaseCard
            title="Software Development"
            description="Automate code generation, review, testing, and deployment with specialized AI agents."
          />
          <UseCaseCard
            title="Project Planning"
            description="Create detailed project plans, technical specifications, and architectural decisions."
          />
          <UseCaseCard
            title="DevOps & CI/CD"
            description="Configure deployment pipelines, monitoring, and infrastructure with AI-powered agents."
          />
          <UseCaseCard
            title="Quality Assurance"
            description="Generate comprehensive test suites, edge cases, and validation scenarios automatically."
          />
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Simple, Transparent Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            title="Free"
            price="$0"
            period="one time"
            features={[
              "1 agent generation",
              "Access to all templates",
              "Smart AI routing",
              "Export configurations"
            ]}
            buttonText="Try Free"
            onClick={onGetStarted}
          />
          <PricingCard
            title="Monthly"
            price="$4.99"
            period="per month"
            features={[
              "Unlimited agent generations",
              "All AI models",
              "Priority support",
              "Advanced customization"
            ]}
            buttonText="Get Started"
            onClick={onSignIn}
            highlighted={true}
          />
          <PricingCard
            title="Yearly"
            price="$49.99"
            period="per year"
            features={[
              "Everything in Monthly",
              "Save $10 annually",
              "Extended support",
              "Early access to features"
            ]}
            buttonText="Best Value"
            onClick={onSignIn}
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Build Your AI Agents?
        </h2>
        <p className="text-xl text-gray-100 mb-6">
          Join developers who are already using AI Agent Manager to accelerate their workflow.
        </p>
        <button
          onClick={onGetStarted}
          className="bg-white hover:bg-gray-100 text-indigo-600 font-semibold px-8 py-3 rounded-lg transition-colors duration-200 text-lg"
        >
          Start Building for Free
        </button>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="bg-gray-800 rounded-lg p-6">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const StatCard: React.FC<{ number: string; label: string; description: string }> = ({
  number,
  label,
  description,
}) => (
  <div>
    <div className="text-5xl font-bold text-indigo-400 mb-2">{number}</div>
    <div className="text-xl font-semibold text-white mb-1">{label}</div>
    <div className="text-gray-400">{description}</div>
  </div>
);

const UseCaseCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="bg-gray-800 rounded-lg p-6">
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  onClick: () => void;
  highlighted?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  period,
  features,
  buttonText,
  onClick,
  highlighted = false,
}) => (
  <div
    className={`rounded-lg p-8 ${
      highlighted
        ? 'bg-indigo-600 border-2 border-indigo-400'
        : 'bg-gray-800 border-2 border-gray-700'
    }`}
  >
    <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
    <div className="mb-6">
      <span className="text-4xl font-bold text-white">{price}</span>
      <span className="text-gray-300 ml-2">{period}</span>
    </div>
    <ul className="mb-6 space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <svg
            className="h-5 w-5 text-green-400 mr-2 mt-0.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="text-gray-300">{feature}</span>
        </li>
      ))}
    </ul>
    <button
      onClick={onClick}
      className={`w-full py-3 rounded-lg font-semibold transition-colors duration-200 ${
        highlighted
          ? 'bg-white text-indigo-600 hover:bg-gray-100'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      }`}
    >
      {buttonText}
    </button>
  </div>
);

export default LandingPage;
