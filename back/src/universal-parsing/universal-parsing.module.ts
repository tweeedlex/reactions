import { Module } from '@nestjs/common';
import { UniversalParsingService } from './universal-parsing.service';
import { UniversalParsingController } from './universal-parsing.controller';
import { SerperModule } from '../serper/serper.module';
import { SerpApiModule } from '../serpapi/serpapi.module';

@Module({
  imports: [SerperModule, SerpApiModule],
  providers: [UniversalParsingService],
  controllers: [UniversalParsingController],
  exports: [UniversalParsingService],
})
export class UniversalParsingModule {}
