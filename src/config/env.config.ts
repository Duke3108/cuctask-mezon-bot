import * as dotenv from 'dotenv';

const ENV = process.env.ENV;
export const envFilePath = `.env.${ENV ?? 'local'}`;

dotenv.config({ path: envFilePath });

export default () => ({
  POSTGRES_HOST: process.env.POSTGRES_HOST || '',
  POSTGRES_PORT: process.env.POSTGRES_PORT || 5432,
  POSTGRES_USER: process.env.POSTGRES_USER || '',
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || '',
  POSTGRES_DB: process.env.POSTGRES_DB || '',
  MEZON_TOKEN: process.env.MEZON_TOKEN || '',
  MEZON_BOT_ID: process.env.MEZON_BOT_ID || '',
  MEZON_HOST: process.env.MEZON_HOST || 'gw.mezon.ai',
  MEZON_PORT: process.env.MEZON_PORT || '443',
  MEZON_USE_SSL: process.env.MEZON_USE_SSL === 'true' || true,
  MEZON_TIMEOUT: Number(process.env.MEZON_TIMEOUT) || 7000,
});
