import { Module } from '@nestjs/common';
import { ParsingService } from './parsing.service';
import { ParsingController } from './parsing.controller';
import { CommentsModule } from '../comments/comments.module';
import { SerpApiModule } from '../serpapi/serpapi.module';

@Module({
  imports: [CommentsModule, SerpApiModule],
  controllers: [ParsingController],
  providers: [ParsingService],
  exports: [ParsingService],
})
export class ParsingModule {}
