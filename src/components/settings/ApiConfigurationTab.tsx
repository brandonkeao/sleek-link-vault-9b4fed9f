
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { UserSettings } from '../../types/Database';
import { settingsDatabase } from '../../utils/settingsDatabase';

interface ApiConfigurationTabProps {
  settings: UserSettings | null;
  apiKey: string;
  setApiKey: (key: string) => void;
  customDomain: string;
  setCustomDomain: (domain: string) => void;
  autoShorten: boolean;
  setAutoShorten: (enabled: boolean) => void;
  onSettingsUpdated: () => void;
}

export const ApiConfigurationTab: React.FC<ApiConfigurationTabProps> = ({
  settings,
  apiKey,
  setApiKey,
  customDomain,
  setCustomDomain,
  autoShorten,
  setAutoShorten,
  onSettingsUpdated
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveSettings = async () => {
    setLoading(true);
    
    const success = await settingsDatabase.updateSettings({
      rebrandlyApiKey: apiKey,
      customDomain: customDomain,
      autoShortenEnabled: autoShorten
    });

    if (success) {
      toast({
        title: "Settings saved",
        description: "Your API settings have been updated successfully.",
      });
      onSettingsUpdated();
    } else {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const testApiKey = async () => {
    if (!apiKey) {
      toast({
        title: "Error",
        description: "Please enter an API key first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-rebrandly-key', {
        body: { apiKey }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "API key valid",
          description: "Your Rebrandly API key is working correctly.",
        });
      } else {
        toast({
          title: "API key invalid",
          description: data.error || "The API key is not valid.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      toast({
        title: "Error",
        description: "Failed to test API key. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Rebrandly API Configuration</CardTitle>
        <CardDescription className="text-gray-600">
          Configure your Rebrandly API key and settings to enable link shortening
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key" className="text-gray-700">API Key</Label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Rebrandly API key"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            <Button 
              onClick={testApiKey} 
              disabled={loading || !apiKey}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Test
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-domain" className="text-gray-700">Custom Domain (Optional)</Label>
          <Input
            id="custom-domain"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="yourdomain.com"
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="auto-shorten"
            checked={autoShorten}
            onCheckedChange={setAutoShorten}
          />
          <Label htmlFor="auto-shorten" className="text-gray-700">
            Automatically shorten new links
          </Label>
        </div>

        <Button 
          onClick={handleSaveSettings} 
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};
