import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstagramParsingController } from './instagram-parsing.controller';
import { InstagramParsingService } from './instagram-parsing.service';
import { InstagramComment } from './entities/instagram-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InstagramComment])],
  controllers: [InstagramParsingController],
  providers: [InstagramParsingService],
  exports: [InstagramParsingService],
})
export class InstagramParsingModule {}
