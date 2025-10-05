import { Injectable, Logger } from '@nestjs/common';
import { SerperParsingService, ParsingType } from '../serper-parsing/serper-parsing.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

export class ParseUrlDto {
  url: string;
  language?: string;
  sortBy?: string;
}

@Injectable()
export class UrlParsingService {
  private readonly logger = new Logger(UrlParsingService.name);

  constructor(
    private readonly serperParsingService: SerperParsingService,
  ) {}

  async parseUrl(parseUrlDto: ParseUrlDto): Promise<{ comments: CreateCommentDto[]; count: number; type: string; identifier: string }> {
    this.logger.log(`🚀 Парсинг URL через serper.dev: ${parseUrlDto.url}`);

    try {
      const { type, identifier } = this.analyzeUrl(parseUrlDto.url);
      
      if (!type || !identifier) {
        throw new Error('Непідтримуваний формат URL або не вдалося витягти ідентифікатор');
      }

      this.logger.log(`📊 Визначено тип: ${type}, ідентифікатор: ${identifier}`);

      const result = await this.serperParsingService.parseReviews({
        type,
        identifier,
        language: parseUrlDto.language || 'uk',
        sortBy: parseUrlDto.sortBy || 'newest'
      });

      this.logger.log(`✅ Успішно спарсено ${result.count} коментарів`);
      return {
        ...result,
        type,
        identifier
      };

    } catch (error) {
      this.logger.error(`❌ Помилка парсингу URL: ${error.message}`);
      throw error;
    }
  }

  private analyzeUrl(url: string): { type: ParsingType | null; identifier: string | null } {
    try {
      const normalizedUrl = url.trim().toLowerCase();
      
      // Google Maps
      if (normalizedUrl.includes('maps.google.com') || normalizedUrl.includes('google.com/maps') || normalizedUrl.includes('chij')) {
        const placeId = this.extractGoogleMapsPlaceId(url);
        if (placeId) {
          return { type: ParsingType.GOOGLE_MAPS, identifier: placeId };
        }
      }
      
      // Google Play Store
      if (normalizedUrl.includes('play.google.com')) {
        const appId = this.extractGooglePlayAppId(url);
        if (appId) {
          return { type: ParsingType.GOOGLE_PLAY, identifier: appId };
        }
      }
      
      // App Store
      if (normalizedUrl.includes('apps.apple.com')) {
        const appId = this.extractAppStoreAppId(url);
        if (appId) {
          return { type: ParsingType.APP_STORE, identifier: appId };
        }
      }
      
      // Google Search (для загальних пошукових запитів)
      if (normalizedUrl.includes('google.com/search') || normalizedUrl.includes('google.com.ua/search')) {
        const query = this.extractGoogleSearchQuery(url);
        if (query) {
          return { type: ParsingType.GOOGLE_SEARCH, identifier: query };
        }
      }
      
      // Якщо це не відомий URL, спробуємо використати як пошуковий запит
      return { type: ParsingType.GOOGLE_SEARCH, identifier: url };
      
    } catch (error) {
      this.logger.error(`❌ Помилка аналізу URL: ${error.message}`);
      return { type: null, identifier: null };
    }
  }

  private extractGoogleMapsPlaceId(url: string): string | null {
    try {
      // Спробуємо різні патерни для Google Maps
      const patterns = [
        /[?&]cid=([^&]+)/,                    // ?cid=ChIJ...
        /[?&]place_id=([^&]+)/,               // ?place_id=ChIJ...
        /\/maps\/place\/[^/]+\/([^/?&]+)/,    // /maps/place/name/ChIJ...
        /\/maps\/[^/]+\/([^/?&]+)/,           // /maps/name/ChIJ...
        /ChIJ[^&?\/]+/                        // Прямий Place ID
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          const placeId = match[1];
          if (placeId.startsWith('ChIJ')) {
            this.logger.log(`📍 Витягнуто Google Maps Place ID: ${placeId}`);
            return placeId;
          }
        }
      }
      
      // Якщо URL містить Place ID безпосередньо
      const directMatch = url.match(/ChIJ[^&?\/]+/);
      if (directMatch) {
        const placeId = directMatch[0];
        this.logger.log(`📍 Витягнуто Google Maps Place ID (прямий): ${placeId}`);
        return placeId;
      }
      
      this.logger.warn(`❌ Не вдалося витягти Google Maps Place ID з URL: ${url}`);
      return null;
      
    } catch (error) {
      this.logger.error(`❌ Помилка витягнення Google Maps Place ID: ${error.message}`);
      return null;
    }
  }

  private extractGooglePlayAppId(url: string): string | null {
    try {
      // Спробуємо різні патерни для Google Play
      const patterns = [
        /[?&]id=([^&]+)/,                           // ?id=com.example.app
        /\/store\/apps\/details\?id=([^&]+)/,       // /store/apps/details?id=com.example.app
        /\/store\/apps\/details\/([^?&]+)/,         // /store/apps/details/com.example.app
        /\/store\/apps\/[^/]+\/([^?&]+)/,           // /store/apps/name/com.example.app
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          const appId = match[1];
          if (appId.includes('.')) { // App ID зазвичай містить крапки
            this.logger.log(`📱 Витягнуто Google Play App ID: ${appId}`);
            return appId;
          }
        }
      }
      
      this.logger.warn(`❌ Не вдалося витягти Google Play App ID з URL: ${url}`);
      return null;
      
    } catch (error) {
      this.logger.error(`❌ Помилка витягнення Google Play App ID: ${error.message}`);
      return null;
    }
  }

  private extractAppStoreAppId(url: string): string | null {
    try {
      // Спробуємо різні патерни для App Store
      const patterns = [
        /\/id(\d+)/,                        // /id123456789
        /[?&]id=(\d+)/,                     // ?id=123456789
        /\/app\/[^/]+\/id(\d+)/,            // /app/app-name/id123456789
        /\/app\/[^/]+\/(\d+)/,              // /app/app-name/123456789
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          const appId = match[1];
          if (/^\d+$/.test(appId)) { // App Store ID зазвичай тільки цифри
            this.logger.log(`🍎 Витягнуто App Store ID: ${appId}`);
            return appId;
          }
        }
      }
      
      this.logger.warn(`❌ Не вдалося витягти App Store ID з URL: ${url}`);
      return null;
      
    } catch (error) {
      this.logger.error(`❌ Помилка витягнення App Store ID: ${error.message}`);
      return null;
    }
  }

  private extractGoogleSearchQuery(url: string): string | null {
    try {
      // Витягуємо пошуковий запит з Google Search URL
      const patterns = [
        /[?&]q=([^&]+)/,                    // ?q=search+query
        /[?&]query=([^&]+)/,                // ?query=search+query
        /\/search\?.*q=([^&]+)/,            // /search?q=search+query
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          const query = decodeURIComponent(match[1].replace(/\+/g, ' '));
          this.logger.log(`🔍 Витягнуто пошуковий запит: ${query}`);
          return query;
        }
      }
      
      this.logger.warn(`❌ Не вдалося витягти пошуковий запит з URL: ${url}`);
      return null;
      
    } catch (error) {
      this.logger.error(`❌ Помилка витягнення пошукового запиту: ${error.message}`);
      return null;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return await this.serperParsingService.testConnection();
  }
}
