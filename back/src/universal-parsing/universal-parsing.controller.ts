import { Controller, Post, Get, Body, Query, Logger } from '@nestjs/common';
import { UniversalParsingService, ParsingSource } from './universal-parsing.service';
import { UniversalParsingDto, MultipleSourcesParsingDto, ParsingResultDto, MultipleParsingResultDto } from './dto/universal-parsing.dto';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';

@Controller('universal-parsing')
export class UniversalParsingController {
  private readonly logger = new Logger(UniversalParsingController.name);

  constructor(private readonly universalParsingService: UniversalParsingService) {}

  @Post('parse')
  async parseReviews(@Body() parsingDto: UniversalParsingDto): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`🚀 Універсальний парсинг: ${parsingDto.source} для ${parsingDto.identifier}`);

    try {
      const comments = await this.universalParsingService.parseReviews(parsingDto);
      
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

  @Post('parse-multiple')
  async parseMultipleSources(@Body() multipleParsingDto: MultipleSourcesParsingDto): Promise<MultipleParsingResultDto> {
    this.logger.log(`🔄 Парсинг з кількох джерел`);

    try {
      const sources = JSON.parse(multipleParsingDto.sources);
      const results = await this.universalParsingService.parseMultipleSources(sources);

      const parsingResults: ParsingResultDto[] = [];
      let totalComments = 0;
      let successCount = 0;
      let errorCount = 0;

      for (const [key, comments] of Object.entries(results)) {
        const [source, identifier] = key.split('_', 2);
        const success = comments.length > 0;
        
        parsingResults.push({
          source,
          identifier,
          comments,
          count: comments.length,
          success
        });

        totalComments += comments.length;
        if (success) successCount++;
        else errorCount++;
      }

      this.logger.log(`✅ Парсинг завершено: ${successCount} успішних, ${errorCount} помилок, ${totalComments} коментарів`);

      return {
        results: parsingResults,
        totalComments,
        successCount,
        errorCount
      };
    } catch (error) {
      this.logger.error(`❌ Помилка множинного парсингу: ${error.message}`);
      throw error;
    }
  }

  @Get('sources')
  async getAvailableSources(): Promise<{ source: ParsingSource; name: string; description: string; supported: boolean }[]> {
    this.logger.log('📋 Отримання доступних джерел парсингу');
    
    try {
      const sources = await this.universalParsingService.getAvailableSources();
      this.logger.log(`✅ Знайдено ${sources.length} джерел`);
      return sources;
    } catch (error) {
      this.logger.error(`❌ Помилка отримання джерел: ${error.message}`);
      throw error;
    }
  }

  @Get('test-source')
  async testSource(@Query('source') source: ParsingSource): Promise<{ success: boolean; message: string }> {
    this.logger.log(`🔧 Тестування джерела: ${source}`);

    try {
      const result = await this.universalParsingService.testSource(source);
      this.logger.log(`✅ Тест ${source}: ${result.success ? 'успішний' : 'невдалий'}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Помилка тестування ${source}: ${error.message}`);
      return {
        success: false,
        message: `Помилка тестування: ${error.message}`
      };
    }
  }

  @Get('test-all-sources')
  async testAllSources(): Promise<{ [key: string]: { success: boolean; message: string } }> {
    this.logger.log('🔧 Тестування всіх джерел');

    try {
      const sources = await this.universalParsingService.getAvailableSources();
      const results: { [key: string]: { success: boolean; message: string } } = {};

      for (const source of sources) {
        if (source.supported) {
          const testResult = await this.universalParsingService.testSource(source.source);
          results[source.source] = testResult;
        } else {
          results[source.source] = {
            success: false,
            message: 'Джерело не підтримується'
          };
        }
      }

      this.logger.log(`✅ Тестування завершено для ${Object.keys(results).length} джерел`);
      return results;
    } catch (error) {
      this.logger.error(`❌ Помилка тестування всіх джерел: ${error.message}`);
      throw error;
    }
  }

  // Спеціальні endpoints для різних джерел
  @Post('google-maps')
  async parseGoogleMaps(
    @Query('placeId') placeId: string,
    @Query('useSerper') useSerper?: boolean,
    @Query('language') language?: string
  ): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`📍 Парсинг Google Maps: ${placeId} (serper: ${useSerper})`);

    const parsingDto: UniversalParsingDto = {
      source: ParsingSource.GOOGLE_MAPS,
      identifier: placeId,
      language: language || 'uk',
      useSerper: useSerper || false
    };

    return await this.parseReviews(parsingDto);
  }

  @Post('google-play')
  async parseGooglePlay(
    @Query('appId') appId: string,
    @Query('language') language?: string
  ): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`📱 Парсинг Google Play Store: ${appId}`);

    const parsingDto: UniversalParsingDto = {
      source: ParsingSource.GOOGLE_PLAY,
      identifier: appId,
      language: language || 'uk'
    };

    return await this.parseReviews(parsingDto);
  }

  @Post('app-store')
  async parseAppStore(
    @Query('appId') appId: string,
    @Query('language') language?: string
  ): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`🍎 Парсинг App Store: ${appId}`);

    const parsingDto: UniversalParsingDto = {
      source: ParsingSource.APP_STORE,
      identifier: appId,
      language: language || 'uk'
    };

    return await this.parseReviews(parsingDto);
  }

  @Post('google-search')
  async parseGoogleSearch(
    @Query('query') query: string,
    @Query('language') language?: string
  ): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`🔍 Парсинг через Google Search: ${query}`);

    const parsingDto: UniversalParsingDto = {
      source: ParsingSource.GOOGLE_SEARCH,
      identifier: query,
      language: language || 'uk'
    };

    return await this.parseReviews(parsingDto);
  }

  @Post('serper-dev')
  async parseWithSerperDev(
    @Query('identifier') identifier: string,
    @Query('language') language?: string
  ): Promise<{ comments: CreateCommentDto[]; count: number }> {
    this.logger.log(`🔧 Парсинг через serper.dev: ${identifier}`);

    const parsingDto: UniversalParsingDto = {
      source: ParsingSource.SERPER_DEV,
      identifier,
      language: language || 'uk'
    };

    return await this.parseReviews(parsingDto);
  }
}
