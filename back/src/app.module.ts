import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentsModule } from './comments/comments.module';
import { ParsingModule } from './parsing/parsing.module';
import { SerpApiModule } from './serpapi/serpapi.module';
import { GoogleMapsModule } from './google-maps/google-maps.module';
import { SerperModule } from './serper/serper.module';
import { UniversalParsingModule } from './universal-parsing/universal-parsing.module';
import { SerperParsingModule } from './serper-parsing/serper-parsing.module';
import { UrlParsingModule } from './url-parsing/url-parsing.module';
import { InstagramParsingModule } from './instagram-parsing/instagram-parsing.module';
import { Comment } from './comments/entities/comment.entity';
import { InstagramComment } from './instagram-parsing/entities/instagram-comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'reactions.db',
      entities: [Comment, InstagramComment],
      synchronize: true, // Тільки для розробки
    }),
    CommentsModule,
    ParsingModule,
    SerpApiModule,
    GoogleMapsModule,
    SerperModule,
    UniversalParsingModule,
    SerperParsingModule,
    UrlParsingModule,
    InstagramParsingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
