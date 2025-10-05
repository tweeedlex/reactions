import { Module } from '@nestjs/common';
import { SerperParsingService } from './serper-parsing.service';
import { SerperParsingController } from './serper-parsing.controller';
import { SerperModule } from '../serper/serper.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [SerperModule, CommentsModule],
  providers: [SerperParsingService],
  controllers: [SerperParsingController],
  exports: [SerperParsingService],
})
export class SerperParsingModule {}
