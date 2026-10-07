import { AIProvider, AIGenerateOptions, AITextResponse, AIStructuredResponse } from '../../../types/ai';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
  }

  async generateText(prompt: string, options: AIGenerateOptions = {}): Promise<AITextResponse> {
    const startTime = Date.now();
    const model = options.model || this.defaultModel;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 15000);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1000,
          messages: [
            ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API request failed: HTTP ${response.status} — ${errorText}`);
      }

      const data: any = await response.json();
      const latencyMs = Date.now() - startTime;
      const text = data.choices?.[0]?.message?.content || '';
      const inputTokens = data.usage?.prompt_tokens || Math.round(prompt.length / 4);
      const outputTokens = data.usage?.completion_tokens || Math.round(text.length / 4);

      return {
        text,
        inputTokens,
        outputTokens,
        latencyMs,
        provider: 'openai',
        model,
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateStructuredOutput<T>(
    prompt: string,
    schemaDescription: string,
    options: AIGenerateOptions = {}
  ): Promise<AIStructuredResponse<T>> {
    const systemPrompt = `${options.systemPrompt || ''}\nYou MUST reply ONLY with valid JSON conforming to: ${schemaDescription}. Do not include markdown codeblocks.`;
    const res = await this.generateText(prompt, { ...options, systemPrompt });

    let parsed: T;
    try {
      const cleaned = res.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(`Failed to parse structured model response: ${res.text.slice(0, 100)}...`);
    }

    return {
      data: parsed,
      inputTokens: res.inputTokens,
      outputTokens: res.outputTokens,
      latencyMs: res.latencyMs,
      provider: 'openai',
      model: res.model,
    };
  }

  async embedText(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI Embedding request failed: HTTP ${response.status}`);
    }

    const data: any = await response.json();
    return data.data?.[0]?.embedding || [];
  }
}
