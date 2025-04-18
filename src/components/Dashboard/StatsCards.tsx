import React from 'react';
import { TotalSMSSentCard } from './TotalSMSSentCard';
import { UnreadMessagesCard } from './UnreadMessagesCard';
import { MarketingCard } from './MarketingCard';

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TotalSMSSentCard />
      <UnreadMessagesCard />
      <MarketingCard />
    </div>
  );
}