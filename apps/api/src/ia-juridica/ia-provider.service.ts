import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

type ProviderAskResult = {
  text: string;
  mode: 'anthropic' | 'openai' | 'local';
};

@Injectable()
export class IaProviderService {
  private readonly logger = new Logger(IaProviderService.name);
  private readonly anthropic: Anthropic | null;
  private readonly openai: OpenAI | null;

  constructor() {
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    this.anthropic = anthropicApiKey ? new Anthropic({ apiKey: anthropicApiKey }) : null;

    const openAiApiKey = process.env.OPENAI_API_KEY;
    this.openai = openAiApiKey ? new OpenAI({ apiKey: openAiApiKey }) : null;
  }

  getMode(): 'anthropic' | 'openai' | 'local' {
    if (this.anthropic) {
      return 'anthropic';
    }

    return this.openai ? 'openai' : 'local';
  }

  private getAnthropicModel(): string {
    return process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
  }

  private getOpenAiModel(): string {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  async ask(systemPrompt: string, userPrompt: string, fallback: string): Promise<ProviderAskResult> {
    if (this.anthropic) {
      try {
        const response = await this.anthropic.messages.create({
          model: this.getAnthropicModel(),
          max_tokens: 1200,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        });

        const text = response.content
          .filter((item) => item.type === 'text')
          .map((item) => item.text)
          .join('\n')
          .trim();

        if (text.length > 0) {
          this.logger.log(`IA provider=anthropic model=${this.getAnthropicModel()} mode=anthropic`);
          return { text, mode: 'anthropic' };
        }

        this.logger.warn(`IA provider=anthropic model=${this.getAnthropicModel()} mode=local reason=empty_response`);
        return { text: fallback, mode: 'local' };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown_error';
        this.logger.warn(`IA provider=anthropic model=${this.getAnthropicModel()} mode=local reason=exception:${message}`);
        return { text: fallback, mode: 'local' };
      }
    }

    if (!this.openai) {
      this.logger.warn('IA provider=local model=none mode=local reason=no_provider_key');
      return { text: fallback, mode: 'local' };
    }

    try {
      const completion = await this.openai.responses.create({
        model: this.getOpenAiModel(),
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const text = completion.output_text?.trim();
      if (text && text.length > 0) {
        this.logger.log(`IA provider=openai model=${this.getOpenAiModel()} mode=openai`);
        return { text, mode: 'openai' };
      }

      this.logger.warn(`IA provider=openai model=${this.getOpenAiModel()} mode=local reason=empty_response`);
      return { text: fallback, mode: 'local' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown_error';
      this.logger.warn(`IA provider=openai model=${this.getOpenAiModel()} mode=local reason=exception:${message}`);
      return { text: fallback, mode: 'local' };
    }
  }
}