
import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

export const EmptyState: React.FC = () => {
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
    </div>
  );
};
