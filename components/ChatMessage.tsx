import React from 'react';
import { Message } from '../types';
import { UserIcon, AgentIcon, FileIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const { content, attachment } = message;

  return (
    <div className={`flex items-start gap-4 p-4 md:p-6 ${isUser ? '' : 'bg-gray-100 dark:bg-gray-700/50'}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
        {isUser ? <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" /> : <AgentIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{message.role}</p>
        <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {content}
        </div>
        {attachment && (
          <div className="mt-4">
            {attachment.type === 'image' ? (
              <img src={attachment.data} alt={attachment.name} className="max-w-xs max-h-64 rounded-lg border border-gray-200 dark:border-gray-700" />
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-200 dark:bg-gray-600 max-w-xs">
                <FileIcon className="w-8 h-8 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                <div className="truncate">
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{attachment.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{(attachment.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;