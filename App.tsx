
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ManageAgentsModal from './components/ManageAgentsModal';
import useLocalStorage from './hooks/useLocalStorage';
import { sendMessageToAgent } from './services/n8nService';
import { sendMessageToGemini } from './services/geminiService';
import { Conversation, Message, Attachment, AgentConfig } from './types';

// FIX: Declare types for internal key management to match global AIStudio definition.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    readonly aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('chatHistory', []);
  const [customAgents, setCustomAgents] = useLocalStorage<AgentConfig[]>('customAgents', []);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini');
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSelectApiKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Proceed immediately - the environment variable will be updated by the platform.
    } catch (e) {
      console.error('Error selecting key:', e);
    }
  };

  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);
  
  const currentModelId = activeConversation?.modelId || selectedModelId;

  const handleNewConversation = () => {
    setActiveConversationId(null);
  };
  
  const handleSelectModel = (id: string) => {
    if (!activeConversationId) {
        setSelectedModelId(id);
    }
  };

  const handleSaveAgent = (agent: AgentConfig) => {
    setCustomAgents(prev => {
      const exists = prev.find(a => a.id === agent.id);
      if (exists) {
        return prev.map(a => a.id === agent.id ? agent : a);
      }
      return [...prev, agent];
    });
    if (agent.isActive) {
        setSelectedModelId(agent.id);
    }
  };

  const handleDeleteAgent = (id: string) => {
    setCustomAgents(prev => prev.filter(agent => agent.id !== id));
    if (selectedModelId === id) {
      setSelectedModelId('gemini');
    }
  };

  const handleToggleAgentStatus = (id: string) => {
    setCustomAgents(prev => prev.map(agent => {
      if (agent.id === id) {
        const newStatus = !agent.isActive;
        if (!newStatus && selectedModelId === id) {
            setSelectedModelId('gemini');
        }
        return { ...agent, isActive: newStatus };
      }
      return agent;
    }));
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleSendMessage = async (userInput: string, attachment?: Attachment) => {
    setIsLoading(true);
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userInput,
      attachment: attachment,
      timestamp: Date.now()
    };
    
    let currentConvoId = activeConversationId;
    let updatedConversations: Conversation[];
    let modelIdForMessage: string;
    
    const conversationTitle = userInput.substring(0, 30) + (userInput.length > 30 ? '...' : '') 
      || (attachment?.name.substring(0, 30) + (attachment?.name.length > 30 ? '...' : ''))
      || 'New Chat';

    if (!currentConvoId) {
      modelIdForMessage = selectedModelId;
      const newConversation: Conversation = {
        id: crypto.randomUUID(),
        title: conversationTitle,
        messages: [userMessage],
        timestamp: Date.now(),
        modelId: modelIdForMessage,
      };
      updatedConversations = [...conversations, newConversation];
      currentConvoId = newConversation.id;
      setActiveConversationId(currentConvoId);
    } else {
      const conv = conversations.find(c => c.id === currentConvoId);
      modelIdForMessage = conv?.modelId || 'gemini';
      updatedConversations = conversations.map(c => 
        c.id === currentConvoId 
        ? { ...c, messages: [...c.messages, userMessage], timestamp: Date.now() }
        : c
      );
    }
    setConversations(updatedConversations);

    let agentResponseContent: string;
    
    if (modelIdForMessage === 'gemini') {
        agentResponseContent = await sendMessageToGemini(userInput, attachment);
    } else {
        const agent = customAgents.find(a => a.id === modelIdForMessage);
        if (agent) {
            agentResponseContent = await sendMessageToAgent(agent, userInput, attachment);
        } else {
            agentResponseContent = "Error: This agent is no longer available.";
        }
    }
    
    const agentMessage: Message = {
      id: crypto.randomUUID(),
      role: 'agent',
      content: agentResponseContent,
      timestamp: Date.now()
    };

    const finalConversations = updatedConversations.map(c =>
      c.id === currentConvoId
      ? { ...c, messages: [...c.messages, agentMessage] }
      : c
    );
    setConversations(finalConversations);
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen font-sans bg-white dark:bg-gray-800 transition-colors duration-200">
      <div className="w-1/4 max-w-xs min-w-[260px] hidden md:block border-r border-gray-200 dark:border-gray-700">
        <Sidebar 
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          selectedModelId={currentModelId}
          customAgents={customAgents}
          onSelectModel={handleSelectModel}
          onOpenManageAgents={() => setIsManageModalOpen(true)}
          onSelectApiKey={handleSelectApiKey}
          isModelSwitcherDisabled={!!activeConversationId}
        />
      </div>
      <div className="flex-1">
        <ChatWindow 
          conversation={activeConversation}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
      {isManageModalOpen && (
        <ManageAgentsModal 
          agents={customAgents}
          onClose={() => setIsManageModalOpen(false)} 
          onSaveAgent={handleSaveAgent}
          onDeleteAgent={handleDeleteAgent}
          onToggleAgent={handleToggleAgentStatus}
        />
      )}
    </div>
  );
};

export default App;
