import { registerAs } from '@nestjs/config';

/** Redis connection shared by BullMQ queues (TECH_ARCHITECTURE §5). */
export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD || undefined,
}));
