import { Injectable, Logger } from '@nestjs/common';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { SerpApiService } from '../serpapi/serpapi.service';

@Injectable()
export class ParsingService {
  private readonly logger = new Logger(ParsingService.name);

  constructor(
    private readonly commentsService: CommentsService,
    private readonly serpApiService: SerpApiService,
  ) {}

  async parseApp(url: string): Promise<number> {
    try {
      this.logger.log(`Парсинг додатку через SerpAPI: ${url}`);
      
      const appId = this.extractAppId(url);
      if (!appId) {
        this.logger.warn('Не вдалося витягти App ID з URL');
        return 0;
      }

      this.logger.log(`App ID: ${appId}`);

      let comments: CreateCommentDto[] = [];

      if (url.includes('play.google.com')) {
        comments = await this.serpApiService.parseGooglePlayStore(appId);
      } else if (url.includes('apps.apple.com')) {
        comments = await this.serpApiService.parseAppStore(appId);
      } else {
        this.logger.warn('Непідтримуваний магазин додатків');
        return 0;
      }

      if (comments.length > 0) {
        // Видаляємо старі коментарі для цього додатку
        const deletedResult = await this.commentsService.clearByAppId(appId);
        this.logger.log(`Видалено ${deletedResult.deletedCount} старих коментарів для ${appId}`);
        
        // Додаємо нові коментарі
        await this.commentsService.bulkCreate(comments);
        this.logger.log(`Збережено ${comments.length} нових коментарів через SerpAPI`);
        return comments.length;
      } else {
        this.logger.warn('SerpAPI не знайшов коментарів');
        return 0;
      }

    } catch (error) {
      this.logger.error(`Помилка парсингу через SerpAPI: ${error.message}`);
      throw error;
    }
  }

  async testSerpApiConnection(): Promise<boolean> {
    try {
      return await this.serpApiService.testConnection();
    } catch (error) {
      this.logger.error(`Помилка тестування SerpAPI: ${error.message}`);
      return false;
    }
  }

  private extractAppId(url: string): string {
    try {
      // Нормалізуємо URL
      const normalizedUrl = url.trim();
      
      if (normalizedUrl.includes('play.google.com')) {
        // Спробуємо різні патерни для Google Play
        const patterns = [
          /[?&]id=([^&]+)/,           // ?id=com.example.app
          /\/store\/apps\/details\?id=([^&]+)/, // /store/apps/details?id=com.example.app
          /\/store\/apps\/details\/([^?&]+)/,   // /store/apps/details/com.example.app
        ];
        
        for (const pattern of patterns) {
          const match = normalizedUrl.match(pattern);
          if (match && match[1]) {
            const appId = match[1];
            this.logger.log(`Витягнуто Google Play App ID: ${appId} з URL: ${url}`);
            return appId;
          }
        }
        
        this.logger.warn(`Не вдалося витягти Google Play App ID з URL: ${url}`);
        return '';
        
      } else if (normalizedUrl.includes('apps.apple.com')) {
        // Спробуємо різні патерни для App Store
        const patterns = [
          /\/id(\d+)/,                // /id123456789
          /[?&]id=(\d+)/,             // ?id=123456789
          /\/app\/[^/]+\/id(\d+)/,    // /app/app-name/id123456789
        ];
        
        for (const pattern of patterns) {
          const match = normalizedUrl.match(pattern);
          if (match && match[1]) {
            const appId = match[1];
            this.logger.log(`Витягнуто App Store ID: ${appId} з URL: ${url}`);
            return appId;
          }
        }
        
        this.logger.warn(`Не вдалося витягти App Store ID з URL: ${url}`);
        return '';
      }
      
      this.logger.warn(`Непідтримуваний формат URL: ${url}`);
      return '';
      
    } catch (error) {
      this.logger.error(`Помилка витягнення App ID з URL: ${error.message}`);
      return '';
    }
  }
}