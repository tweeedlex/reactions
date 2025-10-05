import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SerperReviewsDto, SerperReviewsResponse, SerperReview, SortBy } from './dto/serper-reviews.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

export enum SerperSource {
  GOOGLE_MAPS = 'google_maps',
  GOOGLE_SEARCH = 'google_search',
  GOOGLE_PLAY = 'google_play',
  APP_STORE = 'app_store'
}

@Injectable()
export class SerperService {
  private readonly logger = new Logger(SerperService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://google.serper.dev/reviews';

  constructor() {
    this.apiKey = process.env.SERPER_API_KEY || '37843c7b4f2d2571cb4db43512a5340041856528';
    
    if (!this.apiKey || this.apiKey === 'your_serper_key_here') {
      this.logger.error('SERPER_API_KEY не встановлено або встановлено неправильно');
      this.logger.error('Будь ласка, налаштуйте SERPER_API_KEY в .env файлі');
    } else {
      this.logger.log('SerperService ініціалізовано з API ключем');
    }
  }

  async getGoogleMapsReviews(placeId: string, options?: Partial<SerperReviewsDto>): Promise<SerperReviewsResponse> {
    if (!this.apiKey) {
      throw new Error('SERPER_API_KEY не встановлено');
    }

    try {
      this.logger.log(`🔍 Отримання відгуків Google Maps для placeId: ${placeId}`);

      const requestData: SerperReviewsDto = {
        placeId,
        hl: 'uk',
        sortBy: SortBy.NEWEST,
        ...options
      };

      this.logger.log(`📤 Відправка запиту до serper.dev з даними: ${JSON.stringify(requestData, null, 2)}`);

      const response = await axios.post(this.baseUrl, requestData, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 секунд таймаут
      });

      this.logger.log(`📥 Отримано відповідь від serper.dev: ${response.status}`);
      this.logger.log(`📊 Структура відповіді: ${JSON.stringify(Object.keys(response.data))}`);

      // Обробляємо відповідь від serper.dev
      const reviews = this.processSerperResponse(response.data);
      
      const result: SerperReviewsResponse = {
        reviews,
        nextPageToken: response.data.nextPageToken,
        placeInfo: {
          title: response.data.placeInfo?.title || 'Невідома назва',
          address: response.data.placeInfo?.address || '',
          rating: response.data.placeInfo?.rating || 0,
          totalReviews: response.data.placeInfo?.totalReviews || 0
        }
      };

      this.logger.log(`✅ Успішно оброблено ${reviews.length} відгуків`);
      return result;

    } catch (error) {
      this.logger.error(`❌ Помилка отримання відгуків з serper.dev: ${error.message}`);
      
      if (error.response) {
        this.logger.error(`📊 Статус відповіді: ${error.response.status}`);
        this.logger.error(`📊 Дані помилки: ${JSON.stringify(error.response.data)}`);
      }
      
      throw error;
    }
  }

  async parseGoogleMapsReviews(placeId: string, options?: Partial<SerperReviewsDto>): Promise<CreateCommentDto[]> {
    try {
      this.logger.log(`🚀 Парсинг відгуків Google Maps через serper.dev для placeId: ${placeId}`);

      const response = await this.getGoogleMapsReviews(placeId, options);
      const comments: CreateCommentDto[] = [];
      const seenComments = new Set<string>();

      this.logger.log(`📊 Отримано ${response.reviews.length} відгуків для обробки`);

      for (const review of response.reviews) {
        try {
          const comment = this.convertSerperReviewToComment(review, placeId, response.placeInfo?.title);
          
          if (comment) {
            // Перевіряємо на дублікати
            const commentKey = `${comment.content}|${comment.author}|${comment.rating}`;
            if (!seenComments.has(commentKey)) {
              seenComments.add(commentKey);
              comments.push(comment);
              this.logger.debug(`✅ Додано коментар: ${comment.content.substring(0, 30)}...`);
            } else {
              this.logger.debug(`⏭️ Пропускаємо дублікат: ${comment.content.substring(0, 30)}...`);
            }
          } else {
            this.logger.debug(`❌ Коментар не пройшов валідацію`);
          }
        } catch (error) {
          this.logger.warn(`⚠️ Помилка обробки відгуку: ${error.message}`);
        }
      }

      this.logger.log(`🎉 Успішно конвертовано ${comments.length} коментарів`);
      return comments;

    } catch (error) {
      this.logger.error(`❌ Помилка парсингу відгуків: ${error.message}`);
      throw error;
    }
  }

  private processSerperResponse(data: any): SerperReview[] {
    try {
      // serper.dev може повертати відгуки в різних форматах
      let reviews: any[] = [];

      if (data.reviews && Array.isArray(data.reviews)) {
        reviews = data.reviews;
      } else if (data.data && Array.isArray(data.data)) {
        reviews = data.data;
      } else if (Array.isArray(data)) {
        reviews = data;
      } else {
        this.logger.warn(`⚠️ Неочікуваний формат відповіді від serper.dev: ${JSON.stringify(Object.keys(data))}`);
        return [];
      }

      this.logger.log(`📊 Знайдено ${reviews.length} відгуків в відповіді`);

      return reviews.map(review => this.normalizeSerperReview(review));

    } catch (error) {
      this.logger.error(`❌ Помилка обробки відповіді serper.dev: ${error.message}`);
      return [];
    }
  }

  private normalizeSerperReview(review: any): SerperReview {
    return {
      author: review.user?.name || review.author || review.user_name || review.name || review.reviewer_name || 'Анонімний користувач',
      content: review.snippet || review.translatedSnippet || review.content || review.text || review.review_text || review.comment || '',
      rating: this.extractRating(review),
      date: review.isoDate || review.date || review.created_at || review.published_at || new Date().toISOString(),
      helpfulVotes: review.likes || review.helpful_votes || review.upvotes || 0,
      profilePhotoUrl: review.user?.thumbnail || review.profile_photo_url || review.avatar_url || review.photo_url,
      isVerified: review.is_verified || review.verified || false
    };
  }

  private extractRating(review: any): number {
    const rating = review.rating || review.stars || review.score || review.rating_value;
    
    if (typeof rating === 'number') {
      return Math.min(Math.max(rating, 1), 5);
    }
    
    if (typeof rating === 'string') {
      const match = rating.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        const numRating = parseFloat(match[1]);
        return Math.min(Math.max(numRating, 1), 5);
      }
    }

    return 0;
  }

  private convertSerperReviewToComment(
    review: SerperReview, 
    placeId: string, 
    placeName?: string
  ): CreateCommentDto | null {
    try {
      // Валідація коментаря
      if (!review.content || review.content.length < 3) {
        this.logger.debug(`❌ Відгук відфільтровано: занадто короткий контент (${review.content?.length || 0} символів)`);
        return null;
      }

      if (!this.isValidReview(review.content, review.author)) {
        this.logger.debug(`❌ Відгук відфільтровано: невалідний контент або автор`);
        return null;
      }

      const comment: CreateCommentDto = {
        appId: placeId,
        appName: placeName || 'Невідома назва',
        store: 'googlemaps' as 'googlemaps',
        content: review.content.trim(),
        author: review.author.trim(),
        rating: review.rating,
        reviewDate: this.parseDate(review.date),
        helpfulVotes: review.helpfulVotes || 0,
      };

      return comment;

    } catch (error) {
      this.logger.warn(`⚠️ Помилка конвертації відгуку: ${error.message}`);
      return null;
    }
  }

  private parseDate(dateString: string): Date {
    try {
      if (!dateString) return new Date();
      
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }

      return new Date();
    } catch (error) {
      this.logger.warn(`⚠️ Помилка парсингу дати: ${dateString}`);
      return new Date();
    }
  }

  private isValidReview(content: string, author: string): boolean {
    try {
      const normalizedContent = content.trim();
      const normalizedAuthor = author.trim();

      if (!normalizedContent || normalizedContent.length === 0) {
        return false;
      }

      // Фільтрація фальшивих коментарів
      const suspiciousPatterns = [
        /^[A-Z\s]+$/, // Тільки великі літери
        /^\d+$/, // Тільки цифри
        /^(good|bad|great|awesome|terrible|amazing|worst|best|ok|okay|nice|cool|wow|omg)$/i,
        /^(5|4|3|2|1)\s*stars?$/i,
        /^загальний рейтинг/i,
        /^система/i,
        /^автоматично/i,
        /^test/i,
        /^spam/i,
        /^fake/i,
        /^bot/i,
        /^admin/i,
        /^developer/i,
        /^staff/i,
        /^support/i,
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(normalizedContent)) {
          return false;
        }
      }

      if (normalizedContent.length < 3) {
        return false;
      }

      const systemAuthors = [
        'система', 'system', 'admin', 'адміністратор', 'автоматично', 
        'анонімний користувач', 'anonymous', 'guest', 'user', 'test',
        'bot', 'spam', 'fake', 'developer', 'staff', 'support'
      ];
      
      if (systemAuthors.some(sa => normalizedAuthor.toLowerCase().includes(sa.toLowerCase()))) {
        return false;
      }

      // Перевіряємо на повторювані символи
      const repeatedChars = /(.)\1{4,}/;
      if (repeatedChars.test(normalizedContent)) {
        return false;
      }

      // Перевіряємо на занадто багато знаків оклику
      const exclamationCount = (normalizedContent.match(/!/g) || []).length;
      if (exclamationCount > 3) {
        return false;
      }

      // Перевіряємо на HTML теги
      if (/<[^>]+>/.test(normalizedContent)) {
        return false;
      }

      // Перевіряємо на URL-адреси
      if (/https?:\/\/[^\s]+/.test(normalizedContent)) {
        return false;
      }

      return true;

    } catch (error) {
      this.logger.warn(`⚠️ Помилка валідації відгуку: ${error.message}`);
      return false;
    }
  }

  // Універсальний метод парсингу
  async parseReviews(source: SerperSource, identifier: string, options?: any): Promise<CreateCommentDto[]> {
    this.logger.log(`🔧 Універсальний парсинг через serper.dev: ${source} для ${identifier}`);

    switch (source) {
      case SerperSource.GOOGLE_MAPS:
        return await this.parseGoogleMapsReviews(identifier, options);
      
      case SerperSource.GOOGLE_SEARCH:
        return await this.parseGoogleSearchReviews(identifier, options);
      
      case SerperSource.GOOGLE_PLAY:
        return await this.parseGooglePlayReviews(identifier, options);
      
      case SerperSource.APP_STORE:
        return await this.parseAppStoreReviews(identifier, options);
      
      default:
        throw new Error(`Непідтримуване джерело: ${source}`);
    }
  }

  // Парсинг через Google Search (для пошуку відгуків)
  async parseGoogleSearchReviews(query: string, options?: any): Promise<CreateCommentDto[]> {
    this.logger.log(`🔍 Парсинг відгуків через Google Search: ${query}`);

    try {
      const searchQuery = `${query} reviews site:play.google.com OR site:apps.apple.com`;
      
      const response = await axios.post('https://google.serper.dev/search', {
        q: searchQuery,
        num: 20,
        hl: options?.language || 'uk'
      }, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      const comments: CreateCommentDto[] = [];
      const seenComments = new Set<string>();

      if (response.data.organic) {
        for (const result of response.data.organic) {
          try {
            // Спробуємо витягти відгуки з результатів пошуку
            const comment = this.extractReviewFromSearchResult(result, query);
            if (comment) {
              const commentKey = `${comment.content}|${comment.author}|${comment.rating}`;
              if (!seenComments.has(commentKey)) {
                seenComments.add(commentKey);
                comments.push(comment);
              }
            }
          } catch (error) {
            this.logger.warn(`Помилка обробки результату пошуку: ${error.message}`);
          }
        }
      }

      this.logger.log(`✅ Знайдено ${comments.length} відгуків через Google Search`);
      return comments;

    } catch (error) {
      this.logger.error(`❌ Помилка парсингу через Google Search: ${error.message}`);
      throw error;
    }
  }

  // Парсинг Google Play Store через пошук
  async parseGooglePlayReviews(appId: string, options?: any): Promise<CreateCommentDto[]> {
    this.logger.log(`📱 Парсинг Google Play Store через serper.dev: ${appId}`);

    try {
      // Використовуємо Google Search для пошуку відгуків
      const searchQuery = `"${appId}" reviews "rating" site:play.google.com`;
      
      const response = await axios.post('https://google.serper.dev/search', {
        q: searchQuery,
        num: 20,
        hl: options?.language || 'uk'
      }, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      const comments: CreateCommentDto[] = [];
      const seenComments = new Set<string>();

      if (response.data.organic) {
        for (const result of response.data.organic) {
          try {
            const comment = this.extractPlayStoreReviewFromSearchResult(result, appId);
            if (comment) {
              const commentKey = `${comment.content}|${comment.author}|${comment.rating}`;
              if (!seenComments.has(commentKey)) {
                seenComments.add(commentKey);
                comments.push(comment);
              }
            }
          } catch (error) {
            this.logger.warn(`Помилка обробки результату Play Store: ${error.message}`);
          }
        }
      }

      this.logger.log(`✅ Знайдено ${comments.length} відгуків Google Play Store`);
      return comments;

    } catch (error) {
      this.logger.error(`❌ Помилка парсингу Google Play Store: ${error.message}`);
      throw error;
    }
  }

  // Парсинг App Store через пошук
  async parseAppStoreReviews(appId: string, options?: any): Promise<CreateCommentDto[]> {
    this.logger.log(`🍎 Парсинг App Store через serper.dev: ${appId}`);

    try {
      // Використовуємо Google Search для пошуку відгуків
      const searchQuery = `"${appId}" reviews site:apps.apple.com`;
      
      const response = await axios.post('https://google.serper.dev/search', {
        q: searchQuery,
        num: 20,
        hl: options?.language || 'uk'
      }, {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      const comments: CreateCommentDto[] = [];
      const seenComments = new Set<string>();

      if (response.data.organic) {
        for (const result of response.data.organic) {
          try {
            const comment = this.extractAppStoreReviewFromSearchResult(result, appId);
            if (comment) {
              const commentKey = `${comment.content}|${comment.author}|${comment.rating}`;
              if (!seenComments.has(commentKey)) {
                seenComments.add(commentKey);
                comments.push(comment);
              }
            }
          } catch (error) {
            this.logger.warn(`Помилка обробки результату App Store: ${error.message}`);
          }
        }
      }

      this.logger.log(`✅ Знайдено ${comments.length} відгуків App Store`);
      return comments;

    } catch (error) {
      this.logger.error(`❌ Помилка парсингу App Store: ${error.message}`);
      throw error;
    }
  }

  // Витягнення відгуку з результату пошуку
  private extractReviewFromSearchResult(result: any, query: string): CreateCommentDto | null {
    try {
      const content = result.snippet || result.description || '';
      const title = result.title || '';
      
      if (!content || content.length < 10) {
        return null;
      }

      // Спробуємо витягти рейтинг з контенту
      const ratingMatch = content.match(/(\d+)\s*зірк|(\d+)\s*star|(\d+)\s*★/i);
      const rating = ratingMatch ? parseInt(ratingMatch[1] || ratingMatch[2] || ratingMatch[3]) : 0;

      return {
        appId: query,
        appName: title,
        store: 'search' as any,
        content: content.trim(),
        author: 'Пошук Google',
        rating: Math.min(Math.max(rating, 1), 5),
        reviewDate: new Date(),
        helpfulVotes: 0,
      };
    } catch (error) {
      this.logger.warn(`Помилка витягнення відгуку: ${error.message}`);
      return null;
    }
  }

  // Витягнення відгуку Play Store з результату пошуку
  private extractPlayStoreReviewFromSearchResult(result: any, appId: string): CreateCommentDto | null {
    try {
      const content = result.snippet || result.description || '';
      const title = result.title || '';
      
      if (!content || content.length < 10) {
        return null;
      }

      // Перевіряємо, чи це справді відгук про додаток
      if (!content.toLowerCase().includes('review') && 
          !content.toLowerCase().includes('відгук') &&
          !content.toLowerCase().includes('rating') &&
          !content.toLowerCase().includes('зірк')) {
        return null;
      }

      // Спробуємо витягти рейтинг з контенту
      const ratingMatch = content.match(/(\d+)\s*зірк|(\d+)\s*star|(\d+)\s*★|(\d+)\s*\/\s*5/i);
      const rating = ratingMatch ? parseInt(ratingMatch[1] || ratingMatch[2] || ratingMatch[3] || ratingMatch[4]) : 0;

      // Якщо не знайшли рейтинг, спробуємо витягти з заголовка
      const titleRatingMatch = title.match(/(\d+)\s*зірк|(\d+)\s*star|(\d+)\s*★/i);
      const titleRating = titleRatingMatch ? parseInt(titleRatingMatch[1] || titleRatingMatch[2] || titleRatingMatch[3]) : 0;

      const finalRating = rating || titleRating || 3; // За замовчуванням 3 зірки

      return {
        appId,
        appName: title,
        store: 'playstore' as any,
        content: content.trim(),
        author: 'Google Play',
        rating: Math.min(Math.max(finalRating, 1), 5),
        reviewDate: new Date(),
        helpfulVotes: 0,
      };
    } catch (error) {
      this.logger.warn(`Помилка витягнення відгуку Play Store: ${error.message}`);
      return null;
    }
  }

  // Витягнення відгуку App Store з результату пошуку
  private extractAppStoreReviewFromSearchResult(result: any, appId: string): CreateCommentDto | null {
    try {
      const content = result.snippet || result.description || '';
      const title = result.title || '';
      
      if (!content || content.length < 10) {
        return null;
      }

      // Спробуємо витягти рейтинг з контенту
      const ratingMatch = content.match(/(\d+)\s*зірк|(\d+)\s*star|(\d+)\s*★/i);
      const rating = ratingMatch ? parseInt(ratingMatch[1] || ratingMatch[2] || ratingMatch[3]) : 0;

      return {
        appId,
        appName: title,
        store: 'appstore' as any,
        content: content.trim(),
        author: 'App Store',
        rating: Math.min(Math.max(rating, 1), 5),
        reviewDate: new Date(),
        helpfulVotes: 0,
      };
    } catch (error) {
      this.logger.warn(`Помилка витягнення відгуку App Store: ${error.message}`);
      return null;
    }
  }

  // Отримання доступних джерел
  async getAvailableSources(): Promise<{ source: SerperSource; name: string; description: string; supported: boolean }[]> {
    return [
      {
        source: SerperSource.GOOGLE_MAPS,
        name: 'Google Maps',
        description: 'Відгуки з Google Maps через serper.dev API',
        supported: true
      },
      {
        source: SerperSource.GOOGLE_SEARCH,
        name: 'Google Search',
        description: 'Пошук відгуків через Google Search',
        supported: true
      },
      {
        source: SerperSource.GOOGLE_PLAY,
        name: 'Google Play Store',
        description: 'Відгуки з Google Play Store через пошук',
        supported: true
      },
      {
        source: SerperSource.APP_STORE,
        name: 'App Store',
        description: 'Відгуки з App Store через пошук',
        supported: true
      }
    ];
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.apiKey || this.apiKey === 'your_serper_key_here') {
        this.logger.error('❌ SERPER_API_KEY не встановлено або встановлено неправильно');
        return false;
      }

      // Тестуємо з простим запитом
      const testPlaceId = 'ChIJN1t_tDeuEmsRUsoyG83frY4'; // Тестове місце
      const response = await this.getGoogleMapsReviews(testPlaceId, { hl: 'uk' });

      this.logger.log('✅ Serper.dev підключення успішне');
      return true;

    } catch (error) {
      this.logger.error(`❌ Помилка підключення до serper.dev: ${error.message}`);
      if (error.message?.includes('Invalid API key') || error.message?.includes('401')) {
        this.logger.error('🔑 API ключ недійсний. Перевірте правильність ключа в .env файлі');
      }
      return false;
    }
  }
}
