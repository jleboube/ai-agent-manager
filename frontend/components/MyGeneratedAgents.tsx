import React, { useState, useEffect } from 'react';
import { aiApi, subscriptionApi } from '../services/api';

interface AgentSummary {
  id: string;
  agentName: string;
  agentType: string;
  aiProvider: string;
  description: string;
  createdAt: string;
  fileSizeBytes: number;
}

interface MyGeneratedAgentsProps {
  onClose: () => void;
}

const MyGeneratedAgents: React.FC<MyGeneratedAgentsProps> = ({ onClose }) => {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [requiresAnnualPlan, setRequiresAnnualPlan] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const response = await aiApi.getMyAgents();
      setAgents(response.agents || []);
      setHasAccess(response.hasAccess);
      setRequiresAnnualPlan(response.requiresAnnualPlan);
    } catch (err) {
      console.error('Failed to load agents:', err);
      setError('Failed to load your agents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (agentId: string, agentName: string) => {
    try {
      setDownloadingId(agentId);
      const response = await aiApi.downloadAgent(agentId);

      // Create and download the file
      const blob = new Blob([response.fileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${response.agentType}_config_${new Date(response.createdAt).getTime()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download agent:', err);
      if (err.response?.data?.requiresUpgrade) {
        alert('Annual subscription required to download historical agents.');
      } else {
        alert('Failed to download agent. Please try again.');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUpgrade = async () => {
    try {
      const { url } = await subscriptionApi.createCheckoutSession('yearly');
      window.location.href = url;
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start checkout. Please try again.');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden animate-fade-in flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start p-8 pb-4 border-b border-gray-700">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              My Generated Agents
            </h2>
            <p className="text-gray-300">
              {hasAccess
                ? `Access your historical agent configurations (up to 15 most recent)`
                : 'Upgrade to Annual plan to access historical agents'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md">
              {error}
            </div>
          ) : requiresAnnualPlan ? (
            // Upgrade prompt for non-annual users
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-8 text-center">
              <div className="bg-white bg-opacity-10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-10 w-10 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Upgrade to Annual Plan
              </h3>
              <p className="text-white text-lg mb-6 max-w-md mx-auto">
                Get access to your 15 most recent agent configurations. Perfect for power users who want to track and reuse their AI agents.
              </p>
              <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-6 max-w-md mx-auto">
                <ul className="space-y-3 text-left">
                  <Feature text="15 historical agent configurations" />
                  <Feature text="Download and reuse anytime" />
                  <Feature text="Track all your generations" />
                  <Feature text="Everything in Monthly plan" />
                  <Feature text="Save $10 vs monthly billing" />
                </ul>
              </div>
              <button
                onClick={handleUpgrade}
                className="bg-white hover:bg-gray-100 text-indigo-600 font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
              >
                Upgrade to Annual - $49.99/year
              </button>
            </div>
          ) : agents.length === 0 ? (
            // No agents yet
            <div className="text-center py-12">
              <div className="bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="h-10 w-10 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No Agents Yet
              </h3>
              <p className="text-gray-400">
                Generate your first agent to see it here!
              </p>
            </div>
          ) : (
            // Agent list
            <div className="space-y-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-gray-700 rounded-lg p-5 border border-gray-600 hover:border-indigo-500 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {agent.agentName}
                        </h3>
                        <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                          {agent.agentType}
                        </span>
                        <span className="bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded">
                          {agent.aiProvider}
                        </span>
                      </div>
                      {agent.description && (
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                          {agent.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          {formatDate(agent.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                          </svg>
                          {formatBytes(agent.fileSizeBytes)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(agent.id, agent.agentName)}
                      disabled={downloadingId === agent.id}
                      className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingId === agent.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                          Download
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {hasAccess && agents.length > 0 && (
          <div className="border-t border-gray-700 p-6 bg-gray-750">
            <p className="text-gray-400 text-sm text-center">
              Showing {agents.length} of your most recent agents • Annual subscribers get access to 15 historical agents
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const Feature: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-start">
    <svg
      className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M5 13l4 4L19 7"></path>
    </svg>
    <span className="text-white">{text}</span>
  </li>
);

export default MyGeneratedAgents;
