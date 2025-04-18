import React from 'react';
import { X, Users, AlignLeft, Paperclip, Mail } from 'lucide-react';
import { useDB } from '../../hooks/useDB';
import { sendTeamInvite } from '../../utils/email';

interface EventFormModalProps {
  title: string;
  description: string;
  attendees: string;
  onClose: () => void;
  onSubmit: () => void;
}
export function EventFormModal({ title, description, attendees, onClose, onSubmit }: EventFormModalProps) {
  const { getTeamMembers } = useDB();
  const [teamMembers, setTeamMembers] = React.useState<Array<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>>([]);
  const [guests, setGuests] = React.useState<string[]>([]);
  const [guestInput, setGuestInput] = React.useState('');
  const [isInviting, setIsInviting] = React.useState(false);

  // Load team members
  React.useEffect(() => {
    const loadTeamMembers = async () => {
      const members = await getTeamMembers();
      setTeamMembers(members);
    };
    loadTeamMembers();
  }, [getTeamMembers]);

  const handleGuestInvite = async (email: string) => {
    if (!email.trim() || isInviting) return;
    
    setIsInviting(true);
    try {
      await sendTeamInvite(
        email,
        email.split('@')[0], // Temporary name until they register
        'member',
        ['calendar'] // Basic calendar access
      );
      
      if (!guests.includes(email)) {
        setGuests([...guests, email]);
      }
      setGuestInput('');
    } catch (error) {
      console.error('Failed to send invite:', error);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900/70 backdrop-blur-xl border border-[#B38B3F]/30 rounded-xl shadow-2xl w-full max-w-md overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#B38B3F]/20">
          <h3 className="text-xl font-bold text-white">Create Task</h3>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="p-6 space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Title</label>
            <div className="relative">
              <input
                type="text"
                value={title}
                className="w-full px-4 py-2 bg-zinc-800 border border-[#B38B3F]/20 rounded-lg text-white"
                placeholder="Task title"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Team Members</label>
            <div className="space-y-4">
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !guests.includes(e.target.value)) {
                      setGuests([...guests, e.target.value]);
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-2 bg-zinc-800 border rounded-lg text-white ${
                    eventForm.type === 'event' ? 'border-[#FFD700]/20' :
                    eventForm.type === 'out-of-office' ? 'border-[#FF6B6B]/20' :
                    eventForm.type === 'working-location' ? 'border-[#4CAF50]/20' :
                    'border-[#2196F3]/20'
                  }`}
                >
                  <option value="">Select team member...</option>
                  {teamMembers.map((member: any) => (
                    <option 
                      key={member.id} 
                      value={member.email}
                      disabled={guests.includes(member.email)}
                    >
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Additional Guests</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    value={guestInput}
                    onChange={(e) => setGuestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleGuestInvite(guestInput);
                      }
                    }}
                    placeholder="Add guest email"
                    className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-[#B38B3F]/20 rounded-lg text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleGuestInvite(guestInput)}
                    disabled={!guestInput.trim() || isInviting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm bg-[#B38B3F]/10 hover:bg-[#B38B3F]/20 text-[#B38B3F] rounded transition-colors disabled:opacity-50"
                  >
                    {isInviting ? 'Inviting...' : 'Invite'}
                  </button>
                </div>
              </div>
              
              {guests.length > 0 && (
                <div className="space-y-2">
                  {guests.map((guest, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg border border-[#B38B3F]/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#B38B3F]/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-[#B38B3F]" />
                        </div>
                        <span className="text-white">{guest}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setGuests(guests.filter((_, i) => i !== index))}
                        className="text-white/50 hover:text-white/70"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Description</label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3 w-5 h-5 text-white/40" />
              <textarea
                value={description}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-[#B38B3F]/20 rounded-lg text-white min-h-[100px]"
                placeholder="Add task description..."
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="flex-1 px-6 py-2 bg-gradient-to-r from-[#B38B3F] to-[#FFD700] text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}