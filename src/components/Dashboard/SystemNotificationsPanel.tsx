import React,{useEffect} from 'react';
import axios from 'axios';
import { Bell, X, AlertTriangle, Info, Shield, CreditCard } from 'lucide-react';
import { useSystemNotifications, type SystemNotification } from '../../hooks/useSystemNotifications';

interface SystemNotificationsPanelProps {
  onClose: () => void;
}

const NOTIFICATION_DISPLAY_TIME = 5000; // 5 seconds

export function SystemNotificationsPanel({ onClose }: SystemNotificationsPanelProps) {
  const {  markAsRead, markAllAsRead, removeNotification } = useSystemNotifications();
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);
  const [notifications, setnotifications] =  React.useState([]);

  // Track which notifications have been read
  const readNotifications = React.useRef<Set<string>>(new Set());
  // const notifications = [
  //   {
  //     _id: "67fc4813fd3a199ac78cc248",
  //     title: "sad",
  //     message: "sd",
  //     type: "announcement",
  //     priority: "medium",
  //     action: {
  //       total: 1,
  //       success: 1,
  //       failed: 0,
  //     },
  //     successfulEmails: [/* add emails here if needed */],
  //     failedEmails: [],
  //     sentBy: {
  //       // add details if needed
  //     },
  //     timestamp: "2025-04-13T23:26:11.066Z",
  //   },
  // ];
  useEffect(() => {

    const get_noti = async () => {
      const token = sessionStorage.getItem("token");
      if (!token) return;

  
      try {
        const res = await axios.get("/api/auth/get-notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        setnotifications(
          res.data.notifications
        );

      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert("Session Expired Please Login Again")
        } else {
          console.error("An unexpected error occurred:", error);
        }
      }
      
    };
  
    get_noti();
  }, []);
  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      // Mark all as read in the store
      await markAllAsRead();
      // Update local read state
      notifications.forEach(notification => {
        readNotifications.current.add(notification.id);
      });
      
      // Small delay to show the read state before closing
      setTimeout(() => {
        onClose();
      }, 300);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'billing':
        return <CreditCard className="w-5 h-5 text-[#FFD700]" />;
      case 'maintenance':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'security':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getPriorityStyles = (priority: SystemNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-amber-500/20 text-amber-400';
      default:
        return 'bg-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-zinc-900 border border-[#B38B3F]/30 rounded-xl shadow-2xl overflow-hidden z-50">
      <div className="p-4 border-b border-[#B38B3F]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#B38B3F]/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-[#FFD700]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">System Notifications</h3>
              <p className="text-sm text-white/60">Stay updated with important alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length > 0 ? (
          <>
            <div className="p-2 border-b border-[#B38B3F]/20">
              <button
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className={`w-full text-center text-[#FFD700] hover:text-[#FFD700]/80 text-sm py-1 transition-opacity ${
                  isMarkingAll ? 'opacity-50' : ''
                }`}
              >
                {isMarkingAll ? 'Marking all as read...' : 'Mark all as read'}
              </button>
            </div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-[#B38B3F]/10 hover:bg-white/5 transition-colors ${
                  !notification.read && !readNotifications.current.has(notification.id) ? 'bg-[#B38B3F]/5' : ''
                } cursor-pointer`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                    readNotifications.current.add(notification.id);
                  }
                  if (notification.action?.url) {
                    window.location.href = notification.action.url;
                    onClose();
                  } else {
                    // Remove notification after a short delay to show the read state
                    setTimeout(() => {
                      removeNotification(notification.id);
                    }, 300);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[#B38B3F]/20 flex items-center justify-center flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-white">{notification.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityStyles(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-2">{notification.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">
                        {new Date(notification.timestamp).toLocaleString()}
                      </span>
                      {notification.action && (
                        <button 
                          className="text-[#FFD700] hover:text-[#FFD700]/80 text-sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent parent click
                            if (!notification.read) {
                              markAsRead(notification.id);
                              readNotifications.current.add(notification.id);
                            }
                            if (notification.action?.url) {
                              window.location.href = notification.action.url;
                            }
                            onClose();
                          }}
                        >
                          {notification.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#B38B3F]/20 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-[#FFD700]" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">All Caught Up!</h4>
            <p className="text-white/60">No new system notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}