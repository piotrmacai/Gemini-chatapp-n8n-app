
export interface Attachment {
  name: string;
  type: 'image' | 'file';
  mimeType: string;
  size: number;
  data: string; // Base64 data URI
}

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
  attachment?: Attachment;
}

export interface AgentConfig {
  id: string;
  name: string;
  webhookUrl: string;
  authHeader?: string; // The Bearer token
  isActive: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
  modelId: string; // 'gemini' or a custom agent id
}
