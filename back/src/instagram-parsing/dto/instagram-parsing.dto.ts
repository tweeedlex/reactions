import { IsArray, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class InstagramParsingDto {
  @IsArray()
  @IsString({ each: true })
  urls: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  maxComments?: number = 100;

  @IsOptional()
  useApifyProxy?: boolean = true;
}
