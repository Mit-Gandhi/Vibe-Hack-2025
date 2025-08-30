import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';

const ApiTest: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [response, setResponse] = useState<any>(null);

  const testConnection = async () => {
    setStatus('loading');
    setResponse(null);

    try {
      // Test the health endpoint
      const result = await apiClient.get('/health');
      setResponse(result);
      setStatus('success');
    } catch (error) {
      setResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
      setStatus('error');
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Not tested</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          API Connection Test
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Test the connection between frontend and backend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={status === 'loading'}
          className="w-full"
        >
          {status === 'loading' ? 'Testing...' : 'Test Connection'}
        </Button>
        
        {response && (
          <div className="p-3 bg-gray-50 rounded-md">
            <h4 className="font-semibold mb-2">Response:</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiTest;