
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { supabase } from '../../integrations/supabase/client';
import { ApiLog } from '../../types/Database';

export const ApiLogsTab: React.FC = () => {
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);

  useEffect(() => {
    loadApiLogs();
  }, []);

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
    }
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
  );
};
