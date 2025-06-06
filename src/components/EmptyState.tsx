
import React from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  onSettingsClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSettingsClick }) => {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
        <LinkIcon className="w-8 h-8 text-indigo-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No links saved yet</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Start building your collection by pasting a URL in the input above. 
        We'll automatically fetch the page title for you.
      </p>
      
      {/* Rebrandly Section */}
      <div className="mt-12 pt-12 border-t border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-2">Rebrand your links</h4>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          Connect your Rebrandly account API to brand your links.
        </p>
        <Button 
          onClick={onSettingsClick}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Connect Rebrandly API
        </Button>
      </div>
    </div>
  );
};
