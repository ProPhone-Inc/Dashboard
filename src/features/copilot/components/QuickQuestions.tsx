import React from 'react';

interface QuickQuestionsProps {
  onQuestionSelect: (question: string) => void;
}

export function QuickQuestions({ onQuestionSelect }: QuickQuestionsProps) {
  return (
    <div className="px-4 pb-4">
      <p className="text-white/70 text-sm mb-3">Try asking about:</p>
      <div className="space-y-2">
        <button
          onClick={() => onQuestionSelect("How do I create a new campaign?")}
          className="w-full px-3 py-2 text-left text-sm text-white/70 hover:text-[#FFD700] hover:bg-[#B38B3F]/10 rounded-lg transition-colors group"
        >💡 Creating a marketing campaign</button>
        <button
          onClick={() => onQuestionSelect("How can I automate my workflow with ProFlow?")}
          className="w-full px-3 py-2 text-left text-sm text-white/70 hover:text-[#FFD700] hover:bg-[#B38B3F]/10 rounded-lg transition-colors group"
        >⚡ Automating my workflow with ProFlow</button>
        <button
          onClick={() => onQuestionSelect("Generate a marketing email template for a new product launch")}
          className="w-full px-3 py-2 text-left text-sm text-white/70 hover:text-[#FFD700] hover:bg-[#B38B3F]/10 rounded-lg transition-colors group"
        >✉️ Creating email marketing templates</button>
      </div>
    </div>
  );
}