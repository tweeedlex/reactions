import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Comment } from '../comments/entities/comment.entity';
import { InstagramComment } from '../instagram-parsing/entities/instagram-comment.entity';

export interface PrioritizedFeedback {
  id: string;
  text: string;
  date: string;
  source: string;
  author: string;
  likes: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  totalScore: number;
  sentimentScore: number;
  likesScore: number;
  recencyScore: number;
}

export interface PriorityFilters {
  status?: string;
  limit?: number;
  offset?: number;
  source?: string;
  appId?: number;
}

@Injectable()
export class PriorityService {
  private readonly logger = new Logger(PriorityService.name);

  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(InstagramComment)
    private instagramCommentsRepository: Repository<InstagramComment>,
  ) {}

  /**
   * Отримує пріоритизовані відгуки з бази даних
   */
  async getPrioritizedFeedbacks(filters: PriorityFilters = {}): Promise<PrioritizedFeedback[]> {
    this.logger.log('Отримуємо пріоритизовані відгуки з фільтрами:', filters);

    // Отримуємо відгуки з бази даних
    const reviews = await this.getReviewsFromDatabase(filters);
    this.logger.log(`Знайдено ${reviews.length} відгуків`);

    // Розраховуємо пріоритет для кожного відгуку
    const prioritizedFeedbacks = reviews.map(review => this.calculatePriority(review));

    // Сортуємо за пріоритетом
    const sortedFeedbacks = this.sortByPriority(prioritizedFeedbacks);

    this.logger.log(`Повертаємо ${sortedFeedbacks.length} пріоритизованих відгуків`);
    return sortedFeedbacks;
  }

  /**
   * Отримує відгуки з бази даних з урахуванням фільтрів
   */
  private async getReviewsFromDatabase(filters: PriorityFilters): Promise<any[]> {
    const allData = [];
    
    // Отримуємо коментарі з таблиці comments
    const commentsQuery = this.commentsRepository.createQueryBuilder('comment');
    
    if (filters.source) {
      commentsQuery.andWhere('comment.store = :source', { source: filters.source });
    }
    
    commentsQuery.orderBy('comment.createdAt', 'DESC');
    
    if (filters.limit) {
      commentsQuery.limit(filters.limit);
    }
    
    const comments = await commentsQuery.getMany();
    
    // Конвертуємо коментарі в формат, сумісний з Review
    const convertedComments = comments.map(comment => ({
      id: comment.id,
      text: comment.content,
      author: comment.author,
      rating: comment.rating,
      helpful: comment.helpfulVotes || 0,
      source: comment.store,
      date: comment.reviewDate || comment.createdAt,
      createdAt: comment.createdAt,
      appId: comment.appId,
      appName: comment.appName
    }));
    
    allData.push(...convertedComments);
    this.logger.log(`Знайдено ${convertedComments.length} коментарів з таблиці comments`);
    
    // Отримуємо Instagram коментарі
    const instagramQuery = this.instagramCommentsRepository.createQueryBuilder('instagram');
    
    if (filters.source === 'instagram' || !filters.source) {
      instagramQuery.orderBy('instagram.createdAt', 'DESC');
      
      if (filters.limit) {
        instagramQuery.limit(filters.limit);
      }
      
      const instagramComments = await instagramQuery.getMany();
      
      // Конвертуємо Instagram коментарі в формат, сумісний з Review
      const convertedInstagram = instagramComments.map(comment => ({
        id: `instagram_${comment.id}`,
        text: comment.text,
        author: comment.authorUsername,
        rating: null, // Instagram не має рейтингу
        helpful: comment.likesCount || 0,
        source: 'instagram',
        date: new Date(comment.timestamp),
        createdAt: comment.createdAt,
        appId: comment.postUrl,
        appName: 'Instagram Post'
      }));
      
      allData.push(...convertedInstagram);
      this.logger.log(`Знайдено ${convertedInstagram.length} коментарів з Instagram`);
    }
    
    // Сортуємо всі дані за датою створення
    allData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Обмежуємо кількість результатів
    if (filters.limit) {
      return allData.slice(0, filters.limit);
    }
    
    return allData;
  }

  /**
   * Розраховує пріоритет відгуку на основі тональності, впливу та свіжості
   */
  private calculatePriority(review: any): PrioritizedFeedback {
    // Розраховуємо бали за тональність
    const sentimentScore = this.calculateSentimentScore(review);
    
    // Розраховуємо бали за вплив (лайки)
    const likesScore = this.calculateLikesScore(review.helpful || 0);
    
    // Розраховуємо бали за свіжість
    const recencyScore = this.calculateRecencyScore(review.date || review.createdAt);
    
    // Загальна оцінка
    const totalScore = sentimentScore + likesScore + recencyScore;
    
    // Визначаємо пріоритет
    const priority = this.determinePriority(totalScore);
    
    // Визначаємо тональність на основі рейтингу
    const sentiment = this.determineSentiment(review.rating);
    
    // Визначаємо категорію (спрощено)
    const category = this.determineCategory(review.text);

    return {
      id: review.id.toString(),
      text: review.text,
      date: (review.date || review.createdAt).toISOString(),
      source: review.source,
      author: review.author,
      likes: review.helpful || 0,
      sentiment,
      category,
      priority,
      status: 'Запит', // За замовчуванням
      totalScore,
      sentimentScore,
      likesScore,
      recencyScore,
    };
  }

  /**
   * Розраховує бали за тональність
   * negative → 3, neutral → 2, positive → 1
   */
  private calculateSentimentScore(review: any): number {
    if (!review.rating) {
      return 2; // neutral якщо немає рейтингу
    }

    if (review.rating <= 2) {
      return 3; // negative
    } else if (review.rating <= 3) {
      return 2; // neutral
    } else {
      return 1; // positive
    }
  }

  /**
   * Розраховує бали за вплив (лайки)
   * >50 → 3, 10–50 → 2, 1–9 → 1, 0 → 0
   */
  private calculateLikesScore(likes: number): number {
    if (likes > 50) {
      return 3;
    } else if (likes >= 10) {
      return 2;
    } else if (likes >= 1) {
      return 1;
    } else {
      return 0;
    }
  }

  /**
   * Розраховує бали за свіжість
   * <7 днів → 3, 7–30 днів → 2, >30 днів → 1
   */
  private calculateRecencyScore(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      return 3;
    } else if (diffDays <= 30) {
      return 2;
    } else {
      return 1;
    }
  }

  /**
   * Визначає пріоритет на основі загальної оцінки
   * high → totalScore ≥ 7, medium → totalScore 5–6, low → totalScore < 5
   */
  private determinePriority(totalScore: number): 'high' | 'medium' | 'low' {
    if (totalScore >= 7) {
      return 'high';
    } else if (totalScore >= 5) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Визначає тональність на основі рейтингу
   */
  private determineSentiment(rating: number | null): 'positive' | 'neutral' | 'negative' {
    if (!rating) {
      return 'neutral';
    }

    if (rating <= 2) {
      return 'negative';
    } else if (rating <= 3) {
      return 'neutral';
    } else {
      return 'positive';
    }
  }

  /**
   * Визначає категорію на основі тексту відгуку
   */
  private determineCategory(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Ключові слова для різних категорій
    const categories = {
      'доставка': ['доставка', 'доставили', 'доставка', 'швидко', 'повільно', 'курьєр'],
      'якість': ['якість', 'якісний', 'поганий', 'добре', 'відмінно', 'чудово'],
      'сервіс': ['сервіс', 'обслуговування', 'персонал', 'співробітники', 'консультація'],
      'ціна': ['ціна', 'дорого', 'дешево', 'коштує', 'вартість', 'цінно'],
      'функціональність': ['функції', 'можливості', 'працює', 'не працює', 'зламаний', 'баг'],
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }

    return 'загальний';
  }

  /**
   * Сортує відгуки за пріоритетом
   */
  private sortByPriority(feedbacks: PrioritizedFeedback[]): PrioritizedFeedback[] {
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    return feedbacks.sort((a, b) => {
      // Спочатку за пріоритетом
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      // Потім за загальною оцінкою
      const scoreDiff = b.totalScore - a.totalScore;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      // Нарешті за датою (новіші першими)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  /**
   * Отримує статистику пріоритетів
   */
  async getPriorityStats(filters: PriorityFilters = {}): Promise<{
    total: number;
    high: number;
    medium: number;
    low: number;
  }> {
    const feedbacks = await this.getPrioritizedFeedbacks(filters);
    
    return {
      total: feedbacks.length,
      high: feedbacks.filter(f => f.priority === 'high').length,
      medium: feedbacks.filter(f => f.priority === 'medium').length,
      low: feedbacks.filter(f => f.priority === 'low').length,
    };
  }
}
