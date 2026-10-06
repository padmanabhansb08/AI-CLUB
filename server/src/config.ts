import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // Sprint 8: AI Intelligence Configuration & Feature Flags
  AI_PROVIDER: z.enum(['mock', 'local', 'openai', 'anthropic']).default('mock'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().default('gpt-4o-mini'),
  AI_EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),
  AI_MAX_TOKENS: z.coerce.number().default(1000),
  AI_TEMPERATURE: z.coerce.number().default(0.7),
  AI_TIMEOUT_MS: z.coerce.number().default(15000),
  AI_ENABLED: z.coerce.boolean().default(true),
  AI_RECOMMENDATIONS_ENABLED: z.coerce.boolean().default(true),
  AI_ASSISTANT_ENABLED: z.coerce.boolean().default(true),
  AI_SKILL_ANALYSIS_ENABLED: z.coerce.boolean().default(true),
  AI_ADMIN_INSIGHTS_ENABLED: z.coerce.boolean().default(true),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(_env.error.format());
  process.exit(1);
}

export const config = _env.data;
