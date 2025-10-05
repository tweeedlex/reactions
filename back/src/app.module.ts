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
import { PriorityModule } from './priority/priority.module';
import { AIModule } from './ai/ai.module';
import { Comment } from './comments/entities/comment.entity';
import { InstagramComment } from './instagram-parsing/entities/instagram-comment.entity';
import { Source } from './entities/source.entity';
import { App } from './entities/app.entity';
import { Review } from './entities/review.entity';
import { DatabaseModule } from './database/database.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE === 'postgres' ? 'postgres' : 'sqlite',
      database: process.env.DB_TYPE === 'postgres' ? process.env.DB_NAME || 'reactions' : 'reactions.db',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      entities: [Comment, InstagramComment, Source, App, Review],
      synchronize: process.env.NODE_ENV === 'development', // Тільки для розробки
      logging: process.env.NODE_ENV === 'development',
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
    PriorityModule,
    AIModule,
    DatabaseModule,
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
