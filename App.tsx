
import React, { useState } from 'react';
import { Agent } from './types';
import { PREDEFINED_AGENTS } from './constants';
import Header from './components/Header';
import AgentCard from './components/AgentCard';
import AgentConfigurator from './components/AgentConfigurator';
import NewAgentCreator from './components/NewAgentCreator';
import { CustomAgentIcon } from './components/icons/AgentIcons';

const App: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(PREDEFINED_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsCreatingNew(false);
  };

  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setSelectedAgent(null);
  };

  const handleCloseConfigurator = () => {
    setSelectedAgent(null);
    setIsCreatingNew(false);
  };

  const handleAgentCreated = (newAgent: Omit<Agent, 'id' | 'icon'> & { variables: Agent['variables'] }) => {
    const newAgentWithId: Agent = {
      ...newAgent,
      id: `custom-${Date.now()}`,
      icon: CustomAgentIcon,
    };
    setAgents(prev => [...prev, newAgentWithId]);
    setSelectedAgent(newAgentWithId);
    setIsCreatingNew(false);
  };

  const currentView = selectedAgent || isCreatingNew;

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {!currentView && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Welcome to the AI Agent Factory</h2>
            <p className="text-lg text-gray-300 mb-8 text-center max-w-3xl mx-auto">
              Select a pre-defined agent to configure, or create a custom agent from scratch to manage your software development lifecycle.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} onSelect={() => handleSelectAgent(agent)} />
              ))}
              <div
                className="bg-gray-800 rounded-lg p-6 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-600 hover:border-indigo-500 hover:bg-gray-700 transition-all duration-300 cursor-pointer"
                onClick={handleCreateNew}
              >
                <CustomAgentIcon className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white">Create New Agent</h3>
                <p className="text-gray-400 mt-2">Define a new agent from a description using Gemini.</p>
              </div>
            </div>
          </div>
        )}

        {selectedAgent && (
          <AgentConfigurator 
            key={selectedAgent.id} 
            agent={selectedAgent} 
            onClose={handleCloseConfigurator} 
          />
        )}
        
        {isCreatingNew && (
            <NewAgentCreator 
              onAgentCreated={handleAgentCreated}
              onClose={handleCloseConfigurator}
            />
        )}
      </main>
    </div>
  );
};

export default App;
