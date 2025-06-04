
import React, { useState } from 'react';
import { Tag, X, Link2 } from 'lucide-react';
import { BulkTagDialog } from './BulkTagDialog';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '../hooks/use-toast';

interface BulkActionToolbarProps {
  selectedCount: number;
  selectedLinkIds: string[];
  onClearSelection: () => void;
  onBulkTag: (tags: string[]) => void;
  onBulkShorten: () => void;
  allTags: string[];
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
  selectedCount,
  selectedLinkIds,
  onClearSelection,
  onBulkTag,
  onBulkShorten,
  allTags
}) => {
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [shortening, setShortening] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  if (selectedCount === 0) return null;

  const handleBulkTag = (tags: string[]) => {
    onBulkTag(tags);
    setShowTagDialog(false);
    onClearSelection();
  };

  const handleBulkShorten = async () => {
    if (!user) return;
    
    setShortening(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('bulk-shorten-links', {
        body: { linkIds: selectedLinkIds }
      });

      if (error) throw error;

      toast({
        title: "Bulk shortening initiated",
        description: `Processing ${selectedCount} links. You'll be notified when complete.`,
      });

      onBulkShorten();
      onClearSelection();
    } catch (error) {
      console.error('Error bulk shortening links:', error);
      toast({
        title: "Error",
        description: "Failed to initiate bulk shortening. Please try again.",
        variant: "destructive",
      });
    }
    
    setShortening(false);
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
          onClick={handleBulkShorten}
          disabled={shortening}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
        >
          <Link2 size={16} />
          {shortening ? 'Shortening...' : 'Shorten Links'}
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
