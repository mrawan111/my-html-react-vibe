import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { MikroTikAPI } from '@/lib/mikrotik-api';

export function MikrotikConnectionExample() {
  const [connection, setConnection] = useState({
    ip: '192.168.1.1',
    port: 8728,
    username: 'admin',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState<any>(null);

  const handleTest = async () => {
    setLoading(true);
    try {
      // Create API instance with backend URL
      const api = new MikroTikAPI(connection, 'http://localhost:3001/api/mikrotik');
      
      // Test connection
      const isConnected = await api.testConnection();
      
      if (isConnected) {
        // Get system information
        const info = await api.getSystemInfo();
        setSystemInfo(info);
        
        toast({
          title: "Connection Successful",
          description: `Connected to ${info.identity?.name || 'MikroTik Router'}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to the router",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Error",
        description: error.message || "An error occurred while connecting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>MikroTik Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ip">Router IP</Label>
            <Input
              id="ip"
              value={connection.ip}
              onChange={(e) => setConnection({ ...connection, ip: e.target.value })}
              placeholder="192.168.1.1"
            />
          </div>
          <div>
            <Label htmlFor="port">API Port</Label>
            <Input
              id="port"
              type="number"
              value={connection.port}
              onChange={(e) => setConnection({ ...connection, port: parseInt(e.target.value) || 8728 })}
              placeholder="8728"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={connection.username}
              onChange={(e) => setConnection({ ...connection, username: e.target.value })}
              placeholder="admin"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={connection.password}
              onChange={(e) => setConnection({ ...connection, password: e.target.value })}
              placeholder="Enter password"
            />
          </div>
        </div>

        <Button onClick={handleTest} disabled={loading} className="w-full">
          {loading ? 'Testing Connection...' : 'Test Connection'}
        </Button>

        {systemInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Router Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {systemInfo.identity?.name || 'Unknown'}</div>
                <div><strong>Version:</strong> {systemInfo.resource?.version || 'Unknown'}</div>
                <div><strong>Board:</strong> {systemInfo.resource?.['board-name'] || 'Unknown'}</div>
                <div><strong>Architecture:</strong> {systemInfo.resource?.architecture || 'Unknown'}</div>
                <div><strong>CPU:</strong> {systemInfo.resource?.cpu || 'Unknown'}</div>
                <div><strong>Uptime:</strong> {systemInfo.resource?.uptime || 'Unknown'}</div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}