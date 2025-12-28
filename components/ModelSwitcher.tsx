
import React, { useState, useRef, useEffect } from 'react';
import { GeminiIcon, AgentIcon, ChevronDownIcon, PlusIcon } from './Icons';
import { AgentConfig } from '../types';

interface ModelSwitcherProps {
  selectedModelId: string;
  customAgents: AgentConfig[];
  onSelectModel: (id: string) => void;
  onAddAgent: () => void;
  disabled: boolean;
}

const ModelSwitcher: React.FC<ModelSwitcherProps> = ({ 
  selectedModelId, 
  customAgents, 
  onSelectModel, 
  onAddAgent, 
  disabled 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const activeAgents = customAgents.filter(a => a.isActive);

  const getModelName = (id: string) => {
    if (id === 'gemini') return 'Gemini 3 Flash';
    const agent = customAgents.find(a => a.id === id);
    return agent ? agent.name : 'Unknown Agent';
  };

  const getModelIcon = (id: string) => {
    if (id === 'gemini') return <GeminiIcon className="w-5 h-5" />;
    return <AgentIcon className="w-5 h-5" />;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);
  
  const handleSelect = (id: string) => {
    onSelectModel(id);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between p-2 rounded-md bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {getModelIcon(selectedModelId)}
          <span className="text-sm font-semibold truncate">{getModelName(selectedModelId)}</span>
        </div>
        {!disabled && <ChevronDownIcon className={`w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>
      
      {isOpen && !disabled && (
        <div className="absolute z-20 top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
          <div className="p-1">
            <button
              onClick={() => handleSelect('gemini')}
              className={`w-full flex items-center gap-2 p-2 text-left text-sm rounded-md transition-colors ${selectedModelId === 'gemini' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
            >
              <GeminiIcon className="w-5 h-5" />
              <span>Gemini 3 Flash</span>
            </button>
            
            {activeAgents.length > 0 && <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />}
            
            {activeAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => handleSelect(agent.id)}
                className={`w-full flex items-center gap-2 p-2 text-left text-sm rounded-md transition-colors ${selectedModelId === agent.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
              >
                <AgentIcon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{agent.name}</span>
              </button>
            ))}
            
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
            
            <button
              onClick={() => {
                onAddAgent();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 p-2 text-left text-sm text-blue-600 dark:text-blue-400 font-medium rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Manage Agents</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSwitcher;
