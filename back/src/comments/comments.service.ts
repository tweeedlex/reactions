import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const comment = this.commentsRepository.create(createCommentDto);
    return this.commentsRepository.save(comment);
  }

  async findAll(): Promise<Comment[]> {
    return this.commentsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByAppId(appId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { appId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByStore(store: 'playstore' | 'appstore' | 'googlemaps'): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { store },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Comment> {
    return this.commentsRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.commentsRepository.delete(id);
  }

  async bulkCreate(comments: CreateCommentDto[]): Promise<Comment[]> {
    this.logger.log(`Обробляємо ${comments.length} коментарів для перевірки дублікатів`);
    
    if (comments.length === 0) {
      this.logger.log('Немає коментарів для обробки');
      return [];
    }

    // Фільтруємо дублікати в пам'яті та з базою даних
    const uniqueComments = await this.filterDuplicates(comments);
    
    const duplicatesCount = comments.length - uniqueComments.length;
    if (duplicatesCount > 0) {
      this.logger.log(`Знайдено ${duplicatesCount} дублікатів, пропускаємо їх`);
    }
    
    if (uniqueComments.length === 0) {
      this.logger.log('Всі коментарі є дублікатами, нічого не зберігаємо');
      return [];
    }

    this.logger.log(`Зберігаємо ${uniqueComments.length} унікальних коментарів`);
    
    try {
      const commentEntities = this.commentsRepository.create(uniqueComments);
      return await this.commentsRepository.save(commentEntities);
    } catch (error) {
      // Якщо виникла помилка через унікальні обмеження, спробуємо зберегти по одному
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === '23505') {
        this.logger.warn('Виявлено дублікати на рівні БД, зберігаємо по одному коментарю');
        return await this.saveCommentsIndividually(uniqueComments);
      }
      throw error;
    }
  }

  private async filterDuplicates(comments: CreateCommentDto[]): Promise<CreateCommentDto[]> {
    // Спочатку фільтруємо дублікати в пам'яті
    const inMemoryUnique = this.filterInMemoryDuplicates(comments);
    this.logger.log(`Після фільтрації в пам'яті: ${inMemoryUnique.length} з ${comments.length} коментарів`);
    
    if (inMemoryUnique.length === 0) {
      return [];
    }

    // Отримуємо всі існуючі коментарі для цих appId
    const appIds = [...new Set(inMemoryUnique.map(c => c.appId))];
    const existingComments = await this.commentsRepository.find({
      where: { appId: appIds.length === 1 ? appIds[0] : undefined },
      select: ['appId', 'content', 'author', 'rating']
    });

    // Створюємо Set для швидкого пошуку
    const existingSet = new Set(
      existingComments.map(c => `${c.appId}|${c.content}|${c.author}|${c.rating}`)
    );

    const uniqueComments: CreateCommentDto[] = [];
    
    for (const comment of inMemoryUnique) {
      const key = `${comment.appId}|${comment.content}|${comment.author}|${comment.rating}`;
      if (!existingSet.has(key)) {
        uniqueComments.push(comment);
      }
    }

    return uniqueComments;
  }

  private filterInMemoryDuplicates(comments: CreateCommentDto[]): CreateCommentDto[] {
    const seen = new Set<string>();
    const unique: CreateCommentDto[] = [];

    for (const comment of comments) {
      const key = `${comment.appId}|${comment.content}|${comment.author}|${comment.rating}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(comment);
      }
    }

    return unique;
  }

  private async saveCommentsIndividually(comments: CreateCommentDto[]): Promise<Comment[]> {
    const savedComments: Comment[] = [];
    
    for (const comment of comments) {
      try {
        const commentEntity = this.commentsRepository.create(comment);
        const saved = await this.commentsRepository.save(commentEntity);
        savedComments.push(saved);
      } catch (error) {
        // Пропускаємо дублікати, які не вдалося зберегти
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === '23505') {
          this.logger.debug(`Пропускаємо дублікат: ${comment.content.substring(0, 50)}...`);
        } else {
          this.logger.warn(`Помилка збереження коментаря: ${error.message}`);
        }
      }
    }

    return savedComments;
  }

  async clearTestComments(): Promise<{ deletedCount: number }> {
    const testAuthors = [
      'Тестовий користувач',
      'Тестовий користувач 1',
      'Тестовий користувач 2',
      'Тестовий користувач 3'
    ];

    const result = await this.commentsRepository
      .createQueryBuilder()
      .delete()
      .where('author IN (:...authors)', { authors: testAuthors })
      .execute();

    return { deletedCount: result.affected || 0 };
  }

  async clearAllComments(): Promise<{ deletedCount: number }> {
    const result = await this.commentsRepository
      .createQueryBuilder()
      .delete()
      .execute();

    return { deletedCount: result.affected || 0 };
  }

  async clearInvalidComments(): Promise<{ deletedCount: number }> {
    // Видаляємо коментарі з підозрілими авторами
    const suspiciousAuthors = [
      'система', 'system', 'admin', 'адміністратор', 'автоматично', 'анонімний користувач'
    ];

    // Видаляємо коментарі з підозрілим контентом
    const suspiciousContentPatterns = [
      'загальний рейтинг',
      'система',
      'автоматично',
      'ReadEra Premium',
      'Tim Tims',
      'Иван Годун',
      'Vladimir Vinogradov'
    ];

    const result = await this.commentsRepository
      .createQueryBuilder()
      .delete()
      .where('author IN (:...authors)', { authors: suspiciousAuthors })
      .orWhere('content LIKE :pattern1', { pattern1: '%загальний рейтинг%' })
      .orWhere('content LIKE :pattern2', { pattern2: '%ReadEra Premium%' })
      .orWhere('content LIKE :pattern3', { pattern3: '%Tim Tims%' })
      .orWhere('content LIKE :pattern4', { pattern4: '%Иван Годун%' })
      .orWhere('content LIKE :pattern5', { pattern5: '%Vladimir Vinogradov%' })
      .execute();

    return { deletedCount: result.affected || 0 };
  }

  async clearByAppId(appId: string): Promise<{ deletedCount: number }> {
    const result = await this.commentsRepository
      .createQueryBuilder()
      .delete()
      .where('appId = :appId', { appId })
      .execute();

    return { deletedCount: result.affected || 0 };
  }
}
