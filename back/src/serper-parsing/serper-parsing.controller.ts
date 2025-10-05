import { Controller, Post, Get, Body, Query, Logger } from '@nestjs/common';
import { SerperParsingService, ParsingType } from './serper-parsing.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

export class ParsingRequestDto {
  type: ParsingType;
  identifier: string;
  language?: string;
  sortBy?: string;
  maxPages?: number;
}

@Controller('serper-parsing')
export class SerperParsingController {
  private readonly logger = new Logger(SerperParsingController.name);

  constructor(private readonly serperParsingService: SerperParsingService) {}

  @Post('parse')
  async parseReviews(@Body() request: ParsingRequestDto): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`🚀 Парсинг відгуків через serper.dev: ${request.type} для ${request.identifier}`);

    try {
      const result = await this.serperParsingService.parseReviews(request);
      
      this.logger.log(`✅ Успішно спарсено ${result.count} коментарів`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Помилка парсингу: ${error.message}`);
      throw error;
    }
  }

  @Get('google-maps')
  async parseGoogleMaps(
    @Query('placeId') placeId: string,
    @Query('language') language?: string,
    @Query('sortBy') sortBy?: string
  ): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`📍 Парсинг Google Maps: ${placeId}`);

    const request: ParsingRequestDto = {
      type: ParsingType.GOOGLE_MAPS,
      identifier: placeId,
      language: language || 'uk',
      sortBy: sortBy || 'newest'
    };

    return await this.parseReviews(request);
  }

  @Get('google-play')
  async parseGooglePlay(
    @Query('appId') appId: string,
    @Query('language') language?: string
  ): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`📱 Парсинг Google Play Store: ${appId}`);

    const request: ParsingRequestDto = {
      type: ParsingType.GOOGLE_PLAY,
      identifier: appId,
      language: language || 'uk'
    };

    return await this.parseReviews(request);
  }

  @Get('app-store')
  async parseAppStore(
    @Query('appId') appId: string,
    @Query('language') language?: string
  ): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`🍎 Парсинг App Store: ${appId}`);

    const request: ParsingRequestDto = {
      type: ParsingType.APP_STORE,
      identifier: appId,
      language: language || 'uk'
    };

    return await this.parseReviews(request);
  }

  @Get('google-search')
  async parseGoogleSearch(
    @Query('query') query: string,
    @Query('language') language?: string
  ): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`🔍 Парсинг через Google Search: ${query}`);

    const request: ParsingRequestDto = {
      type: ParsingType.GOOGLE_SEARCH,
      identifier: query,
      language: language || 'uk'
    };

    return await this.parseReviews(request);
  }

  @Get('types')
  async getAvailableTypes(): Promise<{ type: ParsingType; name: string; description: string; supported: boolean }[]> {
    this.logger.log('📋 Отримання доступних типів парсингу');
    
    try {
      const types = await this.serperParsingService.getAvailableTypes();
      this.logger.log(`✅ Знайдено ${types.length} типів`);
      return types;
    } catch (error) {
      this.logger.error(`❌ Помилка отримання типів: ${error.message}`);
      throw error;
    }
  }

  @Get('test-connection')
  async testConnection(): Promise<{ success: boolean; message: string }> {
    this.logger.log('🔧 Тестування підключення до serper.dev');
    
    try {
      const result = await this.serperParsingService.testConnection();
      this.logger.log(`✅ Тест підключення: ${result.success ? 'успішний' : 'невдалий'}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Помилка тестування: ${error.message}`);
      return {
        success: false,
        message: `Помилка тестування: ${error.message}`
      };
    }
  }
}
