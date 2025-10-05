import { Controller, Post, Body, Get } from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';
import { ParseGoogleMapsDto } from './dto/parse-google-maps.dto';

@Controller('google-maps')
export class GoogleMapsController {
  constructor(private readonly googleMapsService: GoogleMapsService) {}

  @Post('parse')
  async parseGoogleMapsReviews(@Body() parseGoogleMapsDto: ParseGoogleMapsDto) {
    try {
      const parsedCount = await this.googleMapsService.parseGoogleMapsReviews(parseGoogleMapsDto.url);
      const placeId = this.extractPlaceId(parseGoogleMapsDto.url);
      
      return {
        success: true,
        message: `Парсинг Google Maps через SerpAPI завершено успішно. Напарсено ${parsedCount} відгуків`,
        url: parseGoogleMapsDto.url,
        placeId: placeId,
        parsedCount: parsedCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        url: parseGoogleMapsDto.url,
        placeId: this.extractPlaceId(parseGoogleMapsDto.url),
        parsedCount: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('parse-with-at')
  async parseGoogleMapsReviewsWithAt(@Body() body: { url: string }) {
    try {
      // Видаляємо символ @ з початку URL, якщо він є
      let cleanUrl = body.url;
      if (cleanUrl.startsWith('@')) {
        cleanUrl = cleanUrl.substring(1);
      }
      
      const parsedCount = await this.googleMapsService.parseGoogleMapsReviews(cleanUrl);
      const placeId = this.extractPlaceId(cleanUrl);
      
      return {
        success: true,
        message: `Парсинг Google Maps через SerpAPI завершено успішно. Напарсено ${parsedCount} відгуків`,
        url: cleanUrl,
        originalUrl: body.url,
        placeId: placeId,
        parsedCount: parsedCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        url: body.url,
        originalUrl: body.url,
        placeId: this.extractPlaceId(body.url),
        parsedCount: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post('expand-url')
  async expandUrl(@Body() body: { url: string }) {
    try {
      const expandedUrl = await this.googleMapsService.expandShortUrl(body.url);
      return {
        success: true,
        originalUrl: body.url,
        expandedUrl: expandedUrl,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        originalUrl: body.url,
        expandedUrl: null,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('test-serpapi')
  async testSerpApi() {
    try {
      const isConnected = await this.googleMapsService.testGoogleMapsConnection();
      return {
        success: isConnected,
        message: isConnected ? 'SerpAPI підключення успішне для Google Maps' : 'SerpAPI підключення не вдалося. Перевірте SERPAPI_API_KEY в .env файлі',
        connected: isConnected,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        connected: false,
      };
    }
  }

  private extractPlaceId(url: string): string {
    try {
      // Для коротких посилань повертаємо порожній рядок, щоб сервіс обробив їх
      if (url.includes('goo.gl/maps/') || url.includes('maps.app.goo.gl/')) {
        return '';
      }

      // Різні формати Google Maps URL
      const patterns = [
        /!1s([^!]+)/,
        /[?&]cid=([^&]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      // Якщо не знайшли через regex, спробуємо витягти з query параметрів
      const urlObj = new URL(url);
      const cid = urlObj.searchParams.get('cid');
      if (cid) {
        return cid;
      }

      return '';
    } catch (error) {
      return '';
    }
  }
}
