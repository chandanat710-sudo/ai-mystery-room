import dotenv from 'dotenv';
import path from 'node:path';
import { isIP } from 'node:net';

// Local workspace scripts load configuration from the monorepo root. On hosted
// platforms, credentials are supplied directly as process environment values.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export function getEnv() {
  const required = ['MONGODB_URI', 'GEMINI_API_KEY', 'GEMINI_MODEL'] as const;
  const absent = required.filter((key) => !process.env[key] || process.env[key]?.startsWith('replace_'));
  if (absent.length) throw new Error(`Missing required environment configuration: ${absent.join(', ')}. Set these values in .env.`);
  const mongoDnsServers = (process.env.MONGODB_DNS_SERVERS ?? '').split(',').map((entry) => entry.trim()).filter(Boolean);
  if (mongoDnsServers.some((server) => isIP(server) === 0)) throw new Error('MONGODB_DNS_SERVERS must be a comma-separated list of DNS server IP addresses.');
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 5000),
    clientOrigin: process.env.CLIENT_ORIGIN,
    mongoUri: process.env.MONGODB_URI!, mongoDnsServers, geminiApiKey: process.env.GEMINI_API_KEY!, geminiModel: process.env.GEMINI_MODEL!,
    geminiTimeoutMs: Number(process.env.GEMINI_TIMEOUT_MS ?? 120000),
    ttlHours: Number(process.env.CASE_TTL_HOURS ?? 24),
    rateWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000), rateMax: Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 10)
  };
}
