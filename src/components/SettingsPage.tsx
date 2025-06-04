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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Eye, EyeOff, ArrowLeft, Check, X } from 'lucide-react';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from './ui/sidebar';
import { TagSidebar } from './TagSidebar';

interface SettingsPageProps {
  onBack?: () => void;
  allTags?: string[];
  linkCounts?: Record<string, number>;
  totalLinks?: number;
}

const SettingsPage = ({ onBack, allTags = [], linkCounts = {}, totalLinks = 0 }: SettingsPageProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Existing state
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [autoShorten, setAutoShorten] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);
  const [defaultTab, setDefaultTab] = useState('api-config');

  // Slack integration state
  const [slackConnected, setSlackConnected] = useState(false);
  const [slackChannel, setSlackChannel] = useState('#general');
  const [slackEvents, setSlackEvents] = useState({
    newLink: true,
    linkShortened: true,
    bulkShortened: false,
    dailySummary: false
  });
  const [connectingSlack, setConnectingSlack] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
      loadApiLogs();
      loadSlackSettings();
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
      setDefaultTab(logs.length > 0 ? 'api-logs' : 'api-config');
    }
  };

  const loadSlackSettings = () => {
    const connected = localStorage.getItem('slackConnected') === 'true';
    const channel = localStorage.getItem('slackChannel') || '#general';
    const events = JSON.parse(localStorage.getItem('slackEvents') || '{"newLink":true,"linkShortened":true,"bulkShortened":false,"dailySummary":false}');
    
    setSlackConnected(connected);
    setSlackChannel(channel);
    setSlackEvents(events);
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

  const handleConnectSlack = async () => {
    setConnectingSlack(true);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSlackConnected(true);
    localStorage.setItem('slackConnected', 'true');
    
    toast({
      title: "Connected to Slack!",
      description: "Your workspace has been successfully connected.",
    });
    
    setConnectingSlack(false);
  };

  const handleDisconnectSlack = () => {
    setSlackConnected(false);
    localStorage.setItem('slackConnected', 'false');
    
    toast({
      title: "Disconnected from Slack",
      description: "Your workspace has been disconnected.",
    });
  };

  const handleSlackChannelChange = (channel: string) => {
    setSlackChannel(channel);
    localStorage.setItem('slackChannel', channel);
  };

  const handleSlackEventChange = (event: string, enabled: boolean) => {
    const newEvents = { ...slackEvents, [event]: enabled };
    setSlackEvents(newEvents);
    localStorage.setItem('slackEvents', JSON.stringify(newEvents));
  };

  const handleTestNotification = () => {
    toast({
      title: "Test notification sent",
      description: `Test sent to ${slackChannel}`,
    });
  };

  const handleSaveSlackSettings = () => {
    toast({
      title: "Slack settings saved",
      description: "Your notification preferences have been updated.",
    });
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <TagSidebar
          allTags={allTags}
          selectedTags={[]}
          onTagSelect={() => {}}
          linkCounts={linkCounts}
          totalLinks={totalLinks}
          onSettingsClick={() => {}}
        />
        
        <SidebarInset>
          <div className="w-full px-4 py-8 bg-white min-h-screen">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-700">Manage your integrations and view API logs</p>
                  </div>
                </div>
                
                {onBack && (
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Back to Links
                  </Button>
                )}
              </div>
            </div>

            <Tabs value={defaultTab} onValueChange={setDefaultTab} className="space-y-6">
              <TabsList className="bg-gray-100">
                <TabsTrigger value="api-config" className="data-[state=active]:bg-white">API Configuration</TabsTrigger>
                <TabsTrigger value="slack" className="data-[state=active]:bg-white">Slack</TabsTrigger>
                <TabsTrigger value="api-logs" className="data-[state=active]:bg-white">API Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="api-config">
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
                            className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
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
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
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
              </TabsContent>

              <TabsContent value="slack">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Slack Integration</CardTitle>
                    <CardDescription className="text-gray-600">
                      Connect your workspace to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!slackConnected ? (
                      <div className="text-center py-8">
                        <Button 
                          onClick={handleConnectSlack}
                          disabled={connectingSlack}
                          className="bg-[#4A154B] hover:bg-[#4A154B]/90 text-white px-8 py-3 text-lg"
                        >
                          {connectingSlack ? 'Connecting...' : 'Connect to Slack'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Check className="h-5 w-5 text-green-600" />
                            <span className="text-green-800 font-medium">Connected to: Mock Workspace</span>
                          </div>
                          <Button
                            onClick={handleDisconnectSlack}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Disconnect
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700">Send notifications to:</Label>
                          <Select value={slackChannel} onValueChange={handleSlackChannelChange}>
                            <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="#general">#general</SelectItem>
                              <SelectItem value="#dev">#dev</SelectItem>
                              <SelectItem value="#marketing">#marketing</SelectItem>
                              <SelectItem value="#notifications">#notifications</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-gray-700">Notify when:</Label>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="new-link"
                                checked={slackEvents.newLink}
                                onCheckedChange={(checked) => handleSlackEventChange('newLink', checked as boolean)}
                              />
                              <Label htmlFor="new-link" className="text-gray-700">New link is saved</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="link-shortened"
                                checked={slackEvents.linkShortened}
                                onCheckedChange={(checked) => handleSlackEventChange('linkShortened', checked as boolean)}
                              />
                              <Label htmlFor="link-shortened" className="text-gray-700">Link is shortened</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="bulk-shortened"
                                checked={slackEvents.bulkShortened}
                                onCheckedChange={(checked) => handleSlackEventChange('bulkShortened', checked as boolean)}
                              />
                              <Label htmlFor="bulk-shortened" className="text-gray-700">Bulk links are shortened</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="daily-summary"
                                checked={slackEvents.dailySummary}
                                onCheckedChange={(checked) => handleSlackEventChange('dailySummary', checked as boolean)}
                              />
                              <Label htmlFor="daily-summary" className="text-gray-700">Daily summary at 9:00 AM</Label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700">Preview:</Label>
                          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">🔗 New Link Saved</div>
                              <div className="text-gray-700">Design System Best Practices</div>
                              <div className="text-blue-600 text-sm">https://example.com/design</div>
                              <div className="text-gray-500 text-sm">Tags: design, research</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          <Button 
                            onClick={handleTestNotification}
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Test Notification
                          </Button>
                          <Button 
                            onClick={handleSaveSlackSettings}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Save Settings
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api-logs">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-900">API Request Log</CardTitle>
                      <CardDescription className="text-gray-600">
                        Recent API requests and responses (most recent first)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        {apiLogs.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No API logs yet</p>
                        ) : (
                          <div className="space-y-2">
                            {apiLogs.map((log) => (
                              <div
                                key={log.id}
                                className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                                  selectedLog?.id === log.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                                }`}
                                onClick={() => setSelectedLog(log)}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900">{log.requestType}</span>
                                  {getStatusBadge(log.statusCode, log.errorMessage)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {log.createdAt.toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Request Details</CardTitle>
                      <CardDescription className="text-gray-600">
                        {selectedLog ? 'Detailed view of the selected request' : 'Select a request to view details'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedLog ? (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2 text-gray-900">Request</h4>
                            <pre className="bg-gray-50 border border-gray-200 p-3 rounded text-sm overflow-auto text-gray-900">
                              {JSON.stringify(selectedLog.requestData, null, 2)}
                            </pre>
                          </div>
                          
                          <Separator className="bg-gray-200" />
                          
                          <div>
                            <h4 className="font-medium mb-2 text-gray-900">Response</h4>
                            {selectedLog.errorMessage ? (
                              <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-700">
                                {selectedLog.errorMessage}
                              </div>
                            ) : (
                              <pre className="bg-gray-50 border border-gray-200 p-3 rounded text-sm overflow-auto text-gray-900">
                                {JSON.stringify(selectedLog.responseData, null, 2)}
                              </pre>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Status: {selectedLog.statusCode || 'N/A'}</span>
                            <span>Time: {selectedLog.createdAt.toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          Select a request from the list to view details
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SettingsPage;
