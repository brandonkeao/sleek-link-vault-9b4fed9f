
import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { DataSource } from '../../pages/DataSources';

interface ConfigureSourceModalProps {
  source: DataSource;
  onClose: () => void;
  onSave: (config: any) => void;
}

export const ConfigureSourceModal: React.FC<ConfigureSourceModalProps> = ({
  source,
  onClose,
  onSave
}) => {
  const [config, setConfig] = useState(source.config || {});

  const handleSave = () => {
    onSave(config);
  };

  const renderGmailConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Import Settings:</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.newsletters || false}
              onChange={(e) => setConfig(prev => ({ ...prev, newsletters: e.target.checked }))}
              className="mr-2"
            />
            Newsletter folder
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.starred || false}
              onChange={(e) => setConfig(prev => ({ ...prev, starred: e.target.checked }))}
              className="mr-2"
            />
            Starred emails with links
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.allEmails || false}
              onChange={(e) => setConfig(prev => ({ ...prev, allEmails: e.target.checked }))}
              className="mr-2"
            />
            All emails (not recommended)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Senders to monitor:</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(config.senders || []).map((sender: string, index: number) => (
            <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
              {sender}
              <button
                onClick={() => {
                  const newSenders = config.senders.filter((_: string, i: number) => i !== index);
                  setConfig(prev => ({ ...prev, senders: newSenders }));
                }}
                className="ml-2 text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add sender"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const value = (e.target as HTMLInputElement).value.trim();
              if (value) {
                setConfig(prev => ({ 
                  ...prev, 
                  senders: [...(prev.senders || []), value] 
                }));
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
        />
      </div>
    </div>
  );

  const renderSlackConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select channels to monitor:</label>
        <div className="space-y-2">
          {['#design', '#engineering', '#resources', '#general', '#random'].map(channel => (
            <label key={channel} className="flex items-center">
              <input
                type="checkbox"
                checked={(config.channels || []).includes(channel)}
                onChange={(e) => {
                  const channels = config.channels || [];
                  if (e.target.checked) {
                    setConfig(prev => ({ ...prev, channels: [...channels, channel] }));
                  } else {
                    setConfig(prev => ({ 
                      ...prev, 
                      channels: channels.filter((c: string) => c !== channel) 
                    }));
                  }
                }}
                className="mr-2"
              />
              {channel}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Link handling:</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="linkHandling"
              checked={!config.onlyWithReactions}
              onChange={() => setConfig(prev => ({ ...prev, onlyWithReactions: false }))}
              className="mr-2"
            />
            Import all links
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="linkHandling"
              checked={config.onlyWithReactions}
              onChange={() => setConfig(prev => ({ ...prev, onlyWithReactions: true }))}
              className="mr-2"
            />
            Only links with reactions (👍, ⭐, 📌)
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Auto-tagging:</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.useChannelTag || false}
              onChange={(e) => setConfig(prev => ({ ...prev, useChannelTag: e.target.checked }))}
              className="mr-2"
            />
            Use channel name as tag
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.useSenderTag || false}
              onChange={(e) => setConfig(prev => ({ ...prev, useSenderTag: e.target.checked }))}
              className="mr-2"
            />
            Tag with sender's name
          </label>
        </div>
      </div>
    </div>
  );

  const renderRSSConfig = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">RSS Feeds:</label>
        <div className="space-y-2">
          {(config.feeds || []).map((feed: string, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span>{feed}</span>
              <button
                onClick={() => {
                  const newFeeds = config.feeds.filter((_: string, i: number) => i !== index);
                  setConfig(prev => ({ ...prev, feeds: newFeeds }));
                }}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <input
          type="url"
          placeholder="Add RSS feed URL"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mt-2"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const value = (e.target as HTMLInputElement).value.trim();
              if (value) {
                setConfig(prev => ({ 
                  ...prev, 
                  feeds: [...(prev.feeds || []), value] 
                }));
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
        />
      </div>
    </div>
  );

  const renderConfig = () => {
    switch (source.type) {
      case 'gmail':
        return renderGmailConfig();
      case 'slack':
        return renderSlackConfig();
      case 'rss':
        return renderRSSConfig();
      default:
        return <div>Configuration options coming soon...</div>;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{source.name} Settings</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {renderConfig()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
