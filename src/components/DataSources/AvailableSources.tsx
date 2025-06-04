
import React from 'react';
import { Button } from '../ui/button';

interface AvailableSourcesProps {
  onConnect: (sourceType: string) => void;
}

const availableSources = [
  {
    type: 'github',
    name: 'GitHub',
    description: 'Star & watch repos',
    icon: '🐙',
    available: true
  },
  {
    type: 'twitter',
    name: 'Twitter/X',
    description: 'Bookmarks',
    icon: '🐦',
    available: true
  },
  {
    type: 'pocket',
    name: 'Pocket',
    description: 'Read later',
    icon: '📱',
    available: true
  },
  {
    type: 'browser',
    name: 'Browser',
    description: 'Bookmarks',
    icon: '🌐',
    available: false
  },
  {
    type: 'calendar',
    name: 'Calendar',
    description: 'Meeting links',
    icon: '📅',
    available: false
  },
  {
    type: 'webhook',
    name: 'Webhook',
    description: 'Custom API',
    icon: '🔗',
    available: false
  }
];

export const AvailableSources: React.FC<AvailableSourcesProps> = ({ onConnect }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Sources</h2>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
        {availableSources.map((source) => (
          <div
            key={source.type}
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center hover:shadow-sm transition-shadow"
          >
            <div className="text-3xl mb-3">{source.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{source.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{source.description}</p>
            
            {source.available ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConnect(source.type)}
                className="w-full"
              >
                Connect
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full"
              >
                Coming Soon
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
