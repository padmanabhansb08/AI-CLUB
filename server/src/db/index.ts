import { Pool } from 'pg';
import { config } from '../config';

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
