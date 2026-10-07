export async function up(client: any): Promise<void> {
  // 1. AI Preferences
  await client.query(`
    CREATE TABLE IF NOT EXISTS ai_preferences (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
      recommendations_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      assistant_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      learning_insights_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      weekly_summary_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 2. AI Conversations
  await client.query(`
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 3. AI Messages
  await client.query(`
    CREATE TABLE IF NOT EXISTS ai_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      sources JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 4. AI Usage & Observability
  await client.query(`
    CREATE TABLE IF NOT EXISTS ai_usage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      member_id UUID REFERENCES members(id) ON DELETE SET NULL,
      feature VARCHAR(50) NOT NULL,
      provider VARCHAR(50) NOT NULL,
      model VARCHAR(100) NOT NULL,
      input_tokens INT DEFAULT 0,
      output_tokens INT DEFAULT 0,
      latency_ms INT DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
      estimated_cost NUMERIC(10, 6) DEFAULT 0.0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 5. Indexes for Fast Lookups and Isolation
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_ai_pref_member ON ai_preferences(member_id);
    CREATE INDEX IF NOT EXISTS idx_ai_conv_member ON ai_conversations(member_id);
    CREATE INDEX IF NOT EXISTS idx_ai_msg_conv ON ai_messages(conversation_id, created_at ASC);
    CREATE INDEX IF NOT EXISTS idx_ai_usage_member ON ai_usage(member_id);
    CREATE INDEX IF NOT EXISTS idx_ai_usage_feature ON ai_usage(feature);
    CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage(created_at DESC);
  `);
}

export async function down(client: any): Promise<void> {
  await client.query(`
    DROP TABLE IF EXISTS ai_usage CASCADE;
    DROP TABLE IF EXISTS ai_messages CASCADE;
    DROP TABLE IF EXISTS ai_conversations CASCADE;
    DROP TABLE IF EXISTS ai_preferences CASCADE;
  `);
}
