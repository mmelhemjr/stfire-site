import React from 'react';
import { useTheme } from '../lib/theme';
import { LayoutDashboard, BarChart3, CalendarRange } from 'lucide-react';

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
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex space-x-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center space-x-2 py-4 px-1 relative
                ${isActive 
                  ? 'text-sf-gold' 
                  : theme === 'dark' 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-500 hover:text-gray-700'
                }
                transition-colors
              `}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{tab.label}</span>
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