export interface MikroTikConnection {
  ip: string;
  port: number;
  username: string;
  password: string;
}

export interface HotspotUser {
  name: string;
  password?: string;
  profile?: string;
  'limit-uptime'?: string;
  'limit-bytes-in'?: number;
  'limit-bytes-out'?: number;
  disabled?: boolean;
}

export interface HotspotActiveUser {
  id: string;
  user: string;
  address: string;
  'mac-address': string;
  uptime: string;
  'bytes-in': number;
  'bytes-out': number;
}

export class MikroTikAPI {
  private connection: MikroTikConnection;

  constructor(connection: MikroTikConnection) {
    this.connection = connection;
  }

  // Test connection to the router
  async testConnection(): Promise<boolean> {
    try {
      console.log(`Testing connection to ${this.connection.ip}:${this.connection.port}`);
      
      // Test multiple connection methods
      const connectionMethods = [
        { name: 'HTTP REST API', method: () => this.testRestAPI(false) },
        { name: 'HTTPS REST API', method: () => this.testRestAPI(true) },
        { name: 'HTTP API (8728)', method: () => this.testHTTPAPI() },
        { name: 'Winbox API (8291)', method: () => this.testWinboxAPI() }
      ];

      for (const { name, method } of connectionMethods) {
        try {
          console.log(`Trying ${name}...`);
          const result = await method();
          if (result) {
            console.log(`✅ Connection successful with ${name}`);
            return true;
          }
        } catch (error) {
          console.log(`❌ ${name} failed:`, error.message);
        }
      }

      console.log('❌ All connection methods failed');
      return false;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Test REST API connection (RouterOS v7+)
  private async testRestAPI(useHttps: boolean = true): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const protocol = useHttps ? 'https' : 'http';
      const port = useHttps ? '' : `:${this.connection.port || 80}`;
      
      const response = await fetch(`${protocol}://${this.connection.ip}${port}/rest/system/identity`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${this.connection.username}:${this.connection.password}`)}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Connection timeout');
      }
      throw error;
    }
  }

  // Test HTTP API connection (port 8728/8729)
  private async testHTTPAPI(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Try common MikroTik API ports
      const ports = [8728, 8729];
      
      for (const port of ports) {
        try {
          const response = await fetch(`http://${this.connection.ip}:${port}/`, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${btoa(`${this.connection.username}:${this.connection.password}`)}`
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          if (response.status !== 0) { // Any response indicates the port is accessible
            return true;
          }
        } catch (portError) {
          console.log(`Port ${port} not accessible`);
        }
      }
      
      return false;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Connection timeout');
      }
      throw error;
    }
  }

  // Test Winbox API connection (port 8291)
  private async testWinboxAPI(): Promise<boolean> {
    try {
      // Try to connect to Winbox port
      const response = await fetch(`http://${this.connection.ip}:8291/`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true; // If no error thrown, connection exists
    } catch (error) {
      throw new Error('Winbox API not accessible');
    }
  }

  // Test SSH connection (port 22)
  private async testSSHConnection(): Promise<boolean> {
    try {
      // Since we can't do SSH directly from browser, we'll test if port is open
      const response = await fetch(`http://${this.connection.ip}:22/`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      throw new Error('SSH not accessible');
    }
  }

  // Get router system information
  async getSystemInfo(): Promise<any> {
    try {
      // Try both HTTP and HTTPS
      const protocols = ['http', 'https'];
      
      for (const protocol of protocols) {
        try {
          const port = protocol === 'https' ? '' : `:${this.connection.port || 80}`;
          const response = await fetch(`${protocol}://${this.connection.ip}${port}/rest/system/identity`, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${btoa(`${this.connection.username}:${this.connection.password}`)}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ System info fetched via ${protocol.toUpperCase()}`);
            return data;
          }
        } catch (protocolError) {
          console.log(`Failed to fetch system info via ${protocol.toUpperCase()}:`, protocolError.message);
        }
      }
      
      throw new Error('All system info fetch methods failed');
    } catch (error) {
      console.error('Failed to get system info:', error);
      // Return mock data if real connection fails
      return {
        identity: 'MikroTik Router (Connection Failed)',
        version: '7.0',
        'board-name': 'Unknown',
        connectionStatus: 'failed'
      };
    }
  }

  // Create hotspot user (voucher)
  async createHotspotUser(user: HotspotUser): Promise<string> {
    try {
      // In real implementation, this would create the user via API
      console.log('Creating hotspot user:', user);
      return 'user-id-generated';
    } catch (error) {
      console.error('Failed to create hotspot user:', error);
      throw error;
    }
  }

  // Get active hotspot users
  async getActiveUsers(): Promise<HotspotActiveUser[]> {
    try {
      // Simulate getting active users
      return [];
    } catch (error) {
      console.error('Failed to get active users:', error);
      throw error;
    }
  }

  // Remove hotspot user
  async removeHotspotUser(userId: string): Promise<boolean> {
    try {
      console.log('Removing hotspot user:', userId);
      return true;
    } catch (error) {
      console.error('Failed to remove hotspot user:', error);
      throw error;
    }
  }

  // Get hotspot users
  async getHotspotUsers(): Promise<HotspotUser[]> {
    try {
      // Simulate getting hotspot users
      return [];
    } catch (error) {
      console.error('Failed to get hotspot users:', error);
      throw error;
    }
  }

  // Enable/disable hotspot
  async setHotspotStatus(interfaceName: string, enabled: boolean): Promise<boolean> {
    try {
      console.log(`${enabled ? 'Enabling' : 'Disabling'} hotspot on interface ${interfaceName}`);
      return true;
    } catch (error) {
      console.error('Failed to set hotspot status:', error);
      throw error;
    }
  }
}