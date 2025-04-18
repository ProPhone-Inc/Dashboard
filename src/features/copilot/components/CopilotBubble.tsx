import React from 'react';
import { Sparkles, Send, X, Maximize2 } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useCopilot } from '../hooks/useCopilot';
import { CopilotChat } from './CopilotChat';
import { CopilotPage } from './CopilotPage';
import { useAudio } from '../hooks/useAudio';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { Message } from '../types';

const GEMINI_LOGO = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M12 2L2 7L12 12L22 7L12 2Z' fill='%23B38B3F'/%3E%3Cpath d='M2 17L12 22L22 17' stroke='%23FFD700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 12L12 17L22 12' stroke='%23FFD700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E`;

export function CopilotBubble() {
  const { apiKey, provider } = useCopilot();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const { playNotification } = useAudio();
  const { unreadCount, hasUnreadMessage, markAsRead } = useUnreadMessages(messages);
  const [isCallActive, setIsCallActive] = React.useState(false);

  // Listen for call state changes
  React.useEffect(() => {
    const handleCallStateChange = (e: CustomEvent) => {
      setIsCallActive(e.detail.active);
    };
    
    window.addEventListener('phoneCallStateChange', handleCallStateChange as EventListener);
    return () => {
      window.removeEventListener('phoneCallStateChange', handleCallStateChange as EventListener);
    };
  }, []);

  // Show welcome message when component mounts
  React.useEffect(() => {
    // Always consider setup complete with the provided API key
    const needsSetup = false;
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [provider, apiKey]);

  const getWelcomeMessage = () => {
    return "Hi there! 👋 I'm Dawson, your ProPhone CoPilot powered by Google Gemini 2.0 Flash. I'm ready to help with automation workflows, templates, designs, and more. How can I assist you today?";
  };

  return (
    <div className={`fixed bottom-6 transition-all duration-300 ${
      isCallActive ? 'right-[380px]' : 'right-6'
    } z-[200]`}>
      {isOpen && (
        <>
          {isExpanded ? (
            <div className="fixed inset-0 z-[300]">
              <CopilotPage
                isOpen={isExpanded}
                onClose={() => {
                  setIsExpanded(false);
                  setIsOpen(true);
                }}
                initialMessages={messages}
                isSetupMode={!provider || !apiKey}
                onNewMessage={(message) => {
                  setMessages(prev => [...prev, message]);
                  playNotification();
                }}
              />
            </div>
          ) : (
            <CopilotChat
              messages={messages}
              setMessages={setMessages}
              isSetupMode={!provider || !apiKey}
              onExpand={() => {
                setIsExpanded(true);
                setIsOpen(true);
              }}
              onClose={() => setIsOpen(false)}
              onNewMessage={() => playNotification()}
            />
          )}
        </>
      )}

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            markAsRead();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-14 h-14 rounded-full bg-gradient-to-r from-[#B38B3F] via-[#FFD700] to-[#B38B3F] text-black flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 bg-[length:200%_100%] hover:bg-[100%_0] bg-[0%_0] ${
          hasUnreadMessage ? 'animate-pulse' : ''
        }`}
      >
        <div className="relative">
          <Sparkles className={`w-6 h-6 z-10 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-white flex items-center justify-center">
            <img src={GEMINI_LOGO} alt="Gemini" className="w-2.5 h-2.5" />
          </div>
        </div>
        
        {/* Soundwave rings */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#B38B3F]/20 to-[#FFD700]/20 animate-[soundwave_2s_ease-out_infinite]" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#B38B3F]/20 to-[#FFD700]/20 animate-[soundwave_2s_ease-out_infinite_0.75s]" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#B38B3F]/20 to-[#FFD700]/20 animate-[soundwave_2s_ease-out_infinite_1.5s]" />
        
        {hasUnreadMessage && (
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-r from-[#B38B3F] to-[#FFD700] border-2 border-black text-xs font-bold flex items-center justify-center animate-bounce shadow-lg shadow-[#FFD700]/20">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}