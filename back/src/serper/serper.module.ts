import { Module } from '@nestjs/common';
import { SerperService } from './serper.service';
import { SerperController } from './serper.controller';

@Module({
  providers: [SerperService],
  controllers: [SerperController],
  exports: [SerperService],
})
export class SerperModule {}
