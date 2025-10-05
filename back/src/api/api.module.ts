import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ReviewsController } from '../controllers/reviews.controller';
import { AppsController } from '../controllers/apps.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ReviewsController, AppsController],
})
export class ApiModule {}
