import React, { useState } from 'react';
import { Agent } from './types';
import { PREDEFINED_AGENTS } from './constants';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import AgentCard from './components/AgentCard';
import AgentConfigurator from './components/AgentConfigurator';
import NewAgentCreator from './components/NewAgentCreator';
import LandingPage from './components/LandingPage';
import SubscriptionModal from './components/SubscriptionModal';
import { CustomAgentIcon } from './components/icons/AgentIcons';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, login, canGenerate } = useAuth();
  const [agents, setAgents] = useState<Agent[]>(PREDEFINED_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setShowLanding(false);
    } else {
      login();
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    // Check if user can generate
    if (!isAuthenticated) {
      login();
      return;
    }

    if (!canGenerate) {
      setShowSubscriptionModal(true);
      return;
    }

    setSelectedAgent(agent);
    setIsCreatingNew(false);
    setShowLanding(false);
  };

  const handleCreateNew = () => {
    // Check if user can generate
    if (!isAuthenticated) {
      login();
      return;
    }

    if (!canGenerate) {
      setShowSubscriptionModal(true);
      return;
    }

    setIsCreatingNew(true);
    setSelectedAgent(null);
    setShowLanding(false);
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

  // Show landing page for unauthenticated users or when explicitly shown
  if (!isAuthenticated || (showLanding && !currentView)) {
    return (
      <div className="min-h-screen bg-gray-900 font-sans">
        <Header />
        <main className="container mx-auto px-4 py-8">
          {!isAuthenticated ? (
            <LandingPage onGetStarted={handleGetStarted} onSignIn={login} />
          ) : (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name || user?.email}!</h2>
                <p className="text-lg text-gray-300 mb-4">
                  Select a pre-defined agent to configure, or create a custom agent from scratch.
                </p>
                {user && !user.hasSubscription && (
                  <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 max-w-2xl mx-auto mb-4">
                    <p className="text-yellow-200">
                      ⚠️ You have <strong>{1 - user.generationsUsed}</strong> free generation{1 - user.generationsUsed !== 1 ? 's' : ''} remaining.
                      <button
                        onClick={() => setShowSubscriptionModal(true)}
                        className="ml-2 underline hover:text-yellow-100"
                      >
                        Upgrade now
                      </button>
                    </p>
                  </div>
                )}
              </div>
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
                  <p className="text-gray-400 mt-2">Define a new agent from a description using AI.</p>
                </div>
              </div>
            </div>
          )}
        </main>
        {showSubscriptionModal && (
          <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
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
      {showSubscriptionModal && (
        <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
