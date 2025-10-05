import { Module } from '@nestjs/common';
import { UrlParsingService } from './url-parsing.service';
import { UrlParsingController } from './url-parsing.controller';
import { SerperParsingModule } from '../serper-parsing/serper-parsing.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [SerperParsingModule, CommentsModule],
  providers: [UrlParsingService],
  controllers: [UrlParsingController],
  exports: [UrlParsingService],
})
export class UrlParsingModule {}
