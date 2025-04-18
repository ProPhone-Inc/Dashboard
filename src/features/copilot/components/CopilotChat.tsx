import React from 'react';
import { Send, X, Maximize2 } from 'lucide-react';
import { Message } from '../types';
import { useCopilotChat } from '../hooks/useCopilotChat';
import { QuickQuestions } from './QuickQuestions';
import { MessageList } from './MessageList';
import { MessageList } from './MessageList';

const GEMINI_LOGO = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M12 2L2 7L12 12L22 7L12 2Z' fill='%23B38B3F'/%3E%3Cpath d='M2 17L12 22L22 17' stroke='%23FFD700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M2 12L12 17L22 12' stroke='%23FFD700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E`;

interface CopilotChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isSetupMode: boolean;
  onExpand: () => void;
  onClose: () => void;
  onNewMessage: () => void;
}

export function CopilotChat({
  messages,
  setMessages,
  isSetupMode,
  onExpand,
  onClose,
  onNewMessage
}: CopilotChatProps) {
  const {
    inputValue,
    setInputValue,
    isTyping,
    handleSubmit,
    handleQuickQuestion
  } = useCopilotChat({
    messages,
    setMessages,
    isSetupMode,
    onNewMessage
  });

  return (
    <div className="absolute bottom-[calc(100%+1rem)] right-0 w-96 z-[201]">
      <div className="bg-gradient-to-br from-black to-zinc-900/95 border border-[#B38B3F]/30 rounded-2xl shadow-2xl transform-gpu animate-fade-up shadow-[#B38B3F]/20">
        <div className="flex items-center justify-between p-4 border-b border-[#B38B3F]/20">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold bg-gradient-to-r from-[#B38B3F] via-[#FFD700] to-[#B38B3F] text-transparent bg-clip-text">
                ProPhone Copilot
              </h3>
              <div className="flex items-center bg-white/10 rounded-full px-2 py-0.5">
                <img src={GEMINI_LOGO} alt="Gemini" className="w-3.5 h-3.5 mr-1" />
                <span className="text-xs text-white/70">Gemini 2.0 Flash</span>
              </div>
            </div>
            <p className="text-white/70 text-sm">Your AI assistant</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onExpand}
              className="text-white/50 hover:text-[#FFD700] transition-colors p-1.5 hover:bg-white/5 rounded-lg"
              title="Expand chat"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#B38B3F] text-black font-medium shadow-lg shadow-[#FFD700]/10'
                    : 'bg-gradient-to-br from-zinc-800/95 to-zinc-900/95 border border-[#B38B3F]/10 text-white shadow-lg shadow-[#B38B3F]/5'
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {message.content}
                </pre>
                <div className={`text-xs mt-1 ${
                  message.type === 'user' 
                    ? 'text-black/60' 
                    : 'text-white/50'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-zinc-800/95 to-zinc-900/95 border border-[#B38B3F]/10 rounded-2xl px-4 py-2 shadow-lg shadow-[#B38B3F]/5">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {messages.length === 0 && (
          <QuickQuestions onQuestionSelect={handleQuickQuestion} />
        )}

        <div className="p-4 border-t border-[#B38B3F]/20">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 text-white px-3 py-2 rounded-lg border border-[#B38B3F]/20 focus:outline-none focus:ring-2 focus:ring-[#B38B3F]/40 focus:border-[#B38B3F]/40 placeholder-white/40 transition-all"
            />
            <button
              type="text"
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-[#B38B3F] via-[#FFD700] to-[#B38B3F] text-black px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:shadow-[#B38B3F]/20 bg-[length:200%_100%] hover:bg-[100%_0] bg-[0%_0]"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="flex justify-center mt-2">
            <div className="flex items-center text-xs text-white/40">
              <img src={GEMINI_LOGO} alt="Gemini" className="w-3 h-3 mr-1" />
              <span>Powered by Google Gemini 2.0 Flash</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}