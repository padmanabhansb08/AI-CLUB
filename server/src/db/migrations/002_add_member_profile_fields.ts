import { PoolClient } from 'pg';

export async function up(client: PoolClient) {
  await client.query(`
    ALTER TABLE members
    ADD COLUMN bio TEXT,
    ADD COLUMN github_url VARCHAR(1000),
    ADD COLUMN linkedin_url VARCHAR(1000),
    ADD COLUMN portfolio_url VARCHAR(1000),
    ADD COLUMN technical_interests TEXT[],
    ADD COLUMN skills TEXT[];
  `);
}

export async function down(client: PoolClient) {
  await client.query(`
    ALTER TABLE members
    DROP COLUMN IF EXISTS bio,
    DROP COLUMN IF EXISTS github_url,
    DROP COLUMN IF EXISTS linkedin_url,
    DROP COLUMN IF EXISTS portfolio_url,
    DROP COLUMN IF EXISTS technical_interests,
    DROP COLUMN IF EXISTS skills;
  `);
}
