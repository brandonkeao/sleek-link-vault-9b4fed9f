
import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ConnectedSources } from '../components/DataSources/ConnectedSources';
import { AvailableSources } from '../components/DataSources/AvailableSources';
import { AddSourceModal } from '../components/DataSources/AddSourceModal';
import { ConfigureSourceModal } from '../components/DataSources/ConfigureSourceModal';
import { EmptyDataSources } from '../components/DataSources/EmptyDataSources';
import { useToast } from '../hooks/use-toast';

export interface DataSource {
  id: string;
  type: 'gmail' | 'slack' | 'rss' | 'github' | 'twitter' | 'pocket';
  name: string;
  icon: string;
  linksImported: number;
  lastSync: string;
  config: any;
  isConnected: boolean;
}

const DataSources = () => {
  const { toast } = useToast();
  const [sources, setSources] = useState<DataSource[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [configureSource, setConfigureSource] = useState<DataSource | null>(null);

  useEffect(() => {
    const savedSources = localStorage.getItem('dataSources');
    if (savedSources) {
      setSources(JSON.parse(savedSources));
    } else {
      // Initialize with mock connected sources
      const mockSources: DataSource[] = [
        {
          id: '1',
          type: 'gmail',
          name: 'Gmail',
          icon: '📧',
          linksImported: 156,
          lastSync: '2 minutes ago',
          config: {
            folders: ['newsletters'],
            senders: ['Morning Brew', 'tldr'],
            autoTag: true
          },
          isConnected: true
        },
        {
          id: '2',
          type: 'slack',
          name: 'Slack - Mock Workspace',
          icon: '💬',
          linksImported: 89,
          lastSync: '15 minutes ago',
          config: {
            channels: ['#design', '#engineering', '#resources'],
            onlyWithReactions: true,
            autoTag: true
          },
          isConnected: true
        },
        {
          id: '3',
          type: 'rss',
          name: 'RSS Feeds',
          icon: '📡',
          linksImported: 67,
          lastSync: '1 hour ago',
          config: {
            feeds: ['CSS-Tricks', 'Smashing Magazine', 'A List Apart']
          },
          isConnected: true
        }
      ];
      setSources(mockSources);
      localStorage.setItem('dataSources', JSON.stringify(mockSources));
    }
  }, []);

  const handleSync = (sourceId: string) => {
    setSources(prev => prev.map(source => {
      if (source.id === sourceId) {
        const newLinksCount = Math.floor(Math.random() * 5) + 1;
        toast({
          title: `Found ${newLinksCount} new links from ${source.name}`,
        });
        return {
          ...source,
          linksImported: source.linksImported + newLinksCount,
          lastSync: 'Just now'
        };
      }
      return source;
    }));
  };

  const handleDisconnect = (sourceId: string) => {
    setSources(prev => {
      const updated = prev.map(source => 
        source.id === sourceId 
          ? { ...source, isConnected: false }
          : source
      );
      localStorage.setItem('dataSources', JSON.stringify(updated));
      return updated;
    });
  };

  const handleConnect = (sourceType: string) => {
    // Mock connection
    setTimeout(() => {
      const newSource: DataSource = {
        id: Date.now().toString(),
        type: sourceType as any,
        name: sourceType.charAt(0).toUpperCase() + sourceType.slice(1),
        icon: sourceType === 'github' ? '🐙' : sourceType === 'twitter' ? '🐦' : '📱',
        linksImported: 0,
        lastSync: 'Never',
        config: {},
        isConnected: true
      };
      
      setSources(prev => {
        const updated = [...prev, newSource];
        localStorage.setItem('dataSources', JSON.stringify(updated));
        return updated;
      });
      
      toast({
        title: `Connected to ${newSource.name}!`,
      });
    }, 1000);
  };

  const handleUpdateConfig = (sourceId: string, config: any) => {
    setSources(prev => {
      const updated = prev.map(source => 
        source.id === sourceId 
          ? { ...source, config }
          : source
      );
      localStorage.setItem('dataSources', JSON.stringify(updated));
      return updated;
    });
  };

  const connectedSources = sources.filter(s => s.isConnected);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Sources</h1>
              <p className="text-gray-700">Automatically import links from your favorite tools</p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Source
            </Button>
          </div>
        </div>

        {connectedSources.length === 0 ? (
          <EmptyDataSources onAddSource={() => setShowAddModal(true)} />
        ) : (
          <>
            <ConnectedSources
              sources={connectedSources}
              onSync={handleSync}
              onConfigure={setConfigureSource}
              onDisconnect={handleDisconnect}
            />
            <AvailableSources onConnect={handleConnect} />
          </>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddSourceModal
            onClose={() => setShowAddModal(false)}
            onConnect={handleConnect}
          />
        )}

        {configureSource && (
          <ConfigureSourceModal
            source={configureSource}
            onClose={() => setConfigureSource(null)}
            onSave={(config) => {
              handleUpdateConfig(configureSource.id, config);
              setConfigureSource(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DataSources;
