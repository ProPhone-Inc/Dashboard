import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';
import { generateGeminiResponse } from '../utils/gemini';

interface CopilotSettings {
  provider: 'openai' | 'anthropic' | 'google' | null;
  apiKey: string | null;
  systemPrompt: string;
  openaiKey: string | null;
  messages: Array<{
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    read?: boolean;
    context?: {
      type: 'phone' | 'crm' | 'automation';
      data?: any;
    };
  }>;
  configurations: {
    id: string;
    name: string;
    provider: 'openai' | 'anthropic' | 'google';
    apiKey: string;
    isActive: boolean;
    lastUsed?: number;
  }[];
  lastUpdated?: number;
}

interface CopilotStore extends CopilotSettings {
  updateSettings: (settings: Partial<CopilotSettings>) => void;
  addConfiguration: (config: Omit<CopilotSettings['configurations'][0], 'id' | 'isActive'>) => void;
  updateConfiguration: (id: string, updates: Partial<Omit<CopilotSettings['configurations'][0], 'id'>>) => void;
  removeConfiguration: (id: string) => void;
  setActiveConfiguration: (id: string) => void;
  clearSettings: () => void;
}

export const useCopilot = create<CopilotStore>()(
  persist(
    (set, get) => ({
      provider: null,
      apiKey: null,
      openaiKey: import.meta.env.VITE_OPENAI_API_KEY || null,
      systemPrompt: `You are ProPhone Copilot powered by Google Gemini 2.0 Flash, an AI assistant for a marketing and automation platform. 
      You help users with campaign creation, workflow automation, analytics, and customer management.
      You can perform actions like:
      - Creating new messages
      - Changing contact statuses
      - Analyzing conversations
      - Automating workflows
      - Generating reports
      
      When performing actions, use the following format:
      [ACTION:type|param1=value1|param2=value2]
      
      Available actions:
      - CREATE_MESSAGE: number, content
      - UPDATE_STATUS: chatId, status
      - CREATE_WORKFLOW: name, trigger, actions
      `,
      messages: [],
      configurations: [],
      lastUpdated: null,

      updateSettings: async (settings) => {
        // If updating API key, encrypt it first
        try {
          // Default to Google Gemini with the provided API key
          if (!settings.apiKey) {
            settings.apiKey = 'AIzaSyCJ6kLKlCo6eW-sp88ktlOvntiq7ASzQ4M';
            settings.provider = 'google';
          }

          const { data } = await api.post('/copilot/settings', settings);
          set({
            ...data,
            lastUpdated: Date.now()
          });
        } catch (error) {
          console.error('Failed to update settings:', error);
          throw error;
        }
      },

      addConfiguration: async (config) => {
        const id = Math.random().toString(36).substr(2, 9);
        try {
          const { data } = await api.post('/copilot/configurations', {
            ...config,
            id,
            isActive: false
          });
        
          set((state) => ({
            configurations: [...state.configurations, data],
            ...(state.configurations.length === 0 ? {
              provider: data.provider,
              apiKey: data.apiKey
            } : {})
          }));
        } catch (error) {
          console.error('Failed to add configuration:', error);
          throw error;
        }
      },

      updateConfiguration: async (id, updates) => {
        try {
          const { data } = await api.put(`/copilot/configurations/${id}`, updates);
          set(state => ({
            configurations: state.configurations.map(config => 
              config.id === id ? data : config
            )
          }));
        } catch (error) {
          console.error('Failed to update configuration:', error);
          throw error;
        }
      },

      removeConfiguration: async (id) => {
        try {
          await api.delete(`/copilot/configurations/${id}`);
          set(state => ({
            configurations: state.configurations.filter(c => c.id !== id)
          }));
        } catch (error) {
          console.error('Failed to remove configuration:', error);
          throw error;
        }
      },

      setActiveConfiguration: async (id) => {
        try {
          const { data } = await api.post(`/copilot/configurations/${id}/activate`);
          set(state => ({
            configurations: state.configurations.map(c => ({
              ...c,
              isActive: c.id === id
            })),
            provider: data.provider,
            apiKey: data.apiKey
          }));
        } catch (error) {
          console.error('Failed to set active configuration:', error);
          throw error;
        }
      },

      clearSettings: async () => {
        // Reset to default Google Gemini configuration
        set({
          provider: 'google',
          apiKey: 'AIzaSyCJ6kLKlCo6eW-sp88ktlOvntiq7ASzQ4M',
          configurations: [],
          lastUpdated: Date.now()
        });
      },

      handleProviderSetup: (provider: string) => {
        const instructions = {
          google: {
            title: "Google Gemini 2.0 Flash Setup Instructions",
            steps: [
              "1. Visit Google AI Studio at https://aistudio.google.com/app/apikey",
              "2. Sign in with your Google account",
              "3. Click 'Get API key'",
              "4. Create a new key or select existing",
              "5. Copy your API key"
            ],
            docs: "https://ai.google.dev/docs/gemini_flash"
          }
        };

        const selectedInstructions = instructions[provider as keyof typeof instructions];
        if (!selectedInstructions) return;

        let responseContent = `Great choice! Let me help you set up ${selectedInstructions.title}:\n\n${selectedInstructions.steps.join('\n')}\n\n`;
        
        if (selectedInstructions.docs) {
          responseContent += `📚 Official Documentation: ${selectedInstructions.docs}\n\n`;
        }
        
        responseContent += `Once you have your API key:\n1. Click the Settings icon in the top right corner\n2. Go to "CoPilot Settings"\n3. Click "Add New Configuration"\n4. Enter your API key\n\nNeed help with anything else?`;
        
        const assistantMessage = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'assistant' as const,
          content: responseContent,
          timestamp: new Date()
        };

        set(state => ({
          messages: [...state.messages, assistantMessage]
        }));
      }
    }),
    {
      name: 'copilot-settings',
      partialize: (state) => ({
        messages: state.messages,
        lastUpdated: state.lastUpdated
      })
    }
  )
);