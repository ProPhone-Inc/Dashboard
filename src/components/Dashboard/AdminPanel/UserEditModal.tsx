import React from 'react';
import axios from 'axios';
import { X, User, Mail, Shield } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom'; // For react-router-dom v6

interface UserEditModalProps {
  member: any;
  onClose: () => void;
  onSave: (member: any) => void;
}

export function UserEditModal({ member, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = React.useState({
    ...member
  });
  const [error, setError] = React.useState<string | null>(null);
  const { user: currentUser } = useAuth();

  const canAssignGodMode = currentUser?.role === 'owner';
  console.log('member',member)

  const isExecutiveOrSuperAdmin = currentUser?.role === 'executive' || currentUser?.role === 'super_admin';
  const isEditingOwner = member.role === 'owner';
  const isEditingSuperAdmin = member.role === 'super_admin';
  const isEditingExecutive = member.role === 'executive';

  // Prevent editing if:
  // 1. Editing owner account and not the owner
  // 2. Super admin trying to edit another super admin
  // 3. Non-owner trying to edit super admin
  if ((isEditingOwner && !canAssignGodMode) || (!canAssignGodMode && isEditingSuperAdmin)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-zinc-900 border border-red-500/30 rounded-xl p-6 shadow-2xl transform animate-fade-in max-w-md w-full mx-auto">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-xl font-bold text-white mb-4">Permission Denied</h3>
          
          <p className="text-white/70 mb-6">
            {isEditingOwner 
              ? "Only the platform owner can edit their own account."
              : "Only the platform owner can edit super admin and executive accounts."}
          </p>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate role changes
    if (formData.role === 'owner' || (!canAssignGodMode && (formData.role === 'super_admin' || formData.role === 'executive'))) {
      setError(formData.role === 'owner' 
        ? 'Cannot modify owner account' 
        : 'Only the platform owner can assign super admin or executive roles');
      return;
    }
    
    // Set plan based on role
    let plan = formData.plan;
    if (formData.role === 'owner' || formData.role === 'super_admin' || formData.role === 'executive') {
      plan = 'god_mode';
    }
    
    const updatedUser = {
      ...formData,
      showAds: !(formData.role === 'owner' || formData.role === 'super_admin'),
      plan: "free"
    };
    const token = sessionStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const res = await axios.post("/api/auth/edit-user", updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
  
      if (res.status === 200) {
        onSave(updatedUser); 
      } else {
        console.warn("Update failed:", res.statusText);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          console.error("Token expired or invalid. Redirecting to login...");
        } else if (error.response.status === 404) {
          console.error("User not found.");
        } else {
          console.error("An error occurred:", error.response.statusText);
        }
      } else {
        console.error("Network or server error:", error.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-[#B38B3F]/30 rounded-xl p-6 shadow-2xl transform animate-fade-in max-w-md w-full mx-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-6">Edit User</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-[#B38B3F]/20 rounded-lg text-white focus:outline-none focus:border-[#B38B3F]/50"
                placeholder="First Name"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/40" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-[#B38B3F]/20 rounded-lg text-white focus:outline-none focus:border-[#B38B3F]/50"
                placeholder="Email"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-white/40" />
              </div>
              <select
                name="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-[#B38B3F]/20 rounded-lg text-white focus:outline-none focus:border-[#B38B3F]/50"
              >
                <option value="user">User</option>
                {canAssignGodMode && (
                  <>
                    <option value="super_admin">Super Admin</option>
                    <option value="executive">Executive</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#B38B3F] hover:bg-[#B38B3F]/80 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}