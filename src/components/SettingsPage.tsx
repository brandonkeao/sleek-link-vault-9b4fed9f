
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { settingsDatabase } from '../utils/settingsDatabase';
import { UserSettings } from '../types/Database';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SettingsLayout } from './settings/SettingsLayout';
import { ApiConfigurationTab } from './settings/ApiConfigurationTab';
import { SlackIntegrationTab } from './settings/SlackIntegrationTab';
import { ApiLogsTab } from './settings/ApiLogsTab';

interface SettingsPageProps {
  onBack?: () => void;
  allTags?: string[];
  linkCounts?: Record<string, number>;
  totalLinks?: number;
  onNavigateToFilteredLinks?: (tag: string | null) => void;
}

const SettingsPage = ({ onBack, allTags = [], linkCounts = {}, totalLinks = 0, onNavigateToFilteredLinks }: SettingsPageProps) => {
  const { user } = useAuth();
  
  // Settings state
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [autoShorten, setAutoShorten] = useState(false);
  const [defaultTab, setDefaultTab] = useState('api-config');

  useEffect(() => {
    if (user) {
      loadSettings();
      // Set default tab based on whether there are any API logs
      setDefaultTab('api-config');
    }
  }, [user]);

  const loadSettings = async () => {
    const userSettings = await settingsDatabase.getSettings();
    if (userSettings) {
      setSettings(userSettings);
      setApiKey(userSettings.rebrandlyApiKey || '');
      setCustomDomain(userSettings.customDomain || '');
      setAutoShorten(userSettings.autoShortenEnabled);
    }
  };

  const handleSettingsUpdated = () => {
    loadSettings();
  };

  return (
    <SettingsLayout
      onBack={onBack}
      allTags={allTags}
      linkCounts={linkCounts}
      totalLinks={totalLinks}
      onNavigateToFilteredLinks={onNavigateToFilteredLinks}
    >
      <Tabs value={defaultTab} onValueChange={setDefaultTab} className="space-y-6">
        <TabsList className="bg-gray-800">
          <TabsTrigger 
            value="api-config" 
            className="text-gray-300 data-[state=active]:bg-white data-[state=active]:text-gray-900 hover:text-white hover:bg-gray-700"
          >
            API Configuration
          </TabsTrigger>
          <TabsTrigger 
            value="slack" 
            className="text-gray-300 data-[state=active]:bg-white data-[state=active]:text-gray-900 hover:text-white hover:bg-gray-700"
          >
            Slack
          </TabsTrigger>
          <TabsTrigger 
            value="api-logs" 
            className="text-gray-300 data-[state=active]:bg-white data-[state=active]:text-gray-900 hover:text-white hover:bg-gray-700"
          >
            API Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-config">
          <ApiConfigurationTab
            settings={settings}
            apiKey={apiKey}
            setApiKey={setApiKey}
            customDomain={customDomain}
            setCustomDomain={setCustomDomain}
            autoShorten={autoShorten}
            setAutoShorten={setAutoShorten}
            onSettingsUpdated={handleSettingsUpdated}
          />
        </TabsContent>

        <TabsContent value="slack">
          <SlackIntegrationTab />
        </TabsContent>

        <TabsContent value="api-logs">
          <ApiLogsTab />
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
};

export default SettingsPage;
