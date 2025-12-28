
import { Attachment, AgentConfig } from '../types';

/**
 * Safely extracts a string message from various common n8n response formats.
 * @param data The JSON response from the webhook.
 * @returns A string representation of the response.
 */
const parseN8nResponse = (data: any): string => {
  if (!data) return 'The agent returned an empty response.';

  // n8n often returns an array of items
  const item = Array.isArray(data) ? data[0] : data;
  if (!item) return 'The agent returned an empty list.';

  // Check for common keys in order of preference
  const priorityKeys = ['output', 'text', 'message', 'response', 'answer', 'chatInput'];
  for (const key of priorityKeys) {
    if (item[key] !== undefined && item[key] !== null) {
      return String(item[key]);
    }
  }

  // If no common keys found, look for any string property
  const firstStringKey = Object.keys(item).find(k => typeof item[k] === 'string');
  if (firstStringKey) {
    return String(item[firstStringKey]);
  }

  // Final fallback: stringify the object so the user sees SOMETHING useful
  return typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item);
};

export const sendMessageToAgent = async (
  agent: AgentConfig, 
  message: string, 
  attachment?: Attachment
): Promise<string> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (agent.authHeader) {
      headers['Authorization'] = `Bearer ${agent.authHeader}`;
    }

    const response = await fetch(agent.webhookUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        chatInput: message,
        attachment: attachment ? {
            name: attachment.name,
            mimeType: attachment.mimeType,
            size: attachment.size,
            data: attachment.data,
        } : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HTTP error! status: ${response.status}`, errorText);
      throw new Error(`Agent returned status ${response.status}. URL: ${agent.webhookUrl}`);
    }

    const data = await response.json();
    return parseN8nResponse(data);

  } catch (error) {
    console.error(`Error communicating with n8n agent (${agent.name}):`, error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return `Connection failed for "${agent.name}". This is likely a CORS issue or an invalid Webhook URL. Ensure your n8n instance allows requests from this origin.`;
    }
    return `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`;
  }
};
