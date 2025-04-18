import React from 'react';
import axios from 'axios';
import { X, User, Mail, Key, Lock, Phone, Users, FileText, GitMerge } from 'lucide-react';

interface EditTeamMemberModalProps {
  member: any;
  onClose: () => void;
  modalRef: React.RefObject<HTMLDivElement>;
  onSave: (member: any) => void;
}

export function EditTeamMemberModal({ member, onClose, modalRef, onSave }: EditTeamMemberModalProps) {
  const [formData, setFormData] = React.useState({
    ...member,
    permissions: ['phone', 'crm', 'docupro', 'proflow']
  });
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  
  // Prevent editing owner/super_admin role
  React.useEffect(() => {
    if (member.role === 'owner' || member.role === 'super_admin') {
      onClose();
    }
  }, [member, onClose]);

  const availablePermissions = [
    { id: 'phone', label: 'Phone System', icon: <Phone className="w-4 h-4" /> },
    { id: 'crm', label: 'CRM', icon: <Users className="w-4 h-4" /> },
    { id: 'docupro', label: 'DocuPro', icon: <FileText className="w-4 h-4" /> },
    { id: 'proflow', label: 'ProFlow', icon: <GitMerge className="w-4 h-4" /> }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password if provided
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }
    }
    
    const token = sessionStorage.getItem("token");
    if (!token) return;
    const res = await axios.post("/api/auth/edit-team-member",{formData,oldemail:member.email}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.data ==1){
      onSave(formData);
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" onClick={onClose} />
      <div 
        ref={modalRef}
        className="relative bg-black/60 border border-[#B38B3F]/30 rounded-xl p-6 shadow-2xl transform animate-fade-in max-w-md w-full mx-auto backdrop-blur-md"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B38B3F]/20 to-[#FFD700]/10 flex items-center justify-center border border-[#B38B3F]/30 relative">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Edit Team Member</h3>
            <p className="text-white/60 text-sm">Update member details and permissions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Change Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-[#B38B3F]/20 rounded-lg text-white"
                placeholder="New password (leave empty to keep current)"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-[#B38B3F]/20 rounded-lg text-white"
                placeholder="Confirm new password"
              />
            </div>
            {passwordError && (
              <p className="text-red-400 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Status: {formData.status}</label>
            <p className="text-xs text-white/50">
              Status will automatically change to active when the user first logs in, starting their 30-day activity period
            </p>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Permissions</label>
            <div className="space-y-2">
              <div className="p-4 bg-[#B38B3F]/10 border border-[#B38B3F]/20 rounded-lg">
                <p className="text-[#FFD700] font-medium">All Permissions</p>
                <p className="text-white/60 text-sm mt-1">Team members have access to all platform features</p>
              </div>
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
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#B38B3F] to-[#FFD700] text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}