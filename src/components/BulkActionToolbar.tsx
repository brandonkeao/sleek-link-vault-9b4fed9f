
import React, { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { BulkTagDialog } from './BulkTagDialog';

interface BulkActionToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkTag: (tags: string[]) => void;
  allTags: string[];
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkTag,
  allTags
}) => {
  const [showTagDialog, setShowTagDialog] = useState(false);

  if (selectedCount === 0) return null;

  const handleBulkTag = (tags: string[]) => {
    onBulkTag(tags);
    setShowTagDialog(false);
    onClearSelection();
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-4 z-10">
        <span className="text-sm font-medium text-gray-700">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
        
        <button
          onClick={() => setShowTagDialog(true)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors duration-200"
        >
          <Tag size={16} />
          Add Tags
        </button>
        
        <button
          onClick={onClearSelection}
          className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X size={16} />
        </button>
      </div>

      {showTagDialog && (
        <BulkTagDialog
          isOpen={showTagDialog}
          onClose={() => setShowTagDialog(false)}
          onApplyTags={handleBulkTag}
          allTags={allTags}
        />
      )}
    </>
  );
};
