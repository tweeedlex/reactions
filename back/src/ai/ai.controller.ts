import { Controller, Post, Body } from '@nestjs/common';
import { AIService, AIResponse } from './ai.service';

interface GenerateResponseDto {
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  source: string;
  author: string;
  category: string;
}

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('generate-response')
  async generateResponse(@Body() dto: GenerateResponseDto): Promise<AIResponse> {
    return this.aiService.generateQuickResponse(dto);
  }
}
