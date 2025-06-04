
import React from 'react';
import { Grid2X2, List } from 'lucide-react';

interface ViewSwitcherProps {
  viewMode: 'card' | 'list';
  onViewChange: (mode: 'card' | 'list') => void;
}

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ viewMode, onViewChange }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewChange('card')}
        className={`flex items-center justify-center w-8 h-8 rounded transition-all duration-200 ${
          viewMode === 'card'
            ? 'bg-white shadow-sm text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Grid2X2 size={16} />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center justify-center w-8 h-8 rounded transition-all duration-200 ${
          viewMode === 'list'
            ? 'bg-white shadow-sm text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <List size={16} />
      </button>
    </div>
  );
};
