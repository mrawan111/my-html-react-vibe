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
  private apiUrl: string;

  constructor(connection: MikroTikConnection, apiUrl: string = "https://my-html-react-vibe-production.up.railway.app") {
    this.connection = connection;
    this.apiUrl = apiUrl;
  }
  // Test connection to the router via backend API
  async testConnection(): Promise<boolean> {
    try {
      console.log(`Testing connection to ${this.connection.ip}:${this.connection.port} via backend`);
        // ✅ Use the direct /connect endpoint
      const response = await fetch(`${this.apiUrl}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: this.connection.ip,
          port: this.connection.port,
          username: this.connection.username,
          password: this.connection.password,
          connectionType: 'auto',
          timeout: 10000
        })
      });


      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Connection successful via backend API');
        return true;
      } else {
        console.log('❌ Connection failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Backend API connection test failed:', error);
      return false;
    }
  }

  // Execute custom command via backend API
  async executeCommand(command: string, params: any = {}): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: this.connection.ip,
          port: this.connection.port,
          username: this.connection.username,
          password: this.connection.password,
          command,
          params
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data.result;
      } else {
        throw new Error(result.message || 'Command execution failed');
      }
    } catch (error) {
      console.error('Failed to execute command:', error);
      throw error;
    }
  }

  // Get router system information via backend API
  async getSystemInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: this.connection.ip,
          port: this.connection.port,
          username: this.connection.username,
          password: this.connection.password
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ System info fetched via backend API');
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to get system info');
      }
    } catch (error) {
      console.error('Failed to get system info via backend:', error);
      // Return mock data if backend connection fails
      return {
        identity: { name: 'MikroTik Router (Backend Connection Failed)' },
        resource: { version: '7.0', 'board-name': 'Unknown' },
        connectionStatus: 'failed'
      };
    }
  }

  // Create hotspot user (voucher) via backend API
  async createHotspotUser(user: HotspotUser): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/hotspot/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: this.connection.ip,
          port: this.connection.port,
          username: this.connection.username,
          password: this.connection.password,
          user
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Hotspot user created successfully');
        return result.data.result;
      } else {
        throw new Error(result.message || 'Failed to create hotspot user');
      }
    } catch (error) {
      console.error('Failed to create hotspot user:', error);
      throw error;
    }
  }

  // Create hotspot users in batch via backend API
  async createHotspotUsersBatch(users: HotspotUser[]): Promise<any> {
    try {
      if (users.length > 200) {
        throw new Error('Maximum 200 users allowed in batch');
      }

      const response = await fetch(`${this.apiUrl}/hotspot/users/create-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: this.connection.ip,
          port: this.connection.port,
          username: this.connection.username,
          password: this.connection.password,
          users
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ ${users.length} hotspot users created successfully in batch`);
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to create hotspot users batch');
      }
    } catch (error) {
      console.error('Failed to create hotspot users batch:', error);
      throw error;
    }
  }

  // Get active hotspot users via backend API
  async getActiveUsers(): Promise<HotspotActiveUser[]> {
    try {
      const response = await fetch(`${this.apiUrl}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: this.connection.ip,
          port: this.connection.port,
          username: this.connection.username,
          password: this.connection.password,
          command: '/ip/hotspot/active/print'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data.result || [];
      } else {
        throw new Error(result.message || 'Failed to get active users');
      }
    } catch (error) {
      console.error('Failed to get active users:', error);
      return [];
    }
  }

  // Remove hotspot user via backend API
  async removeHotspotUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: this.connection.ip,
          port: this.connection.port,
          username: this.connection.username,
          password: this.connection.password,
          command: '/ip/hotspot/user/remove',
          params: { numbers: userId }
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to remove hotspot user:', error);
      return false;
    }
  }

  // Get hotspot users via backend API
  async getHotspotUsers(): Promise<HotspotUser[]> {
    try {
      const response = await fetch(`${this.apiUrl}/hotspot/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: this.connection.ip,
          port: this.connection.port,
          username: this.connection.username,
          password: this.connection.password
        })
      });

      const result = await response.json();

      if (result.success) {
        return result.data || [];
      } else {
        throw new Error(result.message || 'Failed to get hotspot users');
      }
    } catch (error) {
      console.error('Failed to get hotspot users:', error);
      return [];
    }
  }

  // Update hotspot user via backend API
  async updateHotspotUser(userId: string, updates: Partial<HotspotUser>): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: this.connection.ip,
          port: this.connection.port,
          username: this.connection.username,
          password: this.connection.password,
          command: '/ip/hotspot/user/set',
          params: { numbers: userId, ...updates }
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to update hotspot user:', error);
      return false;
    }
  }

  // Enable/disable hotspot via backend API
  async setHotspotStatus(interfaceName: string, enabled: boolean): Promise<boolean> {
    try {
      const command = enabled ? '/ip/hotspot/add' : '/ip/hotspot/remove';
      const params = enabled ? { interface: interfaceName } : { numbers: interfaceName };

      const response = await fetch(`${this.apiUrl}/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip: this.connection.ip,
          port: this.connection.port,
          username: this.connection.username,
          password: this.connection.password,
          command,
          params
        })
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to set hotspot status:', error);
      return false;
    }
  }
}