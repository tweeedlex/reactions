import { IsString, IsUrl } from 'class-validator';

export class ParseGoogleMapsDto {
  @IsString()
  @IsUrl()
  url: string;
}
