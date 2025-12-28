import React, { useRef, useEffect } from 'react';
import { Conversation, Attachment } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { AgentIcon } from './Icons';

interface ChatWindowProps {
  conversation: Conversation | null;
  onSendMessage: (message: string, attachment?: Attachment) => void;
  isLoading: boolean;
}

const WelcomeScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
    <AgentIcon className="w-24 h-24 mb-4 text-gray-400 dark:text-gray-500" />
    <h1 className="text-4xl font-bold text-gray-700 dark:text-gray-300">N8N AI Agent</h1>
    <p className="mt-2 text-lg">Start a new conversation to chat with your agent.</p>
  </div>
);

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, onSendMessage, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <div className="flex-1 overflow-y-auto">
        {conversation && conversation.messages.length > 0 ? (
          <div>
            {conversation.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <WelcomeScreen />
        )}
      </div>
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatWindow;