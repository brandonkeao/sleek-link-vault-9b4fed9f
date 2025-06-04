
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface EmptyDataSourcesProps {
  onAddSource: () => void;
}

export const EmptyDataSources: React.FC<EmptyDataSourcesProps> = ({ onAddSource }) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🔌</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No data sources connected yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Connect your favorite tools to automatically import links and keep everything in one place.
      </p>
      <Button onClick={onAddSource}>
        <Plus className="w-4 h-4 mr-2" />
        Add Your First Source
      </Button>
    </div>
  );
};
