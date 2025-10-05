import { Injectable, Logger } from '@nestjs/common';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { SerpApiService } from '../serpapi/serpapi.service';
import fetch from 'node-fetch';

@Injectable()
export class GoogleMapsService {
  private readonly logger = new Logger(GoogleMapsService.name);

  constructor(
    private readonly commentsService: CommentsService,
    private readonly serpApiService: SerpApiService,
  ) {}

  async parseGoogleMapsReviews(url: string): Promise<number> {
    try {
      this.logger.log(`🚀 Парсинг відгуків Google Maps через SerpAPI: ${url}`);
      
      // Додаємо загальний таймаут для всього процесу (15 секунд)
      const parsePromise = this.performParsing(url);
      const timeoutPromise = new Promise<number>((_, reject) => 
        setTimeout(() => reject(new Error('Таймаут парсингу Google Maps (15 секунд)')), 15000)
      );
      
      return await Promise.race([parsePromise, timeoutPromise]);
    } catch (error) {
      this.logger.error(`Помилка парсингу Google Maps: ${error.message}`);
      return 0;
    }
  }

  private async performParsing(url: string): Promise<number> {
    try {
      let placeId = await this.extractPlaceId(url);
      this.logger.log(`📍 Отримано Place ID: ${placeId}`);
      
      if (!placeId) {
        this.logger.warn('❌ Не вдалося витягти Place ID з URL, спробуємо пошук...');
        // Спробуємо знайти місце через пошук
        const foundPlaceId = await this.findPlaceIdBySearch(url);
        if (foundPlaceId) {
          placeId = foundPlaceId;
          this.logger.log(`✅ Знайдено Place ID через пошук: ${placeId}`);
        } else {
          this.logger.warn('❌ Не вдалося знайти Place ID ні з URL, ні через пошук');
          this.logger.warn('🚫 Пропускаємо парсинг для цього URL');
          return 0;
        }
      }

      this.logger.log(`📍 Place ID з URL: ${placeId}`);

      // Перевіряємо, чи Place ID підходить для SerpAPI (має формат ChIJ...)
      if (!placeId.startsWith('ChIJ')) {
        this.logger.log('⚠️ Place ID не підходить для SerpAPI, намагаємося знайти через пошук...');
        
        // Якщо це коротке посилання, спочатку розкриваємо його
        let searchUrl = url;
        if (url.includes('goo.gl/maps/') || url.includes('maps.app.goo.gl/')) {
          const expandedUrl = await this.expandShortUrl(url);
          if (expandedUrl) {
            searchUrl = expandedUrl;
            this.logger.log(`Використовуємо розкрите посилання для пошуку: ${searchUrl}`);
          }
        }
        
        // Спробуємо знайти місце через пошук за координатами або назвою
        const foundPlaceId = await this.findPlaceIdBySearch(searchUrl);
        if (foundPlaceId) {
          placeId = foundPlaceId;
          this.logger.log(`Знайдено підходящий Place ID: ${placeId}`);
        } else {
          this.logger.warn('Не вдалося знайти підходящий Place ID для SerpAPI');
          // Спробуємо витягти Place ID з URL напряму
          const directPlaceId = this.extractPlaceIdFromUrl(searchUrl);
          if (directPlaceId) {
            placeId = directPlaceId;
            this.logger.log(`Використовуємо Place ID з URL: ${placeId}`);
          } else {
            // Спробуємо пошук за координатами
            const coordinates = this.extractCoordinates(searchUrl);
            if (coordinates) {
              this.logger.log(`Спробуємо пошук за координатами: ${coordinates.lat}, ${coordinates.lng}`);
              const coordPlaceId = await this.searchPlaceByCoordinates(coordinates.lat, coordinates.lng);
              if (coordPlaceId) {
                placeId = coordPlaceId;
                this.logger.log(`Знайдено Place ID за координатами: ${placeId}`);
              } else {
                this.logger.warn('Не вдалося знайти Place ID ні через пошук, ні з URL, ні за координатами');
                return 0;
              }
            } else {
              this.logger.warn('Не вдалося знайти Place ID ні через пошук, ні з URL, ні координат');
              return 0;
            }
          }
        }
      }

      const comments: CreateCommentDto[] = await this.serpApiService.parseGoogleMapsReviews(placeId);

      if (comments.length > 0) {
        this.logger.log(`Отримано ${comments.length} коментарів з SerpAPI`);
        
        // Видаляємо старі коментарі для цього місця
        const deletedResult = await this.commentsService.clearByAppId(placeId);
        this.logger.log(`Видалено ${deletedResult.deletedCount} старих коментарів для ${placeId}`);
        
        // Додаємо нові коментарі
        this.logger.log(`Спроба збереження ${comments.length} коментарів...`);
        const savedComments = await this.commentsService.bulkCreate(comments);
        this.logger.log(`Збережено ${savedComments.length} коментарів з Google Maps`);
        return savedComments.length;
      } else {
        this.logger.warn('SerpAPI не знайшов відгуків для Google Maps');
        return 0;
      }

    } catch (error) {
      this.logger.error(`Помилка парсингу Google Maps через SerpAPI: ${error.message}`);
      this.logger.error(`Деталі помилки: ${JSON.stringify(error, null, 2)}`);
      
      // Якщо помилка пов'язана з невалідним Place ID, спробуємо знайти альтернативний
      if (error.message && error.message.includes('Place ID')) {
        this.logger.log('Спробуємо знайти альтернативний Place ID...');
        try {
          const alternativePlaceId = await this.findAlternativePlaceId(url);
          if (alternativePlaceId) {
            this.logger.log(`Знайдено альтернативний Place ID: ${alternativePlaceId}`);
            return await this.parseGoogleMapsReviews(alternativePlaceId);
          }
        } catch (altError) {
          this.logger.error(`Не вдалося знайти альтернативний Place ID: ${altError.message}`);
        }
      }
      
      throw error;
    }
  }

  async testGoogleMapsConnection(): Promise<boolean> {
    try {
      return await this.serpApiService.testConnection();
    } catch (error) {
      this.logger.error(`Помилка тестування SerpAPI для Google Maps: ${error.message}`);
      return false;
    }
  }

  private async extractPlaceId(url: string): Promise<string> {
    try {
      // Спочатку перевіряємо, чи це коротке посилання
      if (url.includes('goo.gl/maps/') || url.includes('maps.app.goo.gl/')) {
        this.logger.log(`Розкриваємо коротке посилання: ${url}`);
        const expandedUrl = await this.expandShortUrl(url);
        if (expandedUrl) {
          this.logger.log(`Розкрите посилання: ${expandedUrl}`);
          return await this.extractPlaceId(expandedUrl);
        }
      }

      // Різні формати Google Maps URL
      const patterns = [
        // https://www.google.com/maps/place/Place+Name/@lat,lng,zoom/data=!3m1!4b1!4m6!3m5!1s0x1234567890abcdef:0x1234567890abcdef!8m2!3d40.7128!4d-74.0060!16s%2Fg%2F11abc123def
        /!1s([^!]+)/,
        // https://maps.google.com/maps?cid=1234567890123456789
        /[?&]cid=([^&]+)/,
        // https://www.google.com/maps/place/Place+Name/@lat,lng,zoom/data=!4m5!3m4!1s0x1234567890abcdef:0x1234567890abcdef!8m2!3d40.7128!4d-74.0060
        /!1s([^!]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          const placeId = match[1];
          this.logger.log(`Витягнуто Place ID: ${placeId} з URL: ${url}`);
          return placeId;
        }
      }

      // Якщо не знайшли через regex, спробуємо витягти з query параметрів
      const urlObj = new URL(url);
      const cid = urlObj.searchParams.get('cid');
      if (cid) {
        this.logger.log(`Витягнуто Place ID з cid параметра: ${cid}`);
        return cid;
      }

      this.logger.warn(`Не вдалося витягти Place ID з URL: ${url}`);
      return '';
    } catch (error) {
      this.logger.error(`Помилка парсингу URL: ${error.message}`);
      return '';
    }
  }

  private extractPlaceIdFromUrl(url: string): string | null {
    try {
      // Спробуємо витягти Place ID з різних форматів URL
      const patterns = [
        /!1s([^!]+)/,  // Стандартний формат
        /[?&]cid=([^&]+)/,  // CID параметр
        /place_id=([^&]+)/,  // Place ID параметр
        /!3d([^!]+)/,  // Альтернативний формат
        /@[^/]+\/data=!4m[^!]*!1s([^!]+)/  // Складний формат
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          const placeId = match[1];
          this.logger.log(`Витягнуто Place ID з URL: ${placeId}`);
          return placeId;
        }
      }

      this.logger.warn('Не вдалося витягти Place ID з URL');
      return null;
    } catch (error) {
      this.logger.error(`Помилка витягнення Place ID з URL: ${error.message}`);
      return null;
    }
  }

  async expandShortUrl(shortUrl: string): Promise<string | null> {
    try {
      this.logger.log(`Спроба розкриття короткого посилання: ${shortUrl}`);
      const response = await fetch(shortUrl, {
        method: 'HEAD',
        redirect: 'follow'
      });
      const expandedUrl = response.url;
      this.logger.log(`Розкрите посилання: ${expandedUrl}`);
      return expandedUrl;
    } catch (error) {
      this.logger.error(`Помилка розкриття короткого посилання: ${error.message}`);
      return null;
    }
  }

  private async findPlaceIdBySearch(url: string): Promise<string | null> {
    try {
      // Спочатку спробуємо за назвою (це працює краще)
      const placeName = this.extractPlaceName(url);
      if (placeName) {
        this.logger.log(`Спробуємо знайти за назвою: ${placeName}`);
        const placeId = await this.searchPlaceByName(placeName);
        if (placeId) {
          return placeId;
        }
      }

      // Якщо не вдалося знайти за назвою, спробуємо розширений пошук
      this.logger.log('Спробуємо розширений пошук...');
      const extendedPlaceId = await this.searchPlaceByExtendedTerms(url);
      if (extendedPlaceId) {
        return extendedPlaceId;
      }

      // Витягуємо координати з URL (як останній варіант)
      const coordinates = this.extractCoordinates(url);
      if (coordinates) {
        this.logger.log(`Знайдено координати: ${coordinates.lat}, ${coordinates.lng}`);
        
        // Спробуємо знайти місце за координатами через SerpAPI
        const placeId = await this.searchPlaceByCoordinates(coordinates.lat, coordinates.lng);
        if (placeId) {
          return placeId;
        }
      }
      
      this.logger.warn('Не вдалося знайти місце за назвою або координатами з URL');
      return null;
    } catch (error) {
      this.logger.error(`Помилка пошуку місця: ${error.message}`);
      return null;
    }
  }

  private extractCoordinates(url: string): { lat: number; lng: number } | null {
    try {
      // Спочатку шукаємо точні координати (формат !8m2!3dlat!4dlng)
      const preciseMatch = url.match(/!8m2!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/);
      if (preciseMatch) {
        return {
          lat: parseFloat(preciseMatch[1]),
          lng: parseFloat(preciseMatch[2])
        };
      }
      
      // Якщо точні координати не знайдено, шукаємо загальні координати (формат @lat,lng)
      const match = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2])
        };
      }
      return null;
    } catch (error) {
      this.logger.error(`Помилка витягнення координат: ${error.message}`);
      return null;
    }
  }

  private extractPlaceName(url: string): string | null {
    try {
      // Спробуємо витягти назву місця з URL
      const patterns = [
        /place\/([^/@]+)/,  // Стандартний формат
        /place\/%([^/@]+)/, // URL-encoded формат
        /place\/([^/]+)/    // Більш загальний формат
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          let placeName = match[1];
          // Декодуємо URL-encoded символи
          try {
            placeName = decodeURIComponent(placeName);
          } catch (e) {
            // Якщо декодування не вдалося, використовуємо як є
          }
          // Замінюємо + на пробіли
          placeName = placeName.replace(/\+/g, ' ');
          // Очищаємо від зайвих символів
          placeName = placeName.replace(/[()]/g, '').trim();
          
          if (placeName && placeName.length > 2) {
            this.logger.log(`Витягнуто назву місця: "${placeName}"`);
            return placeName;
          }
        }
      }
      
      this.logger.warn('Не вдалося витягти назву місця з URL');
      return null;
    } catch (error) {
      this.logger.error(`Помилка витягнення назви місця: ${error.message}`);
      return null;
    }
  }

  private async searchPlaceByCoordinates(lat: number, lng: number): Promise<string | null> {
    try {
      // Використовуємо SerpAPI для пошуку місця за координатами
      const response = await this.serpApiService.searchPlaceByCoordinates(lat, lng);
      return response;
    } catch (error) {
      this.logger.error(`Помилка пошуку за координатами: ${error.message}`);
      return null;
    }
  }

  private async searchPlaceByName(placeName: string): Promise<string | null> {
    try {
      // Використовуємо SerpAPI для пошуку місця за назвою
      const response = await this.serpApiService.searchPlaceByName(placeName);
      return response;
    } catch (error) {
      this.logger.error(`Помилка пошуку за назвою: ${error.message}`);
      return null;
    }
  }

  private async searchPlaceByExtendedTerms(url: string): Promise<string | null> {
    try {
      const placeName = this.extractPlaceName(url);
      if (!placeName) {
        return null;
      }

      // Обмежуємо кількість спроб пошуку для уникнення безкінечного циклу
      const searchTerms = [
        placeName, // Спочатку спробуємо точну назву
        `${placeName} Київ Україна`,
        `${placeName} Kyiv Ukraine`,
        `${placeName} Київ`,
        `${placeName} Україна`,
        `${placeName} Kyiv`,
        `${placeName} Ukraine`
      ];

      // Обмежуємо до 7 спроб (перші 7 термінів)
      const limitedTerms = searchTerms.slice(0, 7);
      
      for (let i = 0; i < limitedTerms.length; i++) {
        const term = limitedTerms[i];
        this.logger.log(`Спробуємо пошук (${i + 1}/${limitedTerms.length}): "${term}"`);
        
        try {
          // Додаємо таймаут для кожного пошуку (3 секунди)
          const searchPromise = this.serpApiService.searchPlaceByName(term);
          const timeoutPromise = new Promise<string | null>((_, reject) => 
            setTimeout(() => reject(new Error('Таймаут пошуку')), 3000)
          );
          
          const response = await Promise.race([searchPromise, timeoutPromise]) as string | null;
          
          if (response) {
            this.logger.log(`✅ Знайдено місце за терміном: "${term}", Place ID: ${response}`);
            return response;
          } else {
            this.logger.log(`❌ Не знайдено місце за терміном: "${term}"`);
          }
        } catch (error) {
          this.logger.warn(`Помилка пошуку за терміном "${term}": ${error.message}`);
          // Продовжуємо з наступним терміном
        }
      }

      this.logger.warn('Не вдалося знайти місце через розширений пошук');
      return null;
    } catch (error) {
      this.logger.error(`Помилка розширеного пошуку: ${error.message}`);
      return null;
    }
  }

  private async findAlternativePlaceId(url: string): Promise<string | null> {
    try {
      this.logger.log(`Пошук альтернативного Place ID для URL: ${url}`);
      
      // Спробуємо різні методи пошуку
      const methods = [
        () => this.findPlaceIdBySearch(url),
        () => this.searchPlaceByCoordinates(this.extractCoordinates(url)?.lat || 0, this.extractCoordinates(url)?.lng || 0),
        () => this.searchPlaceByName(this.extractPlaceName(url) || '')
      ];

      for (const method of methods) {
        try {
          const result = await method();
          if (result) {
            this.logger.log(`✅ Знайдено альтернативний Place ID: ${result}`);
            return result;
          }
        } catch (error) {
          this.logger.warn(`Метод пошуку не вдався: ${error.message}`);
        }
      }

      this.logger.warn('Не вдалося знайти альтернативний Place ID');
      return null;
    } catch (error) {
      this.logger.error(`Помилка пошуку альтернативного Place ID: ${error.message}`);
      return null;
    }
  }

}
