import type { ActiveTab } from '../types';

interface TabBarProps {
  activeTab: ActiveTab;
  isAdmin: boolean;
  onTabChange: (tab: ActiveTab) => void;
}

export function TabBar({ activeTab, isAdmin, onTabChange }: TabBarProps) {
  return (
    <div className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900">
      <div className="flex">
        <button
          onClick={() => onTabChange('buyer')}
          className={`flex-1 py-4 text-center font-medium ${activeTab === 'buyer' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
        >
          Showroom
        </button>
        {isAdmin && (
          <button
            onClick={() => onTabChange('admin')}
            className={`flex-1 py-4 text-center font-medium ${activeTab === 'admin' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
          >
            Admin
          </button>
        )}
      </div>
    </div>
  );
}
