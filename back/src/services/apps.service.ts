import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { App } from '../entities/app.entity';

@Injectable()
export class AppsService {
  constructor(
    @InjectRepository(App)
    private appsRepository: Repository<App>,
  ) {}

  async createOrGetApp(platform: string, appId: string, name: string, category?: string): Promise<App> {
    // Спочатку шукаємо існуючий додаток
    let app = await this.appsRepository.findOne({
      where: { platform, appId }
    });

    if (!app) {
      // Створюємо новий додаток
      app = this.appsRepository.create({
        platform,
        appId,
        name,
        category
      });
      app = await this.appsRepository.save(app);
    } else {
      // Оновлюємо існуючий додаток якщо потрібно
      if (name !== app.name || category !== app.category) {
        app.name = name;
        app.category = category;
        app = await this.appsRepository.save(app);
      }
    }

    return app;
  }

  async findById(id: number): Promise<App | null> {
    return this.appsRepository.findOne({
      where: { id },
      relations: ['reviews']
    });
  }

  async findByPlatformAndAppId(platform: string, appId: string): Promise<App | null> {
    return this.appsRepository.findOne({
      where: { platform, appId },
      relations: ['reviews']
    });
  }

  async findAll(platform?: string, category?: string): Promise<App[]> {
    const query = this.appsRepository.createQueryBuilder('app')
      .leftJoinAndSelect('app.reviews', 'review');

    if (platform) {
      query.andWhere('app.platform = :platform', { platform });
    }

    if (category) {
      query.andWhere('app.category = :category', { category });
    }

    return query.getMany();
  }
}
