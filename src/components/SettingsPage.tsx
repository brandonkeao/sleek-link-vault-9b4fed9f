import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { settingsDatabase } from '../utils/settingsDatabase';
import { UserSettings, ApiLog } from '../types/Database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Eye, EyeOff } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [autoShorten, setAutoShorten] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);
  const [defaultTab, setDefaultTab] = useState('api-config');

  useEffect(() => {
    if (user) {
      loadSettings();
      loadApiLogs();
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

  const loadApiLogs = async () => {
    const { data, error } = await supabase
      .from('api_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      const logs = data.map(log => ({
        id: log.id,
        userId: log.user_id,
        requestType: log.request_type,
        requestData: log.request_data,
        responseData: log.response_data,
        statusCode: log.status_code,
        errorMessage: log.error_message,
        createdAt: new Date(log.created_at)
      }));
      
      setApiLogs(logs);
      // Set default tab based on whether logs exist
      setDefaultTab(logs.length > 0 ? 'api-logs' : 'api-config');
    }
  };

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
      loadSettings();
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

  const getStatusBadge = (statusCode?: number, errorMessage?: string) => {
    if (errorMessage) {
      return <Badge variant="destructive">Error</Badge>;
    }
    if (statusCode && statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-600 text-white hover:bg-green-700">Success</Badge>;
    }
    if (statusCode && statusCode >= 400) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your Rebrandly API integration and view API logs</p>
      </div>

      <Tabs value={defaultTab} onValueChange={setDefaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-config">API Configuration</TabsTrigger>
          <TabsTrigger value="api-logs">API Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="api-config">
          <Card>
            <CardHeader>
              <CardTitle>Rebrandly API Configuration</CardTitle>
              <CardDescription>
                Configure your Rebrandly API key and settings to enable link shortening
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your Rebrandly API key"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  <Button 
                    onClick={testApiKey} 
                    disabled={loading || !apiKey}
                    variant="outline"
                  >
                    Test
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-domain">Custom Domain (Optional)</Label>
                <Input
                  id="custom-domain"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="yourdomain.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-shorten"
                  checked={autoShorten}
                  onCheckedChange={setAutoShorten}
                />
                <Label htmlFor="auto-shorten">
                  Automatically shorten new links
                </Label>
              </div>

              <Button 
                onClick={handleSaveSettings} 
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-logs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Request Log</CardTitle>
                <CardDescription>
                  Recent API requests and responses (most recent first)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  {apiLogs.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No API logs yet</p>
                  ) : (
                    <div className="space-y-2">
                      {apiLogs.map((log) => (
                        <div
                          key={log.id}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedLog?.id === log.id ? 'border-primary bg-muted' : ''
                          }`}
                          onClick={() => setSelectedLog(log)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{log.requestType}</span>
                            {getStatusBadge(log.statusCode, log.errorMessage)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.createdAt.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
                <CardDescription>
                  {selectedLog ? 'Detailed view of the selected request' : 'Select a request to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedLog ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Request</h4>
                      <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                        {JSON.stringify(selectedLog.requestData, null, 2)}
                      </pre>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Response</h4>
                      {selectedLog.errorMessage ? (
                        <div className="bg-destructive/10 border border-destructive/20 p-3 rounded text-sm text-destructive">
                          {selectedLog.errorMessage}
                        </div>
                      ) : (
                        <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                          {JSON.stringify(selectedLog.responseData, null, 2)}
                        </pre>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Status: {selectedLog.statusCode || 'N/A'}</span>
                      <span>Time: {selectedLog.createdAt.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Select a request from the list to view details
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
