import { AIProvider, AIGenerateOptions, AITextResponse, AIStructuredResponse } from '../../../types/ai';

export class MockAIProvider implements AIProvider {
  private simulateFailure = false;
  private simulateRateLimit = false;
  private simulateTimeout = false;
  private simulateMalformed = false;

  public setSimulateFailure(fail: boolean) {
    this.simulateFailure = fail;
  }

  public setSimulateRateLimit(rateLimit: boolean) {
    this.simulateRateLimit = rateLimit;
  }

  public setSimulateTimeout(timeout: boolean) {
    this.simulateTimeout = timeout;
  }

  public setSimulateMalformed(malformed: boolean) {
    this.simulateMalformed = malformed;
  }

  async generateText(prompt: string, options: AIGenerateOptions = {}): Promise<AITextResponse> {
    const startTime = Date.now();

    if (this.simulateFailure) {
      throw new Error('AI Provider upstream service unavailable');
    }
    if (this.simulateRateLimit) {
      throw new Error('AI Provider rate limit exceeded (429)');
    }
    if (this.simulateTimeout) {
      throw new Error('AI Provider request timed out');
    }

    // Grounded mock logic based on prompt keywords
    let responseText = 'I am the AI CLUB assistant. How can I help you explore courses, events, and projects?';

    const lower = prompt.toLowerCase();
    if (lower.includes('course') || lower.includes('learn') || lower.includes('study')) {
      responseText = 'Based on the AI CLUB curriculum, I recommend exploring our machine learning and deep learning paths. We have structured modules with interactive lessons.';
    } else if (lower.includes('event') || lower.includes('workshop') || lower.includes('hackathon')) {
      responseText = 'AI CLUB organizes regular technical workshops and guest lectures. Check out our upcoming events to collaborate and build together.';
    } else if (lower.includes('project') || lower.includes('team') || lower.includes('collaborat')) {
      responseText = 'You can collaborate on active AI CLUB projects or form a team to build solutions in computer vision, generative AI, and NLP.';
    } else if (lower.includes('quantum') || lower.includes('nonexistent') || lower.includes('invalid_course')) {
      responseText = "I couldn't find a matching AI CLUB course or entity for that topic in our current directory.";
    }

    const latencyMs = Math.max(Date.now() - startTime, 5);
    const inputTokens = Math.max(Math.round(prompt.length / 4), 10);
    const outputTokens = Math.max(Math.round(responseText.length / 4), 15);

    return {
      text: responseText,
      inputTokens,
      outputTokens,
      latencyMs,
      provider: 'mock',
      model: options.model || 'mock-gpt-4o',
    };
  }

  async generateStructuredOutput<T>(
    prompt: string,
    schemaDescription: string,
    options: AIGenerateOptions = {}
  ): Promise<AIStructuredResponse<T>> {
    const startTime = Date.now();

    if (this.simulateFailure) {
      throw new Error('AI Provider upstream service unavailable');
    }
    if (this.simulateRateLimit) {
      throw new Error('AI Provider rate limit exceeded (429)');
    }
    if (this.simulateTimeout) {
      throw new Error('AI Provider request timed out');
    }
    if (this.simulateMalformed) {
      return {
        data: 'malformed non-object string' as unknown as T,
        inputTokens: 50,
        outputTokens: 10,
        latencyMs: 10,
        provider: 'mock',
        model: 'mock-gpt-4o',
      };
    }

    // Parse prompt context if JSON was embedded
    let parsedData: any = {};

    if (schemaDescription.includes('recommendations')) {
      parsedData = {
        explanations: [
          'Directly matches your documented interest in Generative AI.',
          'Builds sequentially on your completed foundations.',
        ],
        confidenceScore: 0.92,
      };
    } else if (schemaDescription.includes('skillGap')) {
      parsedData = {
        summary: 'Target role requires deeper experience in generative models and model evaluation.',
        developingSkills: ['Neural Networks', 'PyTorch'],
        missingSkills: ['RAG Architectures', 'Vector Databases', 'Prompt Optimization'],
      };
    } else if (schemaDescription.includes('learningPath')) {
      parsedData = {
        summary: 'A structured roadmap bridging foundational machine learning to generative AI applications.',
        estimatedWeeks: 8,
      };
    } else if (schemaDescription.includes('adminInsights')) {
      parsedData = {
        summary: 'Platform engagement remains strong with notable acceleration in event attendance and project formations.',
        observations: [
          'High conversion from event registrations to attendance (above 70%).',
          'Course enrollment is trending upward while completion rates could benefit from progress reminders.',
        ],
        areasToInvestigate: [
          'Identify lessons with high drop-off rates in foundational courses.',
          'Support project teams that have reached capacity but have pending membership requests.',
        ],
      };
    } else {
      parsedData = { success: true };
    }

    const latencyMs = Math.max(Date.now() - startTime, 10);
    const inputTokens = Math.max(Math.round((prompt.length + schemaDescription.length) / 4), 20);
    const outputTokens = Math.max(Math.round(JSON.stringify(parsedData).length / 4), 25);

    return {
      data: parsedData as T,
      inputTokens,
      outputTokens,
      latencyMs,
      provider: 'mock',
      model: options.model || 'mock-gpt-4o',
    };
  }

  async embedText(text: string): Promise<number[]> {
    // Generate deterministic 64-dimensional mock embedding vector
    const vector: number[] = [];
    for (let i = 0; i < 64; i++) {
      let code = text.charCodeAt(i % text.length) || 42;
      vector.push(parseFloat(((code * (i + 1)) % 100 / 100).toFixed(4)));
    }
    return vector;
  }
}
