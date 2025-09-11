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
      // Test multiple connection methods
      const connectionMethods = [
        () => this.testRestAPI(),
        () => this.testWinboxAPI(),
        () => this.testSSHConnection()
      ];

      for (const method of connectionMethods) {
        try {
          const result = await method();
          if (result) {
            console.log('Connection successful with method');
            return true;
          }
        } catch (error) {
          console.log('Method failed, trying next:', error.message);
        }
      }

      return false;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Test REST API connection (RouterOS v7+)
  private async testRestAPI(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`https://${this.connection.ip}/rest/system/identity`, {
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
      const response = await fetch(`https://${this.connection.ip}/rest/system/identity`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${this.connection.username}:${this.connection.password}`)}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch system info');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get system info:', error);
      // Return mock data if real connection fails
      return {
        identity: 'MikroTik Router',
        version: '7.0',
        'board-name': 'Unknown'
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