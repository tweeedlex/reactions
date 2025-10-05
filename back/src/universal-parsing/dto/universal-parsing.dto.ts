import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { ParsingSource } from '../universal-parsing.service';

export class UniversalParsingDto {
  @IsEnum(ParsingSource)
  source: ParsingSource;

  @IsString()
  identifier: string;

  @IsString()
  @IsOptional()
  language?: string = 'uk';

  @IsString()
  @IsOptional()
  sortBy?: string = 'newest';

  @IsNumber()
  @IsOptional()
  maxPages?: number = 10;

  @IsBoolean()
  @IsOptional()
  useSerper?: boolean = false;
}

export class MultipleSourcesParsingDto {
  @IsString()
  sources: string; // JSON string з масивом джерел
}

export class ParsingResultDto {
  source: string;
  identifier: string;
  comments: any[];
  count: number;
  success: boolean;
  error?: string;
}

export class MultipleParsingResultDto {
  results: ParsingResultDto[];
  totalComments: number;
  successCount: number;
  errorCount: number;
}
