import React from 'react';
import { Clock, CheckCircle, ArrowRight, PenSquare } from 'lucide-react';

export function TopContacts() {
  const [showEdit, setShowEdit] = React.useState(false);
  const hoverTimer = React.useRef<number | null>(null);

  const handleMouseEnter = () => {
    hoverTimer.current = window.setTimeout(() => {
      setShowEdit(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setShowEdit(false);
  };

  const events = [
    {
      id: 1,
      title: 'Team Meeting',
      type: 'meeting',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Client Call',
      type: 'call',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Review Campaign Results',
      type: 'task',
      status: 'pending'
    },
    {
      id: 4,
      title: 'Send Follow-up Emails',
      type: 'task',
      status: 'completed'
    },
    {
      id: 5,
      title: 'Strategy Planning',
      type: 'meeting',
      status: 'upcoming'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'text-[#FFD700]';
      case 'completed':
        return 'text-emerald-400';
      default:
        return 'text-white/70';
    }
  };

  return (
    <div 
      className="bg-gradient-to-br from-zinc-900 to-black border border-[#B38B3F]/20 rounded-xl overflow-hidden transition-all duration-300 hover:border-[#B38B3F]/40 hover:shadow-lg hover:shadow-[#B38B3F]/5 card-gold-glow"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-[#FFD700]" />
            <h2 className="text-xl font-bold text-white ml-2">Today's Tasks</h2>
            {showEdit && (
              <button className="p-1 hover:bg-white/10 rounded-lg transition-colors group ml-2 opacity-0 animate-fade-in">
                <PenSquare className="w-4 h-4 text-white/40 group-hover:text-[#FFD700] transition-colors" />
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-[#FFD700] whitespace-nowrap">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded-lg border transition-colors ${
                event.status === 'completed'
                  ? 'bg-zinc-800/30 border-zinc-700/30'
                  : 'bg-zinc-800/50 border-[#B38B3F]/20 hover:border-[#B38B3F]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2 group">
                <h4 className={`font-medium ${
                  event.status === 'completed' ? 'text-white/50 line-through' : 'text-white'
                }`}>{event.title}</h4>
                <div className="flex items-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                      <PenSquare className="w-3 h-3 text-white/40 hover:text-[#FFD700] transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center text-sm">
                {event.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 mr-1.5" />
                ) : (
                  <Clock className="w-4 h-4 text-[#FFD700] mr-1.5" />
                )}
                <span className={event.status === 'completed' ? 'text-white/40' : 'text-white/60'}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t border-[#B38B3F]/20 p-4">
        <button className="w-full py-2 text-center text-[#B38B3F] hover:text-[#FFD700] font-medium transition-colors flex items-center justify-center">
          View All Tasks
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}