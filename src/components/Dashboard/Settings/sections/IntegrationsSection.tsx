import React from 'react';
import { Plus, AlertTriangle, Check, Network } from 'lucide-react';

interface AlertTriangleProps {
  className?: string;
}

export function IntegrationsSection() {
  const [error, setError] = React.useState<string | null>(null);


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B38B3F]/20 to-[#FFD700]/10 flex items-center justify-center border border-[#B38B3F]/30">
            <Network className="w-6 h-6 text-[#FFD700]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Integrations</h2>
            <p className="text-white/60">Connect and manage your external services</p>
          </div>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-400" />
        <div>
          <h4 className="text-amber-400 font-medium">Phone System Removed</h4>
          <p className="text-amber-400/80 text-sm mt-1">
            The phone system functionality has been removed from this application.
          </p>
        </div>
      </div>
    </div>
  );
}