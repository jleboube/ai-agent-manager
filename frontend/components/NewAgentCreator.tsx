import React, { useState } from 'react';
import { Agent, Variable } from '../types';
import { aiApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CustomAgentIcon } from './icons/AgentIcons';

interface NewAgentCreatorProps {
  onAgentCreated: (newAgent: Omit<Agent, 'id' | 'icon'> & { variables: Variable[] }) => void;
  onClose: () => void;
}

const NewAgentCreator: React.FC<NewAgentCreatorProps> = ({ onAgentCreated, onClose }) => {
  const { refreshUser } = useAuth();
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<string>('');

  const isDescriptionValid = description.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDescriptionValid) {
      setError('Please provide a more detailed description for your new agent (at least 10 characters).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiApi.generateAgent(description, 'custom');
      setAiProvider(result.provider);
      onAgentCreated({
        name: result.agent.name,
        description: result.agent.description,
        variables: result.agent.variables
      });
      // Refresh user to update generation count
      await refreshUser();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    if(error) {
        setError(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-8 animate-slide-in-up max-w-3xl mx-auto shadow-2xl">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <CustomAgentIcon className="h-12 w-12 text-indigo-400" />
          <div>
            <h2 className="text-3xl font-bold text-white">Create a New Custom Agent</h2>
            <p className="text-gray-400">Describe your agent, and AI will generate its configuration.</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="agent-description" className="block text-md font-medium text-gray-200 mb-2">
            Agent Description
          </label>
          <textarea
            id="agent-description"
            rows={5}
            value={description}
            onChange={handleDescriptionChange}
            className={`w-full bg-gray-700 border rounded-md p-3 text-white focus:ring-2 focus:border-indigo-500 transition ${!isDescriptionValid && description.length > 0 ? 'border-yellow-500' : 'border-gray-600'}`}
            placeholder="e.g., An agent that analyzes code for security vulnerabilities and suggests fixes."
          />
          <p className="text-gray-400 text-sm mt-2">
            Provide a clear, concise description of what you want your agent to do. The more detail, the better AI can generate its parameters.
            {aiProvider && <span className="text-indigo-400 font-semibold ml-2">(Powered by {aiProvider})</span>}
          </p>
        </div>

        {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !isDescriptionValid}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating with AI...
              </>
            ) : 'Generate Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewAgentCreator;