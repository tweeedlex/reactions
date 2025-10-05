import { Controller, Post, Body, Get } from '@nestjs/common';
import { ParsingService } from './parsing.service';
import { ParseAppDto } from './dto/parse-app.dto';

@Controller('parsing')
export class ParsingController {
  constructor(private readonly parsingService: ParsingService) {}

  @Post('parse')
  async parseApp(@Body() parseAppDto: ParseAppDto) {
    try {
      const parsedCount = await this.parsingService.parseApp(parseAppDto.url);
      const appId = this.extractAppId(parseAppDto.url);
      
      return {
        success: true,
        message: `Парсинг через SerpAPI завершено успішно. Напарсено ${parsedCount} коментарів`,
        url: parseAppDto.url,
        appId: appId,
        parsedCount: parsedCount,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        url: parseAppDto.url,
        appId: this.extractAppId(parseAppDto.url),
        parsedCount: 0,
        timestamp: new Date().toISOString(),
      };
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
            return match[1];
          }
        }
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
            return match[1];
          }
        }
        return '';
      }
      
      return '';
      
    } catch (error) {
      return '';
    }
  }

  @Get('test-serpapi')
  async testSerpApi() {
    try {
      const isConnected = await this.parsingService.testSerpApiConnection();
      return {
        success: isConnected,
        message: isConnected ? 'SerpAPI підключення успішне' : 'SerpAPI підключення не вдалося. Перевірте SERPAPI_API_KEY в .env файлі',
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
}
