import React from 'react';
import { TotalSMSSentCard } from './TotalSMSSentCard';
import { UnreadMessagesCard } from './UnreadMessagesCard';
import { MarketingCard } from './MarketingCard';
import { AlertTriangle } from 'lucide-react';

export function StatsCards() {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 blur-md opacity-60">
        <TotalSMSSentCard />
        <UnreadMessagesCard />
        <MarketingCard />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/70 px-8 py-6 rounded-xl border border-[#B38B3F]/30 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-center mb-3">
            <AlertTriangle className="w-8 h-8 text-[#FFD700] mr-3" />
            <h2 className="text-2xl font-bold text-white">Under Development</h2>
          </div>
          <p className="text-white/70 text-center">This section is currently being developed and will be available soon.</p>
        </div>
      </div>
    </div>
  );
}