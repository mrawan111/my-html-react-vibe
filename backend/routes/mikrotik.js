const express = require('express');
const Joi = require('joi');
const MikrotikService = require('../services/mikrotikService');

const router = express.Router();

// Validation schemas
const connectionSchema = Joi.object({
  ip: Joi.string().ip().required(),
  port: Joi.number().integer().min(1).max(65535).default(8728),
  username: Joi.string().required(),
  password: Joi.string().required(),
  connectionType: Joi.string().valid('api', 'winbox', 'auto').default('auto'),
  timeout: Joi.number().integer().min(1000).max(30000).default(10000)
});

const commandSchema = Joi.object({
  ip: Joi.string().ip().required(),
  port: Joi.number().integer().min(1).max(65535).default(8728),
  username: Joi.string().required(),
  password: Joi.string().required(),
  command: Joi.string().required(),
  params: Joi.object().default({})
});

// Test router connection
router.post('/connect', async (req, res) => {
  try {
    const { error, value } = connectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const mikrotikService = new MikrotikService(value);
    const result = await mikrotikService.testConnection();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Connection failed',
      message: error.message
    });
  }
});

// Get system identity
router.post('/identity', async (req, res) => {
  try {
    const { error, value } = connectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const mikrotikService = new MikrotikService(value);
    const identity = await mikrotikService.getSystemIdentity();

    res.json({
      success: true,
      data: identity
    });
  } catch (error) {
    console.error('Get identity failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system identity',
      message: error.message
    });
  }
});

// Execute custom command
router.post('/command', async (req, res) => {
  try {
    const { error, value } = commandSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const mikrotikService = new MikrotikService(value);
    const result = await mikrotikService.executeCommand(value.command, value.params);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Command execution failed:', error);
    res.status(500).json({
      success: false,
      error: 'Command execution failed',
      message: error.message
    });
  }
});

// Get hotspot users
router.post('/hotspot/users', async (req, res) => {
  try {
    const { error, value } = connectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const mikrotikService = new MikrotikService(value);
    const users = await mikrotikService.getHotspotUsers();

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get hotspot users failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get hotspot users',
      message: error.message
    });
  }
});

// Create hotspot user
router.post('/hotspot/users/create', async (req, res) => {
  try {
    const schema = connectionSchema.keys({
      user: Joi.object({
        name: Joi.string().required(),
        password: Joi.string().optional(),
        profile: Joi.string().optional(),
        'limit-uptime': Joi.string().optional(),
        disabled: Joi.boolean().default(false)
      }).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const mikrotikService = new MikrotikService(value);
    const result = await mikrotikService.createHotspotUser(value.user);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Create hotspot user failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create hotspot user',
      message: error.message
    });
  }
});

// Create hotspot users in batch
router.post('/hotspot/users/create-batch', async (req, res) => {
  try {
    const schema = connectionSchema.keys({
      users: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        password: Joi.string().optional(),
        profile: Joi.string().optional(),
        'limit-uptime': Joi.string().optional(),
        disabled: Joi.boolean().default(false)
      })).min(1).max(200).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const mikrotikService = new MikrotikService(value);
    const result = await mikrotikService.createHotspotUsersBatch(value.users);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Create hotspot users batch failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create hotspot users batch',
      message: error.message
    });
  }
});

module.exports = router;