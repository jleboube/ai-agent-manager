import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Initialize AI clients
const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const claudeClient = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export enum AIProvider {
  GEMINI = 'gemini',
  CLAUDE = 'claude',
  OPENAI = 'openai',
}

export enum AgentType {
  PLANNING = 'planning',
  ARCHITECT = 'architect',
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  TESTING = 'testing',
  DEPLOYMENT = 'deployment',
  ORCHESTRATION = 'orchestration',
  CUSTOM = 'custom',
}

// Smart routing: Choose the best AI provider based on task type
export function selectAIProvider(agentType: AgentType): AIProvider {
  switch (agentType) {
    case AgentType.PLANNING:
    case AgentType.ORCHESTRATION:
      // Claude excels at planning and reasoning
      return AIProvider.CLAUDE;

    case AgentType.FRONTEND:
    case AgentType.BACKEND:
      // OpenAI GPT-4 is great for code generation
      return AIProvider.OPENAI;

    case AgentType.ARCHITECT:
      // Gemini has Google Search grounding for research
      return AIProvider.GEMINI;

    case AgentType.TESTING:
    case AgentType.DEPLOYMENT:
      // Claude for systematic testing and deployment
      return AIProvider.CLAUDE;

    case AgentType.CUSTOM:
    default:
      // Default to Gemini for custom agents
      return AIProvider.GEMINI;
  }
}

// Generate agent configuration using Gemini
export async function generateWithGemini(description: string) {
  const model = geminiClient.getGenerativeModel({
    model: 'gemini-2.0-flash-thinking-exp-01-21',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          variables: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                name: { type: SchemaType.STRING },
                label: { type: SchemaType.STRING },
                type: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                defaultValue: { type: SchemaType.STRING },
                options: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                },
              },
              required: ['name', 'label', 'type', 'description'],
            },
          },
        },
        required: ['name', 'description', 'variables'],
      },
    },
  });

  const result = await model.generateContent(
    `Create an AI agent configuration based on this description: ${description}\n\n` +
    `Return a JSON object with:\n` +
    `- name: A concise name for the agent\n` +
    `- description: A clear description of what the agent does\n` +
    `- variables: An array of configuration variables the user should provide\n\n` +
    `Each variable should have:\n` +
    `- name: camelCase variable name\n` +
    `- label: Human-readable label\n` +
    `- type: "text", "textarea", "select", or "radio"\n` +
    `- description: What this variable is for\n` +
    `- defaultValue: Optional default value\n` +
    `- options: Array of options (required for select/radio types)`
  );

  return JSON.parse(result.response.text());
}

// Generate agent configuration using Claude
export async function generateWithClaude(description: string) {
  const response = await claudeClient.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Create an AI agent configuration based on this description: ${description}\n\n` +
          `Return a JSON object with:\n` +
          `- name: A concise name for the agent\n` +
          `- description: A clear description of what the agent does\n` +
          `- variables: An array of configuration variables the user should provide\n\n` +
          `Each variable should have:\n` +
          `- name: camelCase variable name\n` +
          `- label: Human-readable label\n` +
          `- type: "text", "textarea", "select", or "radio"\n` +
          `- description: What this variable is for\n` +
          `- defaultValue: Optional default value\n` +
          `- options: Array of options (required for select/radio types)\n\n` +
          `Return ONLY the JSON object, no other text.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    return JSON.parse(content.text);
  }
  throw new Error('Unexpected response type from Claude');
}

// Generate agent configuration using OpenAI
export async function generateWithOpenAI(description: string) {
  const response = await openaiClient.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an AI agent configuration generator. Return only valid JSON, no other text.',
      },
      {
        role: 'user',
        content: `Create an AI agent configuration based on this description: ${description}\n\n` +
          `Return a JSON object with:\n` +
          `- name: A concise name for the agent\n` +
          `- description: A clear description of what the agent does\n` +
          `- variables: An array of configuration variables the user should provide\n\n` +
          `Each variable should have:\n` +
          `- name: camelCase variable name\n` +
          `- label: Human-readable label\n` +
          `- type: "text", "textarea", "select", or "radio"\n` +
          `- description: What this variable is for\n` +
          `- defaultValue: Optional default value\n` +
          `- options: Array of options (required for select/radio types)`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

// Get grounded advice (Architect agent) using Gemini with Google Search
export async function getGroundedAdvice(prompt: string): Promise<string> {
  const model = geminiClient.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// Main function to generate agent configuration with smart routing
export async function generateAgentConfiguration(
  description: string,
  agentType: AgentType = AgentType.CUSTOM
) {
  const provider = selectAIProvider(agentType);

  try {
    switch (provider) {
      case AIProvider.GEMINI:
        return await generateWithGemini(description);
      case AIProvider.CLAUDE:
        return await generateWithClaude(description);
      case AIProvider.OPENAI:
        return await generateWithOpenAI(description);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error with ${provider}, falling back to Gemini:`, error);
    // Fallback to Gemini if primary provider fails
    if (provider !== AIProvider.GEMINI) {
      return await generateWithGemini(description);
    }
    throw error;
  }
}
