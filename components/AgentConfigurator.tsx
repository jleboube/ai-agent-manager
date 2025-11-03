import React, { useState, useEffect, useCallback } from 'react';
import { Agent, AgentName } from '../types';
import VariableInput from './VariableInput';
import { getGroundedAdvice } from '../services/geminiService';

interface AgentConfiguratorProps {
  agent: Agent;
  onClose: () => void;
}

const ActivityLog: React.FC<{ logs: string[] }> = ({ logs }) => {
  const logContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="mt-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-white mb-2">Activity Log</h3>
      <div ref={logContainerRef} className="bg-gray-900 rounded-md p-4 text-gray-400 max-h-48 overflow-auto font-mono text-sm border border-gray-700">
        {logs.length === 0 ? (
            <p>Waiting to start...</p>
        ) : (
            logs.map((log, index) => (
                <p key={index} className="whitespace-pre-wrap leading-relaxed">{log}</p>
            ))
        )}
      </div>
    </div>
  );
};

const AgentConfigurator: React.FC<AgentConfiguratorProps> = ({ agent, onClose }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const initialValues = agent.variables.reduce((acc, v) => {
      acc[v.name] = v.defaultValue || '';
      return acc;
    }, {} as Record<string, string>);
    setValues(initialValues);
    setGeneratedCode(null);
    setErrors({});
    setLogs([]);
    setApiError(null);
  }, [agent]);
  
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    agent.variables.forEach(variable => {
      const value = values[variable.name];
      const rules = variable.validation;

      if (rules?.required && !value?.trim()) {
        newErrors[variable.name] = `${variable.label} is required.`;
      } else if (rules?.minLength && value?.length < rules.minLength) {
        newErrors[variable.name] = `${variable.label} must be at least ${rules.minLength} characters long.`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [agent.variables, values]);

  const handleValueChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
        // Clear error on change
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
  };

  const generateAndExport = async () => {
    setLogs([]);
    setApiError(null);
    setIsGenerating(true);
    setGeneratedCode(null);
    addLog("Starting generation process...");
    
    await new Promise(res => setTimeout(res, 300)); // for dramatic effect
    addLog("Validating user inputs...");
    
    if (!validate()) {
      addLog("❌ Validation failed. Please correct the fields marked in red.");
      setIsGenerating(false);
      return;
    }
    
    addLog("✅ Validation successful.");

    try {
        let output = `
# AI Agent Configuration: ${agent.name}
# Generated on: ${new Date().toISOString()}
# --------------------------------------------------

agent_name: "${agent.name}"
agent_id: "${agent.id}"

# Configuration Parameters
# --------------------------
`;
        for (const key in values) {
          output += `${key}: "${values[key]}"\n`;
        }
        
        if (agent.name === AgentName.ARCHITECT && values.use_search_grounding === 'Yes') {
          addLog("Querying Gemini with Google Search for architectural advice...");
          const prompt = `Based on these project requirements: Project Type is '${values.project_type}' and performance needs are '${values.performance_needs}', recommend a modern and robust software architecture and technology stack. Provide reasons for your choices.`;
          const advice = await getGroundedAdvice(prompt);
          addLog("✅ Received grounded advice.");
          output += `
# Grounded Architectural Advice (from Gemini with Google Search)
# -------------------------------------------------------------
"""
${advice.replace(/\n/g, '\n')}
"""
`;
        }

        output += "\n# --- End of Configuration ---\n";
        
        addLog("📝 Configuration file content generated.");
        setGeneratedCode(output);

        const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${agent.id}_config.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addLog("⬇️ File download initiated successfully.");

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setApiError(errorMessage);
        addLog(`❌ ERROR: ${errorMessage}`);
    } finally {
        setIsGenerating(false);
    }
  };

  const Icon = agent.icon;

  return (
    <div className="bg-gray-800 rounded-lg p-8 animate-slide-in-up max-w-4xl mx-auto shadow-2xl">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <Icon className="h-12 w-12 text-indigo-400" />
          <div>
            <h2 className="text-3xl font-bold text-white">{agent.name}</h2>
            <p className="text-gray-400">{agent.description}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6 mb-8">
        {agent.variables.map(variable => (
          <VariableInput 
            key={variable.name} 
            variable={variable} 
            value={values[variable.name] || ''} 
            onChange={handleValueChange}
            error={errors[variable.name]}
          />
        ))}
      </div>
      
      {apiError && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md mb-6" role="alert">
            <strong className="font-bold">Process Failed: </strong>
            <span className="block sm:inline">{apiError}</span>
        </div>
      )}

      {generatedCode && !apiError && (
        <div className="mb-6 animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-2">Generated Output Preview</h3>
            <pre className="bg-gray-900 rounded-md p-4 text-gray-300 max-h-60 overflow-auto text-sm border border-gray-700">
                <code>{generatedCode}</code>
            </pre>
        </div>
      )}

      <ActivityLog logs={logs} />

      <div className="flex justify-end mt-8">
        <button 
          onClick={generateAndExport}
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center disabled:bg-indigo-800 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : 'Generate & Export File'}
        </button>
      </div>
    </div>
  );
};

export default AgentConfigurator;