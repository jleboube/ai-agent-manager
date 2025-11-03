// Fix: Import ComponentType from react to resolve 'React' namespace error.
import type { ComponentType } from 'react';

export enum AgentName {
  PLANNING = 'Planning Agent',
  ARCHITECT = 'Architect Agent',
  FRONTEND = 'Frontend Engineer Agent',
  BACKEND = 'Backend Engineer Agent',
  TESTING = 'Testing Agent',
  DEPLOYMENT = 'Deployment Agent',
  ORCHESTRATION = 'Orchestration Agent',
  CUSTOM = 'Custom Agent',
}

export enum VariableType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  RADIO = 'radio',
}

export interface Variable {
  name: string;
  label: string;
  type: VariableType;
  options?: string[];
  description: string;
  defaultValue?: string;
  validation?: {
    required?: boolean;
    minLength?: number;
  };
}

export interface Agent {
  id: string;
  name: AgentName | string;
  description: string;
  variables: Variable[];
  // Fix: Use imported ComponentType directly.
  icon: ComponentType<{ className?: string }>;
}