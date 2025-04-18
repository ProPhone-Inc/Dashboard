import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';

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
      systemPrompt: `You are ProPhone Copilot, an AI assistant for a marketing platform. 
      You help users with campaign creation, workflow automation, analytics, and customer management.
      You are friendly, helpful, and knowledgeable about marketing strategies, automation workflows, 
      and best practices for customer engagement.
      
      When users ask questions, provide clear, concise answers with practical advice they can implement.
      If you don't know something, be honest about your limitations.
      
      You are powered by Google's Gemini 2.0 Flash model.
      `,
      messages: [],
      configurations: [],
      lastUpdated: null,

      updateSettings: async (settings) => {
        // If updating API key, encrypt it first
        try {
          // If OpenAI key is provided in env, use it as default
          if (!settings.apiKey && !settings.provider && get().openaiKey) {
            settings.apiKey = get().openaiKey;
            settings.provider = 'openai';
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
        try {
          await api.delete('/copilot/settings');
          set({
            provider: null,
            apiKey: null,
            configurations: [],
            lastUpdated: null
          });
        } catch (error) {
          console.error('Failed to clear settings:', error);
          throw error;
        }
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