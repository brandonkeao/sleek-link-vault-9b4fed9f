
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Check, X } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export const SlackIntegrationTab: React.FC = () => {
  const { toast } = useToast();
  
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
    loadSlackSettings();
  }, []);

  const loadSlackSettings = () => {
    const connected = localStorage.getItem('slackConnected') === 'true';
    const channel = localStorage.getItem('slackChannel') || '#general';
    const events = JSON.parse(localStorage.getItem('slackEvents') || '{"newLink":true,"linkShortened":true,"bulkShortened":false,"dailySummary":false}');
    
    setSlackConnected(connected);
    setSlackChannel(channel);
    setSlackEvents(events);
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

  return (
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
                <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500">
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
  );
};
