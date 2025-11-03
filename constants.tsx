import { Agent, AgentName, VariableType } from './types';
import { PlanningIcon, ArchitectIcon, FrontendIcon, BackendIcon, TestingIcon, DeploymentIcon, OrchestrationIcon } from './components/icons/AgentIcons';

export const PREDEFINED_AGENTS: Agent[] = [
  {
    id: 'planning',
    name: AgentName.PLANNING,
    description: 'Parses existing PRDs or creates new ones from high-level requirements. Ensures project goals are clear and actionable.',
    icon: PlanningIcon,
    variables: [
      { name: 'prd_input', label: 'PRD Input', type: VariableType.TEXTAREA, description: 'Paste the existing PRD here, or describe the project requirements for a new one.', defaultValue: 'Develop a new e-commerce platform for selling custom T-shirts.', validation: { required: true, minLength: 20 } },
      { name: 'output_format', label: 'Output Format', type: VariableType.SELECT, options: ['Markdown PRD', 'User Stories (Gherkin)', 'Jira-compatible JSON'], description: 'Select the desired output format for the planning phase.', defaultValue: 'Markdown PRD' },
    ],
  },
  {
    id: 'architect',
    name: AgentName.ARCHITECT,
    description: 'Reviews planning outputs and advises on the optimal software stack, architecture, and technology choices.',
    icon: ArchitectIcon,
    variables: [
      { name: 'project_type', label: 'Project Type', type: VariableType.RADIO, options: ['Web App', 'Mobile App', 'API Service', 'Data Pipeline'], description: 'What is the primary nature of the project?', defaultValue: 'Web App' },
      { name: 'performance_needs', label: 'Performance Needs', type: VariableType.SELECT, options: ['Standard', 'High-Traffic', 'Real-time'], description: 'Specify the expected performance and traffic load.', defaultValue: 'Standard' },
      { name: 'use_search_grounding', label: 'Use Search Grounding?', type: VariableType.RADIO, options: ['Yes', 'No'], description: 'Leverage Google Search for up-to-date tech stack recommendations.', defaultValue: 'Yes'},
    ],
  },
  {
    id: 'frontend',
    name: AgentName.FRONTEND,
    description: 'Specializes in frontend web development, generating code for UI components, state management, and user interactions.',
    icon: FrontendIcon,
    variables: [
      { name: 'framework', label: 'JS Framework', type: VariableType.SELECT, options: ['React', 'Vue', 'Svelte', 'Angular'], description: 'Choose the primary JavaScript framework for the frontend.', defaultValue: 'React' },
      { name: 'styling', label: 'Styling Solution', type: VariableType.SELECT, options: ['Tailwind CSS', 'Styled Components', 'CSS Modules', 'Sass'], description: 'Select the preferred styling methodology.', defaultValue: 'Tailwind CSS' },
      { name: 'state_management', label: 'State Management', type: VariableType.SELECT, options: ['Redux', 'Zustand', 'Pinia', 'Context API', 'None'], description: 'Choose a state management library, if needed.', defaultValue: 'Zustand' },
    ],
  },
  {
    id: 'backend',
    name: AgentName.BACKEND,
    description: 'Handles all backend logic, including API design, database schemas, and server-side business logic.',
    icon: BackendIcon,
    variables: [
      { name: 'language', label: 'Backend Language', type: VariableType.SELECT, options: ['Node.js (TypeScript)', 'Python (FastAPI)', 'Go (Gin)', 'Rust (Axum)'], description: 'Select the language and framework for the API server.', defaultValue: 'Node.js (TypeScript)' },
      { name: 'database', label: 'Database Type', type: VariableType.RADIO, options: ['PostgreSQL', 'MongoDB', 'MySQL', 'None'], description: 'Choose the database technology.', defaultValue: 'PostgreSQL' },
      { name: 'auth_method', label: 'Authentication', type: VariableType.SELECT, options: ['JWT', 'OAuth 2.0', 'Session-based', 'None'], description: 'Specify the authentication mechanism.', defaultValue: 'JWT' },
    ],
  },
  {
    id: 'testing',
    name: AgentName.TESTING,
    description: 'Responsible for writing comprehensive test cases, including unit, integration, and end-to-end tests for the generated code.',
    icon: TestingIcon,
    variables: [
      { name: 'test_framework', label: 'Testing Framework', type: VariableType.SELECT, options: ['Jest', 'Vitest', 'Pytest', 'Go Test'], description: 'The primary framework for writing tests.', defaultValue: 'Vitest' },
      { name: 'test_types', label: 'Test Types to Generate', type: VariableType.SELECT, options: ['Unit Tests', 'Integration Tests', 'E2E Tests', 'All'], description: 'Specify which types of tests should be created.', defaultValue: 'All' },
    ],
  },
  {
    id: 'deployment',
    name: AgentName.DEPLOYMENT,
    description: 'Gets the application up and running by generating Docker Compose files and deployment scripts for easy setup.',
    icon: DeploymentIcon,
    variables: [
      { name: 'environment', label: 'Target Environment', type: VariableType.RADIO, options: ['Local Development', 'Staging', 'Production'], description: 'The target environment for the deployment configuration.', defaultValue: 'Local Development' },
      { name: 'include_db', label: 'Include Database Service?', type: VariableType.RADIO, options: ['Yes', 'No'], description: 'Should the Docker Compose file include a database container?', defaultValue: 'Yes' },
    ],
  },
  {
    id: 'orchestration',
    name: AgentName.ORCHESTRATION,
    description: 'Ensures the entire agent workflow follows the correct path and that each agent meets its stated requirements and outputs.',
    icon: OrchestrationIcon,
    variables: [
      { name: 'flow', label: 'Agent Flow', type: VariableType.TEXTAREA, description: 'Define the sequence of agents to run, e.g., "Planning -> Architect -> Frontend, Backend -> Testing -> Deployment".', defaultValue: 'Planning -> Architect -> Frontend, Backend -> Testing -> Deployment', validation: { required: true } },
      { name: 'validation_criteria', label: 'Validation Criteria', type: VariableType.TEXTAREA, description: 'Provide high-level validation criteria for the orchestrator to check at each step.', defaultValue: '1. PRD must be approved before architecture.\n2. All generated code must have at least 80% test coverage.', validation: { required: true } },
    ],
  },
];