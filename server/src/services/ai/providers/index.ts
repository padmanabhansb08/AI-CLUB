import { config } from '../../../config';
import { AIProvider } from '../../../types/ai';
import { MockAIProvider } from './mockProvider';
import { OpenAIProvider } from './openAIProvider';

export class AIProviderFactory {
  private static instance: AIProvider | null = null;
  public static mockInstance = new MockAIProvider();

  public static getProvider(): AIProvider {
    if (this.instance) return this.instance;

    if (config.AI_PROVIDER === 'openai' && config.AI_API_KEY && config.AI_API_KEY.trim() !== '') {
      this.instance = new OpenAIProvider(config.AI_API_KEY, config.AI_MODEL);
    } else {
      this.instance = this.mockInstance;
    }

    return this.instance;
  }

  public static setCustomProvider(custom: AIProvider | null) {
    this.instance = custom;
  }
}

export const getAIProvider = () => AIProviderFactory.getProvider();
