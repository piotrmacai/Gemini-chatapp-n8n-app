
import React from 'react';
import { UserIcon, CogIcon, KeyIcon } from './Icons';

interface UserProfileProps {
  onOpenManageAgents: () => void;
  onSelectApiKey: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onOpenManageAgents, onSelectApiKey }) => {
  return (
    <div className="flex flex-col gap-1 w-full p-2">
      <div className="flex items-center justify-between w-full p-2 rounded-md group hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Account</span>
        </div>
        <button 
          onClick={(e) => {
              e.stopPropagation();
              onOpenManageAgents();
          }}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all flex items-center gap-1 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600" 
          title="Manage Agents"
        >
          <CogIcon className="w-5 h-5" />
          <span className="text-xs font-bold hidden group-hover:inline transition-all">MODELS</span>
        </button>
      </div>
      
      <button 
        onClick={onSelectApiKey}
        className="flex items-center gap-3 w-full p-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
      >
        <KeyIcon className="w-5 h-5 ml-1.5" />
        <span className="font-medium">Change API Key / Project</span>
      </button>
    </div>
  );
};

export default UserProfile;
