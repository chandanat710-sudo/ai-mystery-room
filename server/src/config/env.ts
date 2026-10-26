import dotenv from 'dotenv';
import path from 'node:path';
import { isIP } from 'node:net';

// Workspace scripts run with `server/` as cwd, but configuration lives in the
// monorepo root. The same relative path works from src/config and dist/config.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
console.log('MongoDB URI loaded:', Boolean(process.env.MONGODB_URI));
console.log('MongoDB URI starts correctly:', process.env.MONGODB_URI?.startsWith('mongodb'));

export function getEnv() {
  const required = ['MONGODB_URI', 'GEMINI_API_KEY', 'GEMINI_MODEL'] as const;
  const absent = required.filter((key) => !process.env[key] || process.env[key]?.startsWith('replace_'));
  if (absent.length) throw new Error(`Missing required environment configuration: ${absent.join(', ')}. Set these values in .env.`);
  const mongoDnsServers = (process.env.MONGODB_DNS_SERVERS ?? '').split(',').map((entry) => entry.trim()).filter(Boolean);
  if (mongoDnsServers.some((server) => isIP(server) === 0)) throw new Error('MONGODB_DNS_SERVERS must be a comma-separated list of DNS server IP addresses.');
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 5000),
    clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    mongoUri: process.env.MONGODB_URI!, mongoDnsServers, geminiApiKey: process.env.GEMINI_API_KEY!, geminiModel: process.env.GEMINI_MODEL!,
    geminiTimeoutMs: Number(process.env.GEMINI_TIMEOUT_MS ?? 120000),
    ttlHours: Number(process.env.CASE_TTL_HOURS ?? 24),
    rateWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000), rateMax: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 10)
  };
}
