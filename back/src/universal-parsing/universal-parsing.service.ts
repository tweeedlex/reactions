import { Injectable, Logger } from '@nestjs/common';
import { SerperService, SerperSource } from '../serper/serper.service';
import { SerpApiService } from '../serpapi/serpapi.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

export enum ParsingSource {
  GOOGLE_MAPS = 'google_maps',
  GOOGLE_PLAY = 'google_play',
  APP_STORE = 'app_store',
  GOOGLE_SEARCH = 'google_search',
  SERPER_DEV = 'serper_dev'
}

export interface ParsingOptions {
  source: ParsingSource;
  identifier: string; // Place ID, App ID, URL, etc.
  language?: string;
  sortBy?: string;
  maxPages?: number;
  useSerper?: boolean; // Використовувати serper.dev для Google Maps
}

@Injectable()
export class UniversalParsingService {
  private readonly logger = new Logger(UniversalParsingService.name);

  constructor(
    private readonly serperService: SerperService,
    private readonly serpApiService: SerpApiService,
  ) {}

  async parseReviews(options: ParsingOptions): Promise<CreateCommentDto[]> {
    this.logger.log(`🚀 Універсальний парсинг відгуків з ${options.source} для ${options.identifier}`);

    try {
      // За замовчуванням використовуємо serper.dev для всіх джерел
      switch (options.source) {
        case ParsingSource.GOOGLE_MAPS:
          return await this.parseGoogleMapsReviews(options);
        
        case ParsingSource.GOOGLE_PLAY:
          return await this.parseGooglePlayReviews(options);
        
        case ParsingSource.APP_STORE:
          return await this.parseAppStoreReviews(options);
        
        case ParsingSource.GOOGLE_SEARCH:
          return await this.parseGoogleSearchReviews(options);
        
        case ParsingSource.SERPER_DEV:
          return await this.parseWithSerperDev(options);
        
        default:
          throw new Error(`Непідтримуване джерело: ${options.source}`);
      }
    } catch (error) {
      this.logger.error(`❌ Помилка парсингу з ${options.source}: ${error.message}`);
      
      // Fallback до SerpAPI тільки для Google Maps
      if (options.source === ParsingSource.GOOGLE_MAPS) {
        this.logger.log(`🔄 Fallback до SerpAPI для ${options.source}`);
        return await this.parseWithSerpApiFallback(options);
      }
      
      throw error;
    }
  }

  private async parseGoogleMapsReviews(options: ParsingOptions): Promise<CreateCommentDto[]> {
    this.logger.log(`📍 Парсинг Google Maps відгуків для ${options.identifier}`);

    // За замовчуванням використовуємо serper.dev для Google Maps
    this.logger.log('🔧 Використовуємо serper.dev для Google Maps');
    return await this.serperService.parseReviews(SerperSource.GOOGLE_MAPS, options.identifier, {
      hl: options.language || 'uk',
      sortBy: options.sortBy || 'newest'
    });
  }

  private async parseGooglePlayReviews(options: ParsingOptions): Promise<CreateCommentDto[]> {
    this.logger.log(`📱 Парсинг Google Play Store відгуків для ${options.identifier}`);

    // Для Google Play Store використовуємо SerpAPI, оскільки serper.dev не підтримує це джерело
    this.logger.log('🔧 Використовуємо SerpAPI для Google Play Store');
    return await this.serpApiService.parseGooglePlayStore(options.identifier);
  }

  private async parseAppStoreReviews(options: ParsingOptions): Promise<CreateCommentDto[]> {
    this.logger.log(`🍎 Парсинг App Store відгуків для ${options.identifier}`);

    // Для App Store використовуємо SerpAPI, оскільки serper.dev не підтримує це джерело
    this.logger.log('🔧 Використовуємо SerpAPI для App Store');
    return await this.serpApiService.parseAppStore(options.identifier);
  }

  private async parseGoogleSearchReviews(options: ParsingOptions): Promise<CreateCommentDto[]> {
    this.logger.log(`🔍 Парсинг відгуків через Google Search для ${options.identifier}`);

    // Використовуємо serper.dev для Google Search
    this.logger.log('🔧 Використовуємо serper.dev для Google Search');
    return await this.serperService.parseReviews(SerperSource.GOOGLE_SEARCH, options.identifier, {
      language: options.language || 'uk'
    });
  }

  private async parseWithSerperDev(options: ParsingOptions): Promise<CreateCommentDto[]> {
    this.logger.log(`🔧 Парсинг через serper.dev для ${options.identifier}`);

    // Для serper.dev зараз підтримуємо тільки Google Maps
    if (options.identifier.startsWith('ChIJ') || options.identifier.includes('maps')) {
      return await this.serperService.parseGoogleMapsReviews(options.identifier, {
        hl: options.language || 'uk',
        sortBy: options.sortBy as any || 'newest'
      });
    } else {
      throw new Error('serper.dev підтримує тільки Google Maps відгуки');
    }
  }

  // Fallback до SerpAPI
  private async parseWithSerpApiFallback(options: ParsingOptions): Promise<CreateCommentDto[]> {
    this.logger.log(`🔄 Fallback до SerpAPI для ${options.source}`);

    try {
      switch (options.source) {
        case ParsingSource.GOOGLE_MAPS:
          return await this.serpApiService.parseGoogleMapsReviews(options.identifier);
        
        default:
          throw new Error(`SerpAPI не підтримує ${options.source}`);
      }
    } catch (error) {
      this.logger.error(`❌ Fallback до SerpAPI не вдався: ${error.message}`);
      throw error;
    }
  }

  async getAvailableSources(): Promise<{ source: ParsingSource; name: string; description: string; supported: boolean }[]> {
    return [
      {
        source: ParsingSource.GOOGLE_MAPS,
        name: 'Google Maps',
        description: 'Відгуки з Google Maps через serper.dev API',
        supported: true
      },
      {
        source: ParsingSource.GOOGLE_PLAY,
        name: 'Google Play Store',
        description: 'Відгуки з Google Play Store через serper.dev (з fallback до SerpAPI)',
        supported: true
      },
      {
        source: ParsingSource.APP_STORE,
        name: 'App Store',
        description: 'Відгуки з App Store через serper.dev (з fallback до SerpAPI)',
        supported: true
      },
      {
        source: ParsingSource.GOOGLE_SEARCH,
        name: 'Google Search',
        description: 'Пошук відгуків через Google Search API',
        supported: true
      },
      {
        source: ParsingSource.SERPER_DEV,
        name: 'Serper.dev',
        description: 'Відгуки через serper.dev API (тільки Google Maps)',
        supported: true
      }
    ];
  }

  async testSource(source: ParsingSource): Promise<{ success: boolean; message: string }> {
    try {
      switch (source) {
        case ParsingSource.GOOGLE_MAPS:
        case ParsingSource.GOOGLE_SEARCH:
        case ParsingSource.GOOGLE_PLAY:
        case ParsingSource.APP_STORE:
        case ParsingSource.SERPER_DEV:
          if (await this.serperService.testConnection()) {
            return { success: true, message: `${source} через serper.dev працює` };
          } else {
            return { success: false, message: `serper.dev недоступний для ${source}` };
          }
        
        default:
          return { success: false, message: `Непідтримуване джерело: ${source}` };
      }
    } catch (error) {
      return { success: false, message: `Помилка тестування ${source}: ${error.message}` };
    }
  }

  async parseMultipleSources(
    sources: Array<{ source: ParsingSource; identifier: string; options?: Partial<ParsingOptions> }>
  ): Promise<{ [key: string]: CreateCommentDto[] }> {
    this.logger.log(`🔄 Парсинг з ${sources.length} джерел`);

    const results: { [key: string]: CreateCommentDto[] } = {};

    for (const sourceConfig of sources) {
      try {
        const options: ParsingOptions = {
          source: sourceConfig.source,
          identifier: sourceConfig.identifier,
          language: 'uk',
          sortBy: 'newest',
          ...sourceConfig.options
        };

        const comments = await this.parseReviews(options);
        results[`${sourceConfig.source}_${sourceConfig.identifier}`] = comments;
        
        this.logger.log(`✅ ${sourceConfig.source}: ${comments.length} коментарів`);
      } catch (error) {
        this.logger.error(`❌ Помилка ${sourceConfig.source}: ${error.message}`);
        results[`${sourceConfig.source}_${sourceConfig.identifier}`] = [];
      }
    }

    return results;
  }
}
