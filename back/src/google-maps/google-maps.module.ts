import { Module } from '@nestjs/common';
import { GoogleMapsController } from './google-maps.controller';
import { GoogleMapsService } from './google-maps.service';
import { SerpApiModule } from '../serpapi/serpapi.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [SerpApiModule, CommentsModule],
  controllers: [GoogleMapsController],
  providers: [GoogleMapsService],
  exports: [GoogleMapsService],
})
export class GoogleMapsModule {}
