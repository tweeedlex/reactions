import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from '../entities/source.entity';
import { App } from '../entities/app.entity';
import { Review } from '../entities/review.entity';
import { AppsService } from '../services/apps.service';
import { ReviewsService } from '../services/reviews.service';
import { SourcesService } from '../services/sources.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Source, App, Review])
  ],
  providers: [AppsService, ReviewsService, SourcesService],
  exports: [AppsService, ReviewsService, SourcesService]
})
export class DatabaseModule {}
