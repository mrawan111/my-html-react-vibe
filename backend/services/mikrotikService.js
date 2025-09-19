const { RouterOSAPI } = require('node-routeros');

class MikrotikService {
  constructor(config) {
    this.config = {
      host: config.ip,
      user: config.username,
      password: config.password,
      port: config.port || 8728,
      timeout: config.timeout || 10000,
      keepalive: true
    };
    this.connectionType = config.connectionType || 'auto';
  }

  async testConnection() {
    const conn = new RouterOSAPI(this.config);
    
    try {
      console.log(`Testing connection to ${this.config.host}:${this.config.port}`);
      
      // Try to connect
      await conn.connect();
      console.log('✅ Connected successfully');
      
      // Test with a simple command
      const identity = await conn.write('/system/identity/print');
      console.log('✅ Identity command successful');
      
      await conn.close();
      
      return {
        connected: true,
        host: this.config.host,
        port: this.config.port,
        connectionType: this.connectionType,
        timestamp: new Date().toISOString(),
        identity: identity && identity.length > 0 ? identity[0] : null
      };
    } catch (error) {
      console.error('❌ Connection failed:', error.message);
      
      // Try alternative ports if auto mode
      if (this.connectionType === 'auto') {
        const alternativePorts = [8728, 8729, 8291];
        
        for (const port of alternativePorts) {
          if (port === this.config.port) continue;
          
          try {
            console.log(`Trying alternative port ${port}...`);
            const altConfig = { ...this.config, port };
            const altConn = new RouterOSAPI(altConfig);
            
            await altConn.connect();
            const identity = await altConn.write('/system/identity/print');
            await altConn.close();
            
            console.log(`✅ Connected successfully on port ${port}`);
            return {
              connected: true,
              host: this.config.host,
              port: port,
              connectionType: 'api',
              timestamp: new Date().toISOString(),
              identity: identity && identity.length > 0 ? identity[0] : null
            };
          } catch (altError) {
            console.log(`❌ Port ${port} failed: ${altError.message}`);
          }
        }
      }
      
      throw new Error(`Connection failed: ${error.message}`);
    }
  }

  async getSystemIdentity() {
    const conn = new RouterOSAPI(this.config);
    
    try {
      await conn.connect();
      
      const [identity, resource, license] = await Promise.all([
        conn.write('/system/identity/print'),
        conn.write('/system/resource/print'),
        conn.write('/system/license/print').catch(() => null)
      ]);
      
      await conn.close();
      
      return {
        identity: identity && identity.length > 0 ? identity[0] : {},
        resource: resource && resource.length > 0 ? resource[0] : {},
        license: license && license.length > 0 ? license[0] : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      await conn.close().catch(() => {});
      throw new Error(`Failed to get system identity: ${error.message}`);
    }
  }

  async executeCommand(command, params = {}) {
    const conn = new RouterOSAPI(this.config);
    
    try {
      await conn.connect();
      
      // Build command with parameters
      const cmdArray = [command];
      for (const [key, value] of Object.entries(params)) {
        cmdArray.push(`=${key}=${value}`);
      }
      
      const result = await conn.write(cmdArray);
      await conn.close();
      
      return {
        command,
        params,
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      await conn.close().catch(() => {});
      throw new Error(`Command execution failed: ${error.message}`);
    }
  }

  async getHotspotUsers() {
    const conn = new RouterOSAPI(this.config);
    
    try {
      await conn.connect();
      const users = await conn.write('/ip/hotspot/user/print');
      await conn.close();
      
      return users || [];
    } catch (error) {
      await conn.close().catch(() => {});
      throw new Error(`Failed to get hotspot users: ${error.message}`);
    }
  }

  async createHotspotUser(userData) {
    const conn = new RouterOSAPI(this.config);
    
    try {
      await conn.connect();
      
      const command = ['/ip/hotspot/user/add'];
      for (const [key, value] of Object.entries(userData)) {
        if (value !== undefined && value !== null) {
          command.push(`=${key}=${value}`);
        }
      }
      
      const result = await conn.write(command);
      await conn.close();
      
      return {
        success: true,
        userData,
        result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      await conn.close().catch(() => {});
      throw new Error(`Failed to create hotspot user: ${error.message}`);
    }
  }

  async createHotspotUsersBatch(usersArray) {
    const conn = new RouterOSAPI(this.config);

    try {
      await conn.connect();

      const results = [];
      for (const userData of usersArray) {
        const command = ['/ip/hotspot/user/add'];
        for (const [key, value] of Object.entries(userData)) {
          if (value !== undefined && value !== null) {
            command.push(`=${key}=${value}`);
          }
        }
        const result = await conn.write(command);
        results.push(result);
      }

      await conn.close();

      return {
        success: true,
        results,
        count: usersArray.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      await conn.close().catch(() => {});
      throw new Error(`Failed to create hotspot users batch: ${error.message}`);
    }
  }

  async getActiveUsers() {
    const conn = new RouterOSAPI(this.config);
    
    try {
      await conn.connect();
      const activeUsers = await conn.write('/ip/hotspot/active/print');
      await conn.close();
      
      return activeUsers || [];
    } catch (error) {
      await conn.close().catch(() => {});
      throw new Error(`Failed to get active users: ${error.message}`);
    }
  }
}

module.exports = MikrotikService;