import mongoose from 'mongoose';
import dns from 'node:dns';
import { getEnv } from './config/env';
import { createApp } from './app';

async function start() {
  const env = getEnv();
  if (env.mongoDnsServers.length) dns.setServers(env.mongoDnsServers);
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
  await mongoose.model('MysteryCase').syncIndexes();
  createApp(env.clientOrigin).listen(env.port, () => console.log(`AI Mystery Room API listening on port ${env.port}`));
}
start().catch((error: unknown) => { console.error('Server startup failed:', error instanceof Error ? error.message : 'unknown error'); process.exit(1); });
