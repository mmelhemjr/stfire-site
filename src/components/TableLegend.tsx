import React from 'react';
import { useTheme } from '../lib/theme';
import { Lock, Users, Split } from 'lucide-react';

interface LegendItem {
  color: string;
  label: string;
  icon?: React.ComponentType<any>;
}

interface TableLegendProps {
  className?: string;
}

export default function TableLegend({ className }: TableLegendProps) {
  const { theme } = useTheme();

  const textOpacity = theme === 'dark' ? '400' : '600';

  const statusItems: LegendItem[] = [
    { 
      color: `border-green-500 text-green-${textOpacity} ring-1 ring-green-500/30`,
      label: 'Available'
    },
    { 
      color: `border-red-500 text-red-${textOpacity} ring-1 ring-red-500/30`,
      label: 'Fully Occupied',
      icon: Lock
    },
    { 
      color: `border-amber-500 text-amber-${textOpacity} ring-1 ring-amber-500/30`,
      label: 'Partially Occupied',
      icon: Users
    },
    { 
      color: `border-purple-500 text-purple-${textOpacity} ring-1 ring-purple-500/30`,
      label: 'Split Reservation',
      icon: Split
    }
  ];

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'} rounded-lg p-4 ${className || ''}`}>
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-400">Table Status</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {statusItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${item.color}`} />
                <div className="flex items-center space-x-1">
                  {item.icon && <item.icon className="w-3 h-3 text-gray-400" />}
                  <span className="text-sm">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}