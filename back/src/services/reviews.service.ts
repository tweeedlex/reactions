import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { App } from '../entities/app.entity';
import { AppsService } from './apps.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private appsService: AppsService,
  ) {}

  async createReview(
    platform: string,
    appId: string,
    appName: string,
    author: string,
    rating: number,
    text: string,
    source: string,
    reviewId?: string,
    date?: Date,
    helpful?: number,
    category?: string
  ): Promise<Review> {
    // Спочатку отримуємо або створюємо додаток
    const app = await this.appsService.createOrGetApp(platform, appId, appName, category);

    // Перевіряємо чи не існує вже такий відгук
    if (reviewId) {
      const existingReview = await this.reviewsRepository.findOne({
        where: { source, reviewId }
      });
      if (existingReview) {
        return existingReview;
      }
    }

    // Створюємо новий відгук
    const review = this.reviewsRepository.create({
      appId: app.id,
      author,
      rating,
      text,
      source,
      reviewId,
      date: date || new Date(),
      helpful: helpful || 0
    });

    return this.reviewsRepository.save(review);
  }

  async findReviewsByApp(appId: number, limit?: number, offset?: number): Promise<Review[]> {
    const query = this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.app', 'app')
      .where('review.appId = :appId', { appId })
      .orderBy('review.date', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    if (offset) {
      query.offset(offset);
    }

    return query.getMany();
  }

  async findReviewsByPlatform(platform: string, limit?: number, offset?: number): Promise<Review[]> {
    const query = this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.app', 'app')
      .where('app.platform = :platform', { platform })
      .orderBy('review.date', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    if (offset) {
      query.offset(offset);
    }

    return query.getMany();
  }

  async findReviewsBySource(source: string, limit?: number, offset?: number): Promise<Review[]> {
    const query = this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.app', 'app')
      .where('review.source = :source', { source })
      .orderBy('review.date', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    if (offset) {
      query.offset(offset);
    }

    return query.getMany();
  }

  async getReviewStats(appId: number): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [rating: number]: number };
  }> {
    const reviews = await this.reviewsRepository.find({
      where: { appId },
      select: ['rating']
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / totalReviews 
      : 0;

    const ratingDistribution = reviews.reduce((dist, review) => {
      const rating = review.rating || 0;
      dist[rating] = (dist[rating] || 0) + 1;
      return dist;
    }, {} as { [rating: number]: number });

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution
    };
  }
}
