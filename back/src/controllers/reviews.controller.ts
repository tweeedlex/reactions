import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { AppsService } from '../services/apps.service';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private reviewsService: ReviewsService,
    private appsService: AppsService,
  ) {}

  @Post()
  async createReview(@Body() reviewData: {
    platform: string;
    appId: string;
    appName: string;
    author: string;
    rating: number;
    text: string;
    source: string;
    reviewId?: string;
    date?: string;
    helpful?: number;
    category?: string;
  }) {
    return this.reviewsService.createReview(
      reviewData.platform,
      reviewData.appId,
      reviewData.appName,
      reviewData.author,
      reviewData.rating,
      reviewData.text,
      reviewData.source,
      reviewData.reviewId,
      reviewData.date ? new Date(reviewData.date) : undefined,
      reviewData.helpful,
      reviewData.category
    );
  }

  @Get('app/:appId')
  async getReviewsByApp(
    @Param('appId') appId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.reviewsService.findReviewsByApp(parseInt(appId), limit, offset);
  }

  @Get('platform/:platform')
  async getReviewsByPlatform(
    @Param('platform') platform: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.reviewsService.findReviewsByPlatform(platform, limit, offset);
  }

  @Get('source/:source')
  async getReviewsBySource(
    @Param('source') source: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.reviewsService.findReviewsBySource(source, limit, offset);
  }

  @Get('stats/:appId')
  async getReviewStats(@Param('appId') appId: string) {
    return this.reviewsService.getReviewStats(parseInt(appId));
  }
}
