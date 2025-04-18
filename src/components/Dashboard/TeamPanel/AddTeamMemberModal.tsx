import React from 'react';
import axios from 'axios';
import { X, User, Mail, Shield, FileText, GitMerge } from 'lucide-react';

interface AddTeamMemberModalProps {
  onClose: () => void;
  onAdd: (member: {
    name: string;
    email: string;
    role: string;
    status: string;
    permissions: string[];
  }) => void;
}

export function AddTeamMemberModal({ onClose, onAdd }: AddTeamMemberModalProps) {
  const [showPermissions, setShowPermissions] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showBillingConfirm, setShowBillingConfirm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    role: 'member',
    status: 'active',
    permissions: [] as string[]
  });

  const availablePermissions = [
    { id: 'docupro', label: 'DocuPro', icon: <FileText className="w-4 h-4" /> },
    { id: 'proflow', label: 'ProFlow', icon: <GitMerge className="w-4 h-4" /> }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const memberData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: formData.permissions,
      parentUser: formData.role === 'sub_user' ? currentUser?.id : null,
      status: 'pending',
      joinDate: new Date().toISOString().split('T')[0]
    };

    const res = await axios.post("/api/auth/add-team-member",{memberData}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if(res.data == 2){
      alert("User Already Exist")
    }
    // console.log(memberData)
    // if (formData.role === 'sub_user') {
    //   setShowBillingConfirm(true);
    //   return;c
    // }
    // await createUser();
  };

  const createUser = async () => {
    setIsSubmitting(true);
    
    const memberData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions: formData.permissions,
      parentUser: formData.role === 'sub_user' ? currentUser?.id : null,
      status: 'pending',
      joinDate: new Date().toISOString().split('T')[0]
    };

    onAdd(formData);
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl p-6 shadow-2xl transform animate-fade-in max-w-md w-full mx-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Add Team Member</h3>
            <p className="text-white/60 text-sm">Add a new member to your team</p>
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
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-white/40"
                placeholder="Enter member name"
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
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-white/40"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Role</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-white/40" />
              </div>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              >
                <option value="member">Team Member</option>
                <option value="manager">Team Manager</option>
                <option value="admin">Team Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Permissions</label>
            <div className="space-y-2">
              {availablePermissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center p-3 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-800/70 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                    className="w-4 h-4 rounded border-zinc-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-zinc-800"
                  />
                  <div className="ml-3 flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-3">
                      {permission.icon}
                    </div>
                    <span className="text-white">{permission.label}</span>
                  </div>
                </label>
              ))}
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
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
            >
              Add Member
            </button>
          </div>
        </form>

        {/* Billing Confirmation Modal */}
        {showBillingConfirm && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowBillingConfirm(false)} />
            <div className="relative bg-zinc-900 border border-[#B38B3F]/30 rounded-xl p-6 shadow-2xl transform animate-fade-in max-w-md w-full mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">Sub-User Billing</h3>
              <p className="text-white/70 mb-6">
                Adding a sub-user will cost $5/month. This will be added to your monthly billing.
                The subscription will start immediately and continue until the sub-user is removed.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBillingConfirm(false)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowBillingConfirm(false);
                    createUser();
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#B38B3F] to-[#FFD700] text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
                >
                  Confirm ($5/month)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}