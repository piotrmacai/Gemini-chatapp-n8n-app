
import React, { useState } from 'react';
import { XCircleIcon, PlusIcon, PencilIcon, TrashIcon, AgentIcon } from './Icons';
import { AgentConfig } from '../types';

interface ManageAgentsModalProps {
  agents: AgentConfig[];
  onClose: () => void;
  onSaveAgent: (agent: AgentConfig) => void;
  onDeleteAgent: (id: string) => void;
  onToggleAgent: (id: string) => void;
}

const ManageAgentsModal: React.FC<ManageAgentsModalProps> = ({ 
  agents, 
  onClose, 
  onSaveAgent, 
  onDeleteAgent, 
  onToggleAgent 
}) => {
  const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [authHeader, setAuthHeader] = useState('');

  const resetForm = () => {
    setName('');
    setWebhookUrl('');
    setAuthHeader('');
    setEditingAgent(null);
    setIsAdding(false);
  };

  const handleEdit = (agent: AgentConfig) => {
    setEditingAgent(agent);
    setName(agent.name);
    setWebhookUrl(agent.webhookUrl);
    setAuthHeader(agent.authHeader || '');
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const agentData: AgentConfig = {
      id: editingAgent?.id || crypto.randomUUID(),
      name,
      webhookUrl,
      authHeader: authHeader.trim() || undefined,
      isActive: editingAgent ? editingAgent.isActive : true,
    };
    onSaveAgent(agentData);
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Manage N8N Agents</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure and activate your custom AI endpoints</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <XCircleIcon className="w-7 h-7" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isAdding ? (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-bottom-4 duration-300">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {editingAgent ? 'Edit Agent' : 'Add New Agent'}
              </h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent Name</label>
                  <input
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sales Assistant"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Webhook URL</label>
                  <input
                    type="url" required value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://n8n.example.com/webhook/..."
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bearer Token (Optional)</label>
                  <input
                    type="password" value={authHeader} onChange={(e) => setAuthHeader(e.target.value)}
                    placeholder="Authorization password"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="flex-1 py-2.5 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                  {editingAgent ? 'Update Agent' : 'Save Agent'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">YOUR AGENTS ({agents.length})</span>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Agent
                </button>
              </div>

              {agents.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl">
                  <AgentIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No agents configured yet</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {agents.map((agent) => (
                    <div key={agent.id} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${agent.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                          <AgentIcon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <h4 className={`font-semibold truncate ${agent.isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>{agent.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{agent.webhookUrl}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         <div className="flex items-center mr-4">
                            <button 
                              onClick={() => onToggleAgent(agent.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${agent.isActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${agent.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                            <span className="ml-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-12">{agent.isActive ? 'Active' : 'Off'}</span>
                         </div>
                        <button onClick={() => handleEdit(agent)} className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all shadow-sm">
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onDeleteAgent(agent.id)} className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all shadow-sm">
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAgentsModal;
