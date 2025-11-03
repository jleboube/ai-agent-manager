import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Variable } from '../types';

// Fix: Adhere to coding guidelines by removing API key fallback and warning.
// The API key must be provided exclusively via the `process.env.API_KEY` environment variable.
const genAI = new GoogleGenerativeAI(process.env.API_KEY!);

export const generateAgentVariables = async (description: string): Promise<{ name: string; description: string; variables: Variable[] }> => {
  const modelName = "gemini-2.0-flash-thinking-exp-01-21";

  const prompt = `
    You are an expert system designer for AI agents. A user wants to create a new AI agent to help with a software development task.
    Based on the user's description, you must generate a name for the agent, a concise one-sentence description, and a list of configuration variables the user needs to provide.

    User's agent description: "${description}"

    Your task is to:
    1.  Create a short, descriptive name for this new agent (e.g., "Code Review Agent", "Security Scanner Agent").
    2.  Create a one-sentence description for what this agent does.
    3.  Determine a list of JSON objects representing configuration variables. Each variable must have:
        - "name": a machine-readable string (snake_case).
        - "label": a human-readable string (Title Case).
        - "type": one of 'text', 'textarea', 'select', or 'radio'.
        - "description": a sentence explaining what this variable is for.
        - "options" (optional): an array of strings if the type is 'select' or 'radio'. Provide sensible options.
        - "defaultValue" (optional): a sensible default from the options.

    Think carefully about what parameters would be necessary to make an agent with the given description functional and configurable.
    For example, a "Code Reviewer" might need variables for "language", "review_style", and "severity_threshold".
    Return ONLY the JSON object, with no other text or markdown formatting.
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
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
                  type: { type: SchemaType.STRING, enum: ['text', 'textarea', 'select', 'radio'] },
                  options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, nullable: true },
                  description: { type: SchemaType.STRING },
                  defaultValue: { type: SchemaType.STRING, nullable: true },
                },
                required: ['name', 'label', 'type', 'description']
              }
            }
          },
          required: ['name', 'description', 'variables']
        }
      }
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonText = response.text();
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error("Error generating agent variables with Gemini:", error);
    throw new Error("Failed to generate agent configuration. The model may have returned an invalid response.");
  }
};

export const getGroundedAdvice = async (prompt: string): Promise<string> => {
  const modelName = "gemini-2.0-flash-exp";

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error getting grounded advice:", error);
    return "Sorry, I was unable to fetch grounded advice at this time.";
  }
};