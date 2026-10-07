import type { PoolClient } from 'pg';
export async function up(client: PoolClient) {
  await client.query(`
    ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN session_version INTEGER NOT NULL DEFAULT 0;
    CREATE TABLE account_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      purpose TEXT NOT NULL CHECK (purpose IN ('reset', 'verify')),
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX account_tokens_user_purpose ON account_tokens(user_id, purpose);
  `);
}
export async function down(client: PoolClient) {
  await client.query('DROP TABLE IF EXISTS account_tokens; ALTER TABLE users DROP COLUMN IF EXISTS email_verified_at, DROP COLUMN IF EXISTS session_version;');
}
