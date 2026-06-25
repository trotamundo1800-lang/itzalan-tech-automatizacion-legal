import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

type ProviderAskResult = {
  text: string;
  mode: 'openai' | 'local';
};

@Injectable()
export class IaProviderService {
  private readonly logger = new Logger(IaProviderService.name);
  private readonly openai: OpenAI | null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    this.openai = apiKey ? new OpenAI({ apiKey }) : null;
  }

  getMode(): 'openai' | 'local' {
    return this.openai ? 'openai' : 'local';
  }

  getModel(): string {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async ask(systemPrompt: string, userPrompt: string, fallback: string): Promise<ProviderAskResult> {
    if (!this.openai) {
      this.logger.warn('IA provider=local model=none mode=local reason=no_api_key');
      return { text: fallback, mode: 'local' };
    }

    try {
      const completion = await this.openai.responses.create({
        model: this.getModel(),
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const text = completion.output_text?.trim();
      if (text && text.length > 0) {
        this.logger.log(`IA provider=openai model=${this.getModel()} mode=openai`);
        return { text, mode: 'openai' };
      }

      this.logger.warn(`IA provider=openai model=${this.getModel()} mode=local reason=empty_response`);
      return { text: fallback, mode: 'local' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown_error';
      this.logger.warn(`IA provider=openai model=${this.getModel()} mode=local reason=exception:${message}`);
      return { text: fallback, mode: 'local' };
    }
  }
}