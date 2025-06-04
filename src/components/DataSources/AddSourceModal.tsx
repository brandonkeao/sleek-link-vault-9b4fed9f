
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';

interface AddSourceModalProps {
  onClose: () => void;
  onConnect: (sourceType: string) => void;
}

const sourceOptions = [
  {
    type: 'gmail',
    name: 'Gmail',
    description: 'Import links from newsletters',
    icon: '📧'
  },
  {
    type: 'slack',
    name: 'Slack',
    description: 'Monitor channels for shared links',
    icon: '💬'
  },
  {
    type: 'rss',
    name: 'RSS Feed',
    description: 'Follow blogs and news sites',
    icon: '📡'
  },
  {
    type: 'github',
    name: 'GitHub',
    description: 'Track starred repositories',
    icon: '🐙'
  }
];

export const AddSourceModal: React.FC<AddSourceModalProps> = ({ onClose, onConnect }) => {
  const [selectedSource, setSelectedSource] = useState<string>('');

  const handleContinue = () => {
    if (selectedSource) {
      onConnect(selectedSource);
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Data Source</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <p className="text-sm text-gray-600 mb-4">Choose a source to connect:</p>
          
          {sourceOptions.map((source) => (
            <label
              key={source.type}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="source"
                value={source.type}
                checked={selectedSource === source.type}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="text-purple-600"
              />
              <span className="text-xl">{source.icon}</span>
              <div>
                <div className="font-medium">{source.name}</div>
                <div className="text-sm text-gray-600">{source.description}</div>
              </div>
            </label>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={!selectedSource}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
