import React from 'react';
import { useTheme } from '../lib/theme';
import { LayoutDashboard, BarChart3, CalendarRange, Users, ShieldCheck } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

interface ManagerTabsProps {
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function ManagerTabs({ activeTab, onChange }: ManagerTabsProps) {
  const { theme } = useTheme();

  const tabs: Tab[] = [
    { id: 'tables', label: 'Table Management', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: CalendarRange },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'crm', label: 'Guests', icon: Users },
    { id: 'team', label: 'Team', icon: ShieldCheck },
  ];

  return (
    <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-x-auto`}>
      <div className="flex min-w-max space-x-1 sm:space-x-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center gap-1.5 py-3 px-2 sm:px-1 relative whitespace-nowrap
                ${isActive 
                  ? 'text-sf-gold' 
                  : theme === 'dark' 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
                }
                transition-colors
              `}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <span className="font-medium text-sm sm:text-base">{tab.label}</span>
              {isActive && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-sf-gold rounded-full"
                  style={{ transform: 'translateY(2px)' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}