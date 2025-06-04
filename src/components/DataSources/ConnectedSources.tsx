
import React from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { DataSource } from '../../pages/DataSources';

interface ConnectedSourcesProps {
  sources: DataSource[];
  onSync: (sourceId: string) => void;
  onConfigure: (source: DataSource) => void;
  onDisconnect: (sourceId: string) => void;
}

export const ConnectedSources: React.FC<ConnectedSourcesProps> = ({
  sources,
  onSync,
  onConfigure,
  onDisconnect
}) => {
  const renderSourceDetails = (source: DataSource) => {
    switch (source.type) {
      case 'gmail':
        return (
          <div className="text-sm text-gray-600">
            <p>Monitoring:</p>
            <ul className="list-disc list-inside ml-2">
              <li>Newsletters folder</li>
              <li>Links from: {source.config.senders?.join(', ')}</li>
            </ul>
          </div>
        );
      case 'slack':
        return (
          <div className="text-sm text-gray-600">
            <p>Monitoring channels:</p>
            <ul className="list-disc list-inside ml-2">
              {source.config.channels?.map((channel: string, index: number) => (
                <li key={index}>{channel} ({Math.floor(Math.random() * 50) + 10} links)</li>
              ))}
            </ul>
          </div>
        );
      case 'rss':
        return (
          <div className="text-sm text-gray-600">
            <p>Active feeds: {source.config.feeds?.length || 0}</p>
            <ul className="list-disc list-inside ml-2">
              {source.config.feeds?.map((feed: string, index: number) => (
                <li key={index}>{feed}</li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Connected Sources</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sources.map((source) => (
          <div
            key={source.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{source.icon}</span>
              <h3 className="font-semibold text-gray-900">{source.name}</h3>
            </div>

            <div className="mb-4">
              <p className="text-lg font-medium text-gray-900">{source.linksImported} links imported</p>
              <p className="text-sm text-gray-500">Last sync: {source.lastSync}</p>
            </div>

            {renderSourceDetails(source)}

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConfigure(source)}
              >
                <Settings className="w-4 h-4 mr-1" />
                Configure
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSync(source.id)}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Sync Now
              </Button>
              <button
                onClick={() => onDisconnect(source.id)}
                className="text-sm text-red-600 hover:text-red-700 ml-auto"
              >
                Disconnect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
