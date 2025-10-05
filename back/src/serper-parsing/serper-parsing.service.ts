import { Injectable, Logger } from '@nestjs/common';
import { SerperService, SerperSource } from '../serper/serper.service';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

export enum ParsingType {
  GOOGLE_MAPS = 'google_maps',
  GOOGLE_PLAY = 'google_play',
  APP_STORE = 'app_store',
  GOOGLE_SEARCH = 'google_search'
}

export interface ParsingRequest {
  type: ParsingType;
  identifier: string; // Place ID, App ID, URL, etc.
  language?: string;
  sortBy?: string;
  maxPages?: number;
}

@Injectable()
export class SerperParsingService {
  private readonly logger = new Logger(SerperParsingService.name);

  constructor(
    private readonly serperService: SerperService,
    private readonly commentsService: CommentsService,
  ) {}

  async parseReviews(request: ParsingRequest): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`🚀 Парсинг відгуків через serper.dev: ${request.type} для ${request.identifier}`);

    try {
      let comments: CreateCommentDto[] = [];

      switch (request.type) {
        case ParsingType.GOOGLE_MAPS:
          comments = await this.parseGoogleMapsReviews(request);
          break;
        
        case ParsingType.GOOGLE_PLAY:
          comments = await this.parseGooglePlayReviews(request);
          break;
        
        case ParsingType.APP_STORE:
          comments = await this.parseAppStoreReviews(request);
          break;
        
        case ParsingType.GOOGLE_SEARCH:
          comments = await this.parseGoogleSearchReviews(request);
          break;
        
        default:
          throw new Error(`Непідтримуваний тип парсингу: ${request.type}`);
      }

      this.logger.log(`✅ Успішно спарсено ${comments.length} коментарів`);
      return {
        comments,
        count: comments.length
      };

    } catch (error) {
      this.logger.error(`❌ Помилка парсингу: ${error.message}`);
      throw error;
    }
  }

  private async parseGoogleMapsReviews(request: ParsingRequest): Promise<CreateCommentDto[]> {
    this.logger.log(`📍 Парсинг Google Maps відгуків для ${request.identifier}`);

    try {
      const comments = await this.serperService.parseGoogleMapsReviews(request.identifier, {
        hl: request.language || 'uk',
        sortBy: request.sortBy as any || 'newest'
      });

      // Зберігаємо коментарі в базу даних
      if (comments.length > 0) {
        // Видаляємо старі коментарі для цього місця
        const deletedResult = await this.commentsService.clearByAppId(request.identifier);
        this.logger.log(`Видалено ${deletedResult.deletedCount} старих коментарів для ${request.identifier}`);
        
        // Додаємо нові коментарі
        await this.commentsService.bulkCreate(comments);
        this.logger.log(`Збережено ${comments.length} нових коментарів Google Maps`);
      }

      return comments;

    } catch (error) {
      this.logger.error(`❌ Помилка парсингу Google Maps: ${error.message}`);
      throw error;
    }
  }

  private async parseGooglePlayReviews(request: ParsingRequest): Promise<CreateCommentDto[]> {
    this.logger.log(`📱 Парсинг Google Play Store відгуків для ${request.identifier}`);

    try {
      const comments = await this.serperService.parseGooglePlayReviews(request.identifier, {
        language: request.language || 'uk'
      });

      // Зберігаємо коментарі в базу даних
      if (comments.length > 0) {
        // Видаляємо старі коментарі для цього додатку
        const deletedResult = await this.commentsService.clearByAppId(request.identifier);
        this.logger.log(`Видалено ${deletedResult.deletedCount} старих коментарів для ${request.identifier}`);
        
        // Додаємо нові коментарі
        await this.commentsService.bulkCreate(comments);
        this.logger.log(`Збережено ${comments.length} нових коментарів Google Play Store`);
      }

      return comments;

    } catch (error) {
      this.logger.error(`❌ Помилка парсингу Google Play Store: ${error.message}`);
      throw error;
    }
  }

  private async parseAppStoreReviews(request: ParsingRequest): Promise<CreateCommentDto[]> {
    this.logger.log(`🍎 Парсинг App Store відгуків для ${request.identifier}`);

    try {
      const comments = await this.serperService.parseAppStoreReviews(request.identifier, {
        language: request.language || 'uk'
      });

      // Зберігаємо коментарі в базу даних
      if (comments.length > 0) {
        // Видаляємо старі коментарі для цього додатку
        const deletedResult = await this.commentsService.clearByAppId(request.identifier);
        this.logger.log(`Видалено ${deletedResult.deletedCount} старих коментарів для ${request.identifier}`);
        
        // Додаємо нові коментарі
        await this.commentsService.bulkCreate(comments);
        this.logger.log(`Збережено ${comments.length} нових коментарів App Store`);
      }

      return comments;

    } catch (error) {
      this.logger.error(`❌ Помилка парсингу App Store: ${error.message}`);
      throw error;
    }
  }

  private async parseGoogleSearchReviews(request: ParsingRequest): Promise<CreateCommentDto[]> {
    this.logger.log(`🔍 Парсинг відгуків через Google Search для ${request.identifier}`);

    try {
      const comments = await this.serperService.parseGoogleSearchReviews(request.identifier, {
        language: request.language || 'uk'
      });

      // Зберігаємо коментарі в базу даних
      if (comments.length > 0) {
        // Видаляємо старі коментарі для цього запиту
        const deletedResult = await this.commentsService.clearByAppId(request.identifier);
        this.logger.log(`Видалено ${deletedResult.deletedCount} старих коментарів для ${request.identifier}`);
        
        // Додаємо нові коментарі
        await this.commentsService.bulkCreate(comments);
        this.logger.log(`Збережено ${comments.length} нових коментарів Google Search`);
      }

      return comments;

    } catch (error) {
      this.logger.error(`❌ Помилка парсингу Google Search: ${error.message}`);
      throw error;
    }
  }

  async getAvailableTypes(): Promise<{ type: ParsingType; name: string; description: string; supported: boolean }[]> {
    return [
      {
        type: ParsingType.GOOGLE_MAPS,
        name: 'Google Maps',
        description: 'Відгуки з Google Maps через serper.dev API',
        supported: true
      },
      {
        type: ParsingType.GOOGLE_PLAY,
        name: 'Google Play Store',
        description: 'Відгуки з Google Play Store через serper.dev',
        supported: true
      },
      {
        type: ParsingType.APP_STORE,
        name: 'App Store',
        description: 'Відгуки з App Store через serper.dev',
        supported: true
      },
      {
        type: ParsingType.GOOGLE_SEARCH,
        name: 'Google Search',
        description: 'Пошук відгуків через Google Search API',
        supported: true
      }
    ];
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const success = await this.serperService.testConnection();
      
      if (success) {
        return {
          success: true,
          message: 'Підключення до serper.dev успішне'
        };
      } else {
        return {
          success: false,
          message: 'Підключення до serper.dev невдале. Перевірте API ключ.'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Помилка тестування підключення: ${error.message}`
      };
    }
  }
}
