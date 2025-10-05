import { IsString, IsUrl } from 'class-validator';

export class ParseAppDto {
  @IsString()
  @IsUrl()
  url: string;
}
