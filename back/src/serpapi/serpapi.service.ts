import { Injectable, Logger } from '@nestjs/common';
import { getJson } from 'serpapi';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

@Injectable()
export class SerpApiService {
  private readonly logger = new Logger(SerpApiService.name);
  private readonly apiKey: string;
  private readonly maxPages: number;
  private readonly reviewsPerPage: number;
  private readonly unlimitedPages: boolean;

  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY || 'fda426065a3f31f282eac9271c52fd8eebfe6a5b858b1bc4db2f1bd40112a505';
    this.unlimitedPages = process.env.UNLIMITED_PAGES === 'true';
    this.maxPages = this.unlimitedPages ? 999999 : parseInt(process.env.MAX_REVIEW_PAGES || '50', 10);
    this.reviewsPerPage = parseInt(process.env.REVIEWS_PER_PAGE || '8', 10); // Google Maps повертає ~8 відгуків на сторінку
    
    // Логування для діагностики
    this.logger.log(`SERPAPI_API_KEY з process.env: ${process.env.SERPAPI_API_KEY}`);
    this.logger.log(`Використовується API ключ: ${this.apiKey.substring(0, 10)}...`);
    
    if (!this.apiKey || this.apiKey === 'your_serpapi_key_here') {
      this.logger.error('SERPAPI_API_KEY не встановлено або встановлено неправильно');
      this.logger.error('Будь ласка, налаштуйте SERPAPI_API_KEY в .env файлі');
    } else {
      this.logger.log('SerpApiService ініціалізовано з API ключем');
    }
    
    if (this.unlimitedPages) {
      this.logger.log(`Обмеження знято - парсинг без обмежень кількості сторінок`);
    } else {
      this.logger.log(`Максимальна кількість сторінок для парсингу: ${this.maxPages} (до ${this.maxPages * this.reviewsPerPage} відгуків)`);
    }
  }

  async parseGooglePlayStore(appId: string): Promise<CreateCommentDto[]> {
    if (!this.apiKey) {
      throw new Error('SERPAPI_API_KEY не встановлено');
    }

    try {
      this.logger.log(`Парсинг Google Play Store через SerpAPI для appId: ${appId}`);

      // Спробуємо різні формати appId
      const appIdVariants = [
        appId,
        `com.${appId}`,
        `ua.com.${appId}`,
        appId.replace(/\./g, '')
      ];
      
      this.logger.log(`Спробуємо різні варіанти appId: ${appIdVariants.join(', ')}`);
      
      const comments: CreateCommentDto[] = [];
      const seenComments = new Set<string>(); // Для відстеження дублікатів під час парсингу
      let appName = 'Невідома назва';
      let page = 1;
      const maxPages = this.maxPages; // Використовуємо налаштовану кількість сторінок
      let hasMorePages = true;
      let consecutiveEmptyPages = 0; // Лічильник послідовних порожніх сторінок
      let duplicateCount = 0; // Лічильник дублікатів
      let shouldStop = false; // Флаг для зупинки парсингу

      while (hasMorePages && page <= maxPages) {
        this.logger.log(`Завантажуємо сторінку ${page} з відгуками...`);
        
        const response = await getJson({
          engine: 'google_play_product',
          product_id: appId,
          store: 'apps',
          api_key: this.apiKey,
          hl: 'uk',
          gl: 'ua',
          reviews: true, // Явно запитуємо відгуки
          num: this.reviewsPerPage, // Кількість відгуків на сторінку
          start: (page - 1) * this.reviewsPerPage // Зміщення для пагінації
        });

        this.logger.log(`SerpAPI відповідь отримана для ${appId}, сторінка ${page}`);
        this.logger.log(`Структура відповіді: ${JSON.stringify(Object.keys(response))}`);

        // Перевіряємо наявність помилок у відповіді
        if (response.error) {
          this.logger.error(`SerpAPI повернув помилку: ${response.error}`);
          hasMorePages = false;
          break;
        }

        // Отримуємо назву додатку з першої сторінки
        if (page === 1) {
          appName = response.product_info?.title || response.title || 'Невідома назва';
          this.logger.log(`Назва додатку: ${appName}`);
        }

        if (response.reviews && Array.isArray(response.reviews)) {
          this.logger.log(`Знайдено ${response.reviews.length} відгуків на сторінці ${page}`);

          for (const review of response.reviews) {
            try {
              const comment = this.convertSerpApiReviewToComment(review, appId, 'playstore', appName);
              if (comment) {
                // Перевіряємо на дублікати під час парсингу
                const commentKey = `${comment.content}|${comment.author}|${comment.rating}`;
                if (!seenComments.has(commentKey)) {
                  seenComments.add(commentKey);
                  comments.push(comment);
                  duplicateCount = 0; // Скидаємо лічильник дублікатів
                } else {
                  duplicateCount++;
                  this.logger.debug(`Пропускаємо дублікат під час парсингу: ${comment.content.substring(0, 50)}... (${duplicateCount} дублікатів поспіль)`);
                  
                  // Зупиняємо, якщо занадто багато дублікатів
                  if (duplicateCount >= 20) {
                    shouldStop = true;
                    hasMorePages = false;
                    this.logger.log(`Зупиняємо парсинг: занадто багато дублікатів (${duplicateCount})`);
                    break;
                  }
                }
              }
            } catch (error) {
              this.logger.warn(`Помилка обробки відгуку: ${error.message}`);
            }
          }

          // Перевіряємо, чи є ще сторінки
          if (response.reviews.length === 0) {
            consecutiveEmptyPages++;
            this.logger.log(`Порожня сторінка ${page} (${consecutiveEmptyPages} поспіль)`);
            
            if (consecutiveEmptyPages >= 3) {
              hasMorePages = false;
              this.logger.log(`Зупиняємо парсинг: ${consecutiveEmptyPages} порожніх сторінок поспіль`);
            }
          } else {
            consecutiveEmptyPages = 0; // Скидаємо лічильник, якщо знайшли відгуки
            
            if (response.reviews.length < this.reviewsPerPage) {
              hasMorePages = false;
              this.logger.log(`Остання сторінка досягнута (менше ${this.reviewsPerPage} відгуків)`);
            } else if (response.serpapi_pagination && response.serpapi_pagination.next) {
              hasMorePages = true;
              this.logger.log(`Знайдено наступну сторінку: ${response.serpapi_pagination.next}`);
            } else {
              hasMorePages = false;
              this.logger.log(`Немає інформації про наступну сторінку`);
            }
          }
        } else {
          this.logger.warn(`Відгуки не знайдено на сторінці ${page}`);
          this.logger.log(`Доступні поля: ${JSON.stringify(Object.keys(response))}`);
          hasMorePages = false;
        }

        page++;
        
        // Перевіряємо, чи потрібно зупинити парсинг
        if (shouldStop) {
          this.logger.log(`Парсинг зупинено через занадто багато дублікатів`);
          break;
        }
        
        // Невелика затримка між запитами, щоб не перевантажити API
        if (hasMorePages && page <= maxPages) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      this.logger.log(`Успішно оброблено ${comments.length} коментарів з ${page - 1} сторінок`);
      return comments;

    } catch (error) {
      this.logger.error(`Помилка SerpAPI для ${appId}: ${error.message || 'Невідома помилка'}`);
      this.logger.error(`Деталі помилки: ${JSON.stringify(error, null, 2)}`);
      throw error;
    }
  }

  async parseAppStore(appId: string): Promise<CreateCommentDto[]> {
    if (!this.apiKey) {
      throw new Error('SERPAPI_API_KEY не встановлено');
    }

    try {
      this.logger.log(`Парсинг App Store через SerpAPI для appId: ${appId}`);

      const response = await getJson({
        engine: 'apple_app_store',
        store: 'apps',
        api_key: this.apiKey,
        app_id: appId,
        reviews: true,
        num: this.reviewsPerPage, // Кількість відгуків на сторінку
        country: 'ua', // Країна
        lang: 'ru', // Мова
      });

      this.logger.log(`SerpAPI відповідь отримана для ${appId}`);

      const comments: CreateCommentDto[] = [];
      const seenComments = new Set<string>(); // Для відстеження дублікатів під час парсингу

      if (response.reviews && Array.isArray(response.reviews)) {
        this.logger.log(`Знайдено ${response.reviews.length} відгуків`);

        for (const review of response.reviews) {
          try {
            const comment = this.convertSerpApiReviewToComment(review, appId, 'appstore');
            if (comment) {
              // Перевіряємо на дублікати під час парсингу
              const commentKey = `${comment.content}|${comment.author}|${comment.rating}`;
              if (!seenComments.has(commentKey)) {
                seenComments.add(commentKey);
                comments.push(comment);
              } else {
                this.logger.debug(`Пропускаємо дублікат під час парсингу: ${comment.content.substring(0, 50)}...`);
              }
            }
          } catch (error) {
            this.logger.warn(`Помилка обробки відгуку: ${error.message}`);
          }
        }
      } else {
        this.logger.warn('Відгуки не знайдено в відповіді SerpAPI');
      }

      this.logger.log(`Успішно оброблено ${comments.length} коментарів`);
      return comments;

    } catch (error) {
      this.logger.error(`Помилка SerpAPI для ${appId}: ${error.message || 'Невідома помилка'}`);
      this.logger.error(`Деталі помилки: ${JSON.stringify(error, null, 2)}`);
      throw error;
    }
  }

  private convertSerpApiReviewToComment(
    review: any, 
    appId: string, 
    store: 'playstore' | 'appstore' = 'playstore',
    appName?: string
  ): CreateCommentDto | null {
    try {
      // Витягуємо дані з відгуку SerpAPI
      const content = review.snippet || review.content || review.text || review.review_text || review.comment || '';
      const author = review.title || review.user_name || review.author || review.reviewer_name || review.name || 'Анонімний користувач';
      const rating = review.rating || review.stars || this.extractRatingFromSerpApi(review);
      const reviewDate = this.parseSerpApiDate(review.date || review.created_at || review.published_at);
      const helpfulVotes = this.extractHelpfulVotesFromSerpApi(review);

      // Валідація коментаря
      if (!content || content.length < 10) {
        this.logger.debug(`Відгук відфільтровано: занадто короткий контент`);
        return null;
      }

      if (!this.isValidReview(content, author)) {
        this.logger.debug(`Відгук відфільтровано: невалідний контент або автор`);
        return null;
      }

      // Використовуємо передану назву додатку або витягуємо з відгуку
      const finalAppName = appName || review.app_name || review.title || 'Невідома назва';

      return {
        appId,
        appName: finalAppName,
        store,
        content: content.trim(),
        author: author.trim(),
        rating,
        reviewDate,
        helpfulVotes,
      };

    } catch (error) {
      this.logger.warn(`Помилка конвертації відгуку SerpAPI: ${error.message}`);
      return null;
    }
  }

  private extractRatingFromSerpApi(review: any): number {
    // SerpAPI може повертати рейтинг в різних форматах
    const rating = review.rating || review.stars || review.score || review.rating_value;
    
    if (typeof rating === 'number') {
      return Math.min(Math.max(rating, 1), 5); // Обмежуємо від 1 до 5
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

  private parseSerpApiDate(dateString: string): Date {
    try {
      if (!dateString) return new Date();
      
      // Спробуємо різні формати дат
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }

      // Якщо не вдалося розпарсити, повертаємо поточну дату
      return new Date();
    } catch (error) {
      this.logger.warn(`Помилка парсингу дати: ${dateString}`);
      return new Date();
    }
  }

  private extractHelpfulVotesFromSerpApi(review: any): number {
    const helpful = review.likes || review.helpful_votes || review.upvotes || review.helpful_count;
    
    if (typeof helpful === 'number') {
      return Math.max(helpful, 0);
    }
    
    if (typeof helpful === 'string') {
      const match = helpful.match(/(\d+)/);
      if (match) {
        return parseInt(match[1]);
      }
    }

    return 0;
  }

  private isValidReview(content: string, author: string): boolean {
    try {
      // Нормалізуємо вхідні дані
      const normalizedContent = content.trim();
      const normalizedAuthor = author.trim();

      // Перевіряємо на порожній контент
      if (!normalizedContent || normalizedContent.length === 0) {
        this.logger.debug('Відгук відфільтровано: порожній контент');
        return false;
      }

      // Фільтрація фальшивих коментарів
      const suspiciousPatterns = [
        /^[A-Z\s]+$/, // Тільки великі літери
        /^\d+$/, // Тільки цифри
        /^(good|bad|great|awesome|terrible|amazing|worst|best|ok|okay|nice|cool|wow|omg)$/i, // Однослівні коментарі
        /^(5|4|3|2|1)\s*stars?$/i, // Тільки рейтинг
        /^(excellent|perfect|wonderful|fantastic|outstanding|superb|brilliant)$/i, // Занадто позитивні однослівні
        /^(awful|horrible|terrible|disgusting|hate|disgusting|disappointing)$/i, // Занадто негативні однослівні
        /^загальний рейтинг/i, // Системні повідомлення про рейтинг
        /^система/i, // Системні повідомлення
        /^автоматично/i, // Автоматичні повідомлення
        /^test/i, // Тестові повідомлення
        /^testing/i, // Тестові повідомлення
        /^spam/i, // Спам
        /^fake/i, // Фейкові
        /^bot/i, // Бот
        /^admin/i, // Адміністратор
        /^moderator/i, // Модератор
        /^developer/i, // Розробник
        /^staff/i, // Персонал
        /^support/i, // Підтримка
        /^customer service/i, // Служба підтримки
        /^help desk/i, // Служба підтримки
        /^technical support/i, // Технічна підтримка
        /^readera premium/i, // Специфічні для ReadEra
        /^tim tims/i, // Специфічні імена
        /^иван годун/i, // Специфічні імена
        /^vladimir vinogradov/i, // Специфічні імена
      ];

      // Перевіряємо підозрілі патерни
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(normalizedContent)) {
          this.logger.debug(`Відгук відфільтровано: підозрілий патерн - ${pattern}`);
          return false;
        }
      }

      // Перевіряємо довжину коментаря
      if (normalizedContent.length < 10) {
        this.logger.debug(`Відгук відфільтровано: занадто короткий (${normalizedContent.length} символів)`);
        return false;
      }

      // Перевіряємо, чи не є автор системним
      const systemAuthors = [
        'система', 'system', 'admin', 'адміністратор', 'автоматично', 
        'анонімний користувач', 'anonymous', 'guest', 'user', 'test',
        'bot', 'spam', 'fake', 'developer', 'staff', 'support',
        'customer service', 'help desk', 'technical support',
        'readera premium', 'tim tims', 'иван годун', 'vladimir vinogradov'
      ];
      
      if (systemAuthors.some(sa => normalizedAuthor.toLowerCase().includes(sa.toLowerCase()))) {
        this.logger.debug(`Відгук відфільтровано: підозрілий автор - ${normalizedAuthor}`);
        return false;
      }

      // Перевіряємо на повторювані символи
      const repeatedChars = /(.)\1{4,}/;
      if (repeatedChars.test(normalizedContent)) {
        this.logger.debug('Відгук відфільтровано: занадто багато повторюваних символів');
        return false;
      }

      // Перевіряємо на занадто багато знаків оклику
      const exclamationCount = (normalizedContent.match(/!/g) || []).length;
      if (exclamationCount > 3) {
        this.logger.debug(`Відгук відфільтровано: занадто багато знаків оклику (${exclamationCount})`);
        return false;
      }

      // Перевіряємо на занадто багато знаків питання
      const questionCount = (normalizedContent.match(/\?/g) || []).length;
      if (questionCount > 3) {
        this.logger.debug(`Відгук відфільтровано: занадто багато знаків питання (${questionCount})`);
        return false;
      }

      // Перевіряємо на наявність HTML тегів (може бути системним контентом)
      if (/<[^>]+>/.test(normalizedContent)) {
        this.logger.debug('Відгук відфільтровано: містить HTML теги');
        return false;
      }

      // Перевіряємо на наявність URL-адрес (може бути рекламою)
      if (/https?:\/\/[^\s]+/.test(normalizedContent)) {
        this.logger.debug('Відгук відфільтровано: містить URL-адреси');
        return false;
      }

      // Перевіряємо на наявність електронних пошт (може бути спамом)
      if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(normalizedContent)) {
        this.logger.debug('Відгук відфільтровано: містить електронну пошту');
        return false;
      }

      // Перевіряємо на наявність телефонних номерів (може бути спамом)
      if (/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(normalizedContent)) {
        this.logger.debug('Відгук відфільтровано: містить телефонний номер');
        return false;
      }

      // Перевіряємо на наявність тільки спеціальних символів
      if (/^[^\w\s]+$/.test(normalizedContent)) {
        this.logger.debug('Відгук відфільтровано: містить тільки спеціальні символи');
        return false;
      }

      // Перевіряємо на наявність занадто багато пробілів
      if (/\s{5,}/.test(normalizedContent)) {
        this.logger.debug('Відгук відфільтровано: занадто багато пробілів');
        return false;
      }

      return true;

    } catch (error) {
      this.logger.warn(`Помилка валідації відгуку: ${error.message}`);
      return false;
    }
  }

  async parseGoogleMapsReviews(placeId: string): Promise<CreateCommentDto[]> {
    if (!this.apiKey) {
      throw new Error('SERPAPI_API_KEY не встановлено');
    }

    try {
      this.logger.log(`Парсинг Google Maps відгуків через SerpAPI для placeId: ${placeId}`);

      // Валідуємо placeId
      if (!placeId || placeId.trim().length === 0) {
        throw new Error('Place ID не може бути порожнім');
      }

      const comments: CreateCommentDto[] = [];
      const seenComments = new Set<string>(); // Для відстеження дублікатів під час парсингу
      let placeName = 'Невідома назва';
      let page = 1;
      const maxPages = this.maxPages; // Використовуємо налаштовану кількість сторінок
      let hasMorePages = true;
      let nextPageToken = null;

      while (hasMorePages && page <= maxPages) {
        this.logger.log(`Завантажуємо сторінку ${page} з відгуками Google Maps...`);
        
        try {
          // Використовуємо google_maps_reviews engine для отримання відгуків
          const requestParams: any = {
            engine: 'google_maps_reviews',
            place_id: placeId,
            api_key: this.apiKey,
            hl: 'uk',
            gl: 'ua'
          };

          // Додаємо токен наступної сторінки, якщо він є
          if (nextPageToken) {
            requestParams.next_page_token = nextPageToken;
          }

          this.logger.log(`Запит до SerpAPI з параметрами: ${JSON.stringify(requestParams, null, 2)}`);
          const response = await getJson(requestParams);

          this.logger.log(`SerpAPI відповідь отримана для ${placeId}, сторінка ${page}`);
          this.logger.log(`Структура відповіді: ${JSON.stringify(Object.keys(response))}`);

          // Перевіряємо наявність помилок у відповіді
          if (response.error) {
            this.logger.error(`SerpAPI повернув помилку: ${JSON.stringify(response.error)}`);
            hasMorePages = false;
            break;
          }

          // Отримуємо назву місця з першої сторінки
          if (page === 1) {
            placeName = response.place?.title || response.place_info?.title || response.title || 'Невідома назва';
            this.logger.log(`Назва місця: ${placeName}`);
          }

          // Google Maps Reviews API повертає відгуки в reviews
          const reviews = response.reviews || [];
          
          this.logger.log(`Відгуки в response.reviews: ${reviews.length}`);
          this.logger.log(`Пагінація: ${response.serpapi_pagination ? 'Є' : 'Немає'}`);
          if (response.serpapi_pagination) {
            this.logger.log(`Next page token: ${response.serpapi_pagination.next_page_token ? 'Є' : 'Немає'}`);
            if (response.serpapi_pagination.next_page_token) {
              this.logger.log(`Token: ${response.serpapi_pagination.next_page_token.substring(0, 50)}...`);
            }
          }
          
          if (reviews && Array.isArray(reviews)) {
            this.logger.log(`Знайдено ${reviews.length} відгуків на сторінці ${page}`);

            for (const review of reviews) {
              try {
                this.logger.log(`Обробляємо відгук: ${JSON.stringify(review, null, 2)}`);
                const comment = this.convertGoogleMapsReviewToComment(review, placeId, placeName);
                if (comment) {
                  // Перевіряємо на дублікати під час парсингу
                  const commentKey = `${comment.content}|${comment.author}|${comment.rating}`;
                  if (!seenComments.has(commentKey)) {
                    seenComments.add(commentKey);
                    comments.push(comment);
                    this.logger.log(`✅ Додано коментар: ${comment.content.substring(0, 30)}...`);
                  } else {
                    this.logger.debug(`Пропускаємо дублікат під час парсингу: ${comment.content.substring(0, 50)}...`);
                  }
                } else {
                  this.logger.warn(`❌ Коментар не пройшов валідацію`);
                }
              } catch (error) {
                this.logger.warn(`Помилка обробки відгуку Google Maps: ${error.message}`);
              }
            }

            // Перевіряємо, чи є ще сторінки для Google Maps
            if (reviews.length === 0) {
              hasMorePages = false;
              this.logger.log(`Остання сторінка досягнута (немає відгуків)`);
            } else if (response.serpapi_pagination && response.serpapi_pagination.next_page_token) {
              hasMorePages = true;
              nextPageToken = response.serpapi_pagination.next_page_token;
              this.logger.log(`Знайдено наступну сторінку з токеном: ${nextPageToken.substring(0, 50)}...`);
            } else {
              hasMorePages = false;
              this.logger.log(`Немає інформації про наступну сторінку`);
            }
          } else {
            this.logger.warn(`Відгуки не знайдено на сторінці ${page}`);
            this.logger.log(`Доступні поля відповіді: ${JSON.stringify(Object.keys(response))}`);
            hasMorePages = false;
          }

        } catch (apiError) {
          this.logger.error(`Помилка API запиту на сторінці ${page}: ${apiError.message}`);
          this.logger.error(`Деталі помилки: ${JSON.stringify(apiError, null, 2)}`);
          hasMorePages = false;
          break;
        }

        page++;
        
        // Невелика затримка між запитами, щоб не перевантажити API
        if (hasMorePages && page <= maxPages) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      this.logger.log(`Успішно оброблено ${comments.length} коментарів з ${page - 1} сторінок Google Maps`);
      return comments;

    } catch (error) {
      this.logger.error(`Помилка SerpAPI для Google Maps ${placeId}: ${error.message || 'Невідома помилка'}`);
      this.logger.error(`Деталі помилки: ${JSON.stringify(error, null, 2)}`);
      throw error;
    }
  }

  private convertGoogleMapsReviewToComment(
    review: any, 
    placeId: string, 
    placeName: string
  ): CreateCommentDto | null {
    try {
      // Витягуємо дані з відгуку Google Maps (оновлена логіка)
      const content = review.snippet || review.extracted_snippet?.original || review.content || review.text || review.review_text || review.comment || '';
      const author = review.user?.name || review.user_name || review.author || review.reviewer_name || review.name || 'Анонімний користувач';
      const rating = review.rating || review.stars || this.extractRatingFromSerpApi(review);
      const reviewDate = this.parseSerpApiDate(review.iso_date || review.date || review.created_at || review.published_at);
      const helpfulVotes = this.extractHelpfulVotesFromSerpApi(review);

      this.logger.log(`Обробляємо відгук: "${content.substring(0, 50)}..." від ${author}, рейтинг: ${rating}`);

      // Валідація коментаря
      if (!content || content.length < 5) {
        this.logger.warn(`Відгук Google Maps відфільтровано: занадто короткий контент (${content.length} символів)`);
        return null;
      }

      if (!this.isValidReview(content, author)) {
        this.logger.warn(`Відгук Google Maps відфільтровано: невалідний контент або автор`);
        return null;
      }

      const comment: CreateCommentDto = {
        appId: placeId,
        appName: placeName,
        store: 'googlemaps' as 'googlemaps',
        content: content.trim(),
        author: author.trim(),
        rating,
        reviewDate,
        helpfulVotes,
      };

      this.logger.log(`✅ Відгук успішно конвертовано: ${comment.content.substring(0, 30)}...`);
      return comment;

    } catch (error) {
      this.logger.warn(`Помилка конвертації відгуку Google Maps: ${error.message}`);
      return null;
    }
  }

  async searchPlaceByCoordinates(lat: number, lng: number): Promise<string | null> {
    if (!this.apiKey) {
      throw new Error('SERPAPI_API_KEY не встановлено');
    }

    try {
      this.logger.log(`Пошук місця за координатами: ${lat}, ${lng}`);

      const response = await getJson({
        engine: 'google_maps',
        q: `${lat},${lng}`,
        api_key: this.apiKey,
        hl: 'uk',
        gl: 'ua'
      });

      if (response.local_results && response.local_results.length > 0) {
        const place = response.local_results[0];
        this.logger.log(`Знайдено місце: ${place.title}, Place ID: ${place.place_id}`);
        return place.place_id;
      }

      this.logger.warn('Місце не знайдено за координатами');
      return null;

    } catch (error) {
      this.logger.error(`Помилка пошуку за координатами: ${error.message}`);
      return null;
    }
  }

  async searchPlaceByName(placeName: string): Promise<string | null> {
    if (!this.apiKey) {
      throw new Error('SERPAPI_API_KEY не встановлено');
    }

    try {
      this.logger.log(`🔍 Пошук місця за назвою: "${placeName}"`);

      // Спробуємо різні варіанти пошуку
      const searchQueries = [
        placeName,
        `${placeName} Україна`,
        `${placeName} Ukraine`,
        `${placeName} Київ`,
        `${placeName} Kyiv`
      ];

      for (const query of searchQueries) {
        this.logger.log(`🔍 Спробуємо пошук: "${query}"`);
        
        const response = await getJson({
          engine: 'google_maps',
          q: query,
          api_key: this.apiKey,
          hl: 'uk',
          gl: 'ua'
        });

        this.logger.log(`📊 SerpAPI відповідь для "${query}": ${JSON.stringify(Object.keys(response))}`);
        this.logger.log(`📊 Кількість результатів: ${response.local_results?.length || 0}`);

        if (response.local_results && response.local_results.length > 0) {
          // Шукаємо місце в Україні
          for (const place of response.local_results) {
            this.logger.log(`Перевіряємо місце: ${place.title}, адреса: ${place.address || 'Немає'}`);
            
            // Перевіряємо, чи місце знаходиться в Україні
            const address = place.address || '';
            const title = place.title || '';
            const isUkraine = address.includes('Україна') || 
                             address.includes('Ukraine') || 
                             address.includes('Київ') || 
                             address.includes('Kyiv') ||
                             address.includes('Харків') ||
                             address.includes('Kharkiv') ||
                             address.includes('Львів') ||
                             address.includes('Lviv') ||
                             address.includes('Одеса') ||
                             address.includes('Odessa') ||
                             title.includes('Київ') ||
                             title.includes('Kyiv') ||
                             title.includes('Україна') ||
                             title.includes('Ukraine');
            
            if (isUkraine) {
              this.logger.log(`✅ Знайдено місце в Україні: ${place.title}, Place ID: ${place.place_id}`);
              return place.place_id;
            } else {
              this.logger.log(`❌ Місце не в Україні: ${place.title}, адреса: ${address}`);
            }
          }
          
          // Якщо не знайшли місце в Україні, але це останній запит, повертаємо перше знайдене
          if (query === searchQueries[searchQueries.length - 1]) {
            const place = response.local_results[0];
            this.logger.log(`⚠️ Не знайдено місце в Україні, використовуємо: ${place.title}, Place ID: ${place.place_id}`);
            return place.place_id;
          }
        }
        
        // Невелика затримка між запитами
        if (query !== searchQueries[searchQueries.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      this.logger.warn('Місце не знайдено за назвою після всіх спроб');
      return null;

    } catch (error) {
      this.logger.error(`Помилка пошуку за назвою: ${error.message}`);
      return null;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.apiKey || this.apiKey === 'your_serpapi_key_here') {
        this.logger.error('SERPAPI_API_KEY не встановлено або встановлено неправильно');
        this.logger.error('Будь ласка, налаштуйте SERPAPI_API_KEY в .env файлі');
        return false;
      }

      // Тестуємо з простим запитом Google Maps
      const response = await getJson({
        engine: 'google_maps',
        q: 'Київ Україна',
        api_key: this.apiKey,
        hl: 'uk',
        gl: 'ua'
      });

      this.logger.log('SerpAPI підключення успішне для Google Maps');
      return true;

    } catch (error) {
      this.logger.error(`Помилка підключення до SerpAPI: ${error.message}`);
      if (error.message?.includes('Invalid API key')) {
        this.logger.error('API ключ недійсний. Перевірте правильність ключа в .env файлі');
      }
      return false;
    }
  }
}
