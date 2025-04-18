import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Sparkles,
  GitMerge,
  UserCog,
  Settings, 
  Shield,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const defaultItems = [
  {
    id: 'dashboard',
    text: 'Dashboard',
    icon: <Home size={20} />
  },
  {
    id: 'proflow',
    text: 'ProFlow',
    icon: <GitMerge size={20} />
  }
];

// All users can access team panel
const canAccessTeamPanel = (user: any) => true;

// All users can access admin panel
const canAccessAdminPanel = (user: any) => true;

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activePage: string;
  onPageChange: (page: string) => void;
  token?: string;
  setCopilotExpanded?: (expanded: boolean) => void;
  setShowAdminModal?: (show: boolean) => void;
  setShowTeamPanel?: (show: boolean) => void;
  showProFlow: boolean;
  setShowProFlow: (show: boolean) => void;
}

interface SidebarState {
  showSubmenu: boolean;
  isExpanded: boolean;
  activeSubmenu: string | null;
  showSubItems: boolean;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  id: string;
  highlight?: boolean;
  active?: boolean;
  collapsed: boolean;
  onClick?: (subItemId?: string) => void;
  isAdmin?: boolean;
}

function SidebarItem({ 
  icon, 
  text, 
  id, 
  active = false, 
  highlight = false,
  collapsed, 
  onClick, 
  isAdmin = false,
}: SidebarItemProps) {
  const itemRef = React.useRef<HTMLLIElement>(null);

  return (
    <li 
      ref={itemRef}
      className="relative"
    >
      <a 
        href="#" 
        onClick={(e) => {
          e.preventDefault();
          if (onClick) {
            onClick();
          }
        }}
        className={`
          flex items-center py-3 rounded-xl transition-all duration-200
          ${collapsed ? 'justify-center mx-auto w-10 h-10' : 'px-4 justify-start'} 
          ${active 
            ? 'bg-gradient-to-r from-[#B38B3F]/30 to-[#FFD700]/10 text-[#FFD700] border border-[#B38B3F]/40'
            : highlight
              ? 'bg-gradient-to-r from-[#B38B3F]/20 to-[#FFD700]/5 text-[#FFD700] border border-[#B38B3F]/30'
              : 'hover:bg-white/5 text-white/70 hover:text-white'}
          ${isAdmin ? 'relative' : ''}
          relative
        `}
      >
        <div className={`flex items-center justify-center ${collapsed ? 'w-5 h-5' : 'w-5 h-5'}`}>
          {icon}
        </div>
        {!collapsed && (
          <span className="ml-3 whitespace-nowrap transition-opacity duration-300">
            {text}
          </span>
        )}
        {highlight && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#B38B3F]/0 via-[#FFD700]/10 to-[#B38B3F]/0 animate-pulse rounded-xl" />
        )}
        {highlight && active && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#B38B3F]/0 via-[#FFD700]/10 to-[#B38B3F]/0 animate-pulse rounded-xl" />
        )}
      </a>
    </li>
  );
}

export function Sidebar({ 
  collapsed: propCollapsed, 
  setCollapsed, 
  activePage, 
  onPageChange,
  token,
  setCopilotExpanded,
  setShowAdminModal,
  setShowTeamPanel,
  showProFlow = false,
  setShowProFlow = () => {}
}: SidebarProps) {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(propCollapsed);
  const [sidebarState, setSidebarState] = React.useState<SidebarState>({
    showSubmenu: false,
    isExpanded: false,
    activeSubmenu: null,
    showSubItems: false
  });
  
  const memoizedSidebarItems = React.useMemo(() => {
    return defaultItems;
  }, [activePage]);

  // Sync with parent state
  useEffect(() => {
    setInternalCollapsed(propCollapsed);
  }, [propCollapsed]);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleSidebarClick = React.useCallback((page: string) => {
    // Handle ProFlow navigation
    if (page === 'proflow') {
      setShowProFlow(true);
      return;
    }
    
    if (page === 'dashboard') {
      // Reset ProFlow state and navigate to dashboard
      setShowProFlow(false);
      onPageChange('dashboard');
      setShowProFlow(false);
      onPageChange('dashboard');
    } else {
      // Handle other navigation
      setShowProFlow(false);
      onPageChange(page);
    }
  }, [token, onPageChange, setShowProFlow]);

  const effectiveCollapsed = internalCollapsed && !isHovered;

  const memoizedSidebarItem = React.useCallback((item: any) => (
    <SidebarItem
      key={item.id}
      icon={React.cloneElement(item.icon as React.ReactElement, { 
        size: effectiveCollapsed ? 18 : 20 
      })}
      text={item.text}
      id={item.id}
      active={activePage === item.id}
      collapsed={effectiveCollapsed}
      onClick={() => handleSidebarClick(item.id)}
    />
  ), [effectiveCollapsed, activePage, handleSidebarClick]);

  return (
    <div 
      className={`fixed top-0 left-0 h-screen z-[20] bg-gradient-to-b from-zinc-900 to-black border-r border-[#B38B3F]/20 flex flex-col transition-all duration-300 ease-in-out shadow-xl shadow-black/20 ${effectiveCollapsed ? 'w-16' : 'w-64'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-16 flex items-center p-4 border-b border-[#B38B3F]/20">
        <div className={`transition-all duration-300 ${effectiveCollapsed ? 'opacity-0 scale-0 w-0' : 'opacity-100 scale-100'}`}>
          <div className="text-2xl font-bold bg-gradient-to-r from-[#B38B3F] via-[#FFD700] to-[#B38B3F] text-transparent bg-clip-text">
            ProPhone
          </div>
        </div>
        <div className={`transition-all duration-300 ${!effectiveCollapsed ? 'opacity-0 scale-0 absolute' : 'opacity-100 scale-100 mx-auto'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B38B3F] to-[#FFD700] flex items-center justify-center">
            <span className="text-black font-bold text-sm">P</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 py-4 px-3 overflow-y-auto scrollbar-hide">
        <nav>
          <ul className="space-y-2">
            {memoizedSidebarItems.map((item) => (
              <SidebarItem
                key={item.id}
                icon={React.cloneElement(item.icon as React.ReactElement, { 
                  size: effectiveCollapsed ? 18 : 20 
                })}
                text={item.text}
                id={item.id}
                active={item.id === 'proflow' ? showProFlow : (!showProFlow && activePage === item.id)}
                collapsed={effectiveCollapsed}
                onClick={() => handleSidebarClick(item.id)}
              />
            ))}
          </ul>
          
          <div className="mt-6 pt-6 border-t border-[#B38B3F]/20">
            <ul className="space-y-2">
              {/* Copilot */}
              <SidebarItem
                icon={<Sparkles size={effectiveCollapsed ? 18 : 20} className="text-[#FFD700]" />}
                text="Copilot"
                id="copilot"
                collapsed={effectiveCollapsed}
                onClick={() => handleSidebarClick('copilot')}
              />
              {/* Team Panel */}
              { user?.role !== 'sub_user' && (
  <SidebarItem 
    icon={<UserCog size={effectiveCollapsed ? 18 : 20} className="text-[#FFD700]" />} 
    text="Team Panel" 
    id="team"
    active={activePage === 'team'} 
    collapsed={effectiveCollapsed}
    onClick={() => handleSidebarClick('team')}
  />
)}

              
              {/* Admin section */}
              {canAccessAdminPanel(user) && (
                <>
                  {(user?.role === 'owner' || user?.role === 'super_admin') && (
                    <SidebarItem 
                      icon={<Shield size={effectiveCollapsed ? 18 : 20} className="text-[#FFD700]" />} 
                      text="Super Admin Panel" 
                      id="admin"
                      active={activePage === 'admin'} 
                      collapsed={effectiveCollapsed} 
                      onClick={() => handleSidebarClick('admin')}
                      isAdmin
                    />
                  )}
                </>
              )}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}