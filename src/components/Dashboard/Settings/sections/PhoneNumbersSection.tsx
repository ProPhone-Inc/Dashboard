import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function PhoneNumbersSection() {
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center space-x-3">
      <AlertTriangle className="w-5 h-5 text-amber-400" />
      <div>
        <h4 className="text-amber-400 font-medium">Phone System Removed</h4>
        <p className="text-amber-400/80 text-sm mt-1">
          The phone system functionality has been removed from this application.
        </p>
      </div>
    </div>
  );
}