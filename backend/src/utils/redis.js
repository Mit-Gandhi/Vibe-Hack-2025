const redis = require('redis');

// Simple Redis client wrapper
let client;

async function getClient() {
  if (!client) {
    client = redis.createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });
    client.on('error', (err) => console.error('Redis error', err));
    if (!client.isOpen) await client.connect();
  }
  return client;
}

module.exports = { getClient };