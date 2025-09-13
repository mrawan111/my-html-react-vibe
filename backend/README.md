# MikroTik Backend API

A Node.js Express backend for handling MikroTik router connections from frontend applications, bypassing browser CORS and TCP port limitations.

## Features

- 🔒 Secure API endpoints with rate limiting and validation
- 🌐 Support for MikroTik API (ports 8728/8729) and Winbox (8291)
- 🔄 Auto-discovery of working connection ports
- 📊 System information retrieval
- 👥 Hotspot user management
- ⚡ Fast connection testing
- 🛡️ Input sanitization and error handling

## Installation

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

## API Endpoints

### POST /api/mikrotik/connect
Test router connection and get basic info.

**Request:**
```json
{
  "ip": "192.168.1.1",
  "port": 8728,
  "username": "admin",
  "password": "password",
  "connectionType": "auto",
  "timeout": 10000
}
```

### POST /api/mikrotik/identity
Get detailed system identity and resource information.

### POST /api/mikrotik/command
Execute custom MikroTik commands.

**Request:**
```json
{
  "ip": "192.168.1.1",
  "username": "admin",
  "password": "password",
  "command": "/interface/print",
  "params": {}
}
```

### POST /api/mikrotik/hotspot/users
Get all hotspot users.

### POST /api/mikrotik/hotspot/users/create
Create a new hotspot user.

**Request:**
```json
{
  "ip": "192.168.1.1",
  "username": "admin",
  "password": "password",
  "user": {
    "name": "testuser",
    "password": "testpass",
    "profile": "default",
    "limit-uptime": "1h"
  }
}
```

## Security Features

- Rate limiting (100 requests per 15 minutes)
- Input validation with Joi
- CORS protection
- Helmet security headers
- Error message sanitization
- Connection timeout enforcement

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Development

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start
```