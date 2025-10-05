import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApifyClient } from 'apify-client';
import { InstagramParsingDto } from './dto/instagram-parsing.dto';
import { InstagramComment } from './entities/instagram-comment.entity';

@Injectable()
export class InstagramParsingService {
  private readonly logger = new Logger(InstagramParsingService.name);
  private apifyClient: ApifyClient;

  constructor(
    private configService: ConfigService,
    @InjectRepository(InstagramComment)
    private instagramCommentRepository: Repository<InstagramComment>,
  ) {
    const apifyToken = this.configService.get<string>('APIFY_API_TOKEN');
    if (!apifyToken) {
      this.logger.error('APIFY_API_TOKEN не знайдено в змінних середовища');
      throw new Error('APIFY_API_TOKEN не налаштовано');
    }

    this.apifyClient = new ApifyClient({
      token: apifyToken,
    });
  }

  async parseInstagramComments(parsingDto: InstagramParsingDto): Promise<InstagramComment[]> {
    try {
      this.logger.log(`Початок парсингу Instagram коментарів для ${parsingDto.urls.length} URL`);

      // Підготовка входу для Apify Actor
      const input = {
        urls: parsingDto.urls,
        maxComments: parsingDto.maxComments || 100,
        cookies: [
          {
            name: 'csrftoken',
            value: 'k1fGQP27hCfEYrfZxsQwHi'
          },
          {
            name: 'sessionid', 
            value: '6941425350%3AmhAvtDQTETtvkG%3A21%3AAYjqxw6wmpYHtKASrmf6ThPEPkAUXs52dMHDSSelGA'
          },
          {
            name: 'ds_user_id',
            value: '6941425350'
          },
          {
            name: 'mid',
            value: 'aOHfogALAAFqqVyVePJB5oNk2yqH'
          }
        ],
        proxy: {
          useApifyProxy: parsingDto.useApifyProxy || true,
        }
      };

      // Запуск Apify Actor
      this.logger.log('Запуск Apify Actor для Instagram парсингу...');
      const run = await this.apifyClient.actor('vEjw8BIxHhgtczmoe').call(input);

      // Отримання результатів
      this.logger.log('Отримання результатів з Apify...');
      const { items } = await this.apifyClient.dataset(run.defaultDatasetId).listItems();

      const savedComments: InstagramComment[] = [];

      for (const item of items) {
        try {
          // Збереження коментарів згідно з структурою Actor
          if (item.comments && Array.isArray(item.comments)) {
            for (const comment of item.comments) {
              const instagramComment = this.instagramCommentRepository.create({
                postUrl: (item as any).post_url || parsingDto.urls[0],
                commentId: comment.id as string,
                text: comment.text as string,
                authorUsername: comment.owner as string || '',
                authorFullName: comment.owner as string || '',
                authorProfilePictureUrl: '',
                likesCount: comment.likes as number || 0,
                timestamp: new Date((comment.created_at as number) * 1000).toISOString(),
                parentCommentId: null,
                isReply: false,
              });

              const savedComment = await this.instagramCommentRepository.save(instagramComment);
              savedComments.push(savedComment);
            }
          }
        } catch (error) {
          this.logger.error(`Помилка при обробці елемента: ${error.message}`);
        }
      }

      this.logger.log(`Успішно збережено ${savedComments.length} коментарів`);
      return savedComments;

    } catch (error) {
      this.logger.error(`Помилка при парсингу Instagram коментарів: ${error.message}`);
      throw error;
    }
  }

  async getCommentsByPostUrl(postUrl: string): Promise<InstagramComment[]> {
    return this.instagramCommentRepository.find({
      where: { postUrl },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllComments(): Promise<InstagramComment[]> {
    return this.instagramCommentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async deleteCommentsByPostUrl(postUrl: string): Promise<void> {
    await this.instagramCommentRepository.delete({ postUrl });
    this.logger.log(`Видалено коментарі для поста: ${postUrl}`);
  }
}
