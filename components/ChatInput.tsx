import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PaperclipIcon, XCircleIcon, FileIcon, MicrophoneIcon, StopCircleIcon } from './Icons';
import { Attachment } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string, attachment?: Attachment) => void;
  isLoading: boolean;
}

// Type definitions for SpeechRecognition API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: any) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
}

// Browser compatibility
interface CustomWindow extends Window {
  SpeechRecognition: { new(): SpeechRecognition };
  webkitSpeechRecognition: { new(): SpeechRecognition };
}
declare const window: CustomWindow;
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognitionAPI;

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleToggleRecording = () => {
    if (!isSpeechRecognitionSupported) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setInputValue(transcript);
    };

    recognition.start();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreview('file'); 
      }
    }
    if(e.target) e.target.value = '';
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
      recognitionRef.current?.stop();
    }
    if ((!inputValue.trim() && !attachment) || isLoading) return;

    let attachmentData: Attachment | undefined = undefined;

    if (attachment) {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(attachment);
      });
      
      attachmentData = {
        name: attachment.name,
        type: attachment.type.startsWith('image/') ? 'image' : 'file',
        mimeType: attachment.type,
        size: attachment.size,
        data: data,
      };
    }

    onSendMessage(inputValue.trim(), attachmentData);
    setInputValue('');
    handleRemoveAttachment();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-3xl mx-auto">
        {attachment && (
           <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg relative">
             <div className="flex items-center gap-3">
                {attachmentPreview && attachment.type.startsWith('image/') ? (
                    <img src={attachmentPreview} alt="preview" className="w-16 h-16 object-cover rounded-md" />
                ) : (
                    <FileIcon className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                )}
                <div className="truncate">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{(attachment.size/1024).toFixed(2)} KB</p>
                </div>
             </div>
            <button onClick={handleRemoveAttachment} className="absolute top-1 right-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors" aria-label="Remove attachment">
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-end gap-2 md:gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isRecording}
            className="p-3 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            aria-label="Attach file"
          >
            <PaperclipIcon className="w-6 h-6" />
          </button>
          <textarea
            ref={textareaRef}
            name="chatInput"
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening..." : "Type your message here..."}
            disabled={isLoading || isRecording}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 placeholder-gray-500 dark:placeholder-gray-400"
            style={{ maxHeight: '200px' }}
          />
          {isSpeechRecognitionSupported && (
            <button
              type="button"
              onClick={handleToggleRecording}
              disabled={isLoading}
              className={`p-3 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <StopCircleIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || isRecording || (!inputValue.trim() && !attachment)}
            className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-500 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;