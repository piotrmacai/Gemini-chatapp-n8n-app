
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentParameters } from "@google/genai";
import { Attachment } from '../types';

/**
 * Converts a data URI string to a base64 string.
 */
const dataUriToBase64 = (dataUri: string): string => {
    return dataUri.split(',')[1];
};

/**
 * Sends a message to the Gemini API using the current process.env.API_KEY.
 * Re-initializes the client on every call to pick up project/key changes.
 */
export const sendMessageToGemini = async (message: string, attachment?: Attachment): Promise<string> => {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
          return "API Key not found. Please ensure you have selected a project or configured your environment.";
        }

        const ai = new GoogleGenAI({ apiKey });
        const modelName = 'gemini-3-flash-preview';

        let contents: GenerateContentParameters['contents'];

        if (attachment && attachment.type === 'image') {
            const imagePart = {
                inlineData: {
                    mimeType: attachment.mimeType,
                    data: dataUriToBase64(attachment.data),
                },
            };
            const textPart = { text: message || "Analyze this image." };
            contents = { parts: [imagePart, textPart] };
        } else {
            contents = message;
        }

        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
        });

        return response.text || "No response received from Gemini.";

    } catch (error: any) {
        console.error("Gemini API Error:", error);
        if (error?.message?.includes("entity was not found")) {
            return "Project Error: The selected API key or project was not found. Please click the key icon to re-select your project.";
        }
        return `Gemini Error: ${error instanceof Error ? error.message : 'Communication failed'}`;
    }
};
