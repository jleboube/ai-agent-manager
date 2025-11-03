
import React from 'react';
import { Agent } from '../types';

interface AgentCardProps {
  agent: Agent;
  onSelect: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect }) => {
  const Icon = agent.icon;
  return (
    <div
      onClick={onSelect}
      className="bg-gray-800 rounded-lg p-6 flex flex-col text-center items-center cursor-pointer group hover:bg-indigo-600 hover:-translate-y-1 transform transition-all duration-300 shadow-lg hover:shadow-2xl"
    >
      <div className="bg-gray-700 p-4 rounded-full mb-4 group-hover:bg-indigo-500 transition-colors duration-300">
        <Icon className="h-10 w-10 text-indigo-400 group-hover:text-white" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{agent.name}</h3>
      <p className="text-gray-400 group-hover:text-gray-200 flex-grow">{agent.description}</p>
    </div>
  );
};

export default AgentCard;
