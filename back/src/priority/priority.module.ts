import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriorityController } from './priority.controller';
import { PriorityService } from './priority.service';
import { Review } from '../entities/review.entity';
import { Comment } from '../comments/entities/comment.entity';
import { InstagramComment } from '../instagram-parsing/entities/instagram-comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Comment, InstagramComment]),
  ],
  controllers: [PriorityController],
  providers: [PriorityService],
  exports: [PriorityService],
})
export class PriorityModule {}
