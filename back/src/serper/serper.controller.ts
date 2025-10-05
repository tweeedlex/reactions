import { Controller, Post, Body, Get, Query, Logger } from '@nestjs/common';
import { SerperService } from './serper.service';
import { SerperReviewsDto, SerperReviewsResponse } from './dto/serper-reviews.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

@Controller('serper')
export class SerperController {
  private readonly logger = new Logger(SerperController.name);

  constructor(private readonly serperService: SerperService) {}

  @Post('reviews')
  async getGoogleMapsReviews(
    @Body() serperReviewsDto: SerperReviewsDto
  ): Promise<SerperReviewsResponse> {
    this.logger.log(`🔍 Запит відгуків Google Maps для placeId: ${serperReviewsDto.placeId}`);
    
    try {
      const response = await this.serperService.getGoogleMapsReviews(
        serperReviewsDto.placeId,
        serperReviewsDto
      );
      
      this.logger.log(`✅ Успішно отримано ${response.reviews.length} відгуків`);
      return response;
    } catch (error) {
      this.logger.error(`❌ Помилка отримання відгуків: ${error.message}`);
      throw error;
    }
  }

  @Post('parse-reviews')
  async parseGoogleMapsReviews(
    @Body() serperReviewsDto: SerperReviewsDto
  ): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`🚀 Парсинг відгуків Google Maps для placeId: ${serperReviewsDto.placeId}`);
    
    try {
      const comments = await this.serperService.parseGoogleMapsReviews(
        serperReviewsDto.placeId,
        serperReviewsDto
      );
      
      this.logger.log(`✅ Успішно спарсено ${comments.length} коментарів`);
      return {
        comments,
        count: comments.length
      };
    } catch (error) {
      this.logger.error(`❌ Помилка парсингу відгуків: ${error.message}`);
      throw error;
    }
  }

  @Get('test-connection')
  async testConnection(): Promise<{ success: boolean; message: string }> {
    this.logger.log('🔧 Тестування підключення до serper.dev');
    
    try {
      const success = await this.serperService.testConnection();
      
      if (success) {
        this.logger.log('✅ Підключення до serper.dev успішне');
        return {
          success: true,
          message: 'Підключення до serper.dev успішне'
        };
      } else {
        this.logger.warn('❌ Підключення до serper.dev невдале');
        return {
          success: false,
          message: 'Підключення до serper.dev невдале. Перевірте API ключ.'
        };
      }
    } catch (error) {
      this.logger.error(`❌ Помилка тестування підключення: ${error.message}`);
      return {
        success: false,
        message: `Помилка тестування підключення: ${error.message}`
      };
    }
  }

  @Get('reviews')
  async getReviewsByPlaceId(
    @Query('placeId') placeId: string,
    @Query('hl') hl?: string,
    @Query('sortBy') sortBy?: string,
    @Query('nextPageToken') nextPageToken?: string
  ): Promise<SerperReviewsResponse> {
    this.logger.log(`🔍 GET запит відгуків для placeId: ${placeId}`);
    
    if (!placeId) {
      throw new Error('placeId є обов\'язковим параметром');
    }

    const options: Partial<SerperReviewsDto> = {
      hl: hl || 'uk',
      sortBy: sortBy as any || 'newest',
      nextPageToken
    };

    try {
      const response = await this.serperService.getGoogleMapsReviews(placeId, options);
      
      this.logger.log(`✅ Успішно отримано ${response.reviews.length} відгуків через GET`);
      return response;
    } catch (error) {
      this.logger.error(`❌ Помилка отримання відгуків через GET: ${error.message}`);
      throw error;
    }
  }

  @Post('parse-universal')
  async parseUniversal(
    @Query('source') source: string,
    @Query('identifier') identifier: string,
    @Query('language') language?: string
  ): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`🔧 Універсальний парсинг через serper.dev: ${source} для ${identifier}`);

    try {
      const comments = await this.serperService.parseReviews(source as any, identifier, {
        language: language || 'uk'
      });

      this.logger.log(`✅ Успішно спарсено ${comments.length} коментарів`);
      return {
        comments,
        count: comments.length
      };
    } catch (error) {
      this.logger.error(`❌ Помилка універсального парсингу: ${error.message}`);
      throw error;
    }
  }

  @Get('sources')
  async getAvailableSources(): Promise<{ source: string; name: string; description: string; supported: boolean }[]> {
    this.logger.log('📋 Отримання доступних джерел serper.dev');
    
    try {
      const sources = await this.serperService.getAvailableSources();
      this.logger.log(`✅ Знайдено ${sources.length} джерел`);
      return sources;
    } catch (error) {
      this.logger.error(`❌ Помилка отримання джерел: ${error.message}`);
      throw error;
    }
  }
}
