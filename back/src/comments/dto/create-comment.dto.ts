import { IsString, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  appId: string;

  @IsString()
  appName: string;

  @IsEnum(['playstore', 'appstore', 'googlemaps'])
  store: 'playstore' | 'appstore' | 'googlemaps';

  @IsString()
  content: string;

  @IsString()
  author: string;

  @IsNumber()
  rating: number;

  @IsOptional()
  @IsDateString()
  reviewDate?: Date;

  @IsOptional()
  @IsNumber()
  helpfulVotes?: number;
}
