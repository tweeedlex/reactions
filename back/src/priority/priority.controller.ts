import { Controller, Get, Query, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { PriorityService, PrioritizedFeedback, PriorityFilters } from './priority.service';

@Controller('feedbacks')
export class PriorityController {
  private readonly logger = new Logger(PriorityController.name);

  constructor(private readonly priorityService: PriorityService) {}

  /**
   * GET /feedbacks/prioritized
   * Отримує пріоритизовані відгуки
   */
  @Get('prioritized')
  async getPrioritizedFeedbacks(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('source') source?: string,
    @Query('appId') appId?: string,
  ): Promise<PrioritizedFeedback[]> {
    try {
      this.logger.log('Отримуємо пріоритизовані відгуки з параметрами:', {
        status,
        limit,
        offset,
        source,
        appId,
      });

      const filters: PriorityFilters = {
        status,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
        source,
        appId: appId ? parseInt(appId, 10) : undefined,
      };

      // Валідація параметрів
      this.validateFilters(filters);

      const feedbacks = await this.priorityService.getPrioritizedFeedbacks(filters);
      
      this.logger.log(`Повертаємо ${feedbacks.length} пріоритизованих відгуків`);
      return feedbacks;
    } catch (error) {
      this.logger.error('Помилка при отриманні пріоритизованих відгуків:', error);
      throw new HttpException(
        'Помилка при отриманні пріоритизованих відгуків',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /feedbacks/prioritized/stats
   * Отримує статистику пріоритетів
   */
  @Get('prioritized/stats')
  async getPriorityStats(
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('appId') appId?: string,
  ): Promise<{
    total: number;
    high: number;
    medium: number;
    low: number;
  }> {
    try {
      this.logger.log('Отримуємо статистику пріоритетів з параметрами:', {
        status,
        source,
        appId,
      });

      const filters: PriorityFilters = {
        status,
        source,
        appId: appId ? parseInt(appId, 10) : undefined,
      };

      const stats = await this.priorityService.getPriorityStats(filters);
      
      this.logger.log('Статистика пріоритетів:', stats);
      return stats;
    } catch (error) {
      this.logger.error('Помилка при отриманні статистики пріоритетів:', error);
      throw new HttpException(
        'Помилка при отриманні статистики пріоритетів',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Валідує параметри фільтрації
   */
  private validateFilters(filters: PriorityFilters): void {
    if (filters.limit && (filters.limit < 1 || filters.limit > 1000)) {
      throw new HttpException(
        'Параметр limit повинен бути від 1 до 1000',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (filters.offset && filters.offset < 0) {
      throw new HttpException(
        'Параметр offset повинен бути не менше 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (filters.appId && filters.appId < 1) {
      throw new HttpException(
        'Параметр appId повинен бути позитивним числом',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
