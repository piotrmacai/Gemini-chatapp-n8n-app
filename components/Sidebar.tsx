
import React from 'react';
import { Conversation, AgentConfig } from '../types';
import { PlusIcon, AgentIcon } from './Icons';
import ThemeToggle from './ThemeToggle';
import UserProfile from './UserProfile';
import ModelSwitcher from './ModelSwitcher';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  selectedModelId: string;
  customAgents: AgentConfig[];
  onSelectModel: (id: string) => void;
  onOpenManageAgents: () => void;
  onSelectApiKey: () => void;
  isModelSwitcherDisabled: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  theme,
  onToggleTheme,
  selectedModelId,
  customAgents,
  onSelectModel,
  onOpenManageAgents,
  onSelectApiKey,
  isModelSwitcherDisabled
}) => {
  const sortedConversations = [...conversations].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 h-full flex flex-col p-2">
      <div className="p-2 mb-4 space-y-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <AgentIcon className="w-8 h-8 text-blue-500" />
                <h1 className="text-xl font-bold">N8N Agent Chat</h1>
            </div>
            <button
              onClick={onNewConversation}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
              title="New Chat"
            >
              <PlusIcon className="w-6 h-6" />
            </button>
        </div>
        <ModelSwitcher 
            selectedModelId={selectedModelId} 
            customAgents={customAgents}
            onSelectModel={onSelectModel}
            onAddAgent={onOpenManageAgents}
            disabled={isModelSwitcherDisabled}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="flex flex-col gap-1">
          {sortedConversations.length > 0 && (
            <h2 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-1 mt-2">History</h2>
          )}
          {sortedConversations.map((convo) => (
            <a
              key={convo.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectConversation(convo.id);
              }}
              className={`block w-full text-left p-2 rounded-md truncate text-sm transition-colors ${
                activeConversationId === convo.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'hover:bg-gray-200 dark:hover:bg-gray-700/50'
              }`}
            >
              {convo.title}
            </a>
          ))}
          {sortedConversations.length === 0 && (
            <div className="px-2 py-4 text-xs text-gray-400 dark:text-gray-500 italic">
              No history yet
            </div>
          )}
        </nav>
      </div>
      <div className="mt-auto p-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
          <UserProfile onOpenManageAgents={onOpenManageAgents} onSelectApiKey={onSelectApiKey} />
      </div>
    </div>
  );
};

export default Sidebar;
