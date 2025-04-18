import { useState, useCallback } from 'react';
import { useCopilot } from './useCopilot';
import { Message } from '../types';
import { generateGeminiResponse } from '../../../utils/gemini';

interface UseCopilotChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isSetupMode: boolean;
  onNewMessage: () => void;
}

export function useCopilotChat({
  messages,
  setMessages,
  isSetupMode,
  onNewMessage
}: UseCopilotChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { handleProviderSetup } = useCopilot();

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      if (isSetupMode) {
        const providers = ['openai', 'anthropic', 'google'];
        const matchedProvider = providers.find(p => 
          userMessage.content.toLowerCase().includes(p.toLowerCase())
        );

        if (matchedProvider) {
          handleProviderSetup(matchedProvider);
          setIsTyping(false);
          return;
        }
      }

      // API call and response handling
      // Get API key from store or environment
      const { apiKey, systemPrompt } = useCopilot.getState();
      // Use the provided API key
      const effectiveApiKey = apiKey || 'AIzaSyCJ6kLKlCo6eW-sp88ktlOvntiq7ASzQ4M';
      
      // Generate response using Gemini
      const aiResponse = await generateGeminiResponse(
        userMessage.content,
        effectiveApiKey,
        systemPrompt
      );

      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      onNewMessage();

    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      const fallbackMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: "I'm here to help! You can ask me about:\n- Creating campaigns\n- Analyzing metrics\n- Optimizing workflows\n- Managing contacts\n- And more!",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      onNewMessage();
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isSetupMode, setMessages, onNewMessage, handleProviderSetup]);

  const handleQuickQuestion = useCallback((question: string) => {
    setInputValue(question);
    handleSubmit();
  }, [handleSubmit]);

  return {
    inputValue,
    setInputValue,
    isTyping,
    handleSubmit,
    handleQuickQuestion
  };
}