import React, { useState,useEffect } from 'react';
import axios from 'axios';
import { Menu, X, User, LogOut, Calendar, MessageSquare, Shield, HelpCircle, Settings, CreditCard, Ban, ArrowLeft } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { CalendarModal } from './Calendar';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { useDB } from '../../hooks/useDB';
import { SettingsModal } from '../SettingsModal';
import { AppDrawer } from './AppDrawer';
import { useSMSUsage } from '../../hooks/useSMSUsage';
import { RemoveAdsModal } from './RemoveAdsModal';
import { MessageSquareText } from 'lucide-react';
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  chatId: string;
  type: 'email' | 'sms' | 'call';
  title: string;
  content: string;
  time: string;
  read: boolean;
  sender: {
    name: string;
    avatar?: string;
  };
}

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    avatar?: string;
    originalUser?: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar?: string;
    };
  } | null;
  onLogout: () => void;
  collapsed: boolean;
  activePage: string;
  messages: Message[];
  onPageChange?: (page: string, messageId?: string) => void;
}

function Header({ user, onLogout, collapsed, activePage, messages, onPageChange }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAppDrawer, setShowAppDrawer] = useState(false);
  const [showRemoveAdsModal, setShowRemoveAdsModal] = useState(false);
  const { sendNotification } = useNotifications();
  const { used: smsUsed, limit: smsLimit } = useSMSUsage();
  const { login } = useAuth();
  const menuRef = React.useRef<HTMLDivElement>(null);
  const readMessageIds = React.useRef<Set<string>>(new Set());
  const messagesRef = React.useRef<HTMLDivElement>(null);
  const appDrawerRef = React.useRef<HTMLDivElement>(null);
  const totalUnreadCount = messages.filter(msg => !msg.read).length;
  const [unreadCount, setUnreadCount] = React.useState(0);
  // const navigate = useNavigate();

  useClickOutside(menuRef, () => {
    setShowUserMenu(false);
  });
  
  useClickOutside(messagesRef, () => {
    setShowMessagesDropdown(false);
  });

  useClickOutside(appDrawerRef, () => {
    setShowAppDrawer(false);
  });
  useEffect(() => {
    const checktokwn = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      if (!token) return;
  
      try {
        const res = await axios.get("/api/auth/check-authentication", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      
      
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert("Session Expired Please Login Again")
          onLogout();
        } else {
          console.error("An unexpected error occurred:", error);
        }
      }
      
    };
  
    checktokwn();
  }, []);
  // Calculate unread count from messages
  React.useEffect(() => {
    const count = messages.filter(msg => !msg.read).length;
    setUnreadCount(count);
  }, [messages]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-16 bg-zinc-900 flex items-center justify-between px-4 z-30 relative">
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#B38B3F]/20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#B38B3F]/0 via-[#FFD700]/50 to-[#B38B3F]/0 animate-[glow_4s_ease-in-out_infinite] shadow-[0_0_15px_rgba(255,215,0,0.3)]" />
      </div>
      <div className="flex items-center lg:hidden">
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      <div className="flex-1" />

      <div className="flex items-center space-x-2">

        <button 
          onClick={() => setShowRemoveAdsModal(true)}
          className="w-full bg-gradient-to-r from-[#B38B3F]/20 via-[#FFD700]/10 to-[#B38B3F]/20 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 hover:shadow-xl hover:shadow-[#B38B3F]/20 relative overflow-hidden group animate-pulse"
          title="Remove Ads"
        >
          {/* Button shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 pointer-events-none" />
          
          <Ban className="w-4 h-4 text-[#FFD700]" />
          <span className="text-[#FFD700]">Remove Ads - $10/month</span>
          
          {/* Button sparkles */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 animate-[sparkle-left_3s_infinite] pointer-events-none">
            <Ban className="w-4 h-4 text-[#FFD700]/40" />
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 animate-[sparkle-right_3s_infinite] pointer-events-none">
            <Ban className="w-4 h-4 text-[#FFD700]/40" />
          </div>
        </button>

        {activePage !== 'dashboard' && (
          <button 
            onClick={() => setShowAppDrawer(!showAppDrawer)}
            className="relative w-10 h-10 rounded-lg flex items-center justify-center text-[#FFD700] transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#B38B3F]/10 via-[#FFD700]/5 to-[#B38B3F]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 border border-[#B38B3F]/20 rounded-lg group-hover:border-[#FFD700]/40 transition-colors duration-300" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/0 via-[#FFD700]/10 to-[#FFD700]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <div className="relative z-10 grid grid-cols-2 gap-0.5 scale-90 group-hover:scale-100 transition-transform duration-300">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 rounded-sm bg-current opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ 
                    transitionDelay: `${i * 50}ms`,
                    transform: `rotate(${i * 90}deg)`
                  }}
                />
              ))}
            </div>
          </button>
        )}

        <div className="relative" ref={messagesRef}>
          <div 
            onClick={() => setShowMessagesDropdown(!showMessagesDropdown)}
            className="relative w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className={`absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-[#FFD700] text-black text-xs font-medium flex items-center justify-center px-1 ${unreadCount === 0 ? 'hidden' : ''}`}>
              {unreadCount}
            </span>
          </div>
          
          {showMessagesDropdown && (
            <div className="fixed right-4 mt-2 w-96 bg-zinc-900 border border-[#B38B3F]/30 rounded-xl shadow-2xl overflow-hidden z-[50]">
              <div className="p-4 border-b border-[#B38B3F]/20">
                <h3 className="text-lg font-bold text-white">Messages</h3>
                <p className="text-sm text-white/60">{totalUnreadCount} unread messages</p>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setShowMessagesDropdown(false);
                      // Navigate to phone system and pass the message ID
                      if (onPageChange && message.chatId) {
                        onPageChange('phone');
                        // Small delay to ensure phone system is mounted
                        setTimeout(() => {
                          const messageElement = document.getElementById(`message-${message.id}`);
                          if (messageElement) {
                            messageElement.scrollIntoView({ behavior: 'smooth' });
                            messageElement.classList.add('bg-[#FFD700]/10');
                            setTimeout(() => {
                              messageElement.classList.remove('bg-[#FFD700]/10');
                            }, 2000);
                          }
                        }, 100);
                      }
                    }}
                    className="w-full p-4 hover:bg-white/5 transition-colors border-b border-[#B38B3F]/10 text-left flex items-start space-x-3"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img 
                          src={message.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender.name)}&background=B38B3F&color=fff`}
                          alt={message.sender.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {!message.read && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FFD700] border-2 border-zinc-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white">{message.sender.name}</div>
                      <div className="text-xs text-white/40 mb-1">{message.time}</div>
                      {!message.read && (
                        <div className="w-2 h-2 bg-[#FFD700] rounded-full mb-1" />
                      )}
                      <div className="flex items-center space-x-2 mt-0.5">
                        {message.type === 'email' && <Mail className="w-3 h-3 text-[#FFD700]" />}
                        {message.type === 'sms' && <MessageSquare className="w-3 h-3 text-[#FFD700]" />}
                        <span className="text-sm font-medium text-white/90">{message.title}</span>
                      </div>
                      <p className="text-sm text-white/60 truncate mt-1">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 border-t border-[#B38B3F]/20">
                <div className="w-full py-2 text-center text-[#FFD700] hover:text-[#FFD700]/80 font-medium transition-colors cursor-pointer">
                  View All Messages
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={() => setShowCalendar(true)}
          className="relative w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
        >
          <Calendar className="w-5 h-5" />
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-black text-xs font-medium flex items-center justify-center px-1">
            3
          </span>
        </button>

        {showCalendar && (
          <CalendarModal 
            onClose={() => setShowCalendar(false)} 
            onAddEvent={() => setShowCalendar(false)}
          />
        )}

        {showSettings && (
          <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} initialSection="billing" />
        )}
        
        {/* Remove Ads Modal */}
        {showRemoveAdsModal && (
          <RemoveAdsModal
            onClose={() => setShowRemoveAdsModal(false)}
            onSubscribe={() => {
              // Handle subscription
              setShowRemoveAdsModal(false);
            }}
          />
        )}

        <div className="relative ml-2">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center hover:bg-white/10 rounded-lg w-10 h-10 justify-center transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B38B3F] to-[#FFD700] flex items-center justify-center text-black font-semibold text-sm">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                getInitials(user?.name || 'User')
              )}
            </div>
          </button>
          
          {showUserMenu && (
            <div ref={menuRef} className="fixed right-4 mt-2 w-56 bg-zinc-900 border border-[#B38B3F]/20 rounded-xl shadow-2xl overflow-hidden z-[999] backdrop-blur-sm">
              <div className="p-4 border-b border-[#B38B3F]/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#B38B3F] to-[#FFD700] flex items-center justify-center text-black font-semibold text-sm">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getInitials(user?.name || 'User')
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">{user?.name}</div>
                  </div>
                </div>
              </div>
              <div className="py-2">
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowSettings(true); 
                    // Set initial section to profile
                    localStorage.setItem('settingsSection', 'profile');
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm hover:bg-white/10 transition-colors text-left"
                >
                  <User className="w-4 h-4 mr-3 text-white/70" />
                  <span>Profile</span>
                </button>
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowSettings(true); 
                    // Set initial section to billing
                    localStorage.setItem('settingsSection', 'billing');
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm hover:bg-white/10 transition-colors text-left"
                >
                  <CreditCard className="w-4 h-4 mr-3 text-white/70" />
                  <span>Subscription & Billing</span>
                </button>
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    setShowSettings(true); 
                    // Set initial section to profile
                    localStorage.setItem('settingsSection', 'profile');
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm hover:bg-white/10 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 mr-3 text-white/70" />
                  <span>Settings</span>
                </button>
                <button 
                  onClick={() => {
                    setShowUserMenu(false);
                    window.open('https://docs.prophone.io', '_blank');
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm hover:bg-white/10 transition-colors text-left"
                >
                  <HelpCircle className="w-4 h-4 mr-3 text-white/70" />
                  <span>Help & Support</span>
                </button>
                {user?.originalUser && (
                  <button 
                    onClick={() => {
                      if (user.originalUser) {
                        setShowUserMenu(false);
                        // Store the original user in localStorage directly
                        localStorage.setItem('auth_user', JSON.stringify(user.originalUser));
                        
                        // Set auth token (in a real app this would come from the backend)
                        localStorage.setItem('auth_token', 'test-token-' + Math.random().toString(36).substr(2));
                        
                        // Force redirect to dashboard
                        window.location.href = '/dashboard';
                      }
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-3" />
                    <span className="whitespace-nowrap">
                      {user?.originalUser?.loginOrigin === 'team_panel' 
                        ? 'Return to Team Panel' 
                        : 'Return to Admin Panel'}
                    </span>
                  </button>
                )}
                <div className="border-t border-[#B38B3F]/20 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm hover:bg-white/10 transition-colors text-left text-red-500 hover:text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* App Drawer */}
      {showAppDrawer && (
        <AppDrawer
          ref={appDrawerRef}
          isOpen={showAppDrawer}
          onClose={() => setShowAppDrawer(false)}
          onAppSelect={(app) => {
            if (onPageChange) {
              onPageChange(app);
            }
            setShowAppDrawer(false);
          }}
          currentApp={activePage}
        />
      )}

      {/* Remove Ads Modal */}
      {showRemoveAdsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRemoveAdsModal(false)} />
          <div className="relative bg-zinc-900 border border-[#B38B3F]/30 rounded-xl shadow-2xl w-full max-w-md transform animate-fade-in">
            <div className="p-6">
              <button
                onClick={() => setShowRemoveAdsModal(false)}
                className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#B38B3F]/20 to-[#FFD700]/10 flex items-center justify-center border border-[#B38B3F]/30">
                  <Ban className="w-6 h-6 text-[#FFD700]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Remove Ads</h3>
                  <p className="text-white/60">Enjoy an ad-free experience</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#B38B3F]/10 border border-[#B38B3F]/20 rounded-lg p-4">
                  <h4 className="text-[#FFD700] font-medium mb-2">Benefits</h4>
                  <ul className="space-y-2 text-sm text-white/70">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#FFD700] rounded-full mr-2" />
                      Remove all advertisements across the platform
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#FFD700] rounded-full mr-2" />
                      Cleaner, distraction-free interface
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#FFD700] rounded-full mr-2" />
                      Support further development
                    </li>
                  </ul>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">$10<span className="text-lg text-white/60">/month</span></div>
                  <p className="text-white/60 text-sm">Cancel anytime</p>
                </div>

                <button
                  onClick={() => {
                    // Handle payment processing here
                    setShowRemoveAdsModal(false);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[#B38B3F] via-[#FFD700] to-[#B38B3F] text-black font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                >
                  <span>Upgrade Now</span>
                  <Ban className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;