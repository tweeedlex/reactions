import { Controller, Post, Get, Body, Query, Logger } from '@nestjs/common';
import { UrlParsingService, ParseUrlDto } from './url-parsing.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

@Controller('url-parsing')
export class UrlParsingController {
  private readonly logger = new Logger(UrlParsingController.name);

  constructor(private readonly urlParsingService: UrlParsingService) {}

  @Post('parse')
  async parseUrl(@Body() parseUrlDto: ParseUrlDto): Promise<{ 
    comments: CreateCommentDto[]; 
    count: number; 
    type: string; 
    identifier: string;
    success: boolean;
    message: string;
  }> {
    this.logger.log(`🚀 Парсинг URL через serper.dev: ${parseUrlDto.url}`);

    try {
      const result = await this.urlParsingService.parseUrl(parseUrlDto);
      
      this.logger.log(`✅ Успішно спарсено ${result.count} коментарів`);
      return {
        ...result,
        success: true,
        message: `Парсинг завершено успішно. Напарсено ${result.count} коментарів`
      };
    } catch (error) {
      this.logger.error(`❌ Помилка парсингу URL: ${error.message}`);
      return {
        comments: [],
        count: 0,
        type: 'unknown',
        identifier: '',
        success: false,
        message: error.message
      };
    }
  }

  @Get('parse')
  async parseUrlGet(
    @Query('url') url: string,
    @Query('language') language?: string,
    @Query('sortBy') sortBy?: string
  ): Promise<{ 
    comments: CreateCommentDto[]; 
    count: number; 
    type: string; 
    identifier: string;
    success: boolean;
    message: string;
  }> {
    this.logger.log(`🚀 GET Парсинг URL через serper.dev: ${url}`);

    if (!url) {
      return {
        comments: [],
        count: 0,
        type: 'unknown',
        identifier: '',
        success: false,
        message: 'URL є обов\'язковим параметром'
      };
    }

    const parseUrlDto: ParseUrlDto = {
      url,
      language: language || 'uk',
      sortBy: sortBy || 'newest'
    };

    return await this.parseUrl(parseUrlDto);
  }

  @Get('test-connection')
  async testConnection(): Promise<{ success: boolean; message: string }> {
    this.logger.log('🔧 Тестування підключення до serper.dev');
    
    try {
      const result = await this.urlParsingService.testConnection();
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
